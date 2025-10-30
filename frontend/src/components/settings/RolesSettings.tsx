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
import { Permission } from '@/types';
import { getAllPermissions } from '@/services/permissionService';

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
}

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
        const [permissionsData] = await Promise.all([
          getAllPermissions(),
          // fetchRoles() // À implémenter côté backend
        ]);
        
        setPermissions(permissionsData);
        
        // Données factices pour la démo - À remplacer par un appel API
        setRoles([
          {
            id: 'admin',
            name: 'Administrateur',
            description: 'Accès complet à toutes les fonctionnalités',
            permissions: permissionsData.map(p => p.name),
            isSystem: true
          },
          {
            id: 'user',
            name: 'Utilisateur standard',
            permissions: ['read:profile', 'update:profile', 'read:settings'],
            isSystem: true
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous ajouteriez la logique pour sauvegarder le rôle
    toast.success(editingRole ? 'Rôle mis à jour avec succès' : 'Rôle créé avec succès');
    setIsDialogOpen(false);
    // Réinitialiser le formulaire
    setFormData({ name: '', description: '', permissions: [] });
    setEditingRole(null);
  };

  const handleEdit = (role: Role) => {
    if (role.isSystem) {
      toast.warning('Les rôles système ne peuvent pas être modifiés');
      return;
    }
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: [...role.permissions]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.warning('Les rôles système ne peuvent pas être supprimés');
      return;
    }
    
    // Ici, vous ajouteriez la logique pour supprimer le rôle
    toast.success('Rôle supprimé avec succès');
  };

  if (isLoading) {
    return <div>Chargement des rôles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Rôles</h2>
          <p className="text-muted-foreground">Créez et gérez les rôles et leurs permissions</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Rôle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Rôles</CardTitle>
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
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {role.name}
                      {role.isSystem && (
                        <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          Système
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description || 'Aucune description'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {role.permissions.slice(0, 3).map(permission => (
                        <span 
                          key={permission}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {permission}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{role.permissions.length - 3} de plus
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(role)}
                        disabled={role.isSystem}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(role.id)}
                        disabled={role.isSystem}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
            </DialogTitle>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description du rôle..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-md p-2 bg-muted/20">
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={formData.permissions.includes(permission.name)}
                            onCheckedChange={() => handlePermissionToggle(permission.name)}
                          />
                          <label
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
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
                  setFormData({ name: '', description: '', permissions: [] });
                  setEditingRole(null);
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
