import express from 'express';
import userController from '../controllers/userController';
import { authenticate, hasPermission } from '../middleware/auth.middleware';
import avatarRoutes from './avatarRoutes';

const router = express.Router();

// Routes protégées - nécessitent une authentification
router.use(authenticate);

// Routes avatar (accessible à tous les utilisateurs authentifiés)
router.use('/', avatarRoutes);

// Profil de l'utilisateur connecté
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);

// Routes basées sur les permissions
router.get('/', hasPermission('read:users'), userController.getAllUsers);
router.post('/', hasPermission('create:users'), userController.createUser);
router.get('/:id', hasPermission('read:users'), userController.getUserById);
router.put('/:id', hasPermission('update:users'), userController.updateUser);
router.delete('/:id', hasPermission('delete:users'), userController.deleteUser);

export default router;
