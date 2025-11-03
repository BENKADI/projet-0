import React, { useState, useEffect } from 'react';

import {
  UserCreateInput, UserUpdateInput,
  getAllPermissions, createUser, updateUser, getUserById
} from '../services/userService';
import { Permission } from '../services/permissionService';
import { getAllRoles, type Role } from '../services/roleService';
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [permsData, rolesData] = await Promise.all([
          getAllPermissions(),
          getAllRoles()
        ]);
        setPermissions(permsData);
        setRoles(rolesData);

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
    
    // Si c'est le rôle qui change, mettre à jour les permissions automatiquement
    if (name === 'role') {
      // Trouver le rôle sélectionné
      const selectedRole = roles.find(r => r.name.toLowerCase() === value.toLowerCase());
      
      if (selectedRole) {
        // Récupérer les IDs des permissions du rôle
        const rolePermissionNames = selectedRole.permissions || [];
        const rolePermissionIds = permissions
          .filter(p => rolePermissionNames.includes(p.name))
          .map(p => p.id);
        
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          permissionIds: rolePermissionIds
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    <div className="w-full">
      <form id="user-form" onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {isEdit ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                {isEdit ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Section Informations de base */}
          <div className="space-y-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Informations personnelles
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="space-y-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Rôle et accès
              </h3>
            </div>
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
                {/* Roles par défaut si l'API ne répond pas */}
                {roles.length === 0 ? (
                  <>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </>
                ) : (
                  // Afficher les rôles depuis l'API
                  roles.map((role) => (
                    <option key={role.id} value={role.name.toLowerCase()}>
                      {role.name}
                      {role.description && ` - ${role.description}`}
                    </option>
                  ))
                )}
              </select>
              {roles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {roles.find(r => r.name.toLowerCase() === formData.role)?.description || 
                   `${roles.length} rôles disponibles`}
                </p>
              )}
            </div>
          </div>

          {/* Section Permissions */}
          <div className="space-y-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Permissions du rôle
              </h3>
            </div>
            {(() => {
              // Trouver le rôle sélectionné
              const selectedRole = roles.find(r => r.name.toLowerCase() === formData.role?.toLowerCase());
              
              // Filtrer les permissions à afficher (uniquement celles du rôle)
              const displayPermissions = selectedRole 
                ? permissions.filter(p => selectedRole.permissions?.includes(p.name))
                : permissions;
              
              return (
                <>
                  {selectedRole && (
                    <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="mt-0.5 flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Rôle : <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedRole.name}</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {displayPermissions.length} permission{displayPermissions.length > 1 ? 's' : ''} associée{displayPermissions.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {displayPermissions.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Aucune permission associée à ce rôle
                        </p>
                      </div>
                    ) : (
                      displayPermissions.map(permission => (
                        <div
                          key={permission.id}
                          className="flex items-center gap-2.5 p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-sm"
                        >
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 select-none break-all">
                            {permission.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-4 sm:px-6 pb-5 sm:pb-6 pt-4 sm:pt-5 border-t bg-gray-50 dark:bg-gray-900/50">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto sm:min-w-[130px] h-10 sm:h-11 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Annuler
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={saving}
            className="w-full sm:w-auto sm:min-w-[130px] h-10 sm:h-11 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                {isEdit ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enregistrer
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer l'utilisateur
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
