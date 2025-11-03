import express from 'express';
import roleController from '../controllers/role.controller';
import { authenticate, hasPermission } from '../middleware/auth.middleware';

const router = express.Router();

// Routes pour la gestion des rôles des utilisateurs (doivent être avant les routes avec :id)
router.get('/user/:userId', authenticate, hasPermission('read:users'), roleController.getUserRoles);
router.post('/user/:userId', authenticate, hasPermission('manage:roles'), roleController.assignRoleToUser);
router.delete('/user/:userId/:roleId', authenticate, hasPermission('manage:roles'), roleController.removeRoleFromUser);

// Routes pour la gestion des rôles (basées sur les permissions de rôle)
router.get('/', authenticate, hasPermission('read:roles'), roleController.getAllRoles);
router.post('/', authenticate, hasPermission('create:roles'), roleController.createRole);
router.get('/:id', authenticate, hasPermission('read:roles'), roleController.getRoleById);
router.put('/:id', authenticate, hasPermission('update:roles'), roleController.updateRole);
router.delete('/:id', authenticate, hasPermission('delete:roles'), roleController.deleteRole);

export default router;
