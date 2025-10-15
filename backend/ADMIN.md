# 👤 Compte Administrateur par Défaut

## 🔐 Identifiants de connexion

Une fois le seed exécuté, vous pourrez vous connecter avec :

```
📧 Email     : admin@projet0.com
🔑 Password  : Admin123!
👤 Nom       : Super Admin
🛡️  Rôle     : admin
```

## 🚀 Comment créer l'administrateur

### Méthode 1: Avec npm (Recommandé)
```bash
cd backend
npm run prisma:seed
```

### Méthode 2: Avec ts-node
```bash
cd backend
npx ts-node prisma/seed.ts
```

### Méthode 3: Avec le Makefile
```bash
make prisma-seed
```

## ✨ Ce que fait le seed

Le script de seed (`prisma/seed.ts`) effectue les actions suivantes :

1. **Crée 12 permissions par défaut** :
   - `create:users`, `read:users`, `update:users`, `delete:users`
   - `create:products`, `read:products`, `update:products`, `delete:products`
   - `create:orders`, `read:orders`, `update:orders`, `delete:orders`

2. **Crée un utilisateur administrateur** avec :
   - Toutes les permissions
   - Accès complet à l'application
   - Rôle "admin"

3. **Si l'admin existe déjà** :
   - Met à jour ses permissions si nécessaire
   - Ne modifie pas le mot de passe existant

## ⚠️ Sécurité importante

### **CHANGEZ LE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION !**

Pour changer le mot de passe admin :

1. Connectez-vous avec les identifiants par défaut
2. Allez dans votre profil
3. Modifiez le mot de passe

Ou via l'API :
```bash
curl -X PUT http://localhost:3000/users/{id} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "NouveauMotDePasse123!"}'
```

## 🔄 Réinitialiser l'administrateur

Si vous oubliez le mot de passe admin :

```bash
# 1. Supprimer l'admin existant
npx prisma studio
# Puis supprimez l'utilisateur admin dans l'interface

# 2. Re-exécuter le seed
npm run prisma:seed
```

## 📝 Personnaliser l'admin

Pour modifier les informations par défaut, éditez `prisma/seed.ts` :

```typescript
{
  email: 'admin@projet0.com',        // Changez l'email
  password: hashedPassword,           // Le mot de passe
  firstName: 'Super',                 // Le prénom
  lastName: 'Admin',                  // Le nom
  role: 'admin'                       // Le rôle
}
```

## 🧪 Tester la connexion

### Via l'interface web
1. Allez sur http://localhost:3001/login
2. Entrez les identifiants admin
3. Vous devriez être connecté avec accès complet

### Via l'API
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@projet0.com",
    "password": "Admin123!"
  }'
```

Vous recevrez un token JWT à utiliser pour les requêtes authentifiées.

## 📊 Vérifier les permissions

Pour voir toutes les permissions de l'admin :

```bash
# Via Prisma Studio
npx prisma studio

# Ou via l'API (après connexion)
curl http://localhost:3000/users/{admin_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Permissions de l'administrateur

L'administrateur a toutes les permissions, incluant :

- ✅ Gérer les utilisateurs (CRUD complet)
- ✅ Gérer les permissions
- ✅ Gérer les produits
- ✅ Gérer les commandes
- ✅ Accès à toutes les fonctionnalités

---

**Note** : Ces identifiants sont pour l'environnement de développement. 
En production, utilisez des identifiants sécurisés et changez-les immédiatement !
