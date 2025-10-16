import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errorMessages,
        });
        return;
      }
      next(error);
      return;
    }
  };
};

// Common validation schemas
export const schemas = {
  // User registration
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
    }),
  }),

  // User login
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  // User update
  updateUser: z.object({
    body: z.object({
      email: z.string().email().optional(),
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
      role: z.enum(['user', 'admin']).optional(),
    }),
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Invalid user ID'),
    }),
  }),

  // Permission creation
  createPermission: z.object({
    body: z.object({
      name: z.string().min(3, 'Permission name must be at least 3 characters'),
      description: z.string().optional(),
    }),
  }),

  // ID param validation
  idParam: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Invalid ID'),
    }),
  }),
};
