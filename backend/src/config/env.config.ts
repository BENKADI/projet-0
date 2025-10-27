import { z } from 'zod';
import dotenv from 'dotenv';
import logger from './logger';

// Charger les variables d'environnement
dotenv.config();

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  
  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // CORS
  CORS_ORIGIN: z.string().url().default('http://localhost:3001'),
  
  // Google OAuth (optionnel)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Security
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number()).default('900000'), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number()).default('100'),
});

// Type inféré du schéma
export type EnvConfig = z.infer<typeof envSchema>;

// Validation et export
let env: EnvConfig;

try {
  env = envSchema.parse(process.env);
  logger.info('✅ Environment variables validated successfully');
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('❌ Invalid environment variables', { errors: error.errors });
    process.exit(1);
  }
  throw error;
}

export default env;
