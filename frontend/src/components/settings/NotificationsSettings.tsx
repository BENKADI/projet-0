import { useState, useEffect, useCallback } from 'react';
import { Bell, Save, Mail, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newUserRegistration: boolean;
  systemAlerts: boolean;
  securityAlerts: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
}

export default function NotificationsSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    newUserRegistration: true,
    systemAlerts: true,
    securityAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/settings/preferences');
      const userPrefs = response.data?.[0] || {}; // Prendre le premier élément du tableau

      const newSettings = {
        emailNotifications: userPrefs.emailNotifications ?? true,
        pushNotifications: userPrefs.pushNotifications ?? false,
        newUserRegistration: userPrefs.newUserRegistration ?? true,
        systemAlerts: userPrefs.systemAlerts ?? true,
        securityAlerts: userPrefs.securityAlerts ?? true,
        weeklyReports: userPrefs.weeklyReports ?? false,
        marketingEmails: userPrefs.marketingEmails ?? false,
      };

      setSettings(newSettings);
      setOriginalSettings(newSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      // Si pas de préférences, utiliser les valeurs par défaut
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: false,
        newUserRegistration: true,
        systemAlerts: true,
        securityAlerts: true,
        weeklyReports: false,
        marketingEmails: false,
      };
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
      setHasChanges(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggle = useCallback((field: keyof NotificationSettings) => {
    const newSettings = { ...settings, [field]: !settings[field] };
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await axios.put('/settings/preferences', settings);
      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success('Préférences de notifications enregistrées');
    } catch (error) {
      console.error('Erreur sauvegarde notifications:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const resetToDefaults = useCallback(() => {
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: false,
      newUserRegistration: true,
      systemAlerts: true,
      securityAlerts: true,
      weeklyReports: false,
      marketingEmails: false,
    };
    setSettings(defaultSettings);
    setHasChanges(JSON.stringify(defaultSettings) !== JSON.stringify(originalSettings));
    toast.info('Réinitialisation aux valeurs par défaut');
  }, [originalSettings]);

  const notificationGroups = [
    {
      title: 'Notifications par email',
      icon: <Mail className="h-5 w-5 text-blue-500" />,
      items: [
        {
          key: 'emailNotifications' as keyof NotificationSettings,
          label: 'Notifications par email',
          description: 'Recevoir les notifications importantes par email',
          recommended: true,
        },
        {
          key: 'newUserRegistration' as keyof NotificationSettings,
          label: 'Nouvelles inscriptions',
          description: 'Être notifié quand un nouvel utilisateur s\'inscrit',
          adminOnly: true,
        },
        {
          key: 'systemAlerts' as keyof NotificationSettings,
          label: 'Alertes système',
          description: 'Notifications sur les problèmes techniques ou maintenance',
          critical: true,
        },
        {
          key: 'securityAlerts' as keyof NotificationSettings,
          label: 'Alertes de sécurité',
          description: 'Notifications sur les tentatives de connexion suspectes',
          critical: true,
        },
        {
          key: 'weeklyReports' as keyof NotificationSettings,
          label: 'Rapports hebdomadaires',
          description: 'Résumé hebdomadaire des activités de l\'application',
        },
        {
          key: 'marketingEmails' as keyof NotificationSettings,
          label: 'Emails marketing',
          description: 'Offres spéciales et nouvelles fonctionnalités',
        },
      ],
    },
    {
      title: 'Notifications push',
      icon: <MessageSquare className="h-5 w-5 text-green-500" />,
      items: [
        {
          key: 'pushNotifications' as keyof NotificationSettings,
          label: 'Notifications push',
          description: 'Recevoir des notifications push dans le navigateur',
          note: 'Fonctionnalité à venir',
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-500 animate-pulse" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700 mb-1" />
                      <div className="h-2 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-500" />
          Notifications
        </h3>
        {hasChanges && (
          <span className="text-xs text-orange-500 font-medium">Non sauvegardé</span>
        )}
      </div>

      <div className="space-y-6">
        {notificationGroups.map((group) => (
          <div key={group.title} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              {group.icon}
              <h4 className="font-medium">{group.title}</h4>
            </div>

            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className="font-medium text-sm cursor-pointer">
                        {item.label}
                      </label>
                      {item.recommended && (
                        <CheckCircle className="h-3 w-3 text-green-500" title="Recommandé" />
                      )}
                      {item.critical && (
                        <AlertTriangle className="h-3 w-3 text-red-500" title="Critique" />
                      )}
                      {item.adminOnly && user?.role !== 'admin' && (
                        <span className="text-xs text-orange-500 font-medium">Admin</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                    {item.note && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                        {item.note}
                      </p>
                    )}
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={() => handleToggle(item.key)}
                      disabled={item.adminOnly && user?.role !== 'admin'}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Résumé */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Résumé de vos préférences</h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <div>• Email: {settings.emailNotifications ? 'Activé' : 'Désactivé'}</div>
            <div>• Alertes critiques: {settings.systemAlerts && settings.securityAlerts ? 'Activées' : 'Partiellement désactivées'}</div>
            <div>• Rapports hebdomadaires: {settings.weeklyReports ? 'Activés' : 'Désactivés'}</div>
            <div>• Marketing: {settings.marketingEmails ? 'Activé' : 'Désactivé'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetToDefaults}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Valeurs par défaut
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
          </button>
        </div>
      </div>
    </div>
  );
}
