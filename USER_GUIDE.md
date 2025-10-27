# 📖 Guide Utilisateur Rapide

## 🚀 Démarrage en 5 Minutes

### 1. Accès à l'Application
```bash
URL: http://localhost:3001
```
- **Ouvrez votre navigateur** et naviguez vers l'URL
- **Connectez-vous** avec vos identifiants ou Google
- **Explorez le dashboard** personnalisé

### 2. Première Connexion

#### Option A: Compte Local
1. **Cliquez sur "Se connecter"**
2. **Entrez votre email** et mot de passe
3. **Cliquez sur "Connexion"**
4. **Accédez à votre dashboard**

#### Option B: Compte Google
1. **Cliquez sur "Continuer avec Google"**
2. **Choisissez votre compte Google**
3. **Autorisez l'application**
4. **Vous êtes connecté automatiquement**

---

## 🎯 Navigation Principale

### Sidebar (Menu Principal)
```
🏠 Dashboard     → Page d'accueil avec statistiques
👥 Utilisateurs  → Gestion des comptes (admin)
🛡️ Permissions  → Gestion des permissions (admin)  
⚙️ Paramètres    → Configuration du compte et app
🚪 Déconnexion   → Quitter l'application
```

### Navigation Rapide
- **Avatar en haut à droite** → Menu profil
- **Breadcrumb** → Fil d'Ariane de navigation
- **Recherche globale** → 🔍 Loupe en haut

---

## 👥 Gestion des Utilisateurs (Admin)

### Créer un Utilisateur
1. **Allez dans "Utilisateurs"** (sidebar)
2. **Cliquez "Ajouter un utilisateur"** (bouton bleu)
3. **Remplissez le formulaire**:
   - Email (requis, unique)
   - Mot de passe (optionnel si OAuth)
   - Prénom, Nom (optionnels)
   - Rôle: User ou Admin
4. **Cliquez "Créer"**

### Modifier un Utilisateur
1. **Trouvez l'utilisateur** dans la table
2. **Cliquez l'icône ✏️** (modifier)
3. **Changez les informations**
4. **Cliquez "Mettre à jour"**

### Supprimer un Utilisateur
1. **Trouvez l'utilisateur** dans la table
2. **Cliquez l'icône 🗑️** (supprimer)
3. **Confirmez la suppression**
4. **L'utilisateur est supprimé**

### Rechercher des Utilisateurs
- **Barre de recherche**: Entrez email ou nom
- **Filtre par rôle**: User/Admin/Tous
- **Tri**: Cliquez sur les en-têtes de colonnes

---

## 🛡️ Gestion des Permissions (Admin)

### Format des Permissions
```
action:ressource
```
**Actions**: create, read, update, delete
**Ressources**: users, permissions, settings, products...

**Exemples**:
- `create:users` → Créer des utilisateurs
- `read:products` → Voir les produits  
- `update:orders` → Modifier les commandes
- `delete:posts` → Supprimer les articles

### Créer une Permission
1. **Allez dans "Permissions"** (sidebar)
2. **Cliquez "Ajouter une permission"**
3. **Entrez le nom** (ex: `create:users`)
4. **Ajoutez une description** (optionnel)
5. **Cliquez "Créer"**

### Validation Automatique
- ✅ **Vert**: Format valide
- ❌ **Rouge**: Erreur de format
- 📝 **Message**: Description de l'erreur

### Copier une Permission
1. **Cliquez l'icône 📋** dans la table
2. **Le nom est copié** dans le presse-papiers
3. **Collez où vous voulez**

---

## ⚙️ Paramètres et Personnalisation

### Accès aux Paramètres
```bash
Sidebar → Paramètres
URL: http://localhost:3001/settings
```

### Onglets Disponés

#### 🌍 Général
- **Nom de l'application**
- **Logo** (upload d'image)
- **Description**
- **Email de contact**

#### 👤 Profil Personnel
- **Prénom, Nom**
- **Photo de profil** (upload)
- **Biographie**
- **Téléphone**

#### 🎨 Apparence
- **Thème**: Clair/Sombre/Auto
- **Couleurs**: Primaire et accent
- **Presets**: Bleu, Vert, Violet, Rouge
- **Aperçu**: Voir les changements en direct

#### 🔔 Notifications
- **Notifications email**
- **Notifications bureau**
- **Sons activés/désactivés**
- **Fréquence**: Immédiat/Horaire/Quotidien

#### 🔒 Sécurité
- **Changer le mot de passe**
- **Activer 2FA** (si disponible)
- **Sessions actives**
- **Timeout de session**

---

## 🎨 Personnalisation de l'Apparence

### Changer le Thème
1. **Allez dans Paramètres → Apparence**
2. **Choisissez le thème**:
   - ☀️ **Clair**: Interface lumineuse
   - 🌙 **Sombre**: Interface sombre
   - 🔄 **Auto**: Suit votre système
3. **Le changement est instantané**

### Personnaliser les Couleurs
1. **Dans Apparence**, trouvez "Couleurs"
2. **Choisissez une couleur primaire**:
   - Cliquez sur le color picker
   - Entrez un code hexadécimal (#3b82f6)
   - Ou choisissez un preset
3. **Choisissez une couleur d'accent**
4. **Voyez l'aperçu** en temps réel
5. **Cliquez "Sauvegarder"**

### Presets de Couleurs
- **Bleu**: Professionnel et moderne
- **Vert**: Frais et écologique  
- **Violet**: Créatif et élégant
- **Rouge**: Dynamique et audacieux

---

## 📊 Dashboard et Statistiques

### Accès au Dashboard
```bash
URL: http://localhost:3001/dashboard
```

### Widgets Principaux

#### 📈 Statistiques Utilisateurs
- **Total utilisateurs**: Nombre de comptes
- **Utilisateurs actifs**: Connectés ces 30 derniers jours
- **Nouveaux ce mois**: Nouvelles inscriptions
- **Croissance**: Pourcentage d'augmentation

#### 🛡️ Permissions
- **Total permissions**: Nombre de permissions créées
- **Permissions utilisateur**: Pour les users standards
- **Permissions admin**: Pour les administrateurs
- **Permissions personnalisées**: Créées manuellement

#### 🕐 Activité Récente
- **Dernières actions**: Créations, modifications
- **Qui a fait quoi**: Utilisateur et action
- **Quand**: Timestamp de l'action
- **Type**: Icône selon l'action

### Export des Données
1. **Cliquez "Exporter"** en haut du dashboard
2. **Choisissez le format**: PDF, Excel, CSV
3. **Sélectionnez la période**: Date début/fin
4. **Cliquez "Télécharger"**

---

## 🔍 Recherche et Filtres

### Recherche Globale
- **Icone 🔍** en haut de la page
- **Recherche全文**: Entrez n'importe quel terme
- **Résultats**: Users, permissions, settings
- **Rapide**: Résultats instantanés

### Filtres dans les Tables

#### Table Utilisateurs
- **Recherche**: Email, nom, prénom
- **Filtre par rôle**: User/Admin/Tous
- **Tri**: Par colonne (date, nom, email)

#### Table Permissions  
- **Recherche**: Nom ou description
- **Filtre par action**: create/read/update/delete
- **Filtre par ressource**: users/products/etc.
- **Coloration syntaxique**: Actions colorées

---

## 📱 Utilisation sur Mobile

### Navigation Mobile
- **Menu ☰**: En haut à gauche
- **Swipe**: Glissez pour ouvrir/fermer
- **Touch**: Boutons optimisés pour doigts
- **Scroll**: Horizontal pour les grandes tables

### Responsive Design
- **Adaptation automatique** à la taille d'écran
- **Lecture facile** sur smartphone
- **Performance optimisée** pour mobile
- **Pas de zoom nécessaire**

---

## 🔧 Conseils Pratiques

### Sécurité
- **Mot de passe fort**: 8+ caractères, majuscules, chiffres
- **Changez régulièrement** votre mot de passe
- **Déconnectez-vous** sur ordinateurs partagés
- **Signalez** toute activité suspecte

### Performance
- **Actualisez la page** si problème de chargement
- **Videz le cache** si interface lente
- **Utilisez un navigateur moderne**: Chrome, Firefox, Safari
- **Connexion internet stable** recommandée

### Productivité
- **Utilise les raccourcis clavier**:
  - `Ctrl/Cmd + K`: Recherche globale
  - `Ctrl/Cmd + /`: Aide rapide
- **Personnalisez votre interface** pour plus de confort
- **Exportez vos données** régulièrement
- **Sauvegardez vos changements** dans les settings

---

## ❓ Questions Fréquentes

### Q: Comment réinitialiser mon mot de passe ?
**R**: Cliquez "Mot de passe oublié" sur la page de connexion, entrez votre email et suivez les instructions.

### Q: Puis-je changer mon rôle (User/Admin) ?
**R**: Non, seul un administrateur peut modifier les rôles des utilisateurs.

### Q: Comment supprimer mon compte ?
**R**: Contactez un administrateur. La suppression automatique n'est pas disponible pour des raisons de sécurité.

### Q: Puis-je utiliser l'application hors ligne ?
**R**: Partiellement. Certaines fonctionnalités nécessitent une connexion internet.

### Q: Comment exporter mes données ?
**R**: Allez dans Dashboard → Export ou contactez un admin pour un export complet.

---

## 🆘 Support et Aide

### Obtenir de l'Aide
- **Documentation**: [Lien vers la documentation complète]
- **Support technique**: support@projet-0.com
- **Report bug**: [Lien vers GitHub Issues]
- **Suggestions**: [Lien vers feedback form]

### Ressources Disponibles
- 📚 **Guide complet**: FEATURES_GUIDE.md
- 🛠️ **Guide développeur**: DEVELOPER_GUIDE.md  
- 🔧 **Configuration**: CONFIGURATION.md
- 📊 **Stack technique**: STACK_ANALYSIS.md

---

**🎉 Félicitations ! Vous maîtrisez maintenant les bases de Projet-0. Pour des fonctionnalités avancées, consultez le guide complet des fonctionnalités.**
