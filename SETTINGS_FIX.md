# 🔧 Corrections - Page Settings

## ✅ Problèmes Résolus

### 1. **Configuration Axios Manquante**

**Problème:** Les composants Settings importaient axios directement sans configuration de base URL.

**Solution:** 
- ✅ Créé `frontend/src/lib/axios.ts` avec configuration centralisée
- ✅ Tous les composants Settings mis à jour pour utiliser cette instance

**Fichier créé:**
```typescript
// frontend/src/lib/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour token JWT
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. **Composants Mis à Jour**

Tous les composants Settings utilisent maintenant l'instance axios configurée:

- ✅ `GeneralSettings.tsx` → `import axios from '../../lib/axios'`
- ✅ `ProfileSettings.tsx` → `import axios from '../../lib/axios'`
- ✅ `AppearanceSettings.tsx` → `import axios from '../../lib/axios'`
- ✅ `NotificationSettings.tsx` → `import axios from '../../lib/axios'`
- ✅ `SecuritySettings.tsx` → `import axios from '../../lib/axios'`
- ✅ `SystemSettings.tsx` → `import axios from '../../lib/axios'`

---

## 🚀 Pour Tester Maintenant

### 1. Redémarrer les Serveurs

```bash
# Arrêter tous les processus Node (si actifs)
# Ctrl+C dans les terminaux

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Vérifier les URLs

**Backend:** http://localhost:3000  
**Frontend:** http://localhost:3001  
**Settings:** http://localhost:3001/settings

### 3. Test Complet

```bash
# 1. Ouvrir http://localhost:3001
# 2. Se connecter
# 3. Cliquer sur ⚙️ Paramètres (sidebar)
# 4. Tester chaque onglet:
#    - Général → Modifier le nom → Enregistrer
#    - Profil → Modifier prénom → Enregistrer
#    - Apparence → Changer thème → Enregistrer
#    - Notifications → Toggle switches → Enregistrer
#    - Sécurité → Voir le formulaire
#    - Système (admin) → Voir les paramètres
```

### 4. Vérifier la Console

Ouvrez la console du navigateur (F12) et vérifiez:

```javascript
// Pas d'erreurs de type:
❌ "Network Error" 
❌ "Failed to fetch"
❌ "Cannot GET /settings/app"
❌ "401 Unauthorized"

// Devrait voir:
✅ GET http://localhost:3000/settings/app → 200 OK
✅ PUT http://localhost:3000/settings/app → 200 OK
```

---

## 🔍 Dépannage

### Problème: Erreur 404 sur /settings/app

**Cause:** Backend non démarré ou route manquante

**Solution:**
```bash
# 1. Vérifier que le backend tourne
curl http://localhost:3000/health

# 2. Vérifier les routes settings
curl http://localhost:3000/settings/app
# (devrait retourner 401 si pas authentifié)
```

### Problème: Erreur CORS

**Symptôme:** 
```
Access to XMLHttpRequest at 'http://localhost:3000' from origin 
'http://localhost:3001' has been blocked by CORS policy
```

**Solution:** Vérifier `backend/src/index.ts`:
```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
};
app.use(cors(corsOptions));
```

### Problème: Token non envoyé

**Cause:** Token pas dans localStorage ou intercepteur ne fonctionne pas

**Solution:**
```javascript
// Dans la console navigateur:
localStorage.getItem('token')
// Devrait retourner un token JWT

// Si null:
// 1. Se reconnecter
// 2. Vérifier que le login sauvegarde le token
```

### Problème: Onglets s'affichent mais ne chargent rien

**Cause:** Erreur dans un composant ou données non retournées

**Solution:**
1. Ouvrir la console (F12)
2. Regarder les erreurs React
3. Vérifier les réponses API dans l'onglet Network

---

## 📊 Checklist de Vérification

### Backend ✅
- [ ] Serveur démarré sur port 3000
- [ ] Route `/settings/app` existe
- [ ] Route `/settings/preferences` existe
- [ ] CORS configuré pour localhost:3001
- [ ] Base de données migrée (tables AppSettings, UserPreferences)

### Frontend ✅
- [ ] Serveur démarré sur port 3001
- [ ] Fichier `.env` avec `VITE_API_URL=http://localhost:3000`
- [ ] Fichier `lib/axios.ts` créé
- [ ] Tous les composants Settings utilisent `../../lib/axios`
- [ ] Route `/settings` dans `App.tsx`
- [ ] Lien dans la sidebar

### Test Fonctionnel ✅
- [ ] Page /settings charge sans erreur
- [ ] Les 6 onglets s'affichent
- [ ] Clic sur un onglet change le contenu
- [ ] Les formulaires se remplissent avec les données
- [ ] Bouton "Enregistrer" fonctionne
- [ ] Message de succès/erreur s'affiche

---

## 🎯 Commandes Rapides

### Vérifier que tout fonctionne:

```bash
# 1. Tester le backend
curl http://localhost:3000/health
# Devrait retourner: {"status":"ok",...}

# 2. Tester l'API settings (avec token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/settings/app
# Devrait retourner les paramètres

# 3. Tester le frontend
# Ouvrir http://localhost:3001/settings dans le navigateur
```

### Logs en temps réel:

```bash
# Backend logs
cd backend
npm run dev
# Regarder les requêtes HTTP

# Frontend logs
# Ouvrir Console navigateur (F12)
# Voir les requêtes réseau
```

---

## 💡 Améliorations Suggérées

### Court Terme
1. **Remplacer alert() par toast**
   ```bash
   # Sonner déjà installé
   npm list sonner
   # Voir TOAST_INTEGRATION.md
   ```

2. **Créer endpoint change-password**
   ```typescript
   // backend/src/controllers/authController.ts
   async changePassword(req, res) {
     // Vérifier ancien mot de passe
     // Hash nouveau mot de passe
     // Sauvegarder
   }
   ```

3. **Améliorer gestion erreurs**
   ```typescript
   // Au lieu de console.error
   catch (error) {
     toast.error(error.response?.data?.message || 'Erreur');
   }
   ```

---

## 📝 Fichiers Modifiés

```diff
frontend/
├── src/
│   ├── lib/
│   │   └── axios.ts                        ✅ CRÉÉ
│   └── components/settings/
│       ├── GeneralSettings.tsx            ✅ MODIFIÉ
│       ├── ProfileSettings.tsx            ✅ MODIFIÉ
│       ├── AppearanceSettings.tsx         ✅ MODIFIÉ
│       ├── NotificationSettings.tsx       ✅ MODIFIÉ
│       ├── SecuritySettings.tsx           ✅ MODIFIÉ
│       └── SystemSettings.tsx             ✅ MODIFIÉ
```

---

## 🎉 Résultat Attendu

Après ces corrections, la page Settings devrait:

✅ Charger sans erreur  
✅ Afficher tous les onglets  
✅ Récupérer les données du backend  
✅ Sauvegarder les modifications  
✅ Afficher les messages de succès/erreur  
✅ Fonctionner en mode dark  
✅ Être responsive  

---

## 📞 Si le Problème Persiste

1. **Vérifier les logs backend**
   - Regarder le terminal backend
   - Voir les requêtes HTTP
   - Vérifier les erreurs Prisma

2. **Vérifier les logs frontend**
   - Console navigateur (F12)
   - Onglet Network
   - Onglet Console

3. **Tester manuellement l'API**
   ```bash
   # Via curl ou Postman
   GET http://localhost:3000/settings/app
   # Avec header Authorization
   ```

4. **Vérifier la base de données**
   ```bash
   cd backend
   npx prisma studio
   # Ouvrir http://localhost:5555
   # Vérifier que les tables AppSettings et UserPreferences existent
   ```

---

**Date de correction:** 22 Octobre 2025  
**Status:** ✅ Corrigé  
**Fichiers modifiés:** 7  

🎯 **La page Settings devrait maintenant fonctionner correctement!**
