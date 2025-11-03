# 📋 Utilisation des Paramètres de l'Application

Tous les paramètres configurés dans `/settings` sont maintenant automatiquement appliqués dans toute l'application !

## 🎯 Paramètres Appliqués Automatiquement

### 1. **Thème (theme)**
- ✅ Appliqué automatiquement sur toute l'application
- Valeurs : `light`, `dark`, `auto`
- Le mode `auto` suit les préférences système

### 2. **Couleurs (primaryColor, accentColor)**
- ✅ Variables CSS injectées automatiquement
- Accessibles via `--primary-color` et `--accent-color`

### 3. **Langue (appLanguage)**
- ✅ Attribut `lang` sur la balise `<html>`
- Disponible dans `localStorage.getItem('appLanguage')`

### 4. **Devise (appCurrency)**
- ✅ Disponible dans `localStorage.getItem('appCurrency')`
- Utilisez les helpers fournis

### 5. **Nom de l'application (appName)**
- ✅ Titre de la page (`document.title`)
- Disponible dans `localStorage.getItem('appName')`

## 🛠️ Utilisation dans vos Composants

### Accéder aux Paramètres

```tsx
import { useAppConfig } from '@/hooks/useAppConfig';

function MonComposant() {
  const { appName, appCurrency, theme, loading } = useAppConfig();

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>{appName}</h1>
      <p>Devise : {appCurrency}</p>
      <p>Thème : {theme}</p>
    </div>
  );
}
```

### Formater une Devise

```tsx
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

function PrixProduit({ prix }: { prix: number }) {
  return (
    <div>
      <span className="text-2xl font-bold">
        {formatCurrency(prix)}
      </span>
      {/* Exemple : 1,500.00 د.ج */}
    </div>
  );
}

// Afficher juste le symbole
function MonnaieSymbole() {
  const symbol = getCurrencySymbol();
  return <span>{symbol}</span>; // د.ج
}
```

### Utiliser les Couleurs Personnalisées

```tsx
function BoutonPersonnalise() {
  return (
    <button
      style={{
        backgroundColor: 'var(--primary-color)',
        borderColor: 'var(--accent-color)'
      }}
    >
      Cliquez-moi
    </button>
  );
}

// Ou avec Tailwind (après configuration)
function BoutonTailwind() {
  return (
    <button className="bg-[var(--primary-color)] border-[var(--accent-color)]">
      Cliquez-moi
    </button>
  );
}
```

### Accéder au Contexte Complet

```tsx
import { useAppSettings } from '@/contexts/AppSettingsContext';

function ComposantAvance() {
  const { settings, loading, refreshSettings } = useAppSettings();

  const handleReload = async () => {
    await refreshSettings(); // Recharge les paramètres
  };

  return (
    <div>
      {settings && (
        <>
          <p>Nom : {settings.appName}</p>
          <p>Maintenance : {settings.maintenanceMode ? 'Oui' : 'Non'}</p>
          <button onClick={handleReload}>Rafraîchir</button>
        </>
      )}
    </div>
  );
}
```

## 📦 APIs Disponibles

### Hook : `useAppConfig()`
Retourne les paramètres les plus utilisés :
- `appName`, `appLanguage`, `appCurrency`, `appDescription`, `appLogo`
- `theme`, `primaryColor`, `accentColor`
- `maintenanceMode`, `allowRegistration`
- `loading`

### Context : `useAppSettings()`
Accès complet au contexte :
- `settings` : Tous les paramètres
- `loading` : État de chargement
- `refreshSettings()` : Recharge les paramètres

### Utils Currency
- `formatCurrency(amount, currency?)` : Formate un montant
- `getCurrentCurrency()` : Récupère la devise actuelle
- `getCurrencySymbol(currency?)` : Récupère le symbole

## 🔄 Rafraîchissement Automatique

Les paramètres sont automatiquement rechargés :
- ✅ Au démarrage de l'application
- ✅ Après sauvegarde dans les settings
- ✅ Sur demande via `refreshSettings()`

Les changements sont appliqués **immédiatement** sans rechargement de page !

## 💡 Exemples Pratiques

### Afficher le Logo de l'App

```tsx
import { useAppConfig } from '@/hooks/useAppConfig';

function Header() {
  const { appLogo, appName } = useAppConfig();

  return (
    <header>
      {appLogo ? (
        <img src={appLogo} alt={appName} />
      ) : (
        <h1>{appName}</h1>
      )}
    </header>
  );
}
```

### Mode Maintenance

```tsx
import { useAppConfig } from '@/hooks/useAppConfig';

function App() {
  const { maintenanceMode } = useAppConfig();

  if (maintenanceMode) {
    return <MaintenancePage />;
  }

  return <NormalApp />;
}
```

### Multi-langue (À venir)

```tsx
import { useAppConfig } from '@/hooks/useAppConfig';

function MonComposant() {
  const { appLanguage } = useAppConfig();

  const texts = {
    fr: 'Bonjour',
    en: 'Hello',
    es: 'Hola'
  };

  return <h1>{texts[appLanguage] || texts.fr}</h1>;
}
```

## ✨ Résumé

Tous vos paramètres sont maintenant **globaux** et **réactifs** !
Changez-les dans `/settings` et ils s'appliquent instantanément partout ! 🚀
