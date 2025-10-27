# 🔒 Résolution des Erreurs 403 (Accès Refusé)

**Date:** 27 Octobre 2025  
**Erreur:** `403 Forbidden` sur `/users` et `/permissions`

---

## 🚨 Problème Identifié

### **Symptômes**
```bash
2025-10-27 14:03:15 [warn]: ❌ GET /users - 403 (2ms)
2025-10-27 14:03:15 [warn]: ❌ GET /permissions - 403 (2ms)
```

### **Cause**
L'utilisateur connecté **n'a pas le rôle admin** requis pour accéder à ces routes protégées.

### **Routes Protégées**
```typescript
// backend/src/routes/userRoutes.ts
router.get('/', isAdmin, userController.getAllUsers);       // ❌ Admin requis
router.post('/', isAdmin, userController.createUser);       // ❌ Admin requis
router.put('/:id', isAdmin, userController.updateUser);     // ❌ Admin requis
router.delete('/:id', isAdmin, userController.deleteUser);  // ❌ Admin requis

// backend/src/routes/permissionRoutes.ts
Toutes les routes nécessitent isAdmin                       // ❌ Admin requis
```

---

## ✅ Solution 1: Promouvoir l'Utilisateur en Admin

### **Méthode Interactive (Recommandée)**

```bash
cd backend
npx ts-node src/scripts/promote-to-admin.ts
```

**Étapes:**
1. Le script affiche tous les utilisateurs
2. Choisir le numéro de l'utilisateur à promouvoir
3. Confirmer la promotion
4. ✅ L'utilisateur est maintenant admin

**Exemple d'utilisation:**
```bash
$ npx ts-node src/scripts/promote-to-admin.ts

🔐 Promotion d'un utilisateur en Administrateur

📋 Utilisateurs disponibles:

1. user@example.com (John Doe) - Rôle: user
2. admin@example.com (Jane Admin) - Rôle: admin

Entrez le numéro de l'utilisateur à promouvoir (ou "q" pour quitter): 1

⚠️  Confirmer la promotion de user@example.com en administrateur? (o/n): o

✅ Succès! user@example.com est maintenant administrateur.

💡 L'utilisateur devra se reconnecter pour que les changements prennent effet.
```

---

## ✅ Solution 2: Modification Directe en Base de Données

### **Via Prisma Studio**
```bash
cd backend
npx prisma studio
```

1. Ouvrir le modèle `User`
2. Trouver votre utilisateur
3. Changer `role` de `user` à `admin`
4. Sauvegarder

### **Via SQL Direct**
```sql
-- Voir tous les utilisateurs
SELECT id, email, role FROM "User";

-- Promouvoir un utilisateur spécifique
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'votre-email@example.com';
```

---

## ✅ Solution 3: Créer un Nouvel Admin

### **Via l'API de Registration**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@projet0.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Puis promouvoir cet utilisateur avec la **Solution 1**.

---

## ✅ Solution 4: Seed Database avec Admin

### **Créer un Seed Script**

```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Créer un admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@projet0.com' },
    update: {},
    create: {
      email: 'admin@projet0.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin'
    }
  });

  console.log('✅ Admin créé:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Exécuter:**
```bash
cd backend
npx prisma db seed
```

---

## 🔍 Vérification

### **1. Vérifier le Rôle de l'Utilisateur Connecté**

Ajouter un log dans le middleware auth:
```typescript
// backend/src/middleware/auth.middleware.ts
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  console.log('👤 User:', req.user?.email, '| Role:', req.user?.role); // ← AJOUTER
  
  if (!req.user) {
    res.status(401).json({ message: 'Utilisateur non authentifié.' });
    return;
  }

  const user = req.user as AuthUser;
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Accès refusé. Privilèges administrateur requis.' });
    return;
  }

  next();
};
```

### **2. Test après Promotion**

```bash
# Se reconnecter dans l'application frontend
# Le nouveau token contiendra le rôle 'admin'
```

### **3. Vérifier l'Accès**

```bash
# Test avec curl
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer VOTRE_TOKEN"

# Attendu: 200 OK avec liste des utilisateurs
```

---

## 🛡️ Sécurité en Production

### **⚠️ Important**

En production, **NE JAMAIS:**
- ❌ Donner admin à tous les utilisateurs
- ❌ Permettre auto-promotion
- ❌ Exposer le script promote-to-admin

**Recommandations:**
- ✅ Créer admins manuellement en base
- ✅ Utiliser variables d'environnement pour admin initial
- ✅ Implémenter système d'invitation admin-only
- ✅ Logger toutes les promotions/rétrogradations
- ✅ Audit trail des actions admin

---

## 📊 Permissions Alternatives

Si vous ne voulez pas donner le rôle admin complet, vous pouvez attribuer des permissions spécifiques:

### **Créer des Permissions**
```sql
INSERT INTO "Permission" (name, description, category) 
VALUES 
  ('read:users', 'Lire la liste des utilisateurs', 'users'),
  ('write:users', 'Créer/modifier des utilisateurs', 'users'),
  ('delete:users', 'Supprimer des utilisateurs', 'users');
```

### **Attribuer à un Utilisateur**
```sql
-- Récupérer les IDs
SELECT id FROM "User" WHERE email = 'user@example.com';
SELECT id FROM "Permission" WHERE name = 'read:users';

-- Créer la relation
INSERT INTO "_PermissionToUser" ("A", "B") 
VALUES ('permission-id', 'user-id');
```

### **Modifier les Routes**
```typescript
// Au lieu de isAdmin
router.get('/', hasPermission('read:users'), userController.getAllUsers);
```

---

## 🐛 Debugging

### **Vérifier le Token JWT**

1. Copier le token depuis localStorage
2. Aller sur https://jwt.io
3. Coller le token
4. Vérifier le payload: `{ userId, role, ... }`

### **Logs Backend Détaillés**

```typescript
// Ajouter dans authenticate middleware
console.log('🔐 Token decoded:', decoded);
console.log('👤 User from DB:', dbUser);
console.log('🎭 User role:', dbUser?.role);
```

---

## 🎯 Checklist de Résolution

- [ ] Identifier l'utilisateur connecté (email)
- [ ] Vérifier son rôle actuel en BDD
- [ ] Promouvoir en admin via script
- [ ] Se déconnecter du frontend
- [ ] Se reconnecter pour nouveau token
- [ ] Tester l'accès à /users
- [ ] ✅ Vérifier que 200 OK

---

## 🚀 Quick Fix (1 Minute)

**Le plus rapide pour développement:**

```bash
# 1. Exécuter le script
cd backend
npx ts-node src/scripts/promote-to-admin.ts

# 2. Choisir votre utilisateur
# 3. Confirmer

# 4. Recharger le frontend (F5)
# 5. Se reconnecter

# ✅ Terminé!
```

---

## 📚 Ressources

- [Guide Auth Middleware](./backend/src/middleware/auth.middleware.ts)
- [Routes Protégées](./backend/src/routes/userRoutes.ts)
- [Types Auth](./backend/src/types/auth.types.ts)
- [Prisma Schema](./backend/prisma/schema.prisma)

---

*Problème résolu !* 🔓✅
