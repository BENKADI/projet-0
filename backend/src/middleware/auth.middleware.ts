import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';
import { AuthUser, JwtPayload } from '../types/auth.types';
import logger from '../config/logger';

const prisma = new PrismaClient();

// Étendre l'interface User de Passport pour inclure nos champs personnalisés
declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// Middleware d'authentification
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Récupérer le token d'autorisation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
      return;
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
      return;
    }
    
    // Vérifier le token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Configuration serveur incorrecte.' });
      return;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Récupérer l'utilisateur avec ses permissions
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { permissions: true }
    });

    if (!dbUser) {
      res.status(401).json({ message: 'Utilisateur non trouvé.' });
      return;
    }
    
    // Transformer en AuthUser
    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      permissions: dbUser.permissions
    };

    // Ajouter l'utilisateur à l'objet request pour un accès ultérieur
    req.user = user;
    next();
    return;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Erreur d\'authentification', { error: errorMessage, stack: errorStack });
    res.status(401).json({ message: 'Token invalide ou expiré.' });
    return;
  }
};

// Vérifier si l'utilisateur est un administrateur
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
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

// Vérifier si l'utilisateur a une permission spécifique
export const hasPermission = (permissionName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si l'utilisateur est admin, il a accès à tout
    if (req.user?.role === 'admin') {
      next();
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return;
    }

    const user = req.user as AuthUser;
    const hasRequiredPermission = user.permissions?.some(p => p.name === permissionName);

    if (!hasRequiredPermission) {
      res.status(403).json({ message: `Accès refusé. Permission '${permissionName}' requise.` });
      return;
    }

    next();
  };
};

// Vérifier si l'utilisateur a toutes les permissions spécifiées
export const hasPermissions = (permissionNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si l'utilisateur est admin, il a accès à tout
    if (req.user?.role === 'admin') {
      next();
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return;
    }

    const user = req.user as AuthUser;
    const userPermissions = user.permissions?.map(p => p.name) || [];
    const hasAllRequiredPermissions = permissionNames.every(pName => 
      userPermissions.includes(pName)
    );

    if (!hasAllRequiredPermissions) {
      res.status(403).json({ 
        message: `Accès refusé. Toutes les permissions suivantes sont requises: ${permissionNames.join(', ')}.`
      });
      return;
    }

    next();
  };
};
