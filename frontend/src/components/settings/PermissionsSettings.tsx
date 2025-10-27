import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Permission, getAllPermissions, deletePermission } from '@/services/permissionService';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import PermissionForm from '@/components/PermissionForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { DataTableToolbar } from '@/components/ui/DataTableToolbar';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { Loader2, Edit, Trash2, PlusCircle, AlertCircle, ArrowUpDown, Shield, Copy, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataTableSkeleton } from '@/components/ui/DataTableSkeleton';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

type SortableKeys = keyof Permission;

const PermissionsSettings: React.FC = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterResource, setFilterResource] = useState<string>('');

  const processedPermissions = useMemo(() => {
    let filtered = [...permissions];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    }
    
    // Filtrer par action (ex: create, read, update, delete)
    if (filterAction) {
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().startsWith(filterAction.toLowerCase() + ':')
      );
    }
    
    // Filtrer par ressource
    if (filterResource) {
      filtered = filtered.filter(permission => {
        const parts = permission.name.toLowerCase().split(':');
        return parts.length > 1 && parts[1].includes(filterResource.toLowerCase());
      });
    }

    // Tri
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [permissions, searchTerm, sortConfig, filterAction, filterResource]);

  const totalPages = Math.ceil(processedPermissions.length / itemsPerPage);

  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPermissions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPermissions, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPermissions();
      setPermissions(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des permissions';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Erreur chargement permissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const confirmDelete = useCallback(async (permissionId: number) => {
    try {
      await deletePermission(permissionId);
      fetchPermissions();
      setDeleteConfirm(null);
      toast.success('Permission supprimée avec succès.');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMessage);
      logger.error('Erreur suppression permission:', err);
    }
  }, [fetchPermissions]);

  const copyPermissionName = useCallback((name: string) => {
    navigator.clipboard.writeText(name);
    toast.success('Nom de permission copié dans le presse-papiers');
  }, []);

  const togglePermissionSelection = useCallback((permissionId: number) => {
    setSelectedPermissions(prev => {
      const newSelection = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPermissions([]);
    setShowBulkActions(false);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterAction('');
    setFilterResource('');
    setCurrentPage(1);
  }, []);

  // Optimisation: mémoiser les actions et ressources uniques
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

  // Optimisation: mémoiser les états de calcul
  const hasActiveFilters = useMemo(() => {
    return searchTerm || filterAction || filterResource;
  }, [searchTerm, filterAction, filterResource]);

  const isAllSelected = useMemo(() => {
    return paginatedPermissions.length > 0 && 
           paginatedPermissions.every(p => selectedPermissions.includes(p.id));
  }, [paginatedPermissions, selectedPermissions]);

  const isIndeterminate = useMemo(() => {
    return selectedPermissions.length > 0 && !isAllSelected;
  }, [selectedPermissions.length, isAllSelected]);

  const requestSort = useCallback((key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  }, [sortConfig]);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(paginatedPermissions.map(p => p.id));
    }
    setShowBulkActions(!isAllSelected);
  }, [isAllSelected, paginatedPermissions]);

  const getSortIcon = useCallback((key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />;
  }, [sortConfig]);

  const renderTableHeader = useCallback((key: SortableKeys, title: string, className?: string) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => requestSort(key)} className="px-0 py-0 h-auto hover:bg-transparent">
        {title}
        {getSortIcon(key)}
      </Button>
    </TableHead>
  ), [requestSort, getSortIcon]);

  const formatPermissionName = useCallback((name: string) => {
    const parts = name.split(':');
    if (parts.length !== 2) return name;
    
    const [action, resource] = parts;
    const actionColors: Record<string, string> = {
      create: 'text-green-600',
      read: 'text-blue-600',
      update: 'text-orange-600',
      delete: 'text-red-600'
    };
    
    return (
      <span className="font-mono">
        <span className={actionColors[action] || 'text-gray-600'}>{action}</span>
        <span className="text-gray-400">:</span>
        <span className="text-purple-600">{resource}</span>
      </span>
    );
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
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  {renderTableHeader('id', 'ID', 'w-[100px]')}
                  {renderTableHeader('name', 'Nom')}
                  {renderTableHeader('description', 'Description')}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {hasActiveFilters ? 'Aucune permission trouvée pour ces filtres.' : 'Aucune permission trouvée.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPermissions.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => togglePermissionSelection(permission.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{permission.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {formatPermissionName(permission.name)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyPermissionName(permission.name)}
                            title="Copier le nom"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {permission.description || <em>Non défini</em>}
                      </TableCell>
                      <TableCell className="text-right">
                        {deleteConfirm === permission.id ? (
                          <div className="flex justify-end space-x-2">
                            <Button variant="destructive" size="sm" onClick={() => confirmDelete(permission.id)}>Confirmer</Button>
                            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(permission)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(permission.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <DataTablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
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
