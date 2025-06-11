import express from 'express';
import permissionController from '../controllers/permission.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { hasPermission } from '../middleware/permission.middleware';

const router = express.Router();

// Routes pour la gestion des permissions des utilisateurs (doivent être avant les routes avec :id)
router.get('/user/:userId', authenticate, hasPermission('read:users'), permissionController.getUserPermissions);
router.post('/user/:userId/:permissionId', authenticate, isAdmin, permissionController.assignPermissionToUser);
router.delete('/user/:userId/:permissionId', authenticate, isAdmin, permissionController.removePermissionFromUser);

// Routes pour la gestion des permissions (accessibles uniquement par les administrateurs)
router.get('/', authenticate, isAdmin, permissionController.getAllPermissions);
router.post('/', authenticate, isAdmin, permissionController.createPermission);
router.get('/:id', authenticate, isAdmin, permissionController.getPermissionById);
router.put('/:id', authenticate, isAdmin, permissionController.updatePermission);
router.delete('/:id', authenticate, isAdmin, permissionController.deletePermission);

export default router;
