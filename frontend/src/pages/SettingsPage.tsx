import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import GeneralSettings from '../components/settings/GeneralSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import SystemSettings from '../components/settings/SystemSettings';
import PermissionsSettings from '../components/settings/PermissionsSettings';
import BackupHistory from '../components/settings/BackupHistory';
import PushNotificationsSettings from '../components/settings/PushNotificationsSettings';

type TabType = 'general' | 'profile' | 'appearance' | 'notifications' | 'security' | 'backups' | 'push' | 'system' | 'permissions';

const SettingsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Gérer le paramètre d'URL pour l'onglet actif
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['general', 'profile', 'appearance', 'notifications', 'security', 'backups', 'push', 'system', 'permissions'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'general' as TabType, label: 'Général', icon: '🌍', adminOnly: false },
    { id: 'profile' as TabType, label: 'Profil', icon: '👤', adminOnly: false },
    { id: 'appearance' as TabType, label: 'Apparence', icon: '🎨', adminOnly: false },
    { id: 'notifications' as TabType, label: 'Notifications', icon: '🔔', adminOnly: false },
    { id: 'security' as TabType, label: 'Sécurité', icon: '🔒', adminOnly: false },
    { id: 'backups' as TabType, label: 'Backups', icon: '📦', adminOnly: true },
    { id: 'push' as TabType, label: 'Push Temps Réel', icon: '🚀', adminOnly: true },
    { id: 'system' as TabType, label: 'Système', icon: '💾', adminOnly: true },
    { id: 'permissions' as TabType, label: 'Permissions', icon: '🛡️', adminOnly: true },
  ].filter(tab => !tab.adminOnly || user?.role === 'admin');

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Paramètres
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Gérez les paramètres de votre application et vos préférences
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* En-têtes des tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu des tabs */}
          <div className="p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'backups' && <BackupHistory />}
            {activeTab === 'push' && <PushNotificationsSettings />}
            {activeTab === 'system' && <SystemSettings />}
            {activeTab === 'permissions' && <PermissionsSettings />}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Astuce:</strong> Tous les changements sont sauvegardés automatiquement sur vos serveurs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
