# 🎨 Guide des composants UI

Cette application utilise un design system basé sur **shadcn/ui** avec des composants Radix UI.

## 📁 Structure des composants

```
frontend/src/components/ui/
├── Alert.tsx           # Alertes et notifications
├── Avatar.tsx          # Avatars avec images ou initiales
├── Badge.tsx           # Étiquettes colorées
├── Button.tsx          # Boutons avec variantes
├── Card.tsx            # Cartes pour afficher du contenu
├── Dialog.tsx          # Modals centrés
├── DropdownMenu.tsx    # Menus déroulants
├── Input.tsx           # Champs de saisie
├── Label.tsx           # Labels de formulaire
├── Select.tsx          # Sélecteurs
├── Separator.tsx       # Séparateurs visuels
├── Sheet.tsx           # Panneaux latéraux
├── Skeleton.tsx        # Loaders squelette
├── Table.tsx           # Tableaux de données
├── Textarea.tsx        # Zones de texte multilignes
├── ThemeToggle.tsx     # Basculer thème clair/sombre
└── Tooltip.tsx         # Info-bulles
```

## 🎯 Composants principaux

### Badge

Étiquettes colorées avec plusieurs variantes.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="outline">Outline</Badge>
```

**Variantes disponibles :**
- `default` - Bleu primaire
- `secondary` - Gris secondaire
- `destructive` - Rouge pour danger
- `success` - Vert pour succès
- `warning` - Jaune pour avertissement
- `outline` - Bordure seulement

### Avatar

Avatars avec images ou initiales avec dégradés.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Avec dégradé
<Avatar>
  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
    JD
  </AvatarFallback>
</Avatar>
```

### Dialog

Modals centrés avec overlay.

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre du modal</DialogTitle>
    </DialogHeader>
    <p>Contenu du modal...</p>
  </DialogContent>
</Dialog>
```

### Button

Boutons avec différentes variantes et tailles.

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Card

Cartes pour afficher du contenu structuré.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenu...</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Separator

Séparateurs pour diviser visuellement les sections.

```tsx
import { Separator } from '@/components/ui/Separator';

<Separator /> {/* Horizontal par défaut */}
<Separator orientation="vertical" />
```

### Alert

Alertes et messages d'information.

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { AlertCircle } from 'lucide-react';

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Erreur</AlertTitle>
  <AlertDescription>Message d'erreur...</AlertDescription>
</Alert>
```

## 🎨 Personnalisation

### Thème

L'application supporte les thèmes clair/sombre via le `ThemeProvider`.

```tsx
// Dans votre composant
import { useTheme } from '@/contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

### Couleurs

Les couleurs sont définies dans `tailwind.config.js` et utilisent des variables CSS pour le support du thème sombre.

### Animations

Les animations sont gérées par `tailwindcss-animate` :
- `animate-in` / `animate-out`
- `fade-in` / `fade-out`
- `slide-in` / `slide-out`
- `zoom-in` / `zoom-out`

## 🔧 Utilitaires

### cn() - Classe utility

```tsx
import { cn } from '@/lib/utils';

// Combine des classes conditionnellement
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

### Icons

Utilise **Lucide React** pour les icônes :

```tsx
import { User, Mail, Settings, LogOut } from 'lucide-react';

<User className="h-4 w-4" />
```

## 📱 Responsive Design

Tous les composants sont responsive avec des breakpoints Tailwind :
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

## ♿ Accessibilité

Tous les composants Radix UI sont conformes aux standards WCAG :
- Navigation au clavier
- Lecteurs d'écran (ARIA)
- Focus management
- Contraste des couleurs

## 📚 Ressources

- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Bon développement ! 🚀**
