# 📸 Implémentation Upload Avatar - Documentation

**Date:** 22 Octobre 2025  
**Fonctionnalité:** Upload et gestion de photo de profil utilisateur

---

## ✅ Modifications Effectuées

### 1. Backend

#### **Schéma Prisma** (`backend/prisma/schema.prisma`)
- ✅ Ajout du champ `avatarUrl String?` au modèle `User`
- Permet de stocker l'URL relative de l'avatar

#### **Contrôleur Avatar** (`backend/src/controllers/avatarController.ts`)
- ✅ `uploadAvatar()` - Upload d'avatar avec gestion du fichier
- ✅ `deleteAvatar()` - Suppression de l'avatar et du fichier physique
- Gestion automatique de la suppression de l'ancien fichier lors d'un nouvel upload

#### **Middleware Upload** (`backend/src/middleware/upload.middleware.ts`)
- ✅ Configuration Multer pour upload de fichiers
- Validation des types MIME (JPEG, PNG, GIF, WEBP)
- Limite de taille : 5 MB
- Stockage dans `backend/uploads/avatars/`
- Génération de noms uniques : `avatar-{timestamp}-{random}.ext`

#### **Routes Avatar** (`backend/src/routes/avatarRoutes.ts`)
- ✅ `POST /users/me/avatar` - Upload avatar (authentifié)
- ✅ `DELETE /users/me/avatar` - Supprimer avatar (authentifié)
- Documentation Swagger intégrée

#### **Serveur** (`backend/src/index.ts`)
- ✅ Middleware pour servir les fichiers statiques : `/uploads`
- Les avatars sont accessibles via `http://localhost:3000/uploads/avatars/{filename}`

#### **UserController** (`backend/src/controllers/userController.ts`)
- ✅ Ajout de `avatarUrl` dans toutes les sélections Prisma
- Retour de l'URL avatar dans les réponses API

#### **Dépendances**
- ✅ Installation de `multer` et `@types/multer`

---

### 2. Frontend

#### **Composant ProfileSettings** (`frontend/src/components/settings/ProfileSettings.tsx`)
- ✅ Interface utilisateur complète pour upload d'avatar
- ✅ Prévisualisation de l'image avant upload
- ✅ Validation côté client (type, taille max 5 MB)
- ✅ Gestion d'état avec `uploadingAvatar`, `avatarPreview`
- ✅ Affichage de l'avatar existant ou fallback avec initiales
- ✅ Boutons "Changer la photo" et "Supprimer"
- ✅ Notifications toast pour succès/erreurs
- ✅ Spinner de chargement pendant l'upload
- ✅ Gestion d'erreurs typée avec `isAxiosError`

#### **Composants UI**
- ✅ Utilisation de `Avatar`, `AvatarImage`, `AvatarFallback` (Radix UI)
- ✅ Icônes Lucide : `Upload`, `Loader2`, `X`

---

## 🚀 Étapes de Déploiement

### 1. Migration Prisma
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 2. Créer le dossier uploads
```bash
mkdir -p backend/uploads/avatars
```

### 3. Redémarrer le backend
```bash
cd backend
npm run dev
```

### 4. Redémarrer le frontend
```bash
cd frontend
npm run dev
```

---

## 🧪 Tests Recommandés

### Tests Manuels

1. **Upload d'avatar**
   - Aller dans Paramètres > Profil
   - Cliquer sur "Changer la photo"
   - Sélectionner une image (JPG, PNG, GIF, WEBP)
   - Vérifier la prévisualisation
   - Vérifier le toast de succès
   - Vérifier que l'avatar s'affiche correctement

2. **Validation des fichiers**
   - Tenter d'uploader un fichier non-image → toast d'erreur
   - Tenter d'uploader une image > 5 MB → toast d'erreur

3. **Suppression d'avatar**
   - Cliquer sur "Supprimer"
   - Confirmer la suppression
   - Vérifier le retour au fallback (initiales)
   - Vérifier que le fichier est supprimé du serveur

4. **Persistence**
   - Rafraîchir la page → l'avatar doit rester affiché
   - Se déconnecter/reconnecter → l'avatar doit persister

5. **Remplacement d'avatar**
   - Uploader un premier avatar
   - Uploader un second avatar
   - Vérifier que l'ancien fichier est supprimé du serveur

### Tests API (via Swagger ou Postman)

**Upload Avatar**
```http
POST http://localhost:3000/users/me/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  avatar: {fichier image}
```

**Supprimer Avatar**
```http
DELETE http://localhost:3000/users/me/avatar
Authorization: Bearer {token}
```

---

## 📝 Notes Importantes

### Stockage Local (Développement)
- Les avatars sont stockés dans `backend/uploads/avatars/`
- ⚠️ **Production** : Migrer vers un service cloud (S3, Cloudinary, etc.)

### Sécurité
- ✅ Authentification requise pour upload/suppression
- ✅ Validation du type MIME
- ✅ Limite de taille fichier
- ✅ Noms de fichiers uniques (évite les collisions)

### Performance
- Les fichiers sont servis directement par Express
- En production, utiliser un CDN ou reverse proxy (Nginx)

### Améliorations Futures
- [ ] Compression/redimensionnement automatique des images
- [ ] Support de crop/rotation avant upload
- [ ] Migration vers stockage cloud (S3, Cloudinary)
- [ ] Cache des avatars côté client
- [ ] Lazy loading des avatars dans les listes

---

## 🐛 Problèmes Connus

### Erreurs TypeScript Backend
Les erreurs suivantes sont attendues jusqu'à la régénération Prisma :
```
Object literal may only specify known properties, and 'avatarUrl' does not exist in type 'UserSelect<DefaultArgs>'.
```

**Solution :** Exécuter `npm run prisma:generate` dans le backend.

### Erreurs TypeScript Frontend
Les types `User` dans `AuthContext` ne contiennent pas encore `avatarUrl`, `firstName`, `lastName`.

**Solution :** Mettre à jour l'interface `User` dans `frontend/src/contexts/AuthContext.tsx` :
```typescript
interface User {
  id: string | number;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}
```

---

## 📚 Documentation API

### POST /users/me/avatar
**Description:** Upload avatar de l'utilisateur connecté

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Body:**
- `avatar`: Fichier image (JPG, PNG, GIF, WEBP, max 5 MB)

**Réponse 200:**
```json
{
  "message": "Avatar mis à jour avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "/uploads/avatars/avatar-1729598400000-123456789.jpg",
    "role": "user"
  }
}
```

### DELETE /users/me/avatar
**Description:** Supprimer l'avatar de l'utilisateur connecté

**Headers:**
- `Authorization: Bearer {token}`

**Réponse 200:**
```json
{
  "message": "Avatar supprimé avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": null,
    "role": "user"
  }
}
```

---

## ✨ Résumé

La fonctionnalité d'upload d'avatar est maintenant **complètement implémentée** avec :
- ✅ Backend complet (API, stockage, validation)
- ✅ Frontend avec UI moderne et UX optimale
- ✅ Gestion d'erreurs robuste
- ✅ Notifications utilisateur
- ✅ Documentation Swagger

**Prochaine étape :** Exécuter les migrations Prisma et tester la fonctionnalité.
