# 🔍 Debug: Page Settings Redirige vers Login

## ❌ Problème
La page Settings redirige immédiatement vers `/login` dès qu'on y accède.

---

## 🎯 Diagnostic Étape par Étape

### 1. Vérifier si vous êtes vraiment connecté

**Dans la console navigateur (F12):**
```javascript
// Vérifier le token
localStorage.getItem('token')
// Devrait retourner: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// Si null → VOUS N'ÊTES PAS CONNECTÉ

// Vérifier l'utilisateur dans le contexte
// (à faire depuis React DevTools)
```

**Si le token est null:**
```
→ Problème: Vous n'êtes pas vraiment connecté
→ Solution: Se reconnecter via /login
```

---

### 2. Vérifier que le token est valide

**Test avec curl:**
```bash
# Récupérer votre token depuis localStorage
# Puis tester:
curl -H "Authorization: Bearer VOTRE_TOKEN" \
     http://localhost:3000/settings/app

# Réponses possibles:
✅ 200 OK → Token valide, problème ailleurs
❌ 401 Unauthorized → Token invalide/expiré
❌ 404 Not Found → Route backend n'existe pas
```

---

### 3. Vérifier les middlewares backend

**Fichier: `backend/src/middleware/auth.middleware.ts`**

Le middleware `authenticate` doit:
1. ✅ Extraire le token du header Authorization
2. ✅ Vérifier et décoder le token JWT
3. ✅ Attacher `req.user` 
4. ✅ Appeler `next()`

**Si le middleware retourne 401:**
- Token manquant
- Token malformé
- Token expiré
- Secret JWT incorrect

---

### 4. Vérifier l'intercepteur axios

**Fichier: `frontend/src/lib/axios.ts`**

L'intercepteur fait:
```typescript
// Request: Ajoute le token
config.headers.Authorization = `Bearer ${token}`;

// Response: Sur 401 → redirige vers /login
if (error.response?.status === 401) {
  window.location.href = '/login';
}
```

**⚠️ Problème potentiel:**
Si les composants Settings font des appels API dès le montage (useEffect), et que l'API retourne 401, la redirection est immédiate!

---

## ✅ Solutions

### Solution 1: Vérifier que vous êtes connecté

```bash
# 1. Allez sur /login
# 2. Connectez-vous avec des identifiants valides
# 3. Vérifiez dans localStorage:
localStorage.getItem('token')  # Doit avoir un token
# 4. Essayez d'aller sur /settings
```

### Solution 2: Désactiver temporairement la redirection auto

**Fichier: `frontend/src/lib/axios.ts`**
```typescript
// Commenter temporairement:
if (error.response?.status === 401) {
  console.log('401 ERROR:', error.response.data);
  // window.location.href = '/login';  ← COMMENTÉ
}
```

Puis recharger `/settings` et voir l'erreur exacte dans la console.

### Solution 3: Rendre les composants Settings plus robustes

Les composants ne doivent pas crasher si l'API échoue:

```typescript
// Dans GeneralSettings.tsx
const fetchSettings = async () => {
  try {
    const response = await axios.get('/settings/app');
    setSettings(response.data);
  } catch (error: any) {
    // Ne pas planter, utiliser valeurs par défaut
    if (error.response?.status === 401) {
      console.error('Non authentifié');
      // Laisser l'intercepteur gérer
    } else {
      console.error('Erreur:', error);
      // Utiliser valeurs par défaut
    }
  }
};
```

### Solution 4: Vérifier la configuration backend

**Fichier: `backend/src/middleware/auth.middleware.ts`**

Assurez-vous que:
```typescript
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};
```

---

## 🧪 Tests à Faire

### Test 1: Authentification de base

```javascript
// Console navigateur (après login)
const token = localStorage.getItem('token');
console.log('Token présent:', !!token);
console.log('Token commence par:', token?.substring(0, 20));

// Tester une autre route protégée
fetch('http://localhost:3000/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Users API:', d))
.catch(e => console.error('Erreur:', e));
```

### Test 2: API Settings directement

```javascript
// Console navigateur
const token = localStorage.getItem('token');

fetch('http://localhost:3000/settings/app', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(d => console.log('Settings:', d))
.catch(e => console.error('Erreur:', e));
```

### Test 3: Vérifier ProtectedRoute

La route `/settings` est protégée par `<ProtectedRoute>`. Si ça passe ce composant mais redirige quand même, le problème est dans les appels API des composants Settings.

---

## 🎯 Checklist de Résolution

- [ ] Token présent dans localStorage
- [ ] Token non expiré (décoder sur jwt.io)
- [ ] Backend sur port 3000 actif
- [ ] Route `/settings/app` existe et répond
- [ ] Middleware `authenticate` fonctionne
- [ ] Pas d'erreur CORS
- [ ] ProtectedRoute laisse passer
- [ ] Composants Settings gèrent les erreurs
- [ ] Intercepteur axios ne redirige pas trop tôt

---

## 📝 Actions Immédiates

### 1. Désactiver temporairement l'intercepteur

```typescript
// frontend/src/lib/axios.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // COMMENTER TEMPORAIREMENT:
    // if (error.response?.status === 401) {
    //   window.location.href = '/login';
    // }
    
    return Promise.reject(error);
  }
);
```

### 2. Ajouter des logs dans GeneralSettings

```typescript
useEffect(() => {
  console.log('GeneralSettings mounted');
  console.log('Token:', localStorage.getItem('token')?.substring(0, 20));
  fetchSettings();
}, []);

const fetchSettings = async () => {
  console.log('Fetching settings...');
  try {
    const response = await axios.get('/settings/app');
    console.log('Settings loaded:', response.data);
    setSettings(response.data);
  } catch (error: any) {
    console.error('Error loading settings:', {
      status: error.response?.status,
      message: error.response?.data?.message
    });
  }
};
```

### 3. Tester avec Postman/curl

```bash
# Remplacez YOUR_TOKEN par votre token
curl -v \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/settings/app

# Voir la réponse complète
# Status 200 → OK
# Status 401 → Problème auth
# Status 404 → Route n'existe pas
```

---

## 🔑 Causes Fréquentes

### 1. Token expiré
**Symptôme:** Ça marchait avant, plus maintenant  
**Solution:** Se reconnecter

### 2. Secret JWT différent
**Symptôme:** Token créé avec un secret, vérifié avec un autre  
**Solution:** Vérifier `.env` backend: `JWT_SECRET=...`

### 3. Middleware mal configuré
**Symptôme:** Toujours 401 même avec token valide  
**Solution:** Vérifier `auth.middleware.ts`

### 4. CORS bloque les requêtes
**Symptôme:** Network error, pas de réponse  
**Solution:** Vérifier CORS backend pour `localhost:3001`

### 5. Route backend n'existe pas
**Symptôme:** 404 Not Found  
**Solution:** Vérifier que `/settings/app` est bien enregistré dans `index.ts`

---

## 📞 Si Rien ne Fonctionne

**Créer un fichier de test minimal:**

```typescript
// frontend/src/pages/TestSettings.tsx
import { useEffect } from 'react';
import axios from '../lib/axios';

export default function TestSettings() {
  useEffect(() => {
    const test = async () => {
      const token = localStorage.getItem('token');
      console.log('=== TEST SETTINGS ===');
      console.log('1. Token présent:', !!token);
      
      try {
        console.log('2. Test API /settings/app...');
        const response = await axios.get('/settings/app');
        console.log('3. SUCCESS:', response.data);
      } catch (error: any) {
        console.error('4. ERROR:', {
          status: error.response?.status,
          message: error.response?.data,
        });
      }
    };
    
    test();
  }, []);
  
  return <div>Voir console (F12)</div>;
}
```

Puis tester en allant sur `/test-settings`.

---

**🎯 L'objectif est de comprendre POURQUOI l'API retourne 401 avant de corriger la redirection!**
