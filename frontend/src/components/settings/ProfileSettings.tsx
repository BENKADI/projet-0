import { useState, useEffect } from 'react';
import { User, Save, Mail, Building } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function ProfileSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Récupérer les infos depuis le user connecté
      if (user) {
        setProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          role: user.role || 'user',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
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
      alert('✅ Profil mis à jour avec succès!');
    } catch (error) {
      alert('❌ Erreur lors de la mise à jour du profil');
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
        {/* Avatar (placeholder) */}
        <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.firstName?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium">Photo de profil</div>
            <div className="text-sm text-gray-500">
              Upload de photo à venir
            </div>
            <button
              disabled
              className="mt-2 text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded cursor-not-allowed"
            >
              Changer la photo
            </button>
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
              <span className="font-medium">Méthode de connexion:</span> {user?.provider || 'local'}
            </div>
            <div>
              <span className="font-medium">Compte créé:</span> {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR')}
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
