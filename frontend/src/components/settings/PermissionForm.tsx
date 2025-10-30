import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';

interface PermissionFormProps {
  permissionId?: number;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  permissionId,
  isEdit = false,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger la permission si c'est un mode édition
  useEffect(() => {
    if (isEdit && permissionId) {
      // TODO: Implémenter le chargement de la permission depuis l'API
      // Pour l'instant, on simule avec des données vides
      setName('');
      setDescription('');
    }
  }, [isEdit, permissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Le nom de la permission est requis');
      return;
    }

    // Validation du format du nom (action:ressource)
    const nameRegex = /^[a-zA-Z]+:[a-zA-Z]+$/;
    if (!nameRegex.test(name)) {
      toast.error('Le nom doit être au format "action:ressource" (ex: "create:user")');
      return;
    }

    setLoading(true);

    try {
      if (isEdit && permissionId) {
        // TODO: Implémenter la mise à jour via l'API
        console.log('Mise à jour de la permission:', { id: permissionId, name, description });
        toast.success('Permission mise à jour avec succès');
      } else {
        // TODO: Implémenter la création via l'API
        console.log('Création de la permission:', { name, description });
        toast.success('Permission créée avec succès');
      }

      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de la permission *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: create:user"
          disabled={loading}
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          Format: action:ressource (ex: create:user, read:profile, delete:post)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de la permission..."
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
};

export default PermissionForm;
