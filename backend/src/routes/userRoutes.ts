import express from 'express';
import userController from '../controllers/userController';
import { authenticate, isAdmin, hasPermission } from '../middleware/auth.middleware';
import avatarRoutes from './avatarRoutes';

const router = express.Router();

// Routes protégées - nécessitent une authentification
router.use(authenticate);

// Routes avatar (accessible à tous les utilisateurs authentifiés)
router.use('/', avatarRoutes);

// Routes accessibles aux administrateurs uniquement
router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdmin, userController.createUser);

// Routes accessibles aux administrateurs ou aux utilisateurs avec la permission spécifique
router.get('/:id', hasPermission('read:users'), userController.getUserById);
router.put('/:id', isAdmin, userController.updateUser);
router.delete('/:id', isAdmin, userController.deleteUser);

export default router;
