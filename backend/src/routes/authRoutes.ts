import express from 'express';
import { register, login, googleAuth, googleCallback, googleAuthFailure } from '../controllers/authController';

const router = express.Router();

// Auth routes traditionnelles
router.post('/register', register);
router.post('/login', login);

// Routes Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/failure', googleAuthFailure);

export default router;
