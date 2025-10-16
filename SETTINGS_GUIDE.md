# 🎨 Guide - Interface de Configuration

## ✅ Backend - TERMINÉ

### Fichiers créés:
1. ✅ `backend/prisma/schema.prisma` - Modèles AppSettings + UserPreferences
2. ✅ `backend/src/controllers/settings.controller.ts` - Controller complet
3. ✅ `backend/src/routes/settingsRoutes.ts` - Routes API
4. ✅ Routes enregistrées dans `index.ts`

### API Endpoints disponibles:

**Paramètres Généraux (Admin)**
- `GET /settings/app` - Récupérer paramètres
- `PUT /settings/app` - Mettre à jour
- `POST /settings/logo` - Upload logo

**Préférences Utilisateur**
- `GET /settings/preferences` - Récupérer préférences
- `PUT /settings/preferences` - Mettre à jour

---

## 📝 Prochaines Étapes - Frontend

### 1. Créer la migration Prisma

```bash
cd backend
npx prisma migrate dev --name add_settings_tables
```

### 2. Créer les composants React

Créez `/frontend/src/pages/SettingsPage.tsx` avec:

```typescript
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">⚙️ Paramètres</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>
        
        {/* 6 sections à implémenter */}
      </Tabs>
    </div>
  );
}
```

### 3. Sections à créer

**A. Paramètres Généraux** (`GeneralSettings.tsx`)
- Nom de l'application
- Langue
- Devise
- Logo (upload)
- Description

**B. Profil Utilisateur** (`ProfileSettings.tsx`)
- Prénom, nom
- Email
- Photo de profil
- Bio

**C. Apparence** (`AppearanceSettings.tsx`)
- Thème (light/dark/auto)
- Couleur primaire (color picker)
- Couleur d'accent
- Mode compact

**D. Notifications** (`NotificationSettings.tsx`)
- Email notifications (toggle)
- Push notifications (toggle)
- Son des notifications
- Fréquence digest (realtime/daily/weekly)

**E. Sécurité** (`SecuritySettings.tsx`)
- Changer mot de passe
- 2FA toggle
- Session timeout
- Politique de mot de passe

**F. Système** (`SystemSettings.tsx`)
- Mode maintenance
- Autoriser inscriptions
- Taille max upload
- Logs système
- Backup/Restore

---

## 🎨 Composants UI nécessaires (shadcn/ui)

```bash
npx shadcn@latest add tabs
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add switch
npx shadcn@latest add select
npx shadcn@latest add label
npx shadcn@latest add separator
npx shadcn@latest add toast
```

---

## 📋 Exemple Section Complète

**`frontend/src/components/settings/GeneralSettings.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    appName: '',
    appLanguage: 'fr',
    appCurrency: 'EUR',
    appDescription: '',
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/settings/app');
      setSettings(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/settings/app', settings);
      toast.success('Paramètres enregistrés!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌍 Paramètres Généraux</CardTitle>
        <CardDescription>Configurez les paramètres de base de votre application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nom de l'application */}
        <div className="space-y-2">
          <Label htmlFor="appName">Nom de l'application</Label>
          <Input
            id="appName"
            value={settings.appName}
            onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            placeholder="Mon Application"
          />
        </div>

        {/* Langue */}
        <div className="space-y-2">
          <Label htmlFor="language">Langue</Label>
          <Select value={settings.appLanguage} onValueChange={(val) => setSettings({ ...settings, appLanguage: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">🇫🇷 Français</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="es">🇪🇸 Español</SelectItem>
              <SelectItem value="ar">🇲🇦 العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Devise */}
        <div className="space-y-2">
          <Label htmlFor="currency">Devise</Label>
          <Select value={settings.appCurrency} onValueChange={(val) => setSettings({ ...settings, appCurrency: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="MAD">MAD (د.م.)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={settings.appDescription || ''}
            onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
            placeholder="Description de votre application"
          />
        </div>

        {/* Bouton Enregistrer */}
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🚀 Pour démarrer

1. **Migration base de données:**
```bash
cd backend
npx prisma migrate dev --name add_settings_tables
```

2. **Créer les composants settings:**
```bash
mkdir frontend/src/components/settings
```

3. **Créer chaque section:**
- GeneralSettings.tsx
- ProfileSettings.tsx
- AppearanceSettings.tsx
- NotificationSettings.tsx
- SecuritySettings.tsx
- SystemSettings.tsx

4. **Créer la page principale:**
```bash
# frontend/src/pages/SettingsPage.tsx
```

5. **Ajouter la route dans App.tsx:**
```typescript
<Route path="/settings" element={<SettingsPage />} />
```

---

## 🎯 Fonctionnalités Avancées (Optionnel)

- [ ] Upload de logo avec prévisualisation
- [ ] Color picker pour les couleurs
- [ ] Thème en temps réel
- [ ] Export/Import paramètres
- [ ] Historique des modifications
- [ ] Permissions granulaires par section

---

**Backend: ✅ Terminé**  
**Frontend: 📝 À implémenter**  
**Base: Structure complète prête!**
