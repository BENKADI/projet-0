import { useState, useEffect, useRef } from 'react';
import { User, Save, Mail, Building, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  provider?: string;
  createdAt?: string;
}

export default function ProfileSettings() {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Charger depuis l'API pour obtenir les dernières infos (y compris avatar)
      const response = await axios.get('/users/me');
      const me = response.data;
      setProfile({
        firstName: me.firstName || '',
        lastName: me.lastName || '',
        email: me.email,
        role: me.role || 'user',
        avatarUrl: me.avatarUrl || null,
        provider: me.provider,
        createdAt: me.createdAt,
      });
    } catch {
      console.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide.');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 MB.');
      return;
    }

    // Prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await axios.post('/users/me/avatar', formData);

      toast.success('Photo de profil mise à jour avec succès!');
      setAvatarPreview(null);
      if (data?.user?.avatarUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: data.user.avatarUrl }));
      }
      // Recharger le profil pour obtenir la nouvelle URL
      fetchProfile();
      await refreshUser();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'upload.');
      } else {
        toast.error('Erreur lors de l\'upload de la photo.');
      }
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) return;

    setUploadingAvatar(true);
    try {
      await axios.delete('/users/me/avatar');
      toast.success('Photo de profil supprimée.');
      setProfile((prev) => ({ ...prev, avatarUrl: null }));
      fetchProfile();
      await refreshUser();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression.');
      } else {
        toast.error('Erreur lors de la suppression.');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mettre à jour le profil via l'API users
      await axios.put('/users/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      toast.success('Profil mis à jour avec succès!');
      await refreshUser();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
      } else {
        toast.error('Erreur lors de la mise à jour du profil.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-green-500" />
          Profil Utilisateur
        </h3>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="relative">
            <Avatar className="h-20 w-20">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Aperçu" />
              ) : profile.avatarUrl ? (
                <AvatarImage src={`${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '')}${profile.avatarUrl}`} alt="Avatar" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {profile.firstName?.[0]?.toUpperCase() || profile.email[0]?.toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium">Photo de profil</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              JPG, PNG, GIF ou WEBP (max 5 MB)
            </div>
            <div className="flex gap-2 mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                Changer la photo
              </button>
              {profile.avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={uploadingAvatar}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Prénom
          </label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Jean"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Nom
          </label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Dupont"
          />
        </div>

        {/* Email (lecture seule) */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            L'email ne peut pas être modifié
          </p>
        </div>

        {/* Rôle (lecture seule) */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Rôle
          </label>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-2 rounded-lg font-medium capitalize ${
              profile.role === 'admin' 
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            }`}>
              {profile.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
            </span>
          </div>
        </div>

        {/* Informations compte */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Informations du compte</h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Méthode de connexion:</span> {profile.provider || 'local'}
            </div>
            <div>
              <span className="font-medium">Compte créé:</span> {new Date(profile.createdAt || Date.now()).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
