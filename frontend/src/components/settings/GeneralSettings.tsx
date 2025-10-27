import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Save, Globe, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';

interface GeneralSettingsData {
  appName: string;
  appLanguage: string;
  appCurrency: string;
  appDescription: string;
  appLogo?: string | null;
}

export default function GeneralSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [settings, setSettings] = useState<GeneralSettingsData>({
    appName: '',
    appLanguage: 'fr',
    appCurrency: 'DZD',
    appDescription: '',
    appLogo: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialSettings, setInitialSettings] = useState<GeneralSettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currencyMode, setCurrencyMode] = useState<'dzd' | 'custom'>('dzd');
  const [customCurrency, setCustomCurrency] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/settings/app');
      // S'assurer qu'aucun champ n'est null (convertir en chaîne vide)
      const data = {
        appName: response.data.appName || '',
        appLanguage: response.data.appLanguage || 'fr',
        appCurrency: response.data.appCurrency || 'DZD',
        appDescription: response.data.appDescription || '',
        appLogo: response.data.appLogo || null,
      };
      setSettings(data);
      setInitialSettings(data);
      setCurrencyMode(data.appCurrency === 'DZD' ? 'dzd' : 'custom');
      setCustomCurrency(data.appCurrency !== 'DZD' ? data.appCurrency : '');
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
    if (!isAdmin) {
      toast.error('Seuls les administrateurs peuvent modifier ces paramètres.');
      return;
    }
    if (!isValid) {
      toast.error('Le nom de l’application est requis.');
      return;
    }
    // Déterminer la devise à sauvegarder
    const nextCurrency = currencyMode === 'dzd' ? 'DZD' : customCurrency.toUpperCase();
    if (currencyMode === 'custom' && !/^[A-Z]{3}$/.test(nextCurrency)) {
      toast.error('Veuillez saisir un code devise valide (3 lettres, ex: EUR).');
      return;
    }
    setSaving(true);
    try {
      await axios.put('/settings/app', { ...settings, appCurrency: nextCurrency });
      toast.success('Paramètres enregistrés avec succès.');
      setInitialSettings({ ...settings, appCurrency: nextCurrency });
      setError(null);
      await fetchSettings();
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

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
    handleUploadLogo(file);
  };

  const handleUploadLogo = async (file: File) => {
    if (!isAdmin) {
      toast.error('Seuls les administrateurs peuvent modifier le logo.');
      return;
    }
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append('logo', file);
      await axios.post('/settings/logo', form);
      toast.success('Logo uploadé avec succès.');
      setLogoPreview(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
      await fetchSettings();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de l\'upload du logo';
        toast.error(message);
        console.error('Upload logo error:', error.response?.data);
      } else {
        toast.error('Erreur lors de l\'upload du logo');
        console.error('Upload logo error:', error);
      }
      setLogoPreview(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    } finally {
      setUploadingLogo(false);
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

      {!isAdmin && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          Vous pouvez consulter ces paramètres, mais seules les personnes ayant le rôle administrateur peuvent les modifier.
        </div>
      )}

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
            disabled={saving || !isAdmin}
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
            disabled={saving || !isAdmin}
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
            value={currencyMode}
            onChange={(e) => {
              const mode = e.target.value as 'dzd' | 'custom';
              setCurrencyMode(mode);
              setSettings({ ...settings, appCurrency: mode === 'dzd' ? 'DZD' : (customCurrency || '') });
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            disabled={saving || !isAdmin}
          >
            <option value="dzd">DZD (دج)</option>
            <option value="custom">Autre (personnalisé)</option>
          </select>
          {currencyMode === 'custom' && (
            <div className="mt-2">
              <input
                type="text"
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="Ex: EUR"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                disabled={saving || !isAdmin}
              />
              <p className="text-xs text-gray-500 mt-1">Code devise ISO 4217, 3 lettres (ex: DZD, EUR, USD)</p>
            </div>
          )}
        </div>

        {/* Logo de l'application */}
        <div>
          <label className="block text-sm font-medium mb-2">Logo de l'application</label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 min-h-[80px] min-w-[80px] rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-sm p-2">
              {logoPreview ? (
                <img src={logoPreview} alt="Aperçu logo" className="max-h-full max-w-full object-contain" />
              ) : settings.appLogo ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${settings.appLogo}?t=${Date.now()}`} 
                  alt="Logo" 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    if (import.meta.env.DEV) {
                      console.error('Erreur chargement logo:', settings.appLogo);
                    }
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={() => {
                    if (import.meta.env.DEV) {
                      console.log('Logo chargé:', settings.appLogo);
                    }
                  }}
                />
              ) : (
                <span className="text-xs text-gray-400">Aucun</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoFile(f);
                }}
                disabled={!isAdmin || uploadingLogo}
                className="text-sm"
              />
              {uploadingLogo && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Téléversement en cours...
                </div>
              )}
              <p className="text-xs text-gray-500">JPG, PNG, GIF ou WEBP (max 5 MB). Le logo est uploadé automatiquement.</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={settings.appDescription}
            onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            disabled={saving || !isAdmin}
            rows={3}
            placeholder="Description de votre application..."
          />
        </div>

        {/* Bouton Enregistrer */}
        <button
          type="submit"
          disabled={saving || !isDirty || !isValid || !isAdmin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
