import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from 'better-auth/crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(signupDto: SignupDto) {
    const {
      email,
      password,
      name,
      companyName,
      workspaceUrl,
      industry,
      otherIndustry,
      country,
    } = signupDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if workspace URL is already taken
    const existingCompany = await this.prisma.company.findUnique({
      where: { workspaceUrl },
    });

    if (existingCompany) {
      throw new ConflictException('Workspace URL is already taken');
    }

    // Hash password using Better Auth's hashing (compatible with their login)
    const hashedPassword = await hashPassword(password);

    // Use transaction to create company and owner user
    const result = await this.prisma.$transaction(async (tx) => {
      // Create company first (without owner initially)
      const company = await tx.company.create({
        data: {
          name: companyName,
          workspaceUrl,
          industry,
          otherIndustry: industry === 'other' ? otherIndustry : null,
          country,
        },
      });

      // Create owner user with Better Auth fields
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'OWNER',
          companyId: company.id,
          emailVerified: false, // Better Auth field
        },
      });

      // Create Better Auth account entry
      // Better Auth's email/password uses 'credential' as providerId
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id, // Use user.id as accountId for credential provider
          providerId: 'credential', // Better Auth uses 'credential' for email/password
          password: hashedPassword,
        },
      });

      // Update company with real owner ID
      const updatedCompany = await tx.company.update({
        where: { id: company.id },
        data: { ownerId: user.id },
      });

      return { user, company: updatedCompany };
    });

    // Return user and company for Better Auth to create session
    return {
      userId: result.user.id,
      role: result.user.role,
      companyId: result.user.companyId,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        companyId: result.user.companyId,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        workspaceUrl: result.company.workspaceUrl,
        industry: result.company.industry,
        country: result.company.country,
      },
    };
  }

  async validateCredentials(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Fetch user by email with company information
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password using Better Auth's verifyPassword
    const isPasswordValid = await verifyPassword({
      password,
      hash: user.password,
    });

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user data for Better Auth session creation
    return {
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        workspaceUrl: user.company.workspaceUrl,
        industry: user.company.industry,
        country: user.company.country,
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      company: {
        id: user.company.id,
        name: user.company.name,
        workspaceUrl: user.company.workspaceUrl,
        industry: user.company.industry,
        country: user.company.country,
      },
    };
  }

  async updateUserProfile(
    userId: string,
    updateData: { name?: string; email?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { company: true },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      company: {
        id: user.company.id,
        name: user.company.name,
        workspaceUrl: user.company.workspaceUrl,
        industry: user.company.industry,
        country: user.company.country,
      },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await verifyPassword({
      password: currentPassword,
      hash: user.password,
    });

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Update Better Auth account password
    await this.prisma.account.updateMany({
      where: {
        userId: userId,
        providerId: 'credential', // Better Auth uses 'credential' for email/password
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return { message: 'Password updated successfully' };
  }
}
