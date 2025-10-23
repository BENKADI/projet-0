import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import passport from './config/passport';
import { authRoutes, permissionRoutes, userRoutes, settingsRoutes, backupRoutes } from './routes';
import healthRoutes from './routes/health.routes';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { limiter, helmetConfig, authLimiter } from './middleware/security.middleware';
import logger from './config/logger';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialisation de Passport
app.use(passport.initialize());

// Request logging
app.use(requestLogger);

// Servir les fichiers statiques (avatars et logos) avec CORS
app.use('/uploads', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3001');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cache-Control', 'public, max-age=31536000'); // 1 an de cache
  next();
}, express.static(path.join(__dirname, '../uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Welcome route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Projet-0 API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

// Health check routes
app.use('/', healthRoutes);

// API Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/permissions', permissionRoutes);
app.use('/users', userRoutes);
app.use('/settings', settingsRoutes);
app.use('/backup', backupRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});
