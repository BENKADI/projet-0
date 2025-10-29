import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Save, RefreshCw, Eye } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

// Contexte pour le thème dynamique
export const ThemeContext = React.createContext<{
  primaryColor: string;
  accentColor: string;
  theme: 'light' | 'dark' | 'auto';
  applyTheme: (primary: string, accent: string, theme: 'light' | 'dark' | 'auto') => void;
}>({
  primaryColor: '#3b82f6',
  accentColor: '#8b5cf6',
  theme: 'light',
  applyTheme: () => {},
});

// Hook personnalisé pour utiliser le thème
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface DynamicThemeProviderProps {
  children: React.ReactNode;
}

export function DynamicThemeProvider({ children }: DynamicThemeProviderProps) {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [accentColor, setAccentColor] = useState('#8b5cf6');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');

  // Appliquer le thème dynamiquement
  const applyTheme = useCallback((primary: string, accent: string, newTheme: 'light' | 'dark' | 'auto') => {
    setPrimaryColor(primary);
    setAccentColor(accent);
    setTheme(newTheme);

    // Appliquer les variables CSS
    const root = document.documentElement;

    // Couleurs primaires
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-hover', adjustBrightness(primary, -10));
    root.style.setProperty('--color-primary-light', adjustBrightness(primary, 20));

    // Couleurs d'accent
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-accent-hover', adjustBrightness(accent, -10));
    root.style.setProperty('--color-accent-light', adjustBrightness(accent, 20));

    // Appliquer le thème (light/dark/auto)
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto: basé sur les préférences système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('theme-settings', JSON.stringify({ primary, accent, theme: newTheme }));
  }, []);

  // Ajuster la luminosité d'une couleur hex
  function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('theme-settings');
    if (saved) {
      try {
        const { primary, accent, theme: savedTheme } = JSON.parse(saved);
        applyTheme(primary || '#3b82f6', accent || '#8b5cf6', savedTheme || 'light');
      } catch (e) {
        console.warn('Erreur chargement thème sauvegardé:', e);
      }
    }

    // Écouter les changements de préférences système pour le mode auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme(primaryColor, accentColor, 'auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, primaryColor, accentColor, theme]);

  const contextValue = {
    primaryColor,
    accentColor,
    theme,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Composant pour gérer le thème dynamique dans les paramètres
interface DynamicThemeSettingsProps {
  onThemeChange?: (primary: string, accent: string, theme: 'light' | 'dark' | 'auto') => void;
}

export default function DynamicThemeSettings({ onThemeChange }: DynamicThemeSettingsProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { primaryColor, accentColor, theme, applyTheme } = useTheme();
  const [settings, setSettings] = useState({
    primaryColor,
    accentColor,
    theme,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/settings/app');
      const newSettings = {
        primaryColor: response.data?.primaryColor || '#3b82f6',
        accentColor: response.data?.accentColor || '#8b5cf6',
        theme: response.data?.theme || 'light',
      };
      setSettings(newSettings);
      applyTheme(newSettings.primaryColor, newSettings.accentColor, newSettings.theme);
      setHasChanges(false);
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  const validateHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleColorChange = (field: 'primaryColor' | 'accentColor', value: string) => {
    if (!validateHexColor(value) && value !== '') {
      toast.error('Couleur hexadécimale invalide');
      return;
    }

    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    applyTheme(
      field === 'primaryColor' ? value : settings.primaryColor,
      field === 'accentColor' ? value : settings.accentColor,
      settings.theme
    );
    setHasChanges(true);

    // Notifier le parent
    if (onThemeChange) {
      onThemeChange(
        field === 'primaryColor' ? value : settings.primaryColor,
        field === 'accentColor' ? value : settings.accentColor,
        settings.theme
      );
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    applyTheme(settings.primaryColor, settings.accentColor, newTheme);
    setHasChanges(true);

    if (onThemeChange) {
      onThemeChange(settings.primaryColor, settings.accentColor, newTheme);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Administrateur requis');
      return;
    }

    if (!validateHexColor(settings.primaryColor) || !validateHexColor(settings.accentColor)) {
      toast.error('Corriger les couleurs avant sauvegarde');
      return;
    }

    setSaving(true);
    try {
      await axios.put('/settings/app', {
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        theme: settings.theme,
      });
      setHasChanges(false);
      toast.success('Thème sauvegardé');
    } catch (error) {
      toast.error('Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      primaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      theme: 'light' as const,
    };
    setSettings(defaults);
    applyTheme(defaults.primaryColor, defaults.accentColor, defaults.theme);
    setHasChanges(true);
    toast.info('Réinitialisé aux valeurs par défaut');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5" style={{ color: primaryColor }} />
          Thème Dynamique
        </h3>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400">Application temps réel</span>
          {hasChanges && (
            <span className="text-xs text-orange-500">Non sauvegardé</span>
          )}
        </div>
      </div>

      {/* Thème */}
      <div>
        <label className="block text-sm font-medium mb-3">Mode d'affichage</label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'auto'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`p-4 border-2 rounded-lg transition-all ${
                settings.theme === t
                  ? 'border-current shadow-sm'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
              style={{
                borderColor: settings.theme === t ? primaryColor : undefined,
                backgroundColor: settings.theme === t ? `${primaryColor}10` : undefined,
              }}
              disabled={!isAdmin}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {t === 'light' && '☀️'}
                  {t === 'dark' && '🌙'}
                  {t === 'auto' && '🔄'}
                </div>
                <div className="text-sm font-medium capitalize">{t}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Couleurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-3">Couleur Primaire</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
              disabled={!isAdmin}
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              disabled={!isAdmin}
              placeholder="#3b82f6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Couleur d'Accent</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => handleColorChange('accentColor', e.target.value)}
              className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
              disabled={!isAdmin}
            />
            <input
              type="text"
              value={settings.accentColor}
              onChange={(e) => handleColorChange('accentColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              disabled={!isAdmin}
              placeholder="#8b5cf6"
            />
          </div>
        </div>
      </div>

      {/* Preview temps réel */}
      <div className="p-4 border-2 border-dashed rounded-lg" style={{ borderColor: primaryColor }}>
        <div className="text-center mb-4">
          <h4 className="font-medium" style={{ color: primaryColor }}>Aperçu Temps Réel</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Les changements sont appliqués immédiatement</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 rounded-lg text-white font-medium shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Bouton Primaire
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white font-medium shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            Bouton Accent
          </button>
          <button
            className="px-4 py-2 rounded-lg border-2 font-medium"
            style={{
              borderColor: primaryColor,
              color: primaryColor,
              backgroundColor: `${primaryColor}20`
            }}
          >
            Bouton Outline
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={resetToDefaults}
          disabled={!isAdmin}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Valeurs par défaut
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving || !isAdmin}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: hasChanges && !saving ? primaryColor : '#9ca3af',
          }}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder le thème'}
        </button>
      </div>

      {!isAdmin && (
        <div className="text-xs text-gray-500 bg-yellow-50 dark:bg-yellow-950 p-3 rounded border border-yellow-200 dark:border-yellow-800">
          <strong>💡 Info:</strong> Seuls les administrateurs peuvent modifier le thème global. Les changements sont appliqués à tous les utilisateurs.
        </div>
      )}
    </div>
  );
}
