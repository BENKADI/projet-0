import { useState, useEffect, useCallback, useMemo } from 'react';
import { Palette, Save, Eye, EyeOff, RefreshCw } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface AppearanceData {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
}

interface ColorPreset {
  name: string;
  primary: string;
  accent: string;
}

const colorPresets: ColorPreset[] = [
  { name: 'Bleu par défaut', primary: '#3b82f6', accent: '#8b5cf6' },
  { name: 'Vert nature', primary: '#10b981', accent: '#06b6d4' },
  { name: 'Rouge passion', primary: '#ef4444', accent: '#f97316' },
  { name: 'Gris élégant', primary: '#6b7280', accent: '#9333ea' },
  { name: 'Orange énergie', primary: '#f97316', accent: '#eab308' },
];

export default function AppearanceSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [settings, setSettings] = useState<AppearanceData>({
    theme: 'light',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AppearanceData | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/settings/app');
      const newSettings = {
        theme: response.data?.theme || 'light',
        primaryColor: response.data?.primaryColor || '#3b82f6',
        accentColor: response.data?.accentColor || '#8b5cf6',
      };
      setSettings(newSettings);
      setOriginalSettings(newSettings);
      setHasChanges(false);
    } catch (error) {
      toast.error("Impossible de charger l'apparence");
    } finally {
      setLoading(false);
    }
  }, []);

  const validateHexColor = useCallback((color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }, []);

  const handleColorChange = useCallback((field: 'primaryColor' | 'accentColor', value: string) => {
    if (!validateHexColor(value) && value !== '') {
      toast.error('Veuillez entrer une couleur hexadécimale valide (ex: #3b82f6)');
      return;
    }
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings, validateHexColor]);

  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'auto') => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const applyPreset = useCallback((preset: ColorPreset) => {
    const newSettings = {
      theme: settings.theme,
      primaryColor: preset.primary,
      accentColor: preset.accent,
    };
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
    toast.success(`Preset "${preset.name}" appliqué`);
  }, [settings.theme, originalSettings]);

  const resetToDefaults = useCallback(() => {
    const defaultSettings = {
      theme: 'light' as const,
      primaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
    };
    setSettings(defaultSettings);
    setHasChanges(JSON.stringify(defaultSettings) !== JSON.stringify(originalSettings));
    toast.info('Paramètres réinitialisés aux valeurs par défaut');
  }, [originalSettings]);

  const handleSave = useCallback(async () => {
    if (!isAdmin) {
      toast.error('Seuls les administrateurs peuvent modifier ces paramètres.');
      return;
    }
    if (!validateHexColor(settings.primaryColor) || !validateHexColor(settings.accentColor)) {
      toast.error('Veuillez corriger les couleurs avant de sauvegarder');
      return;
    }
    setSaving(true);
    try {
      await axios.put('/settings/app', settings);
      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success('Apparence enregistrée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }, [isAdmin, settings, validateHexColor]);

  // Optimisation: memoiser les presets pour éviter les re-rendus inutiles
  const memoizedPresets = useMemo(() => colorPresets, []);

  // Optimisation: memoiser l'état de chargement et de sauvegarde
  const isDisabled = useMemo(() => !isAdmin || saving || loading, [isAdmin, saving, loading]);
  const canSave = useMemo(() => isAdmin && hasChanges && !saving && !loading, [isAdmin, hasChanges, saving, loading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Apparence
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={showPreview ? 'Masquer la prévisualisation' : 'Afficher la prévisualisation'}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {hasChanges && (
            <span className="text-xs text-orange-500 font-medium">Non sauvegardé</span>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          Vous pouvez consulter l'apparence, mais seules les personnes ayant le rôle administrateur peuvent la modifier.
        </div>
      )}

      <div className="space-y-6">
        {loading && (
          <div className="space-y-4">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        )}

        {!loading && (
          <>
            {/* Thème */}
            <div>
              <label className="block text-sm font-medium mb-3" id="theme-label">
                Thème de l'interface
              </label>
              <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-labelledby="theme-label">
                {(['light', 'dark', 'auto'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`p-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      settings.theme === theme
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    disabled={isDisabled}
                    role="radio"
                    aria-checked={settings.theme === theme}
                    aria-describedby={`theme-${theme}-desc`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">
                        {theme === 'light' && '☀️'}
                        {theme === 'dark' && '🌙'}
                        {theme === 'auto' && '🔄'}
                      </div>
                      <div className="text-sm font-medium capitalize">{theme}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400" id={`theme-${theme}-desc`}>
                        {theme === 'light' && 'Clair'}
                        {theme === 'dark' && 'Sombre'}
                        {theme === 'auto' && 'Automatique'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets de couleurs */}
            <div>
              <label className="block text-sm font-medium mb-3">Presets de couleurs</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {memoizedPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isDisabled}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-sm">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs personnalisées */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3" htmlFor="primary-color">
                  Couleur Primaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="primary-color"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="h-12 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                    disabled={isDisabled}
                    aria-describedby="primary-color-desc"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isDisabled}
                      placeholder="#3b82f6"
                      aria-describedby="primary-color-desc"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" id="primary-color-desc">
                      Format hexadécimal (ex: #3b82f6)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" htmlFor="accent-color">
                  Couleur d'Accent
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="accent-color"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="h-12 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                    disabled={isDisabled}
                    aria-describedby="accent-color-desc"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isDisabled}
                      placeholder="#8b5cf6"
                      aria-describedby="accent-color-desc"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" id="accent-color-desc">
                      Format hexadécimal (ex: #8b5cf6)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview amélioré */}
            {showPreview && (
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Prévisualisation</h4>
                  <span className="text-xs text-gray-500">Basé sur le thème "{settings.theme}"</span>
                </div>
                
                <div className="space-y-4">
                  {/* Preview des couleurs */}
                  <div className="flex gap-3 items-center">
                    <div className="text-center">
                      <div
                        className="h-16 w-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: settings.primaryColor }}
                      />
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Primaire</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="h-16 w-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: settings.accentColor }}
                      />
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Accent</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Interface exemple</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview des boutons */}
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: settings.primaryColor }}
                      disabled
                    >
                      Bouton primaire
                    </button>
                    <button
                      className="px-4 py-2 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: settings.accentColor }}
                      disabled
                    >
                      Bouton accent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetToDefaults}
                disabled={isDisabled}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </button>
              
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: canSave ? settings.primaryColor : '#9ca3af',
                  cursor: canSave ? 'pointer' : 'not-allowed'
                }}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer les changements'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
