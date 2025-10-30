import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Settings,
  Globe,
  User,
  Palette,
  Bell,
  Shield,
  Archive,
  Zap,
  Server,
  Search,
  Menu,
  X,
  Crown,
  Sparkles,
  type LucideIcon
} from 'lucide-react';
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
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

type TabType = 'general' | 'profile' | 'appearance' | 'notifications' | 'security' | 'backups' | 'push' | 'system' | 'permissions';

interface TabConfig {
  id: TabType;
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
  description: string;
  color: string;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Gérer le paramètre d'URL pour l'onglet actif
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['general', 'profile', 'appearance', 'notifications', 'security', 'backups', 'push', 'system', 'permissions'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  const tabs: TabConfig[] = useMemo(() => (
    [
      {
        id: 'general',
        label: 'Général',
        icon: Globe,
        adminOnly: false,
        description: 'Configuration de base de l\'application',
        color: 'text-blue-500'
      },
      {
        id: 'profile',
        label: 'Profil',
        icon: User,
        adminOnly: false,
        description: 'Informations personnelles et préférences',
        color: 'text-green-500'
      },
      {
        id: 'appearance',
        label: 'Apparence',
        icon: Palette,
        adminOnly: false,
        description: 'Thème et personnalisation visuelle',
        color: 'text-purple-500'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        adminOnly: false,
        description: 'Préférences de notifications',
        color: 'text-orange-500'
      },
      {
        id: 'security',
        label: 'Sécurité',
        icon: Shield,
        adminOnly: false,
        description: 'Paramètres de sécurité et authentification',
        color: 'text-red-500'
      },
      {
        id: 'backups',
        label: 'Sauvegardes',
        icon: Archive,
        adminOnly: true,
        description: 'Gestion des sauvegardes système',
        color: 'text-amber-500'
      },
      {
        id: 'push',
        label: 'Push Temps Réel',
        icon: Zap,
        adminOnly: true,
        description: 'Notifications push en temps réel',
        color: 'text-cyan-500'
      },
      {
        id: 'system',
        label: 'Système',
        icon: Server,
        adminOnly: true,
        description: 'Paramètres système avancés',
        color: 'text-gray-500'
      },
      {
        id: 'permissions',
        label: 'Permissions',
        icon: Shield,
        adminOnly: true,
        description: 'Gestion des permissions utilisateur',
        color: 'text-indigo-500'
      },
    ]
  ), []);

  const filteredTabs = useMemo(() => {
    if (!searchQuery) {
      return tabs;
    }

    const query = searchQuery.toLowerCase();
    const matches = tabs.filter((tab) =>
      tab.label.toLowerCase().includes(query) ||
      tab.description.toLowerCase().includes(query)
    );

    return matches.length > 0 ? matches : tabs;
  }, [tabs, searchQuery]);

  const isTabDisabled = useCallback(
    (tab: TabConfig) => tab.adminOnly && user?.role !== 'admin',
    [user?.role]
  );

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  const handleTabChange = (tabId: TabType, fromMobileSidebar = false) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab || isTabDisabled(tab)) {
      return;
    }

    setActiveTab(tabId);
    setSearchParams({ tab: tabId });

    if (fromMobileSidebar && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'profile': return <ProfileSettings />;
      case 'appearance': return <AppearanceSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'security': return <SecuritySettings />;
      case 'backups': return <BackupHistory />;
      case 'push': return <PushNotificationsSettings />;
      case 'system': return <SystemSettings />;
      case 'permissions': return <PermissionsSettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar pour desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header de la sidebar */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Paramètres
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configuration
                  </p>
                </div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher une section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const disabled = isTabDisabled(tab);

                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => handleTabChange(tab.id, false)}
                        disabled={disabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 group',
                          isActive && !disabled
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : disabled
                            ? 'opacity-60 cursor-not-allowed text-gray-400 dark:text-gray-500'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <div className={cn(
                          'p-2 rounded-lg transition-colors',
                          isActive && !disabled
                            ? 'bg-primary/20'
                            : disabled
                            ? 'bg-gray-100 dark:bg-gray-700 opacity-50'
                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                        )}>
                          <Icon className={cn('h-5 w-5', disabled ? 'text-gray-400' : tab.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-medium truncate',
                              disabled && 'line-through'
                            )}>
                              {tab.label}
                            </span>
                            <Badge variant={disabled ? 'outline' : 'secondary'} className="text-xs">
                              {disabled ? (
                                <>
                                  <Crown className="h-3 w-3 mr-1" />
                                  Admin requis
                                </>
                              ) : (
                                tab.adminOnly ? (
                                  <>
                                    <Crown className="h-3 w-3 mr-1" />
                                    Admin
                                  </>
                                ) : (
                                  'Utilisateur'
                                )
                              )}
                            </Badge>
                          </div>
                          <p
                            className={cn(
                              'text-xs truncate',
                              !disabled
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-400 dark:text-gray-500'
                            )}
                          >
                            {tab.description}
                          </p>
                        </div>
                        {isActive && !disabled && (
                          <div className="w-1 h-8 bg-primary rounded-full"></div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Astuce
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Tous les changements sont sauvegardés automatiquement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex flex-col h-full">
                {/* Header mobile */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-lg font-semibold">Paramètres</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Barre de recherche mobile */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Navigation mobile */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-2">
                    {filteredTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      const disabled = isTabDisabled(tab);

                      return (
                        <li key={tab.id}>
                          <button
                            onClick={() => handleTabChange(tab.id, true)}
                            disabled={disabled}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200',
                              isActive && !disabled
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : disabled
                                ? 'opacity-60 cursor-not-allowed text-gray-400 dark:text-gray-500'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                          >
                            <div className={cn(
                              'p-2 rounded-lg',
                              isActive && !disabled
                                ? 'bg-primary/20'
                                : disabled
                                ? 'bg-gray-100 dark:bg-gray-700 opacity-50'
                                : 'bg-gray-100 dark:bg-gray-700'
                            )}>
                              <Icon className={cn('h-5 w-5', disabled ? 'text-gray-400' : tab.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  'font-medium truncate',
                                  disabled && 'line-through'
                                )}>
                                  {tab.label}
                                </span>
                                <Badge variant={disabled ? 'outline' : 'secondary'} className="text-xs">
                                  {disabled ? (
                                    <>
                                      <Crown className="h-3 w-3 mr-1" />
                                      Admin requis
                                    </>
                                  ) : (
                                    tab.adminOnly ? (
                                      <>
                                        <Crown className="h-3 w-3 mr-1" />
                                        Admin
                                      </>
                                    ) : (
                                      'Utilisateur'
                                    )
                                  )}
                                </Badge>
                              </div>
                              <p
                                className={cn(
                                  'text-xs truncate',
                                  !disabled
                                    ? 'text-gray-500 dark:text-gray-400'
                                    : 'text-gray-400 dark:text-gray-500'
                                )}
                              >
                                {tab.description}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Contenu principal */}
        <main className="flex-1 lg:ml-80">
          <div className="min-h-screen">
            {/* Header mobile */}
            <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                {activeTabConfig && (
                  <>
                    <activeTabConfig.icon className={cn('h-5 w-5', activeTabConfig.color)} />
                    <span className="font-medium">{activeTabConfig.label}</span>
                  </>
                )}
              </div>

              <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Contenu de l'onglet actif */}
            <div className="p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                {/* En-tête de section pour desktop */}
                <div className="hidden lg:block mb-8">
                  <div className="flex items-center gap-4 mb-2">
                    {activeTabConfig && (
                      <>
                        <div className={cn('p-3 rounded-xl', activeTabConfig.color.replace('text-', 'bg-').replace('-500', '-100'))}>
                          <activeTabConfig.icon className={cn('h-8 w-8', activeTabConfig.color)} />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {activeTabConfig.label}
                          </h1>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {activeTabConfig.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="animate-in fade-in-50 duration-300">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
