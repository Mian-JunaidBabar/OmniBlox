import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.OBSERVER;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  status: 'active' | 'inactive';
}

export class UserListResponseDto {
  users: UserResponseDto[];
  total: number;
  pages: number;
}

export class GenerateInviteDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.OBSERVER;

  @IsString()
  @IsOptional()
  name?: string;
}

export class InviteLinkResponseDto {
  token: string;
  link: string;
  expiresAt: Date;
}

export class UserStatsDto {
  totalUsers: number;
  adminCount: number;
  managerCount: number;
  staffCount: number;
  activeUsers: number;
  inactiveUsers: number;
}
