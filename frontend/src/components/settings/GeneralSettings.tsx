import { useState, useEffect } from 'react';
import { Save, Globe, DollarSign } from 'lucide-react';
import axios from '../../lib/axios';

interface GeneralSettingsData {
  appName: string;
  appLanguage: string;
  appCurrency: string;
  appDescription: string;
}

export default function GeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettingsData>({
    appName: '',
    appLanguage: 'fr',
    appCurrency: 'EUR',
    appDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/settings/app');
      // S'assurer qu'aucun champ n'est null (convertir en chaîne vide)
      setSettings({
        appName: response.data.appName || '',
        appLanguage: response.data.appLanguage || 'fr',
        appCurrency: response.data.appCurrency || 'EUR',
        appDescription: response.data.appDescription || '',
      });
    } catch (error: any) {
      console.error('Erreur lors du chargement des paramètres:', error);
      // Si 401, l'intercepteur s'en occupe
      // Pour les autres erreurs, on utilise les valeurs par défaut
      if (error.response?.status !== 401) {
        // Garder les valeurs par défaut
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/settings/app', settings);
      alert('✅ Paramètres enregistrés avec succès!');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Paramètres Généraux
        </h3>
      </div>

      <div className="space-y-4">
        {/* Nom de l'application */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Nom de l'application
          </label>
          <input
            type="text"
            value={settings.appName}
            onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Mon Application"
          />
        </div>

        {/* Langue */}
        <div>
          <label className="block text-sm font-medium mb-2">Langue</label>
          <select
            value={settings.appLanguage}
            onChange={(e) => setSettings({ ...settings, appLanguage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="ar">🇲🇦 العربية</option>
          </select>
        </div>

        {/* Devise */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Devise
          </label>
          <select
            value={settings.appCurrency}
            onChange={(e) => setSettings({ ...settings, appCurrency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="MAD">MAD (د.م.)</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={settings.appDescription}
            onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            rows={3}
            placeholder="Description de votre application..."
          />
        </div>

        {/* Bouton Enregistrer */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
