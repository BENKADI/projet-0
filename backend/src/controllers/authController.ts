import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/authUtils';
import { UserInput } from '../types';
import { AuthUser } from '../types/auth.types';
import passport from '../config/passport';

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
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: UserInput = req.body;
    
    console.log(`Tentative de connexion pour: ${email}`);

    // Validate input
    if (!email || !password) {
      console.log(`Connexion échouée: email ou mot de passe manquant`);
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { permissions: true } // Inclure les permissions pour l'authentification
    });

    if (!user) {
      console.log(`Connexion échouée: utilisateur non trouvé pour ${email}`);
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }
    
    console.log(`Utilisateur trouvé: ${user.email}, rôle: ${user.role}`);

    // Vérifier si l'utilisateur utilise Google OAuth
    if (user.provider === 'google' && !user.password) {
      console.log(`Connexion échouée: utilisateur ${email} doit utiliser Google OAuth`);
      res.status(401).json({ message: 'Please use Google Sign-In for this account.' });
      return;
    }

    // Verify password
    if (!user.password) {
      console.log(`Connexion échouée: mot de passe manquant pour ${email}`);
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    console.log(`Vérification du mot de passe pour ${email}: ${isPasswordValid ? 'Succès' : 'Échec'}`);

    if (!isPasswordValid) {
      console.log(`Connexion échouée: mot de passe invalide pour ${email}`);
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data and token
    console.log(`Connexion réussie pour: ${email} avec le rôle: ${user.role}`);
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
    console.error('Error during login:', error);
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
      console.error('Google OAuth error:', err);
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
      console.error('Error generating token:', error);
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
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
