import { useAppSettings } from '@/contexts/AppSettingsContext';

/**
 * Hook personnalisé pour accéder facilement aux paramètres de l'application
 */
export const useAppConfig = () => {
  const { settings, loading } = useAppSettings();

  return {
    appName: settings?.appName || 'Projet-0',
    appLanguage: settings?.appLanguage || 'fr',
    appCurrency: settings?.appCurrency || 'DZD',
    appDescription: settings?.appDescription || '',
    appLogo: settings?.appLogo || null,
    theme: settings?.theme || 'light',
    primaryColor: settings?.primaryColor || '#3b82f6',
    accentColor: settings?.accentColor || '#8b5cf6',
    maintenanceMode: settings?.maintenanceMode || false,
    allowRegistration: settings?.allowRegistration || true,
    loading
  };
};
