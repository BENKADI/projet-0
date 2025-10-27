import { IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateUserDTO {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ example: 'user', enum: UserRole, description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'local', description: 'Authentication provider' })
  @IsOptional()
  @IsString()
  provider?: string = 'local';
}

export class UpdateUserDTO {
  @ApiPropertyOptional({ example: 'john@example.com', description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'admin', enum: UserRole, description: 'User role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDTO {
  @ApiProperty({ example: 'oldpassword123', description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', description: 'New password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: 'newpassword123', description: 'Confirm new password' })
  @IsString()
  confirmPassword: string;
}

export class UserQueryDTO {
  @ApiPropertyOptional({ example: 'john', description: 'Search term for email, first name, or last name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'user', enum: UserRole, description: 'Filter by role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: '1', description: 'Page number' })
  @IsOptional()
  @IsString()
  page?: string = '1';

  @ApiPropertyOptional({ example: '10', description: 'Items per page' })
  @IsOptional()
  @IsString()
  limit?: string = '10';

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort order' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
