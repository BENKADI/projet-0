# 🔐 Système RBAC - Role-Based Access Control

## 🎯 Comment ça marche ?

Le système utilise maintenant un **vrai système RBAC basé sur les permissions des rôles** au lieu de seulement vérifier si l'utilisateur est "admin".

### Principe :
1. **Un utilisateur a un ou plusieurs rôles**
2. **Chaque rôle contient des permissions**
3. **Les routes vérifient les permissions** au lieu du rôle admin
4. **L'utilisateur peut faire uniquement ce que ses permissions lui permettent**

---

## 📋 Les 4 Rôles par Défaut

### 1. 👑 **Administrateur** (Système)
Toutes les permissions - Accès complet

### 2. 👔 **Manager** (Système)
Gestion avancée :
- ✅ Créer, lire, modifier des utilisateurs
- ✅ Lire des rôles
- ✅ Lire des permissions
- ✅ Analytics
- ✅ Profil et paramètres

### 3. 👤 **Utilisateur** (Système)
Accès standard :
- ✅ Lire les utilisateurs
- ✅ Lire les rôles
- ✅ Lire les permissions
- ✅ Analytics
- ✅ Profil
- ❌ Pas de création/modification

### 4. 👁️ **Lecteur** (Système)
Lecture seule :
- ✅ Lire les utilisateurs
- ✅ Lire les analytics
- ✅ Lire son profil
- ✅ Lire les paramètres
- ❌ Aucune modification

---

## ✨ Permissions Disponibles

### 👥 Gestion des Utilisateurs
- `create:users` - Créer des utilisateurs
- `read:users` - Voir les utilisateurs
- `update:users` - Modifier les utilisateurs
- `delete:users` - Supprimer des utilisateurs
- `export:users` - Exporter les données

### 🎭 Gestion des Rôles
- `create:roles` - Créer des rôles
- `read:roles` - Voir les rôles
- `update:roles` - Modifier les rôles
- `delete:roles` - Supprimer des rôles
- `manage:roles` - Assigner des rôles aux utilisateurs

### 🔑 Gestion des Permissions
- `create:permissions` - Créer des permissions
- `read:permissions` - Voir les permissions
- `update:permissions` - Modifier des permissions
- `delete:permissions` - Supprimer des permissions
- `manage:permissions` - Assigner des permissions

### ⚙️ Profil & Paramètres
- `read:profile` - Consulter son profil
- `update:profile` - Modifier son profil
- `read:settings` - Voir les paramètres
- `update:settings` - Modifier les paramètres

### 📊 Analytics
- `read:analytics` - Consulter les statistiques

---

## 🚀 Comment Tester ?

### 1. Créer un Utilisateur "Manager"

1. Connectez-vous avec `admin@projet0.com`
2. Allez dans **Users** → **Nouvel utilisateur**
3. Créez un utilisateur avec :
   - Email : `manager@test.com`
   - Mot de passe : `Manager123!`
   - **Rôle : Manager**

### 2. Tester avec le Manager

1. Déconnectez-vous
2. Connectez-vous avec `manager@test.com`
3. Vous verrez :
   - ✅ Dashboard avec statistiques
   - ✅ Liste des utilisateurs
   - ✅ Création d'utilisateurs
   - ✅ Modification d'utilisateurs
   - ❌ **MAIS PAS** de suppression (il n'a pas `delete:users`)

### 3. Créer un Utilisateur "Lecteur"

1. Reconnectez-vous en admin
2. Créez un utilisateur avec le rôle **Lecteur**
3. Connectez-vous avec ce compte
4. Vous verrez :
   - ✅ Dashboard (lecture seule)
   - ✅ Liste des utilisateurs (lecture)
   - ❌ Aucun bouton "Nouveau"
   - ❌ Aucun bouton "Modifier"
   - ❌ Aucun bouton "Supprimer"

---

## 🎨 Personnalisation des Rôles

### Modifier les Permissions d'un Rôle

1. Allez dans **Settings** → **Permissions**
2. Cliquez sur **Modifier** (crayon) à côté d'un rôle
3. **Cochez/Décochez** les permissions
4. Cliquez sur **Mettre à jour**

Les utilisateurs avec ce rôle auront immédiatement les nouvelles permissions !

### Créer un Rôle Personnalisé

1. Allez dans **Settings** → **Permissions**
2. Cliquez sur **Nouveau Rôle**
3. Remplissez :
   - **Nom** : "Éditeur"
   - **Description** : "Peut créer et modifier mais pas supprimer"
4. **Cochez les permissions** :
   - ✅ `create:users`
   - ✅ `read:users`
   - ✅ `update:users`
   - ❌ `delete:users`
5. Cliquez sur **Créer**
6. Assignez ce rôle à un utilisateur

---

## 🔒 Protection des Rôles Système

Les 4 rôles système (Administrateur, Manager, Utilisateur, Lecteur) sont protégés :
- ✅ Vous POUVEZ modifier leurs permissions
- ❌ Vous NE POUVEZ PAS les renommer
- ❌ Vous NE POUVEZ PAS les supprimer
- ❌ Vous NE POUVEZ PAS modifier leur description

Les rôles personnalisés que vous créez n'ont aucune restriction.

---

## 📊 Correspondance Routes ↔ Permissions

### Utilisateurs
```
GET    /users     → read:users
POST   /users     → create:users
GET    /users/:id → read:users
PUT    /users/:id → update:users
DELETE /users/:id → delete:users
```

### Rôles
```
GET    /roles     → read:roles
POST   /roles     → create:roles
GET    /roles/:id → read:roles
PUT    /roles/:id → update:roles
DELETE /roles/:id → delete:roles
```

### Permissions
```
GET    /permissions     → read:permissions
POST   /permissions     → create:permissions
PUT    /permissions/:id → update:permissions
DELETE /permissions/:id → delete:permissions
```

---

## ✅ Résumé

**Avant :** Seulement "admin" ou "user" → Accès tout ou rien  
**Maintenant :** Permissions granulaires → Chaque utilisateur voit exactement ce qu'il peut faire selon son rôle

**Exemple concret :**
- Un **Manager** peut créer des utilisateurs mais pas les supprimer
- Un **Utilisateur** peut voir les statistiques mais pas créer d'utilisateurs
- Un **Lecteur** peut tout voir mais rien modifier

Le système est maintenant **flexible**, **sécurisé** et **évolutif** ! 🚀
