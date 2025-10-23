import { useState, useEffect, useRef } from 'react';
import { Database, Save, AlertTriangle, Upload } from 'lucide-react';
import { isAxiosError } from 'axios';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface SystemData {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  passwordPolicy: string;
}

export default function SystemSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [settings, setSettings] = useState<SystemData>({
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSize: 10,
    sessionTimeout: 3600,
    passwordPolicy: 'medium',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const restoreInputRef = useRef<HTMLInputElement>(null);

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
    } catch {
      console.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/settings/app', settings);
      toast.success('Paramètres système enregistrés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleSwitch = (field: keyof SystemData) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  const handleViewLogs = () => {
    toast.info('Ouverture des logs...');
    window.open('/api-docs', '_blank');
  };

  const handleBackupDB = async () => {
    if (!confirm('Voulez-vous vraiment créer un backup de la base de données ?')) return;
    try {
      toast.info('Création du backup en cours...');
      const response = await axios.get('/backup/create', {
        responseType: 'blob',
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Backup téléchargé avec succès!');
    } catch (error) {
      console.error('Erreur backup:', error);
      toast.error('Erreur lors de la création du backup.');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Voulez-vous vraiment vider le cache ?')) return;
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Cache vidé avec succès. Rechargez la page pour appliquer.');
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      toast.error('Erreur lors du vidage du cache.');
    }
  };

  const handleViewStats = async () => {
    try {
      const response = await axios.get('/backup/stats');
      const stats = response.data;
      
      const message = `Statistiques du système:

👥 Utilisateurs:
  - Total: ${stats.users.total}
  - Admins: ${stats.users.admins}
  - Utilisateurs: ${stats.users.regular}

🔑 Permissions: ${stats.permissions}

⚙️ Paramètres: ${stats.settings}

💻 Système:
  - Uptime: ${stats.system.uptime}
  - Node: ${stats.system.nodeVersion}
  - Plateforme: ${stats.system.platform}
  - Mémoire: ${stats.system.memory.used}MB / ${stats.system.memory.total}MB`;
      
      alert(message);
    } catch (error) {
      console.error('Erreur stats:', error);
      toast.error('Erreur lors de la récupération des statistiques.');
    }
  };

  const handleRestoreBackup = async (file: File) => {
    if (!confirm('⚠️ ATTENTION: La restauration va écraser les paramètres et permissions actuels.\n\nLes utilisateurs ne seront PAS écrasés pour des raisons de sécurité.\n\nVoulez-vous continuer ?')) {
      return;
    }

    try {
      toast.info('Restauration du backup en cours...');
      const formData = new FormData();
      formData.append('backup', file);

      const response = await axios.post('/backup/restore', formData);
      
      const result = response.data;
      let message = `Backup restauré avec succès!\n\n`;
      message += `✅ ${result.restored.permissions} permissions\n`;
      message += `✅ ${result.restored.appSettings} paramètres\n`;
      message += `✅ ${result.restored.userPreferences} préférences\n`;
      
      if (result.warnings && result.warnings.length > 0) {
        message += `\n⚠️ Avertissements:\n`;
        result.warnings.forEach((w: string) => {
          message += `- ${w}\n`;
        });
      }
      
      alert(message);
      toast.success('Restauration terminée! Rechargez la page.');
      
      // Recharger les paramètres
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: unknown) {
      console.error('Erreur restauration:', error);
      if (isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de la restauration du backup';
        toast.error(message);
      } else {
        toast.error('Erreur lors de la restauration du backup');
      }
    } finally {
      if (restoreInputRef.current) {
        restoreInputRef.current.value = '';
      }
    }
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
              <span className="font-medium">Environnement:</span> {import.meta.env.MODE || 'development'}
            </div>
          </div>
        </div>

        {/* Actions système */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h4 className="font-medium mb-3">Actions Système</h4>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleViewLogs}
              disabled={!isAdmin}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Voir les logs
            </button>
            <button 
              onClick={handleBackupDB}
              disabled={!isAdmin}
              className="px-4 py-2 bg-green-200 dark:bg-green-700 rounded-lg hover:bg-green-300 dark:hover:bg-green-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Créer Backup
            </button>
            <button 
              onClick={() => restoreInputRef.current?.click()}
              disabled={!isAdmin}
              className="px-4 py-2 bg-blue-200 dark:bg-blue-700 rounded-lg hover:bg-blue-300 dark:hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 Restaurer Backup
            </button>
            <button 
              onClick={handleViewStats}
              disabled={!isAdmin}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📈 Statistiques
            </button>
            <button 
              onClick={handleClearCache}
              className="px-4 py-2 bg-orange-200 dark:bg-orange-700 rounded-lg hover:bg-orange-300 dark:hover:bg-orange-600 text-sm col-span-2"
            >
              🔄 Vider cache
            </button>
          </div>
          <input
            ref={restoreInputRef}
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleRestoreBackup(file);
            }}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-3">
            💾 Créer: Télécharge un fichier JSON • 📥 Restaurer: Restaure paramètres et permissions (utilisateurs préservés) • 📈 Stats: Temps réel
          </p>
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres système'}
        </button>
      </div>
    </div>
  );
}
