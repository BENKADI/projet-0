import React, { useState, useEffect } from 'react';
import { PermissionCreateInput, PermissionUpdateInput, getPermissionById, updatePermission, createPermission } from '@/services/permissionService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface PermissionFormProps {
  permissionId?: number;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permissionId, isEdit = false, onSave, onCancel }) => {
  
  const [formData, setFormData] = useState<PermissionCreateInput | PermissionUpdateInput>({
    name: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation du nom de permission
  const validatePermissionName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Le nom de la permission est requis';
    }
    
    // Vérifier le format recommandé: action:ressource
    const namePattern = /^[a-z]+:[a-z]+$/;
    if (!namePattern.test(name)) {
      return 'Format invalide. Utilisez le format: action:ressource (ex: create:products)';
    }
    
    // Vérifier la longueur
    if (name.length > 50) {
      return 'Le nom ne doit pas dépasser 50 caractères';
    }
    
    return null;
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    const nameError = validatePermissionName(formData.name || '');
    if (nameError) {
      errors.name = nameError;
    }
    
    if (formData.description && formData.description.length > 200) {
      errors.description = 'La description ne doit pas dépasser 200 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchPermission = async () => {
      if (!isEdit || !permissionId) return;
      
      try {
        setLoading(true);
        const permissionData = await getPermissionById(permissionId);
        
        setFormData({
          name: permissionData.name,
          description: permissionData.description || ''
        });
        
        setError(null);
        setValidationErrors({});
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement de la permission');
        logger.error('Erreur chargement permission:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermission();
  }, [permissionId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Valider en temps réel
    if (name === 'name') {
      const nameError = validatePermissionName(value);
      setValidationErrors(prev => ({
        ...prev,
        name: nameError || ''
      }));
    }
    
    if (name === 'description') {
      if (value.length > 200) {
        setValidationErrors(prev => ({
          ...prev,
          description: 'La description ne doit pas dépasser 200 caractères'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          description: ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire avant soumission
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);

      if (isEdit && permissionId) {
        await updatePermission(permissionId, formData);
        toast.success('Permission mise à jour avec succès');
      } else {
        await createPermission(formData as PermissionCreateInput);
        toast.success('Permission créée avec succès');
      }
      onSave();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Erreur enregistrement permission:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

    return (
    <div className="py-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            Nom*
            {validationErrors.name && (
              <span className="text-destructive text-sm font-normal">({validationErrors.name})</span>
            )}
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: create:products"
            required
            aria-invalid={!!validationErrors.name}
            aria-describedby={validationErrors.name ? "name-error" : "name-help"}
            className={validationErrors.name ? 'border-destructive focus:ring-destructive' : ''}
          />
          <p className="text-sm text-muted-foreground" id="name-help">
            Format recommandé: action:ressource (ex: create:products, read:users)
          </p>
          {validationErrors.name && (
            <p className="text-sm text-destructive flex items-center gap-1" id="name-error">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.name}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            Description
            {formData.description && (
              <span className="text-muted-foreground text-sm font-normal">
                ({formData.description.length}/200)
              </span>
            )}
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Description de cette permission..."
            aria-describedby={validationErrors.description ? "description-error" : undefined}
            className={validationErrors.description ? 'border-destructive focus:ring-destructive' : ''}
            rows={3}
          />
          {validationErrors.description && (
            <p className="text-sm text-destructive flex items-center gap-1" id="description-error">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.description}
            </p>
          )}
        </div>
        
        {/* Indicateur de validation */}
        {!Object.keys(validationErrors).length && formData.name && validatePermissionName(formData.name) === null && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Formulaire valide
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={saving || Object.keys(validationErrors).length > 0 || !formData.name?.trim()}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PermissionForm;
