import React, { useState, useEffect } from 'react';
import { PermissionCreateInput, PermissionUpdateInput, getPermissionById, updatePermission, createPermission } from '@/services/permissionService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, AlertCircle } from 'lucide-react';

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
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement de la permission');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermission();
  }, [permissionId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      if (isEdit && permissionId) {
        await updatePermission(permissionId, formData);
      } else {
        await createPermission(formData as PermissionCreateInput);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
      console.error('Erreur:', err);
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom*</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="ex: create:products"
            required
          />
          <p className="text-sm text-muted-foreground">
            Format recommandé: action:ressource (ex: create:products, read:users)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Description de cette permission..."
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PermissionForm;
