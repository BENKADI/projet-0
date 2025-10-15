import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import UserForm from '@/components/UserForm';
import { User, getAllUsers, deleteUser } from '@/services/userService';
import { DataTableToolbar } from '@/components/ui/DataTableToolbar';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/Separator';
import { Loader2, UserPlus, Trash2, Edit, Check, X, AlertCircle, ArrowUpDown, Mail, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataTableSkeleton } from '@/components/ui/DataTableSkeleton';

type SortableKeys = keyof User | 'name';

const getUserDisplayName = (user: User) => {
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.email;
};

const Users: React.FC = () => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const roleOptions = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'Utilisateur' },
  ];

  const processedUsers = useMemo(() => {
    let filtered = [...users]
      .filter(user => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        const nameMatch = getUserDisplayName(user).toLowerCase().includes(term);
        const emailMatch = user.email.toLowerCase().includes(term);
        return nameMatch || emailMatch;
      })
      .filter(user => {
        if (roleFilter === 'all') return true;
        return user.role === roleFilter;
      });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'name') {
          aValue = getUserDisplayName(a).toLowerCase();
          bValue = getUserDisplayName(b).toLowerCase();
        } else {
          aValue = a[sortConfig.key as keyof User];
          bValue = b[sortConfig.key as keyof User];
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [users, searchTerm, roleFilter, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedUsers, currentPage, itemsPerPage]);

    useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (location.state?.openCreateSheet) {
      handleCreate();
      // Nettoie l'état de la navigation pour éviter que le panneau ne se ré-ouvre
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

    const confirmDelete = async (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    try {
      await deleteUser(userId);
      fetchUsers();
      setDeleteConfirm(null);
      toast.success(`L'utilisateur ${userToDelete?.email || `ID ${userId}`} a été supprimé.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'La suppression a échoué.');
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setSheetOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setSheetOpen(true);
  };

  const handleSave = () => {
    setSheetOpen(false);
    setEditingUser(null);
    fetchUsers();
    toast.success(`Utilisateur ${editingUser ? 'modifié' : 'créé'} avec succès.`);
  };

  const handleCancel = () => {
    setSheetOpen(false);
    setEditingUser(null);
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

  const renderTableHeader = (key: SortableKeys, title: string) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
      <Button variant="ghost" onClick={() => requestSort(key)} className="px-0 py-0 h-auto hover:bg-transparent">
        {title}
        {getSortIcon(key)}
      </Button>
    </th>
  );

    if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <DataTableSkeleton columns={6} />
      </div>
    );
  }

  if (error) return <div className="container mx-auto p-4"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erreur</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

    return (
    <>
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <Button onClick={handleCreate}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        <DataTableToolbar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} filterValue={roleFilter} onFilterValueChange={setRoleFilter} filterPlaceholder="Filtrer par rôle" filterOptions={roleOptions} />

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                {renderTableHeader('name', 'Utilisateur')}
                {renderTableHeader('role', 'Rôle')}
                {renderTableHeader('createdAt', 'Date de création')}
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">Aucun utilisateur trouvé</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                            {getUserDisplayName(user).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-foreground">{getUserDisplayName(user)}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="font-medium">
                        {user.role === 'admin' ? '🔑 Admin' : '👤 User'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="destructive" size="sm" onClick={() => confirmDelete(user.id)}>Confirmer</Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(user.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <DataTablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        <div className="my-12">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Vue cartes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {paginatedUsers.map(user => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getUserDisplayName(user).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{getUserDisplayName(user)}</CardTitle>
                      </div>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? '🔑' : '👤'}
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      📅 Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {deleteConfirm === user.id ? (
                    <><Button variant="destructive" size="sm" onClick={() => confirmDelete(user.id)}>Confirmer</Button><Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Annuler</Button></>
                  ) : (
                    <><Button variant="ghost" size="icon" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(user.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <UserForm
            key={editingUser ? editingUser.id : 'new'}
            userId={editingUser?.id}
            isEdit={!!editingUser}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Users;
