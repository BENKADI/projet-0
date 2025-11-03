import express from 'express';
import roleController from '../controllers/role.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Routes pour la gestion des rôles des utilisateurs (doivent être avant les routes avec :id)
router.get('/user/:userId', authenticate, roleController.getUserRoles);
router.post('/user/:userId', authenticate, isAdmin, roleController.assignRoleToUser);
router.delete('/user/:userId/:roleId', authenticate, isAdmin, roleController.removeRoleFromUser);

// Routes pour la gestion des rôles (accessibles uniquement par les administrateurs)
router.get('/', authenticate, roleController.getAllRoles);
router.post('/', authenticate, isAdmin, roleController.createRole);
router.get('/:id', authenticate, roleController.getRoleById);
router.put('/:id', authenticate, isAdmin, roleController.updateRole);
router.delete('/:id', authenticate, isAdmin, roleController.deleteRole);

export default router;
