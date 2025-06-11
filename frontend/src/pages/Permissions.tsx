import React, { useState, useEffect, useMemo } from 'react';
import { Permission, getAllPermissions, deletePermission } from '@/services/permissionService';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import PermissionForm from '@/components/PermissionForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { DataTableToolbar } from '@/components/ui/DataTableToolbar';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { Loader2, Edit, Trash2, PlusCircle, AlertCircle, ArrowUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataTableSkeleton } from '@/components/ui/DataTableSkeleton';
import { toast } from 'sonner';

type SortableKeys = keyof Permission;

const Permissions: React.FC = () => {
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

  const processedPermissions = useMemo(() => {
    let filtered = [...permissions].filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
  }, [permissions, searchTerm, sortConfig]);

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

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await getAllPermissions();
      setPermissions(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des permissions');
    } finally {
      setLoading(false);
    }
  };

    const handleCreate = () => {
    setEditingPermission(null);
    setSheetOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setSheetOpen(true);
  };

  const handleSave = () => {
    setSheetOpen(false);
    fetchPermissions();
    toast.success(`Permission ${editingPermission ? 'modifiée' : 'créée'} avec succès.`);
  };

  const handleCancel = () => {
    setSheetOpen(false);
  };

  const confirmDelete = async (permissionId: number) => {
    try {
      await deletePermission(permissionId);
      fetchPermissions();
      setDeleteConfirm(null);
      toast.success('Permission supprimée avec succès.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const renderTableHeader = (key: SortableKeys, title: string, className?: string) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => requestSort(key)} className="px-0 py-0 h-auto hover:bg-transparent">
        {title}
        {getSortIcon(key)}
      </Button>
    </TableHead>
  );

    if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gestion des Permissions</CardTitle>
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

  if (error) return <div className="container mx-auto p-4"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erreur</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Permissions</CardTitle>
              <CardDescription>Ajoutez, modifiez ou supprimez des permissions.</CardDescription>
            </div>
                        <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une permission
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTableToolbar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
          <div className="border rounded-lg mt-4 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {renderTableHeader('id', 'ID', 'w-[100px]')}
                  {renderTableHeader('name', 'Nom')}
                  {renderTableHeader('description', 'Description')}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Aucune permission trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPermissions.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.id}</TableCell>
                      <TableCell>{permission.name}</TableCell>
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

export default Permissions;
