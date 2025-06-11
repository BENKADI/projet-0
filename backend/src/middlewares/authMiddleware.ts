import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/authUtils';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// Authentication middleware to protect routes
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Find the user by id
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
