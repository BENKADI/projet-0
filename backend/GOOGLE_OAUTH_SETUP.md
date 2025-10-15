# Configuration de l'Authentification Google OAuth

## Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ (Google+ API)

### 2. Configurer l'écran de consentement OAuth

1. Dans le menu, allez à **APIs & Services > OAuth consent screen**
2. Choisissez le type d'application :
   - **Internal** : pour les utilisateurs de votre organisation Google Workspace
   - **External** : pour tout utilisateur avec un compte Google
3. Remplissez les informations requises :
   - Nom de l'application
   - Email de support utilisateur
   - Logo de l'application (optionnel)
   - Domaines autorisés
4. Ajoutez les scopes nécessaires :
   - `email`
   - `profile`
5. Enregistrez et continuez

### 3. Créer les identifiants OAuth 2.0

1. Allez à **APIs & Services > Credentials**
2. Cliquez sur **Create Credentials > OAuth client ID**
3. Sélectionnez **Web application**
4. Configurez :
   - **Name** : Donnez un nom à votre client OAuth
   - **Authorized JavaScript origins** :
     ```
     http://localhost:3000
     http://localhost:3001
     ```
   - **Authorized redirect URIs** :
     ```
     http://localhost:3000/auth/google/callback
     ```
5. Cliquez sur **Create**
6. Copiez le **Client ID** et le **Client Secret**

### 4. Configurer les variables d'environnement

1. Ouvrez le fichier `.env` dans le dossier `backend`
2. Ajoutez/modifiez les variables suivantes :

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

### 5. Générer le client Prisma et créer la migration

Après avoir modifié le schéma Prisma, exécutez :

```bash
# Générer le client Prisma avec les nouveaux champs
npm run prisma:generate

# Créer et appliquer la migration
npm run prisma:migrate
```

Donnez un nom descriptif à votre migration, par exemple : `add_google_oauth_fields`

### 6. Tester l'authentification

#### Démarrer le serveur backend
```bash
npm run dev
```

#### URLs d'authentification disponibles

- **Initier l'authentification Google** : `http://localhost:3000/auth/google`
- **Callback Google** : `http://localhost:3000/auth/google/callback`
- **Échec d'authentification** : `http://localhost:3000/auth/google/failure`

#### Flux d'authentification

1. L'utilisateur clique sur "Se connecter avec Google" qui redirige vers `/auth/google`
2. L'utilisateur est redirigé vers Google pour s'authentifier
3. Après authentification, Google redirige vers `/auth/google/callback`
4. Le backend génère un JWT et redirige vers le frontend avec le token : `http://localhost:3001/auth/callback?token=JWT_TOKEN`
5. Le frontend récupère le token de l'URL et l'utilise pour les requêtes API

## Structure de la base de données

Le modèle `User` a été mis à jour avec les champs suivants :

```prisma
model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  password     String?       // Optionnel pour les utilisateurs OAuth
  googleId     String?       @unique // ID Google pour OAuth
  provider     String        @default("local") // "local", "google"
  role         String        @default("user")
  firstName    String?
  lastName     String?
  permissions  Permission[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

## Sécurité

- ⚠️ **Ne jamais committer** les fichiers `.env` avec de vraies clés
- Utilisez des secrets différents pour les environnements de développement et de production
- En production, utilisez des URLs HTTPS pour le callback
- Limitez les scopes OAuth au strict nécessaire

## Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URL de callback dans Google Cloud Console correspond exactement à celle dans votre `.env`
- Incluez le protocole (`http://` ou `https://`)
- N'oubliez pas le trailing slash si nécessaire

### Erreur "invalid_client"
- Vérifiez que le `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects
- Assurez-vous qu'il n'y a pas d'espaces avant ou après les valeurs dans le `.env`

### L'utilisateur ne peut pas s'authentifier
- Vérifiez que l'API Google+ est activée
- Vérifiez que l'écran de consentement OAuth est correctement configuré
- Pour les applications en mode "External", vérifiez que l'utilisateur n'est pas bloqué
