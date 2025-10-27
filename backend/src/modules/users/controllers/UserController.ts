import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDTO, UpdateUserDTO, ChangePasswordDTO, UserQueryDTO } from '../dto/UserDTO';
import { ApiResponse } from '../../shared/types/ApiResponse';
import { AuthenticatedRequest } from '../../shared/types/AuthenticatedRequest';
import { validateDTO } from '../../shared/utils/ValidationUtils';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerResponse({ status: 201, description: 'User created successfully' })
  @SwaggerResponse({ status: 400, description: 'Bad request' })
  @SwaggerResponse({ status: 409, description: 'User already exists' })
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createUserDTO = await validateDTO(CreateUserDTO, req.body);
      const user = await this.userService.createUser(createUserDTO);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @SwaggerResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = await validateDTO(UserQueryDTO, req.query);
      const result = await this.userService.getUsers(query);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Users retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @SwaggerResponse({ status: 200, description: 'User retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @SwaggerResponse({ status: 200, description: 'User updated successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = await validateDTO(UpdateUserDTO, req.body);
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
        };
        return res.status(401).json(response);
      }

      const user = await this.userService.updateUser(id, updateData, updatedBy);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @SwaggerResponse({ status: 200, description: 'User deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
        };
        return res.status(401).json(response);
      }

      await this.userService.deleteUser(id, deletedBy);

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Change user password' })
  @SwaggerResponse({ status: 200, description: 'Password changed successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid password data' })
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
        };
        return res.status(401).json(response);
      }

      const passwordData = await validateDTO(ChangePasswordDTO, req.body);
      await this.userService.changePassword(userId, passwordData);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Get user metrics' })
  @SwaggerResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getUserMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad request',
          message: 'Start and end dates are required',
        };
        return res.status(400).json(response);
      }

      const period = {
        start: new Date(start as string),
        end: new Date(end as string),
      };

      const metrics = await this.userService.getUserMetrics(period);

      const response: ApiResponse = {
        success: true,
        data: metrics,
        message: 'Metrics retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Search users' })
  @SwaggerResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query, limit } = req.query;

      if (!query) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad request',
          message: 'Search query is required',
        };
        return res.status(400).json(response);
      }

      const users = await this.userService.searchUsers(
        query as string,
        limit ? parseInt(limit as string) : 10
      );

      const response: ApiResponse = {
        success: true,
        data: users,
        message: 'Search results retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Get current user permissions' })
  @SwaggerResponse({ status: 200, description: 'Permissions retrieved successfully' })
  async getUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
        };
        return res.status(401).json(response);
      }

      const permissions = await this.userService.getUserPermissions(userId);

      const response: ApiResponse = {
        success: true,
        data: permissions,
        message: 'Permissions retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Check if user has specific permission' })
  @SwaggerResponse({ status: 200, description: 'Permission check completed' })
  async checkPermission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { permission } = req.params;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
        };
        return res.status(401).json(response);
      }

      if (!permission) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad request',
          message: 'Permission parameter is required',
        };
        return res.status(400).json(response);
      }

      const hasPermission = await this.userService.hasPermission(userId, permission);

      const response: ApiResponse = {
        success: true,
        data: { hasPermission },
        message: 'Permission check completed',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Export users data' })
  @SwaggerResponse({ status: 200, description: 'Export completed successfully' })
  async exportUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format } = req.params;
      const query = req.query;

      if (!['csv', 'excel', 'json'].includes(format)) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad request',
          message: 'Invalid export format. Use csv, excel, or json',
        };
        return res.status(400).json(response);
      }

      const filters = await validateDTO(UserQueryDTO, query);
      const buffer = await this.userService.exportUsers(format as any, filters);

      const contentType = {
        csv: 'text/csv',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        json: 'application/json',
      }[format];

      const filename = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  @ApiOperation({ summary: 'Bulk update users' })
  @SwaggerResponse({ status: 200, description: 'Users updated successfully' })
  async bulkUpdateUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds } = req.body;
      const updateData = await validateDTO(UpdateUserDTO, req.body);
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized',
          message: 'User authentication required',
        };
        return res.status(401).json(response);
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad request',
          message: 'User IDs array is required',
        };
        return res.status(400).json(response);
      }

      const updatedUsers = await this.userService.bulkUpdateUsers(userIds, updateData, updatedBy);

      const response: ApiResponse = {
        success: true,
        data: {
          updatedCount: updatedUsers.length,
          updatedUsers,
        },
        message: 'Users updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
