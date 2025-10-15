# 🔐 Authentification Google OAuth - Backend Intégré ✅

## Résumé

L'authentification Google OAuth a été **complètement intégrée côté backend** de votre application !

---

## 📋 Ce qui a été fait

### 1. **Base de données mise à jour** ✅
Le schéma Prisma a été modifié pour supporter l'authentification Google :
- Ajout du champ `googleId` (identifiant Google unique)
- Ajout du champ `provider` ("local" ou "google")
- Le champ `password` est maintenant optionnel (pour les utilisateurs Google)

### 2. **Configuration de Passport.js** ✅
- Stratégie Google OAuth 2.0 configurée
- Gestion automatique de la création/mise à jour des utilisateurs
- Support complet de l'authentification Google

### 3. **Contrôleurs et Routes** ✅
Trois nouvelles routes API ont été créées :
- `GET /auth/google` - Démarre l'authentification Google
- `GET /auth/google/callback` - Reçoit la réponse de Google
- `GET /auth/google/failure` - Gère les erreurs

### 4. **Documentation complète** ✅
Trois guides détaillés ont été créés :
- `backend/GOOGLE_OAUTH_SETUP.md` - Configuration Google Cloud Console
- `backend/MIGRATION_INSTRUCTIONS.md` - Instructions de migration
- `backend/GOOGLE_OAUTH_IMPLEMENTATION_SUMMARY.md` - Résumé technique complet

---

## 🚀 Actions à faire maintenant

### Étape 1 : Appliquer la migration de la base de données

**⚠️ IMPORTANT : Une commande est en attente dans votre terminal !**

Vous devez :
1. Aller dans le terminal où la commande `npm run prisma:migrate` est en cours
2. Taper `y` puis appuyer sur Entrée pour confirmer
3. Donner un nom à la migration, par exemple : `add_google_oauth_fields`
4. Appuyer sur Entrée

La migration va ajouter les nouveaux champs à votre base de données.

---

### Étape 2 : Configurer Google Cloud Console

Pour obtenir vos identifiants Google OAuth :

1. **Allez sur** [Google Cloud Console](https://console.cloud.google.com/)

2. **Créez un projet** (ou sélectionnez un projet existant)

3. **Activez l'API Google+ :**
   - Menu → APIs & Services → Library
   - Recherchez "Google+ API"
   - Cliquez sur "Enable"

4. **Configurez l'écran de consentement OAuth :**
   - Menu → APIs & Services → OAuth consent screen
   - Choisissez "External" (ou "Internal" si vous avez Google Workspace)
   - Remplissez les informations requises
   - Ajoutez les scopes : `email` et `profile`

5. **Créez les identifiants OAuth 2.0 :**
   - Menu → APIs & Services → Credentials
   - Cliquez sur "Create Credentials" → "OAuth client ID"
   - Type d'application : "Web application"
   - Configurez :
     - **Authorized JavaScript origins :**
       ```
       http://localhost:3000
       http://localhost:3001
       ```
     - **Authorized redirect URIs :**
       ```
       http://localhost:3000/auth/google/callback
       ```
   - Cliquez sur "Create"
   - **Copiez le Client ID et le Client Secret** ⚠️

6. **Mettez à jour le fichier `.env` dans le dossier `backend` :**
   ```env
   GOOGLE_CLIENT_ID=votre_client_id_copié
   GOOGLE_CLIENT_SECRET=votre_client_secret_copié
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   FRONTEND_URL=http://localhost:3001
   ```

📖 **Guide détaillé disponible dans :** `backend/GOOGLE_OAUTH_SETUP.md`

---

### Étape 3 : Redémarrer le serveur backend

```bash
cd backend
npm run dev
```

---

### Étape 4 : Tester l'authentification

1. **Ouvrez votre navigateur** et allez à :
   ```
   http://localhost:3000/auth/google
   ```

2. **Vous devriez être redirigé** vers la page de connexion Google

3. **Après connexion**, vous serez redirigé vers :
   ```
   http://localhost:3001/auth/callback?token=VOTRE_JWT_TOKEN
   ```

4. **Vérifiez les logs** du serveur backend pour voir le processus

---

## 🔄 Flux d'authentification

Voici comment fonctionne l'authentification Google OAuth :

```
1. Utilisateur clique sur "Se connecter avec Google"
   → Redirection vers : http://localhost:3000/auth/google

2. Backend redirige vers Google pour l'authentification

3. Utilisateur se connecte à Google

4. Google redirige vers : http://localhost:3000/auth/google/callback

5. Backend :
   - Récupère les infos de l'utilisateur depuis Google
   - Crée ou met à jour l'utilisateur dans la base de données
   - Génère un token JWT

6. Backend redirige vers le frontend avec le token :
   → http://localhost:3001/auth/callback?token=JWT_TOKEN

7. Frontend :
   - Récupère le token de l'URL
   - Stocke le token (localStorage, cookies, etc.)
   - Connecte l'utilisateur
```

---

## 📱 Intégration Frontend (à faire)

Pour intégrer l'authentification Google dans votre frontend React :

### 1. Créer un bouton "Se connecter avec Google"

```tsx
// Dans votre composant de Login
const handleGoogleLogin = () => {
  // Redirige vers le backend pour initier l'authentification Google
  window.location.href = 'http://localhost:3000/auth/google';
};

return (
  <button onClick={handleGoogleLogin}>
    <img src="/google-icon.svg" alt="Google" />
    Se connecter avec Google
  </button>
);
```

### 2. Créer une page de callback

```tsx
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le token de l'URL
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Stocker le token
      localStorage.setItem('authToken', token);
      
      // Rediriger vers la page principale
      navigate('/dashboard');
    } else if (error) {
      // Gérer l'erreur
      console.error('Erreur d\'authentification:', error);
      navigate('/login?error=' + error);
    }
  }, [searchParams, navigate]);

  return <div>Authentification en cours...</div>;
};
```

### 3. Ajouter la route dans votre Router

```tsx
// Dans votre configuration de routes
<Route path="/auth/callback" element={<AuthCallback />} />
```

---

## 🔐 Routes API disponibles

### Authentification Traditionnelle (existantes)
- `POST /auth/register` - Inscription avec email/password
- `POST /auth/login` - Connexion avec email/password

### Authentification Google OAuth (nouvelles) ✨
- `GET /auth/google` - Initier l'authentification Google
- `GET /auth/google/callback` - Callback après authentification
- `GET /auth/google/failure` - Gestion des erreurs

---

## ⚙️ Configuration

### Variables d'environnement nécessaires

Dans `backend/.env` :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/PROJECT_0"

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=24h

# Google OAuth (À CONFIGURER) ⚠️
GOOGLE_CLIENT_ID=votre_google_client_id_ici
GOOGLE_CLIENT_SECRET=votre_google_client_secret_ici
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3001
```

---

## 🧪 Test de l'authentification

### Test manuel

1. **Démarrez le backend :**
   ```bash
   cd backend
   npm run dev
   ```

2. **Ouvrez votre navigateur :**
   ```
   http://localhost:3000/auth/google
   ```

3. **Connectez-vous avec votre compte Google**

4. **Vérifiez la base de données :**
   ```bash
   cd backend
   npm run prisma:studio
   ```
   - Ouvrez la table `User`
   - Vérifiez qu'un nouvel utilisateur a été créé avec :
     - `email` : votre email Google
     - `googleId` : votre ID Google
     - `provider` : "google"
     - `password` : null

---

## 🛠️ Troubleshooting

### Erreur "redirect_uri_mismatch"
**Cause :** L'URL de callback ne correspond pas à celle configurée dans Google Cloud Console.

**Solution :**
- Vérifiez que l'URL dans Google Cloud Console est exactement : `http://localhost:3000/auth/google/callback`
- Pas de slash à la fin !
- Vérifiez que le protocole (`http://`) est correct

### Erreur "invalid_client"
**Cause :** Le Client ID ou Client Secret est incorrect.

**Solution :**
- Vérifiez les valeurs dans votre fichier `.env`
- Assurez-vous qu'il n'y a pas d'espaces avant ou après
- Régénérez les credentials dans Google Cloud Console si nécessaire

### Erreur "Access blocked: This app's request is invalid"
**Cause :** L'écran de consentement OAuth n'est pas configuré correctement.

**Solution :**
- Allez dans OAuth consent screen
- Assurez-vous que l'app est "Published" (ou en mode "Testing" avec des utilisateurs test)
- Vérifiez que les scopes `email` et `profile` sont ajoutés

### L'utilisateur ne peut pas se connecter après l'authentification Google
**Vérifiez :**
1. Les logs du serveur backend
2. Que la migration Prisma a été appliquée
3. Que le JWT est généré correctement
4. Que la redirection vers le frontend fonctionne

---

## 📚 Documentation complète

Pour plus de détails techniques, consultez :

- **`backend/GOOGLE_OAUTH_SETUP.md`** : Guide complet de configuration Google Cloud
- **`backend/MIGRATION_INSTRUCTIONS.md`** : Instructions pour les migrations
- **`backend/GOOGLE_OAUTH_IMPLEMENTATION_SUMMARY.md`** : Résumé technique complet

---

## ✅ Checklist

- [ ] Migration de la base de données appliquée
- [ ] Projet Google Cloud créé
- [ ] OAuth consent screen configuré
- [ ] Client ID et Client Secret obtenus
- [ ] Variables d'environnement mises à jour dans `.env`
- [ ] Serveur backend redémarré
- [ ] Test manuel effectué (connexion Google fonctionne)
- [ ] Intégration frontend démarrée

---

## 🎯 Résumé

**✅ Backend : Complètement intégré !**

Toute la logique d'authentification Google OAuth est en place côté backend. Il ne vous reste qu'à :

1. ✅ Appliquer la migration (répondre à la commande en attente)
2. ⚠️ Configurer Google Cloud Console (suivre le guide)
3. 🔲 Intégrer côté frontend (créer le bouton et la page de callback)

**Bon développement ! 🚀**

---

## 💬 Questions ?

Si vous avez des questions ou rencontrez des problèmes :
1. Consultez les guides détaillés dans le dossier `backend/`
2. Vérifiez les logs du serveur
3. Utilisez Prisma Studio pour inspecter la base de données : `npm run prisma:studio`
