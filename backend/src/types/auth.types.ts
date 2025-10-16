import { Permission } from '../../generated/prisma';

// Type pour l'utilisateur authentifié dans la requête (version simplifiée sans info sensibles)
export interface AuthUser {
  id: number;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
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
