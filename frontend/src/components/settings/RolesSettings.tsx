import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Permission } from '@/services/permissionService';
import { getAllPermissions } from '@/services/permissionService';
import { getAllRoles, createRole, updateRole, deleteRole, type Role, type RoleCreateInput, type RoleUpdateInput } from '@/services/roleService';

const RolesSettings: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [permissionsData, rolesData] = await Promise.all([
          getAllPermissions(),
          getAllRoles(),
        ]);
        
        setPermissions(permissionsData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Fallback: Si l'API n'est pas disponible, charger les permissions et créer des rôles démo
        try {
          const permissionsData = await getAllPermissions();
          setPermissions(permissionsData);
          
          // Créer des rôles de démonstration si l'API roles n'existe pas
          const adminPermissions = permissionsData.map((p) => p.name);
          const userPermissions = permissionsData
            .filter((p) => p.name.startsWith('read:') || p.name.includes('profile') || p.name.includes('settings'))
            .map((p) => p.name);
          const viewerPermissions = permissionsData
            .filter((p) => p.name.startsWith('read:'))
            .map((p) => p.name);

          setRoles([
            {
              id: 'admin',
              name: 'Administrateur',
              description: 'Accès complet à toutes les fonctionnalités',
              permissions: adminPermissions,
              isSystem: true,
            },
            {
              id: 'manager',
              name: 'Manager',
              description: 'Gestion avancée des utilisateurs et des commandes',
              permissions: Array.from(new Set([...userPermissions, ...permissionsData.filter((p) => p.name.includes('update:orders')).map((p) => p.name)])),
              isSystem: true,
            },
            {
              id: 'user',
              name: 'Utilisateur',
              description: 'Accès standard aux fonctionnalités principales',
              permissions: userPermissions,
              isSystem: true,
            },
            {
              id: 'viewer',
              name: 'Lecteur',
              description: 'Accès en lecture seule aux modules principaux',
              permissions: viewerPermissions,
              isSystem: true,
            },
          ]);
          
          toast.info('Rôles de démonstration chargés (API non disponible)');
        } catch (permError) {
          console.error('Error loading permissions fallback:', permError);
          toast.error('Erreur lors du chargement des données');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permissionName: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName];
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Le nom du rôle est requis');
      return;
    }

    try {
      if (editingRole) {
        const updateData: RoleUpdateInput = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          permissions: formData.permissions,
        };
        const updated = await updateRole(editingRole.id, updateData);
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
        if (editingRole?.isSystem) {
          toast.success('Permissions du rôle système mises à jour avec succès');
        } else {
          toast.success('Rôle mis à jour avec succès');
        }
      } else {
        console.log('Creating new role with data:', formData);
        const createData: RoleCreateInput = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          permissions: formData.permissions,
        };
        console.log('Sending to API:', createData);
        const created = await createRole(createData);
        console.log('Role created:', created);
        setRoles(prev => [created, ...prev]);
        toast.success('Rôle créé avec succès');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving role:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la sauvegarde du rôle';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setEditingRole(null);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: [...role.permissions]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.warning('Les rôles système ne peuvent pas être supprimés');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role?.name}" ?`)) {
      return;
    }

    try {
      await deleteRole(roleId);
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast.success('Rôle supprimé avec succès');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Erreur lors de la suppression du rôle');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des Rôles</CardTitle>
            <Button onClick={() => {
              console.log('Opening new role dialog');
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Rôle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-muted-foreground">Aucun rôle trouvé</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Créer un rôle
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {role.name}
                        {role.isSystem && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            Système
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {role.description || <span className="italic text-muted-foreground/60">Aucune description</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {role.permissions.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Aucune permission</span>
                        ) : (
                          <>
                            {role.permissions.slice(0, 3).map(permission => (
                              <span 
                                key={permission}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                              >
                                {permission}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="text-xs text-muted-foreground font-medium">
                                +{role.permissions.length - 3} de plus
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(role)}
                          title={role.isSystem ? 'Modifier les permissions du rôle système' : 'Modifier le rôle'}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(role.id)}
                          disabled={role.isSystem}
                          className={role.isSystem ? 'opacity-50 cursor-not-allowed' : ''}
                          title={role.isSystem ? 'Les rôles système ne peuvent pas être supprimés' : 'Supprimer le rôle'}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 
                (editingRole.isSystem ? 'Modifier les permissions du rôle système' : 'Modifier le rôle') 
                : 'Créer un nouveau rôle'}
            </DialogTitle>
            {editingRole?.isSystem && (
              <p className="text-sm text-muted-foreground mt-2">
                ℹ️ Le nom et la description des rôles système ne peuvent pas être modifiés, mais vous pouvez ajuster leurs permissions.
              </p>
            )}
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du rôle *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Éditeur, Modérateur..."
                    required
                    disabled={editingRole?.isSystem}
                    className={editingRole?.isSystem ? 'bg-muted cursor-not-allowed' : ''}
                  />
                  {editingRole?.isSystem && (
                    <p className="text-xs text-muted-foreground">Les rôles système ne peuvent pas être renommés</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description du rôle..."
                    disabled={editingRole?.isSystem}
                    className={editingRole?.isSystem ? 'bg-muted cursor-not-allowed' : ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Permissions</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formData.permissions.length} / {permissions.length} sélectionnées
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (formData.permissions.length === permissions.length) {
                          setFormData(prev => ({ ...prev, permissions: [] }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            permissions: permissions.map(p => p.name) 
                          }));
                        }
                      }}
                      className="h-7 text-xs"
                    >
                      {formData.permissions.length === permissions.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-2 bg-muted/20">
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2 p-1.5 hover:bg-accent/50 rounded">
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={formData.permissions.includes(permission.name)}
                            onCheckedChange={() => handlePermissionToggle(permission.name)}
                          />
                          <label
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {permission.name}
                            {permission.description && (
                              <p className="text-xs text-muted-foreground font-normal">
                                {permission.description}
                              </p>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingRole ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesSettings;
