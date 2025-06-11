export interface UserInput {
  email: string;
  password: string;
}

// Interface fusionnée avec AuthUser dans auth.types.ts
// Gardée pour rétrocompatibilité avec du code existant
export interface UserPayload {
  id: number;
  email: string;
  role?: string;
}

// Remplacée par la version dans auth.types.ts
export interface JwtPayload {
  userId: number;
  email?: string;
  role?: string;
}

// La déclaration globale est maintenant dans auth.types.ts
// Cette déclaration est gardée vide pour éviter les erreurs avec du code existant
// qui pourrait l'utiliser
declare global {
  namespace Express {
    // Interface vide pour éviter les conflits
  }
}
