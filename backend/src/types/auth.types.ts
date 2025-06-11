import { User, Permission } from '../../generated/prisma';

// Type pour l'utilisateur authentifié dans la requête
export interface AuthUser extends User {
  permissions: Permission[];
}

// Type pour les données JWT
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
