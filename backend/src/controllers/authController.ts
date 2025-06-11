import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { hashPassword, comparePasswords, generateToken } from '../utils/authUtils';
import { UserInput } from '../types';

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

    // Verify password
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
