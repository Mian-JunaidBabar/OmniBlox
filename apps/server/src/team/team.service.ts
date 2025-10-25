import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserResponseDto,
  UserListResponseDto,
  UserStatsDto,
} from './dto/team.dto';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  // GOLDEN RULE: All methods require companyId and filter by it

  async createUser(
    dto: CreateUserDto,
    companyId: string,
    currentUserRole: UserRole,
  ): Promise<UserResponseDto> {
    // Only OWNER and ADMIN can create users
    if (!['OWNER', 'ADMIN'].includes(currentUserRole)) {
      throw new ForbiddenException('Insufficient permissions to create users');
    }

    // Check if email already exists globally
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Only OWNER can create ADMIN users
    if (
      dto.role === UserRole.ADMIN &&
      currentUserRole !== ('OWNER' as UserRole)
    ) {
      throw new ForbiddenException('Only company owner can create admin users');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        companyId,
      },
    });

    return this.mapToUserResponse(user);
  }

  async findAll(companyId: string): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(this.mapToUserResponse);
  }

  async findAllPaginated(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: UserRole,
  ): Promise<UserListResponseDto> {
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(this.mapToUserResponse),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, companyId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToUserResponse(user);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    companyId: string,
    currentUserRole: UserRole,
    currentUserId: string,
  ): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Users can only update themselves unless they're OWNER/ADMIN
    if (id !== currentUserId && !['OWNER', 'ADMIN'].includes(currentUserRole)) {
      throw new ForbiddenException('Insufficient permissions to update user');
    }

    // Only OWNER can update role to ADMIN
    if (
      dto.role === UserRole.ADMIN &&
      currentUserRole !== ('OWNER' as UserRole)
    ) {
      throw new ForbiddenException('Only company owner can assign admin role');
    }

    // Only OWNER and ADMIN can change roles (except their own)
    if (
      dto.role &&
      id !== currentUserId &&
      !['OWNER', 'ADMIN'].includes(currentUserRole)
    ) {
      throw new ForbiddenException(
        'Insufficient permissions to change user role',
      );
    }

    // Check for email uniqueness if email is being updated
    if (dto.email && dto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return this.mapToUserResponse(updatedUser);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    companyId: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async removeUser(
    id: string,
    companyId: string,
    currentUserRole: UserRole,
    currentUserId: string,
  ): Promise<{ message: string }> {
    // Only OWNER and ADMIN can remove users
    if (!['OWNER', 'ADMIN'].includes(currentUserRole)) {
      throw new ForbiddenException('Insufficient permissions to remove users');
    }

    // Users cannot remove themselves
    if (id === currentUserId) {
      throw new BadRequestException('Cannot remove your own account');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only OWNER can remove ADMIN users
    if (
      user.role === UserRole.ADMIN &&
      currentUserRole !== ('OWNER' as UserRole)
    ) {
      throw new ForbiddenException('Only company owner can remove admin users');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User removed successfully' };
  }

  async getStats(companyId: string): Promise<UserStatsDto> {
    const users = await this.prisma.user.findMany({
      where: { companyId },
      select: { role: true, createdAt: true },
    });

    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
    const managerCount = users.filter(
      (u) => u.role === UserRole.MANAGER,
    ).length;
    const staffCount = users.filter((u) => u.role === UserRole.STAFF).length;

    return {
      totalUsers,
      adminCount,
      managerCount,
      staffCount,
      activeUsers: totalUsers, // For now, assume all users are active
      inactiveUsers: 0,
    };
  }

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: undefined, // TODO: Implement last login tracking
      status: 'active', // TODO: Implement user status
    };
  }
}
