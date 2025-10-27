import { SetMetadata } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../infrastructure/cache/CacheService';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PUBLIC_KEY = 'public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

export const SKIP_AUTH_KEY = 'skipAuth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);

export interface AuthOptions {
  permissions?: string[];
  roles?: string[];
  public?: boolean;
  skipAuth?: boolean;
}

export function Auth(options: AuthOptions = {}) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (options.permissions && options.permissions.length > 0) {
      Permissions(...options.permissions)(target, propertyKey, descriptor);
    }
    
    if (options.roles && options.roles.length > 0) {
      Roles(...options.roles)(target, propertyKey, descriptor);
    }
    
    if (options.public) {
      Public()(target, propertyKey, descriptor);
    }
    
    if (options.skipAuth) {
      SkipAuth()(target, propertyKey, descriptor);
    }
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    iat?: number;
    exp?: number;
  };
}

export class AuthDecorator {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaClient,
    private cacheService: CacheService
  ) {}

  async extractUserFromToken(token: string): Promise<AuthenticatedRequest['user'] | null> {
    try {
      // Verify JWT token
      const payload = this.jwtService.verify(token);
      
      // Get user from cache or database
      const cacheKey = `user:${payload.sub}`;
      let user = await this.cacheService.get(cacheKey);
      
      if (!user) {
        user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: {
            id: true,
            email: true,
            role: true,
            permissions: {
              select: { name: true }
            }
          }
        });
        
        if (user) {
          // Cache user for 1 hour
          await this.cacheService.set(cacheKey, user, 3600);
        }
      }
      
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions.map(p => p.name),
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      return null;
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const cacheKey = `user_permissions:${userId}`;
    let permissions = await this.cacheService.get<string[]>(cacheKey);
    
    if (!permissions) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: true
        }
      });
      
      if (!user) {
        return false;
      }
      
      // Get role-based permissions
      const rolePermissions = this.getRolePermissions(user.role);
      
      // Combine role and user permissions
      permissions = [
        ...rolePermissions,
        ...user.permissions.map(p => p.name)
      ];
      
      // Cache permissions for 30 minutes
      await this.cacheService.set(cacheKey, permissions, 1800);
    }
    
    return permissions.includes(permission);
  }

  private getRolePermissions(role: string): string[] {
    const rolePermissionsMap = {
      user: [
        'read:profile',
        'update:profile',
        'read:settings',
        'update:settings',
      ],
      admin: [
        'create:users',
        'read:users',
        'update:users',
        'delete:users',
        'create:permissions',
        'read:permissions',
        'update:permissions',
        'delete:permissions',
        'read:settings',
        'update:settings',
        'read:analytics',
        'export:users',
        'export:permissions',
      ],
    };
    
    return rolePermissionsMap[role] || [];
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const cacheKey = `user_role:${userId}`;
    let userRole = await this.cacheService.get<string>(cacheKey);
    
    if (!userRole) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      if (!user) {
        return false;
      }
      
      userRole = user.role;
      await this.cacheService.set(cacheKey, userRole, 3600);
    }
    
    return userRole === role;
  }

  async isOwner(userId: string, resourceUserId: string): Promise<boolean> {
    return userId === resourceUserId;
  }

  async canAccessResource(
    userId: string,
    resource: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    // Check if user has the specific permission
    const permission = `${action}:${resource}`;
    const hasPermission = await this.hasPermission(userId, permission);
    
    if (hasPermission) {
      return true;
    }
    
    // Check if user is the owner of the resource
    if (resource === 'user' && resourceId === userId) {
      const ownerPermissions = ['read:user', 'update:user'];
      return ownerPermissions.includes(permission);
    }
    
    return false;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.invalidate(`user:${userId}`);
    await this.cacheService.invalidate(`user_permissions:${userId}`);
    await this.cacheService.invalidate(`user_role:${userId}`);
  }

  generateToken(user: { id: string; email: string; role: string }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(user: { id: string }): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };
    
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }

  async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'refresh') {
        return null;
      }
      
      return payload.sub;
    } catch (error) {
      return null;
    }
  }
}

// Rate limiting decorator
export const RateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    // Implementation would integrate with rate limiting middleware
    SetMetadata('rateLimit', options)(target, propertyKey, descriptor);
  };
};

// Cache decorator
export const Cache = (options: {
  ttl: number;
  key?: string;
  condition?: (...args: any[]) => boolean;
}) => {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Check condition if provided
      if (options.condition && !options.condition(...args)) {
        return originalMethod.apply(this, args);
      }
      
      // Generate cache key
      const cacheKey = options.key || `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await this.cacheService?.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await this.cacheService?.set(cacheKey, result, options.ttl);
      
      return result;
    };
  };
};

// Audit decorator
export const Audit = (action: string, resource: string) => {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const req = args.find(arg => arg && typeof req === 'object' && req.user);
      const userId = req?.user?.id;
      
      try {
        const result = await originalMethod.apply(this, args);
        
        // Log successful action
        if (userId && this.auditService) {
          await this.auditService.log({
            userId,
            action,
            resource,
            resourceId: args[0]?.id || args[0],
            success: true,
          });
        }
        
        return result;
      } catch (error) {
        // Log failed action
        if (userId && this.auditService) {
          await this.auditService.log({
            userId,
            action,
            resource,
            resourceId: args[0]?.id || args[0],
            success: false,
            error: error.message,
          });
        }
        
        throw error;
      }
    };
  };
};
