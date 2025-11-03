import express from 'express';
import permissionController from '../controllers/permission.controller';
import { authenticate, hasPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Routes pour la gestion des permissions des utilisateurs (doivent être avant les routes avec :id)
router.get('/user/:userId', authenticate, hasPermission('read:users'), permissionController.getUserPermissions);
router.post('/user/:userId/:permissionId', authenticate, hasPermission('manage:permissions'), permissionController.assignPermissionToUser);
router.delete('/user/:userId/:permissionId', authenticate, hasPermission('manage:permissions'), permissionController.removePermissionFromUser);

// Routes pour la gestion des permissions (basées sur les permissions de rôle)
router.get('/', authenticate, hasPermission('read:permissions'), permissionController.getAllPermissions);
router.post('/', authenticate, hasPermission('create:permissions'), permissionController.createPermission);
router.get('/:id', authenticate, hasPermission('read:permissions'), permissionController.getPermissionById);
router.put('/:id', authenticate, hasPermission('update:permissions'), permissionController.updatePermission);
router.delete('/:id', authenticate, hasPermission('delete:permissions'), permissionController.deletePermission);

export default router;
