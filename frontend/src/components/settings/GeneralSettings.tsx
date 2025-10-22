import { useState, useEffect, useMemo, useCallback } from 'react';
import { Save, Globe, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
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
  const [initialSettings, setInitialSettings] = useState<GeneralSettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/settings/app');
      // S'assurer qu'aucun champ n'est null (convertir en chaîne vide)
      const data = {
        appName: response.data.appName || '',
        appLanguage: response.data.appLanguage || 'fr',
        appCurrency: response.data.appCurrency || 'EUR',
        appDescription: response.data.appDescription || '',
      };
      setSettings(data);
      setInitialSettings(data);
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des paramètres:', error);
      // Si 401, l'intercepteur s'en occupe
      // Pour les autres erreurs, on utilise les valeurs par défaut
      if (isAxiosError(error) && error.response?.status !== 401) {
        // Garder les valeurs par défaut
        setError('Impossible de charger les paramètres. Veuillez réessayer.');
        toast.error('Échec du chargement des paramètres.');
      }
      if (!isAxiosError(error)) {
        setError('Une erreur inattendue est survenue.');
        toast.error('Une erreur inattendue est survenue.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const isValid = useMemo(() => settings.appName.trim().length > 0, [settings.appName]);

  const isDirty = useMemo(() => {
    if (!initialSettings) return true;
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const handleSave = async () => {
    if (!isValid) {
      toast.error('Le nom de l’application est requis.');
      return;
    }
    setSaving(true);
    try {
      await axios.put('/settings/app', settings);
      toast.success('Paramètres enregistrés avec succès.');
      setInitialSettings({ ...settings });
      setError(null);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const message = axiosError.response?.data?.message || axiosError.message;
        toast.error(message || 'Erreur lors de la sauvegarde des paramètres.');
      } else {
        toast.error('Erreur lors de la sauvegarde des paramètres.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Paramètres Généraux
        </h3>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); handleSave(); }} aria-busy={saving}>
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
            disabled={saving}
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
            disabled={saving}
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
            disabled={saving}
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
            disabled={saving}
            rows={3}
            placeholder="Description de votre application..."
          />
        </div>

        {/* Bouton Enregistrer */}
        <button
          type="submit"
          disabled={saving || !isDirty || !isValid}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
