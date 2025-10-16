# 🚀 Projet-0 Manager - Guide d'Utilisation

## Description

Script PowerShell complet pour gérer l'application Projet-0 avec une interface interactive en ligne de commande.

## Fonctionnalités

### 🟢 1. Démarrer l'application
- Démarre automatiquement le backend ET le frontend
- Vérifie et installe les dépendances si nécessaire
- Libère les ports occupés automatiquement
- Ouvre le navigateur sur l'application

### 🔴 2. Arrêter l'application
- Arrête proprement backend, frontend et Prisma Studio
- Libère tous les ports utilisés

### 🔄 3. Redémarrer l'application
- Arrête puis redémarre les services
- Utile après des modifications de code

### 🗄️ 4. Prisma Studio
- Interface graphique pour la base de données
- Accessible sur `http://localhost:5555`

### 🌐 5. Gérer les ports
- **Vérifier les ports** : Voir quels ports sont utilisés
- **Libérer un port** : Arrêter un processus sur un port spécifique
- **Libérer tous les ports** : Nettoyer tous les ports de l'app

**Ports utilisés :**
- Backend : `3000`
- Frontend : `3001`
- Prisma Studio : `5555`

### 🗃️ 6. Gérer la base de données
- **Appliquer les migrations** : `prisma migrate deploy`
- **Réinitialiser la BDD** : Supprime toutes les données
- **Générer le client Prisma** : Après modif du schema
- **Statut des migrations** : Voir l'état actuel
- **Créer une migration** : Nouvelle migration nommée

### 🧹 7. Nettoyer les caches
- Supprime les caches Vite
- Supprime les dossiers `dist`
- Nettoie backend et frontend

### 📋 8. Afficher les logs
- Logs backend (fichiers dans `backend/logs`)
- Logs frontend (console navigateur)
- Historique des migrations Prisma

### 🌿 9. Gestion Git
- **Statut** : `git status`
- **Commits récents** : `git log`
- **Créer un commit** : Interactif
- **Push** : Vers GitHub
- **Pull** : Depuis GitHub
- **Branches** : Lister, créer, changer
- **Diff** : Voir les modifications

### 💾 10. Créer un backup

#### Option 1 : Backup Complet
- Code source (ZIP sans node_modules, dist, .git)
- Base de données (SQL + JSON + Schema Prisma)
- Fichier d'instructions de restauration

#### Option 2 : Application uniquement
- ZIP du code source optimisé

#### Option 3 : Base de données uniquement
- Export SQL (pg_dump)
- Schema Prisma

**Emplacement :** `D:\project\windsurf\projet-0\backups\`

### 📦 11. Restaurer un backup
- Liste des backups disponibles
- Extraction et instructions de restauration
- Ouverture automatique de l'explorateur

### ❌ 12. Quitter
- Ferme le script proprement

---

## Utilisation

### Démarrage rapide

```powershell
# Ouvrir PowerShell dans le dossier du projet
cd D:\project\windsurf\projet-0

# Exécuter le script
.\project-app-manager.ps1
```

### Navigation
- Tapez le **numéro** de l'option désirée
- Appuyez sur **Entrée**
- Suivez les instructions à l'écran

---

## Configuration

Le script détecte automatiquement :
- Chemins du projet
- Ports configurés
- Installation de PostgreSQL
- Dépendances Node.js

### Chemins configurés

```powershell
$backendPath = "D:\project\windsurf\projet-0\backend"
$frontendPath = "D:\project\windsurf\projet-0\frontend"
$rootPath = "D:\project\windsurf\projet-0"
$backupPath = "D:\project\windsurf\projet-0\backups"
```

### Ports configurés

```powershell
$backendPort = 3000
$frontendPort = 3001
$dbStudioPort = 5555
```

### Base de données

- **Nom** : `PROJECT_0`
- **User** : `postgres`
- **Password** : `TOUFIK90`
- **Host** : `localhost`
- **Port** : `5432`

---

## Prérequis

### Obligatoires
- ✅ **PowerShell 5.0+** (Windows)
- ✅ **Node.js 18+**
- ✅ **PostgreSQL** (pour backup/restore SQL)
- ✅ **Git** (pour les fonctions Git)

### Optionnels
- **7-Zip** : Compression plus rapide des backups
  - Si absent, utilise `Compress-Archive` (plus lent)

---

## Backup & Restauration

### Créer un Backup Complet

1. Menu → Option `10`
2. Choisir `1` (Backup complet)
3. Attendre la fin
4. Backup créé dans `backups/projet0_backup_YYYYMMDD_HHMMSS.zip`

### Restaurer un Backup

1. Menu → Option `11`
2. Sélectionner un backup dans la liste
3. Taper `OUI` pour confirmer
4. Suivre les instructions dans `backup_info.txt`

**Contenu d'un backup complet :**
- `application.zip` : Code source
- `database_dump.sql` : Export PostgreSQL
- `database_data.json` : Export JSON alternatif
- `database_schema.prisma` : Schema Prisma
- `backup_info.txt` : Instructions détaillées

---

## Dépannage

### Le script ne démarre pas
```powershell
# Autoriser l'exécution de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port déjà utilisé
- Le script libère automatiquement les ports
- Ou : Menu → `5` → `3` (Libérer tous les ports)

### PostgreSQL non détecté
Le script cherche dans :
- `C:\Program Files\PostgreSQL\[version]\bin\`
- `C:\Program Files (x86)\PostgreSQL\[version]\bin\`

Si introuvable, ajoutez `pg_dump` au PATH système.

### Backup SQL échoue
- Vérifier que PostgreSQL est installé
- Vérifier les credentials dans le script
- Alternative : Utilise le backup JSON automatiquement

### Dépendances manquantes
Le script propose automatiquement d'installer avec `npm install`

---

## Exemples d'Utilisation

### Workflow Développement Quotidien

```
1. Démarrer le script
2. Option 1 → Démarrer l'application
3. Développer...
4. Option 9 → Git (commit, push)
5. Option 2 → Arrêter l'application
```

### Avant une Grosse Modification

```
1. Option 10 → Créer un backup complet
2. Faire les modifications
3. Option 3 → Redémarrer l'application
4. Tester
```

### Après Modification du Schema Prisma

```
1. Modifier prisma/schema.prisma
2. Option 6 → Gérer BDD
3. Option 5 → Créer migration
4. Nom : "add_google_oauth_fields"
5. Option 3 → Générer client Prisma
```

### Nettoyer après Erreurs

```
1. Option 7 → Nettoyer caches
2. Option 5 → Libérer tous les ports
3. Option 3 → Redémarrer l'application
```

---

## Codes Couleur

Le script utilise des couleurs pour faciliter la lecture :

- 🟢 **Vert** : Succès
- 🔴 **Rouge** : Erreurs
- 🟡 **Jaune** : Avertissements
- 🔵 **Cyan** : Informations
- 🟣 **Magenta** : Actions secondaires
- ⚪ **Gris** : Options inactives

---

## Icônes Utilisées

| Icône | Signification |
|-------|---------------|
| 🚀 | Démarrage |
| ✅ | Succès |
| ❌ | Erreur |
| ⚠️ | Avertissement |
| 🔍 | Vérification |
| 📦 | Installation/Backup |
| 🗄️ | Base de données |
| 🌐 | Réseau/Web |
| 🧹 | Nettoyage |
| 🔄 | Redémarrage |
| 📊 | Logs/Stats |
| 🌿 | Git |
| 💾 | Sauvegarde |
| 🛑 | Arrêt |
| ℹ️ | Information |

---

## Sécurité

⚠️ **Important :**
- Le script modifie le système (processus, fichiers)
- Les opérations de BDD sont irréversibles
- Toujours faire un backup avant reset/migration

🔒 **Protections intégrées :**
- Confirmation pour actions destructives
- Ignore les processus système
- Ne supprime jamais node_modules automatiquement
- Backup automatique avant opérations critiques

---

## Performance

### Optimisations
- Détection automatique de 7-Zip (compression rapide)
- Export parallèle SQL + JSON
- Cache des chemins PostgreSQL

### Temps Moyens
- Démarrage app : **10-15 secondes**
- Backup complet : **30-60 secondes**
- Nettoyage cache : **5-10 secondes**
- Migration DB : **Selon taille**

---

## Changelog

### Version 1.0 (Adapté pour Projet-0)
- ✅ Chemins adaptés à `D:\project\windsurf\projet-0`
- ✅ Ports : Backend 3000, Frontend 3001
- ✅ Base de données : PROJECT_0
- ✅ Modèles Prisma : User, Permission
- ✅ Backup adapté au nouveau schéma
- ✅ Support Google OAuth dans la structure

---

## Support

### Logs
Les logs sont disponibles dans :
- Backend : `backend/logs/`
- Migrations : `backend/prisma/migrations/`

### Commandes Manuelles

Si le script rencontre un problème :

```powershell
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Prisma
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

---

## Améliorations Futures

- [ ] Support Docker
- [ ] Tests automatisés
- [ ] Déploiement automatique
- [ ] Monitoring des performances
- [ ] Backup automatique planifié
- [ ] Intégration CI/CD

---

**Fait avec ❤️ pour Projet-0**

*Pour toute question, consultez la documentation dans le dossier du projet.*
