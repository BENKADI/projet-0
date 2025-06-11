import React, { useState, useEffect } from 'react';

import {
  UserCreateInput, UserUpdateInput,
  getAllPermissions, createUser, updateUser, getUserById
} from '../services/userService';
import { Permission } from '../services/permissionService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Button } from './ui/Button';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface UserFormProps {
  userId?: number;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ userId, isEdit = false, onSave, onCancel }) => {

  const [formData, setFormData] = useState<UserCreateInput | UserUpdateInput>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    permissionIds: []
  });

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const permsData = await getAllPermissions();
        setPermissions(permsData);

        if (isEdit && userId) {
          const userData = await getUserById(userId);
          setFormData({
            email: userData.email,
            password: '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: userData.role,
            permissionIds: userData.permissions?.map(p => p.id) || []
          });
        }
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [userId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const permId = parseInt(value);

    setFormData(prev => {
      const currentPerms = prev.permissionIds || [];
      if (checked) {
        return { ...prev, permissionIds: [...currentPerms, permId] };
      } else {
        return { ...prev, permissionIds: currentPerms.filter(id => id !== permId) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (isEdit && userId) {
        const updateData: UserUpdateInput = { ...formData };
        if (!updateData.password) delete updateData.password;
        await updateUser(userId, updateData);
      } else {
        await createUser(formData as UserCreateInput);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <form id="user-form" onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email*</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{isEdit ? 'Nouveau mot de passe' : 'Mot de passe*'}</Label>
              <Input
                placeholder={isEdit ? 'Laisser vide pour ne pas changer' : ''}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rôle*</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={saving}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <Label className="text-base font-semibold text-foreground mb-2 block">
              Permissions
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map(permission => (
                <div key={permission.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    value={permission.id}
                    checked={formData.permissionIds?.includes(permission.id) || false}
                    onChange={handleCheckboxChange}
                    disabled={saving}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`permission-${permission.id}`} className="font-normal">
                    {permission.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </form>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" form="user-form" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </CardFooter>
    </div>
  );
};

export default UserForm;
