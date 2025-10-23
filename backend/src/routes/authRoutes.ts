import express from 'express';
import { register, login, googleAuth, googleCallback, googleAuthFailure, getCurrentUser, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Auth routes traditionnelles
router.post('/register', register);
router.post('/login', login);
router.put('/change-password', authenticate, changePassword);

// Routes Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/failure', googleAuthFailure);

// Get current user info (protected)
router.get('/me', authenticate, getCurrentUser);

export default router;
