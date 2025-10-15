# 🚀 Quick Start - Google OAuth (5 minutes)

## Étape 1 : Appliquer la Migration (2 min)

```bash
cd backend
npm run prisma:migrate
```

Répondez `y` et donnez le nom : `add_google_oauth_fields`

## Étape 2 : Google Cloud Console (3 min)

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com/)
2. Créez un projet
3. APIs & Services → Credentials → Create Credentials → OAuth client ID
4. Type: Web application
5. Redirect URIs: `http://localhost:3000/auth/google/callback`
6. Copiez le Client ID et Client Secret

## Étape 3 : Mettre à Jour .env

```env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
```

## Étape 4 : Redémarrer le Serveur

```bash
npm run dev
```

## Étape 5 : Tester

Ouvrez : `http://localhost:3000/auth/google`

---

## Routes API Créées

- `GET /auth/google` - Démarre l'authentification
- `GET /auth/google/callback` - Reçoit la réponse de Google
- `GET /auth/google/failure` - Gestion des erreurs

---

## Intégration Frontend Minimale

```tsx
// Bouton de connexion
<button onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>
  Google Sign-In
</button>

// Page de callback (/auth/callback)
useEffect(() => {
  const token = new URLSearchParams(window.location.search).get('token');
  if (token) {
    localStorage.setItem('authToken', token);
    navigate('/dashboard');
  }
}, []);
```

---

**C'est tout ! 🎉**

Pour plus de détails, voir `AUTHENTIFICATION_GOOGLE_BACKEND.md`
