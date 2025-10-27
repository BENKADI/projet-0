import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../../shared/middleware/AuthMiddleware';
import { requirePermissions } from '../../shared/middleware/PermissionMiddleware';
import { validateRequest } from '../../shared/middleware/ValidationMiddleware';
import { rateLimitMiddleware } from '../../shared/middleware/RateLimitMiddleware';
import { auditMiddleware } from '../../shared/middleware/AuditMiddleware';

const router = Router();
const userController = new UserController();

// Apply authentication to all routes
router.use(authMiddleware);

// Public routes (authenticated users only)
router.get('/me/permissions', userController.getUserPermissions.bind(userController));
router.get('/me/permissions/:permission', userController.checkPermission.bind(userController));
router.post('/me/change-password', userController.changePassword.bind(userController));

// Admin-only routes
router.use(requirePermissions(['read:users']));

// GET /api/v2/users - Get all users with pagination and filters
router.get('/', 
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  userController.getUsers.bind(userController)
);

// GET /api/v2/users/search - Search users
router.get('/search',
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  userController.searchUsers.bind(userController)
);

// GET /api/v2/users/metrics - Get user metrics
router.get('/metrics',
  requirePermissions(['read:analytics']),
  userController.getUserMetrics.bind(userController)
);

// GET /api/v2/users/export/:format - Export users data
router.get('/export/:format',
  requirePermissions(['export:users']),
  rateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 requests per hour
  userController.exportUsers.bind(userController)
);

// POST /api/v2/users - Create new user
router.post('/',
  requirePermissions(['create:users']),
  validateRequest,
  auditMiddleware('create', 'user'),
  userController.createUser.bind(userController)
);

// PUT /api/v2/users/bulk - Bulk update users
router.put('/bulk',
  requirePermissions(['update:users']),
  validateRequest,
  auditMiddleware('bulk_update', 'user'),
  userController.bulkUpdateUsers.bind(userController)
);

// GET /api/v2/users/:id - Get user by ID
router.get('/:id',
  userController.getUserById.bind(userController)
);

// PUT /api/v2/users/:id - Update user by ID
router.put('/:id',
  requirePermissions(['update:users']),
  validateRequest,
  auditMiddleware('update', 'user'),
  userController.updateUser.bind(userController)
);

// DELETE /api/v2/users/:id - Delete user by ID
router.delete('/:id',
  requirePermissions(['delete:users']),
  auditMiddleware('delete', 'user'),
  userController.deleteUser.bind(userController)
);

export default router;
