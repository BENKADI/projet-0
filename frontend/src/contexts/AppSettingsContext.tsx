import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAppSettings, type AppSettings } from '@/services/settingsService';

const THEME_STORAGE_KEY = 'vite-ui-theme';

interface AppSettingsContextType {
  settings: AppSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getAppSettings();
      setSettings(data);
      applySettings(data);
    } catch (error) {
      console.error('Error loading app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (settings: AppSettings) => {
    const root = document.documentElement;
    const hasUserThemePreference = Boolean(localStorage.getItem(THEME_STORAGE_KEY));

    if (!hasUserThemePreference) {
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }

    // Appliquer les couleurs personnalisées
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--accent-color', settings.accentColor);

    // Appliquer la langue
    root.setAttribute('lang', settings.appLanguage);
    document.title = settings.appName;

    // Stocker les paramètres dans localStorage pour accès rapide
    localStorage.setItem('appCurrency', settings.appCurrency);
    localStorage.setItem('appLanguage', settings.appLanguage);
    localStorage.setItem('appName', settings.appName);
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!settings) return;

    const hasUserThemePreference = Boolean(localStorage.getItem(THEME_STORAGE_KEY));
    if (hasUserThemePreference || settings.theme !== 'auto') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applySettings(settings);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings]);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
