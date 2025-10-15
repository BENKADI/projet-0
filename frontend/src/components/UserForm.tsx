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
    <div className="w-full max-w-4xl mx-auto">
      <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isEdit ? 'Modifiez les informations de l\'utilisateur' : 'Remplissez les informations pour créer un nouveau compte'}
          </p>
        </div>
        <div className="space-y-6 px-6">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Section Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">👤</span>
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                  disabled={saving}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {isEdit ? 'Nouveau mot de passe' : 'Mot de passe *'}
                </Label>
              <Input
                placeholder={isEdit ? 'Laisser vide pour ne pas changer' : ''}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                  disabled={saving}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                  disabled={saving}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                  disabled={saving}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Section Rôle et accès */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              Rôle et accès
            </h3>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Rôle *</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                required
                disabled={saving}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>

          {/* Section Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">🔐</span>
              Permissions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {permissions.map(permission => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    value={permission.id}
                    checked={formData.permissionIds?.includes(permission.id) || false}
                    onChange={handleCheckboxChange}
                    disabled={saving}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    {permission.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-center gap-3 px-6 pb-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="min-w-[120px] h-11"
          >
            ❌ Annuler
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={saving}
            className="min-w-[120px] h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? '⏳ Enregistrement...' : isEdit ? '💾 Enregistrer' : '✨ Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
