import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Permission, getAllPermissions, deletePermission } from '@/services/permissionService';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import {
  PlusCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Shield,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import PermissionRow from '@/components/settings/PermissionRow';
import PermissionForm from '@/components/settings/PermissionForm';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { DataTableToolbar } from '@/components/ui/DataTableToolbar';
import { DataTableSkeleton } from '@/components/ui/DataTableSkeleton';
import RolesSettings from '@/components/settings/RolesSettings';

type SortableKeys = 'id' | 'name' | 'description' | 'createdAt';

type CurrentItemsView =
  | { type: 'flat'; items: Permission[]; total: number }
  | { type: 'grouped'; grouped: Record<string, Permission[]>; expandedGroups: Record<string, boolean> };

const PermissionsSettings: React.FC = () => {
  // États pour la gestion de l'interface
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la gestion des données
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ 
    key: SortableKeys; 
    direction: 'ascending' | 'descending' 
  } | null>({ 
    key: 'name', 
    direction: 'ascending' 
  });
  
  // États pour la pagination et la sélection
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  // États pour les filtres
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterResource, setFilterResource] = useState<string>('');
  
  // État pour les groupes dépliés
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Grouper les permissions par ressource
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const parts = permission.name.split(':');
      if (parts.length > 1) {
        const resource = parts[1]; // On ne garde que la ressource
        if (!acc[resource]) {
          acc[resource] = [];
        }
        acc[resource].push(permission);
      }
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  // Vérifier si un groupe est sélectionné
  const isGroupSelected = (group: Permission[]): boolean => {
    return group.every(permission => selectedPermissions.includes(permission.id));
  };

  // Vérifier si un groupe est partiellement sélectionné
  const isGroupIndeterminate = (group: Permission[]): boolean => {
    const hasSelected = group.some(p => selectedPermissions.includes(p.id));
    const allSelected = group.every(p => selectedPermissions.includes(p.id));
    return hasSelected && !allSelected;
  };

  // Basculer la sélection d'un groupe
  const toggleGroupSelection = (group: Permission[]) => {
    const allSelected = group.every(p => selectedPermissions.includes(p.id));
    if (allSelected) {
      const groupIds = new Set(group.map(p => p.id));
      setSelectedPermissions(prev => prev.filter(id => !groupIds.has(id)));
    } else {
      const groupIds = group.map(p => p.id);
      setSelectedPermissions(prev => [...new Set([...prev, ...groupIds])]);
    }
  };

  // Initialiser les groupes dépliés au premier chargement
  useEffect(() => {
    if (Object.keys(expandedGroups).length === 0 && Object.keys(groupedPermissions).length > 0) {
      const initialExpandedState = Object.keys(groupedPermissions).reduce((acc, resource) => {
        acc[resource] = true; // Tous les groupes sont dépliés par défaut
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedGroups(initialExpandedState);
    }
  }, [groupedPermissions, expandedGroups]);

  const toggleGroup = useCallback((resource: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [resource]: !prev[resource]
    }));
  }, [setExpandedGroups]);

  const filteredPermissions = useMemo(() => {
    let result = [...permissions];

    if (searchTerm) {
      const lowered = searchTerm.toLowerCase();
      result = result.filter((permission) =>
        permission.name.toLowerCase().includes(lowered) ||
        (permission.description?.toLowerCase().includes(lowered) ?? false)
      );
    }

    if (filterAction) {
      const loweredAction = filterAction.toLowerCase();
      result = result.filter((permission) =>
        permission.name.toLowerCase().startsWith(`${loweredAction}:`)
      );
    }

    if (filterResource) {
      const loweredResource = filterResource.toLowerCase();
      result = result.filter((permission) => {
        const resource = permission.name.split(':')[1] || '';
        return resource.toLowerCase() === loweredResource;
      });
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Permission] as string | number | undefined;
        const bValue = b[sortConfig.key as keyof Permission] as string | number | undefined;

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [permissions, searchTerm, filterAction, filterResource, sortConfig]);

  const hasFiltersApplied = useMemo(
    () => Boolean(searchTerm || filterAction || filterResource),
    [searchTerm, filterAction, filterResource]
  );

  const paginatedPermissions = useMemo(() => {
    if (!hasFiltersApplied) {
      return filteredPermissions;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPermissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPermissions, currentPage, itemsPerPage, hasFiltersApplied]);

  const currentItems = useMemo<CurrentItemsView>(() => {
    if (hasFiltersApplied) {
      return {
        type: 'flat',
        items: paginatedPermissions,
        total: filteredPermissions.length,
      };
    }

    return {
      type: 'grouped',
      grouped: groupedPermissions,
      expandedGroups,
    };
  }, [hasFiltersApplied, paginatedPermissions, filteredPermissions.length, groupedPermissions, expandedGroups]);

  const totalPages = currentItems.type === 'flat'
    ? Math.max(1, Math.ceil(filteredPermissions.length / itemsPerPage))
    : 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Effet pour charger les permissions
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPermissions();
      setPermissions(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des permissions:', err);
      setError('Erreur lors du chargement des permissions');
      toast.error('Impossible de charger les permissions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCreate = useCallback(() => {
    setEditingPermission(null);
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((permission: Permission) => {
    setEditingPermission(permission);
    setSheetOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    setSheetOpen(false);
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCancel = useCallback(() => {
    setSheetOpen(false);
  }, []);

  // Gestion de la suppression d'une permission
  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) {
      try {
        await deletePermission(id);
        toast.success('Permission supprimée avec succès');
        await fetchPermissions();
        setSelectedPermissions(prev => prev.filter(pid => pid !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de la permission:', error);
        toast.error('Échec de la suppression de la permission');
      }
    }
  }, [fetchPermissions]);

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Permission copiée dans le presse-papier');
  }, []);

  const togglePermissionSelection = useCallback((permissionId: number) => {
    if (loading) {
      return;
    }
    setSelectedPermissions(prev => {
      const newSelection = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId];
      
      return newSelection;
    });
  }, [loading]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterAction('');
    setFilterResource('');
    setCurrentPage(1);
  }, []);

  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    permissions.forEach(p => {
      const parts = p.name.split(':');
      if (parts.length > 0) actions.add(parts[0]);
    });
    return Array.from(actions).sort();
  }, [permissions]);

  const uniqueResources = useMemo(() => {
    const resources = new Set<string>();
    permissions.forEach(p => {
      const parts = p.name.split(':');
      if (parts.length > 1) resources.add(parts[1]);
    });
    return Array.from(resources).sort();
  }, [permissions]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm || filterAction || filterResource;
  }, [searchTerm, filterAction, filterResource]);

  const isAllSelected = useMemo(() => {
    if (currentItems.type === 'flat') {
      if (currentItems.items.length === 0) return false;
      return currentItems.items.every((permission) =>
        selectedPermissions.includes(permission.id)
      );
    }

    if (permissions.length === 0) return false;
    return permissions.every((permission) => selectedPermissions.includes(permission.id));
  }, [currentItems, permissions, selectedPermissions]);

  const isIndeterminate = useMemo(() => {
    if (currentItems.type === 'flat') {
      if (currentItems.items.length === 0) return false;
      const hasSome = currentItems.items.some((permission) =>
        selectedPermissions.includes(permission.id)
      );
      return hasSome && !isAllSelected;
    }

    if (permissions.length === 0) return false;
    const hasSome = permissions.some((permission) => selectedPermissions.includes(permission.id));
    return hasSome && !isAllSelected;
  }, [currentItems, permissions, selectedPermissions, isAllSelected]);

  const requestSort = useCallback((key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  }, [sortConfig]);

  const handleSelectAll = useCallback((checked: boolean | 'indeterminate') => {
    const targetPermissions = currentItems.type === 'flat' ? currentItems.items : permissions;
    const isChecked = checked === true;

    if (isChecked) {
      const allIds = targetPermissions.map((p) => p.id);
      setSelectedPermissions((prev) => [...new Set([...prev, ...allIds])]);
    } else {
      const idsToRemove = new Set(targetPermissions.map((p) => p.id));
      setSelectedPermissions((prev) => prev.filter((id) => !idsToRemove.has(id)));
    }
  }, [currentItems, permissions]);

  const getSortIcon = useCallback((key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" key="inactive" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 text-primary" key="active" />;
  }, [sortConfig]);

  const renderTableHeader = useCallback((key: SortableKeys, title: string, className?: string) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => requestSort(key)} className="px-0 py-0 h-auto hover:bg-transparent">
        {title}
        {getSortIcon(key)}
      </Button>
    </TableHead>
  ), [requestSort, getSortIcon]);

  const formatResourceName = useCallback((name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Gestion des Permissions
                </CardTitle>
                <CardDescription>Ajoutez, modifiez ou supprimez des permissions.</CardDescription>
              </div>
              <Skeleton className="h-10 w-[220px]" />
            </div>
          </CardHeader>
          <CardContent>
            <DataTableSkeleton columns={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erreur</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Gestion des Permissions
              </CardTitle>
              <CardDescription>Ajoutez, modifiez ou supprimez des permissions.</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une permission
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres avancés */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtres</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Effacer tout
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Action</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Toutes</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Ressource</label>
                <select
                  value={filterResource}
                  onChange={(e) => setFilterResource(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Toutes</option>
                  {uniqueResources.map(resource => (
                    <option key={resource} value={resource}>{resource}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Recherche</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom ou description..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <DataTableToolbar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
          <div className="border rounded-lg mt-4 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      id="select-all"
                      checked={isIndeterminate ? 'indeterminate' : isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="h-4 w-4 rounded"
                    />
                    <Label htmlFor="select-all" className="sr-only">
                      Sélectionner toutes les permissions
                    </Label>
                  </TableHead>
                  {renderTableHeader('id', 'ID', 'w-[100px]')}
                  {renderTableHeader('name', 'Nom')}
                  {renderTableHeader('description', 'Description')}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.type === 'flat' ? (
                  // Vue plate (lors de la recherche/filtrage)
                  currentItems.items.map((permission) => (
                    <PermissionRow 
                      key={permission.id} 
                      permission={permission}
                      isSelected={selectedPermissions.includes(permission.id)}
                      onSelect={togglePermissionSelection}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCopy={handleCopyToClipboard}
                    />
                  ))
                ) : (
                  // Vue groupée par ressource
                  Object.entries(currentItems.grouped || {}).map(([resource, perms]) => {
                    // Vérification de type pour s'assurer que perms est un tableau de permissions
                    if (!Array.isArray(perms)) return null;
                    
                    const isExpanded = currentItems.expandedGroups?.[resource] !== false;
                    const allSelected = isGroupSelected(perms);
                    const groupIndeterminate = isGroupIndeterminate(perms);
                    
                    return (
                      <React.Fragment key={resource}>
                        <TableRow className="bg-muted/20 hover:bg-muted/30">
                          <TableCell colSpan={4} className="p-0">
                            <div className="flex items-center px-4 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 mr-2"
                                onClick={() => toggleGroup(resource)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {isExpanded ? 'Réduire' : 'Développer'}
                                </span>
                              </Button>
                              
                              <Checkbox
                                id={`group-${resource}`}
                                checked={groupIndeterminate ? 'indeterminate' : allSelected}
                                onCheckedChange={() => toggleGroupSelection(perms)}
                                className="h-4 w-4 rounded"
                              />
                              <Label 
                                htmlFor={`group-${resource}`}
                                className="ml-2 font-medium cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleGroup(resource);
                                }}
                              >
                                {formatResourceName(resource)}
                                <span className="ml-2 text-sm text-muted-foreground">
                                  ({perms.length} {perms.length > 1 ? 'permissions' : 'permission'})
                                </span>
                              </Label>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && perms.map((permission) => (
                          <PermissionRow 
                            key={permission.id} 
                            permission={permission}
                            isSelected={selectedPermissions.includes(permission.id)}
                            onSelect={togglePermissionSelection}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCopy={handleCopyToClipboard}
                            level={1}
                          />
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
                
                {currentItems.type === 'flat' && currentItems.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Aucune permission trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <DataTablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Gestion des Rôles
              </CardTitle>
              <CardDescription>
                Créez, modifiez et associez des permissions aux rôles.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RolesSettings />
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingPermission ? 'Modifier la permission' : 'Ajouter une permission'}</SheetTitle>
          </SheetHeader>
          <PermissionForm
            key={editingPermission ? editingPermission.id : 'new'}
            permissionId={editingPermission?.id}
            isEdit={!!editingPermission}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PermissionsSettings;
