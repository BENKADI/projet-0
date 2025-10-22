import { useState, useEffect } from 'react';
import { Database, Save, AlertTriangle, Upload } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface SystemData {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  passwordPolicy: string;
}

export default function SystemSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemData>({
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSize: 10,
    sessionTimeout: 3600,
    passwordPolicy: 'medium',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/settings/app');
      setSettings({
        maintenanceMode: response.data.maintenanceMode,
        allowRegistration: response.data.allowRegistration,
        maxUploadSize: response.data.maxUploadSize,
        sessionTimeout: response.data.sessionTimeout,
        passwordPolicy: response.data.passwordPolicy,
      });
    } catch (error) {
      console.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/settings/app', settings);
      alert('✅ Paramètres système enregistrés!');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleSwitch = (field: keyof SystemData) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  // Vérifier si l'utilisateur est admin
  if (user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
        <p className="text-gray-500">
          Seuls les administrateurs peuvent accéder aux paramètres système.
        </p>
      </div>
    );
  }

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-gray-500" />
          Paramètres Système
        </h3>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Attention: Ces paramètres affectent tout le système
        </div>
      </div>

      <div className="space-y-4">
        {/* Mode Maintenance */}
        <div className="p-4 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-950">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Mode Maintenance
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Désactive l'accès pour tous les utilisateurs sauf admins
              </div>
            </div>
            <button
              onClick={() => toggleSwitch('maintenanceMode')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settings.maintenanceMode && (
            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
              ⚠️ Mode maintenance ACTIVÉ
            </div>
          )}
        </div>

        {/* Autoriser les inscriptions */}
        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <div>
            <div className="font-medium">Autoriser les inscriptions</div>
            <div className="text-sm text-gray-500">
              Permet aux nouveaux utilisateurs de créer un compte
            </div>
          </div>
          <button
            onClick={() => toggleSwitch('allowRegistration')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.allowRegistration ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.allowRegistration ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Taille max upload */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Taille maximale d'upload (MB)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.maxUploadSize}
            onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <p className="text-xs text-gray-500 mt-1">
            Recommandé: 10 MB. Maximum: 100 MB
          </p>
        </div>

        {/* Session Timeout */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Délai d'expiration de session (secondes)
          </label>
          <select
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="900">15 minutes</option>
            <option value="1800">30 minutes</option>
            <option value="3600">1 heure</option>
            <option value="7200">2 heures</option>
            <option value="28800">8 heures</option>
            <option value="86400">24 heures</option>
          </select>
        </div>

        {/* Politique de mot de passe */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Politique de mot de passe
          </label>
          <select
            value={settings.passwordPolicy}
            onChange={(e) => setSettings({ ...settings, passwordPolicy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="weak">🔓 Faible (min 6 caractères)</option>
            <option value="medium">🔒 Moyenne (min 8 caractères, lettres + chiffres)</option>
            <option value="strong">🔐 Forte (min 12 caractères, lettres + chiffres + symboles)</option>
          </select>
        </div>

        {/* Info Base de données */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Informations Système</h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Base de données:</span> PostgreSQL
            </div>
            <div>
              <span className="font-medium">Version API:</span> 1.0.0
            </div>
            <div>
              <span className="font-medium">Environnement:</span> {process.env.NODE_ENV || 'development'}
            </div>
          </div>
        </div>

        {/* Actions système */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h4 className="font-medium mb-3">Actions Système</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
              📊 Voir les logs
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
              💾 Backup DB
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
              🔄 Vider cache
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
              📈 Statistiques
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Ces actions seront implémentées dans une future version
          </p>
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres système'}
        </button>
      </div>
    </div>
  );
}
