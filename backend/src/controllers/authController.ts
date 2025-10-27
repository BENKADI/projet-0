import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/authUtils';
import { UserInput } from '../types';
import { AuthUser } from '../types/auth.types';
import passport from '../config/passport';
import logger from '../config/logger';

const prisma = new PrismaClient();

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: UserInput = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user.id,
        email: user.email
      },
      token
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Error during registration', { error: errorMessage, stack: errorStack });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Change password for authenticated user
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as AuthUser | undefined;
    if (!user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return;
    }

    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      res.status(404).json({ message: 'Utilisateur non trouvé.' });
      return;
    }

    // Accounts created via Google OAuth cannot change password here
    if (dbUser.provider === 'google' || !dbUser.password) {
      res.status(400).json({ message: 'Ce compte utilise Google OAuth. Le mot de passe ne peut pas être modifié.' });
      return;
    }

    const isCurrentValid = await comparePasswords(currentPassword, dbUser.password);
    if (!isCurrentValid) {
      res.status(401).json({ message: 'Mot de passe actuel incorrect.' });
      return;
    }

    const newHashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: newHashed } });

    res.status(200).json({ message: 'Mot de passe modifié avec succès.' });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Error changing password', { error: errorMessage, stack: errorStack });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: UserInput = req.body;
    
    logger.info('Tentative de connexion', { email });

    // Validate input
    if (!email || !password) {
      logger.warn('Connexion échouée: email ou mot de passe manquant', { email });
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { permissions: true } // Inclure les permissions pour l'authentification
    });

    if (!user) {
      logger.warn('Connexion échouée: utilisateur non trouvé', { email });
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }
    
    logger.info('Utilisateur trouvé', { email: user.email, role: user.role });

    // Vérifier si l'utilisateur utilise Google OAuth
    if (user.provider === 'google' && !user.password) {
      logger.warn('Connexion échouée: utilisateur doit utiliser Google OAuth', { email });
      res.status(401).json({ message: 'Please use Google Sign-In for this account.' });
      return;
    }

    // Verify password
    if (!user.password) {
      logger.warn('Connexion échouée: mot de passe manquant', { email });
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    logger.info('Vérification du mot de passe', { email, success: isPasswordValid });

    if (!isPasswordValid) {
      logger.warn('Connexion échouée: mot de passe invalide', { email });
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data and token
    logger.info('Connexion réussie', { email, role: user.role });
    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
    return;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Error during login', { error: errorMessage, stack: errorStack });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Google OAuth - Initier l'authentification
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Google OAuth - Callback après authentification
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err || !user) {
      logger.error('Google OAuth error', { error: err.message, stack: err.stack });
      // Rediriger vers le frontend avec une erreur
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    try {
      // Générer le token JWT
      const token = generateToken(user.id);

      // Rediriger vers le frontend avec le token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Error generating token', { error: errorMessage, stack: errorStack });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/login?error=token_generation_failed`);
    }
  })(req, res, next);
};

// Google OAuth - Gestion de l'échec d'authentification
export const googleAuthFailure = (_req: Request, res: Response): void => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  res.redirect(`${frontendUrl}/login?error=authentication_failed`);
};

// Get current user information
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return;
    }

    const user = req.user as AuthUser;

    // Retourner les infos de l'utilisateur (déjà chargées par le middleware authenticate)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Error fetching current user', { error: errorMessage, stack: errorStack });
    res.status(500).json({ message: 'Internal server error.' });
  }
};
