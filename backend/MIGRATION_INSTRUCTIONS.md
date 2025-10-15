# Instructions de Migration pour Google OAuth

## Étapes à suivre

### 1. Générer le client Prisma (FAIT ✓)

La génération du client Prisma a été effectuée avec succès.

### 2. Créer et appliquer la migration

Une commande de migration est en cours. Vous devez :

1. **Répondre `y` (oui)** à la question qui apparaît dans le terminal
2. **Donner un nom à la migration** quand demandé, par exemple : `add_google_oauth_fields`

La commande en attente est :
```bash
npm run prisma:migrate
```

### 3. Vérifier la migration

Après avoir confirmé, la migration va :
- Ajouter le champ `googleId` (unique, optionnel) à la table `User`
- Ajouter le champ `provider` avec valeur par défaut `"local"`
- Rendre le champ `password` optionnel (nullable)

### 4. Redémarrer le serveur

Après la migration, redémarrez le serveur backend :
```bash
npm run dev
```

## Structure complète mise en place

### ✅ Fichiers créés/modifiés

1. **Schema Prisma** (`prisma/schema.prisma`)
   - Ajout des champs `googleId` et `provider`
   - Modification du champ `password` (optionnel)

2. **Configuration Passport** (`src/config/passport.ts`)
   - Stratégie Google OAuth configurée
   - Gestion de la création/mise à jour des utilisateurs

3. **Contrôleur d'authentification** (`src/controllers/authController.ts`)
   - `googleAuth` : Initie l'authentification Google
   - `googleCallback` : Gère le callback de Google
   - `googleAuthFailure` : Gère les échecs d'authentification

4. **Routes d'authentification** (`src/routes/authRoutes.ts`)
   - `GET /auth/google` : Démarre le flux OAuth
   - `GET /auth/google/callback` : Reçoit le callback de Google
   - `GET /auth/google/failure` : Gère les erreurs

5. **Serveur principal** (`src/index.ts`)
   - Initialisation de Passport.js

6. **Variables d'environnement** (`.env` et `.env.example`)
   - Configuration Google OAuth
   - URL du frontend

### 📋 Prochaines étapes

1. **Configurer Google Cloud Console**
   - Suivre le guide dans `GOOGLE_OAUTH_SETUP.md`
   - Obtenir le Client ID et Client Secret
   - Mettre à jour le fichier `.env` avec vos vraies clés

2. **Tester l'authentification**
   - Démarrer le backend : `npm run dev`
   - Accéder à : `http://localhost:3000/auth/google`
   - Vérifier la redirection et le callback

3. **Intégrer côté Frontend**
   - Ajouter un bouton "Se connecter avec Google"
   - Gérer la route `/auth/callback?token=...`
   - Stocker le JWT reçu

## Routes API disponibles

### Authentification locale
- `POST /auth/register` - Inscription avec email/password
- `POST /auth/login` - Connexion avec email/password

### Authentification Google OAuth
- `GET /auth/google` - Initier l'authentification Google
- `GET /auth/google/callback` - Callback après authentification Google
- `GET /auth/google/failure` - Gestion des échecs

## Flux d'authentification Google

```
1. Frontend → GET /auth/google
2. Backend → Redirige vers Google OAuth
3. Utilisateur → S'authentifie sur Google
4. Google → Redirige vers /auth/google/callback
5. Backend → Crée/met à jour l'utilisateur
6. Backend → Génère JWT
7. Backend → Redirige vers Frontend avec token
8. Frontend → Stocke le token et connecte l'utilisateur
```

## Dépendances installées

Les packages suivants sont déjà inclus dans `package.json` :
- `passport` : Framework d'authentification
- `passport-google-oauth20` : Stratégie Google OAuth 2.0
- `@types/passport` : Types TypeScript pour Passport
- `@types/passport-google-oauth20` : Types TypeScript pour la stratégie Google

Aucune installation supplémentaire n'est nécessaire !
