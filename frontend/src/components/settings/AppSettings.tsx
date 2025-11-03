import React, { useState, useEffect } from 'react';
import { getAppSettings, updateAppSettings, type AppSettings as AppSettingsType } from '@/services/settingsService';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Switch } from '../ui/Switch';
import { toast } from 'sonner';
import { Save, Settings, Palette, Bell, Shield, Server, Loader2 } from 'lucide-react';

const AppSettings: React.FC = () => {
  const { refreshSettings } = useAppSettings();
  const [settings, setSettings] = useState<AppSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getAppSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AppSettingsType, value: string | number | boolean) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      // Convertir null en undefined pour appLogo
      const updateData = {
        ...settings,
        appLogo: settings.appLogo ?? undefined,
        appDescription: settings.appDescription ?? undefined
      };
      await updateAppSettings(updateData);
      
      // Rafraîchir les paramètres globaux pour appliquer les changements immédiatement
      await refreshSettings();
      
      toast.success('Paramètres enregistrés et appliqués avec succès !');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Impossible de charger les paramètres</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paramètres Généraux */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Paramètres généraux</CardTitle>
          </div>
          <CardDescription>
            Configuration de base de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Nom de l'application</Label>
              <Input
                id="appName"
                value={settings.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appLanguage">Langue</Label>
              <select
                id="appLanguage"
                value={settings.appLanguage}
                onChange={(e) => handleChange('appLanguage', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={saving}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appCurrency">Devise</Label>
              <select
                id="appCurrency"
                value={settings.appCurrency}
                onChange={(e) => handleChange('appCurrency', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={saving}
              >
                <option value="DZD">DZD (د.ج)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="MAD">MAD (د.م.)</option>
                <option value="TND">TND (د.ت)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="appDescription">Description</Label>
              <Input
                id="appDescription"
                value={settings.appDescription || ''}
                onChange={(e) => handleChange('appDescription', e.target.value)}
                placeholder="Description de votre application"
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apparence */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            <CardTitle>Apparence</CardTitle>
          </div>
          <CardDescription>
            Personnalisation de l'interface utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Thème</Label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={saving}
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Couleur primaire</Label>
              <Input
                id="primaryColor"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                disabled={saving}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Couleur d'accent</Label>
              <Input
                id="accentColor"
                type="color"
                value={settings.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                disabled={saving}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Gestion des notifications système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications par email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications navigateur</Label>
              <p className="text-sm text-muted-foreground">
                Afficher les notifications dans le navigateur
              </p>
            </div>
            <Switch
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => handleChange('browserNotifications', checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Son des notifications</Label>
              <p className="text-sm text-muted-foreground">
                Jouer un son lors des notifications
              </p>
            </div>
            <Switch
              checked={settings.notificationSound}
              onCheckedChange={(checked) => handleChange('notificationSound', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <CardTitle>Sécurité</CardTitle>
          </div>
          <CardDescription>
            Paramètres de sécurité et d'authentification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Authentification à deux facteurs</Label>
              <p className="text-sm text-muted-foreground">
                Activer le 2FA pour tous les utilisateurs
              </p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => handleChange('twoFactorEnabled', checked)}
              disabled={saving}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout de session (secondes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordPolicy">Politique de mot de passe</Label>
              <select
                id="passwordPolicy"
                value={settings.passwordPolicy}
                onChange={(e) => handleChange('passwordPolicy', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={saving}
              >
                <option value="weak">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="strong">Forte</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Système */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-green-500" />
            <CardTitle>Système</CardTitle>
          </div>
          <CardDescription>
            Configuration système et limitations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Mettre l'application en mode maintenance
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autoriser les inscriptions</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux nouveaux utilisateurs de s'inscrire
              </p>
            </div>
            <Switch
              checked={settings.allowRegistration}
              onCheckedChange={(checked) => handleChange('allowRegistration', checked)}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUploadSize">Taille max d'upload (MB)</Label>
            <Input
              id="maxUploadSize"
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AppSettings;
