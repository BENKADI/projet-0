# 🔐 Informations Administrateur

## Compte Admin par défaut

Le système a créé automatiquement un compte administrateur lors de l'initialisation :

**Identifiants :**
- 📧 Email : `admin@projet0.com`
- 🔑 Mot de passe : `Admin123!`
- 👑 Rôle : Administrateur (toutes les permissions)

## Accès au Dashboard

Pour accéder à toutes les fonctionnalités (Dashboard, Settings, Users, Roles, etc.), vous DEVEZ être connecté avec un compte ayant le rôle **Administrateur**.

### Permissions requises :
- ✅ Voir les statistiques du dashboard → Rôle **Admin**
- ✅ Gérer les utilisateurs → Rôle **Admin**
- ✅ Gérer les rôles → Rôle **Admin**
- ✅ Gérer les permissions → Rôle **Admin**
- ✅ Modifier les paramètres → Rôle **Admin**

## Comment se connecter ?

1. Allez sur `http://localhost:3002/login`
2. Entrez l'email : `admin@projet0.com`
3. Entrez le mot de passe : `Admin123!`
4. Cliquez sur "Se connecter"

Une fois connecté, toutes les erreurs de permissions disparaîtront ! 🚀

## Vérifier votre rôle actuel

Si vous êtes déjà connecté mais voyez des erreurs de permissions :
1. Cliquez sur votre profil (en haut à droite)
2. Vérifiez votre rôle affiché
3. Si ce n'est pas "Administrateur", déconnectez-vous et reconnectez-vous avec le compte admin

## Créer un nouvel administrateur

Pour créer un autre compte admin :
1. Connectez-vous avec `admin@projet0.com`
2. Allez dans **Users** → **Nouvel utilisateur**
3. Remplissez les informations
4. Sélectionnez le rôle **Administrateur**
5. Sauvegardez
