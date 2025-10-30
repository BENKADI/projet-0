export const PERMISSION_DEFINITIONS = [
  // Users management
  { name: 'create:users', description: 'Créer des utilisateurs' },
  { name: 'read:users', description: 'Voir les utilisateurs' },
  { name: 'update:users', description: 'Modifier les utilisateurs' },
  { name: 'delete:users', description: 'Supprimer des utilisateurs' },
  { name: 'export:users', description: 'Exporter les données utilisateurs' },
  { name: 'read:analytics', description: 'Consulter les métriques utilisateurs' },
  { name: 'read:user', description: 'Consulter les informations de son propre compte' },
  { name: 'update:user', description: 'Mettre à jour les informations de son propre compte' },

  // Permissions management
  { name: 'create:permissions', description: 'Créer de nouvelles permissions' },
  { name: 'read:permissions', description: 'Voir la liste des permissions' },
  { name: 'update:permissions', description: 'Modifier des permissions existantes' },
  { name: 'delete:permissions', description: 'Supprimer des permissions' },
  { name: 'export:permissions', description: 'Exporter les permissions' },

  // Profile & settings
  { name: 'read:profile', description: 'Consulter son profil utilisateur' },
  { name: 'update:profile', description: 'Mettre à jour son profil utilisateur' },
  { name: 'read:settings', description: 'Consulter les paramètres de l’application' },
  { name: 'update:settings', description: 'Mettre à jour les paramètres de l’application' },

  // Notifications (prévisionnel)
  { name: 'send:notifications', description: 'Envoyer des notifications aux utilisateurs' },
  { name: 'manage:notifications', description: 'Gérer et nettoyer les notifications' },
] as const;

export type PermissionDefinition = (typeof PERMISSION_DEFINITIONS)[number];
export type PermissionName = PermissionDefinition['name'];

export const PERMISSION_NAMES: PermissionName[] = PERMISSION_DEFINITIONS.map(
  ({ name }) => name
) as PermissionName[];
