import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../types/auth.types';

/**
 * Middleware pour vérifier si l'utilisateur possède une permission spécifique
 * @param permissionName - Nom de la permission requise (ex: 'read:users')
 */
export const hasPermission = (permissionName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return;
    }

    // Vérifier si l'utilisateur est admin (accès total)
    const userAdmin = req.user as AuthUser;
    if (userAdmin.role === 'admin') {
      next();
      return;
    }

    // Vérifier si l'utilisateur possède la permission requise
    const user = req.user as AuthUser;
    const hasRequiredPermission = user.permissions.some(
      (permission) => permission.name === permissionName
    );

    if (!hasRequiredPermission) {
      res.status(403).json({ 
        message: `Accès refusé. Permission '${permissionName}' requise.` 
      });
      return;
    }

    next();
  };
};

/**
 * Middleware pour vérifier si l'utilisateur possède plusieurs permissions
 * @param permissionNames - Liste des permissions requises
 * @param requireAll - Si true, toutes les permissions sont requises; si false, au moins une permission est requise
 */
export const hasPermissions = (permissionNames: string[], requireAll = true) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return;
    }

    // Vérifier si l'utilisateur est admin (accès total)
    const userAdmin = req.user as AuthUser;
    if (userAdmin.role === 'admin') {
      next();
      return;
    }

    // Récupérer les noms des permissions de l'utilisateur
    const user = req.user as AuthUser;
    const userPermissionNames = user.permissions.map((p) => p.name);

    if (requireAll) {
      // L'utilisateur doit avoir toutes les permissions
      const hasAllPermissions = permissionNames.every(permission => 
        userPermissionNames.includes(permission)
      );

      if (!hasAllPermissions) {
        res.status(403).json({ 
          message: `Accès refusé. Toutes les permissions suivantes sont requises: ${permissionNames.join(', ')}` 
        });
        return;
      }
    } else {
      // L'utilisateur doit avoir au moins une permission
      const hasAnyPermission = permissionNames.some(permission => 
        userPermissionNames.includes(permission)
      );

      if (!hasAnyPermission) {
        res.status(403).json({ 
          message: `Accès refusé. Au moins une des permissions suivantes est requise: ${permissionNames.join(', ')}` 
        });
        return;
      }
    }

    next();
  };
};
