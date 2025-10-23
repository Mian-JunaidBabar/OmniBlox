import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
    const existingWorkspace = await this.prisma.user.findFirst({
      where: { workspaceUrl } as any,
    } as any);

    if (existingWorkspace) {
      throw new ConflictException('Workspace URL is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with ADMIN role (first user for their workspace)
    const created = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN' as any,
        companyName,
        workspaceUrl,
        industry,
        otherIndustry: industry === 'other' ? otherIndustry : null,
        country,
      } as any,
    });

    // Fetch the created user record (cast to any to avoid generated type mismatches)
    const user = (await this.prisma.user.findUnique({
      where: { id: created.id },
    })) as any;

    if (!user) {
      throw new ConflictException('Failed to create user');
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      workspaceUrl: user.workspaceUrl,
    } as any;

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        workspaceUrl: user.workspaceUrl,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Fetch user by email and include password (cast to any)
    const user = (await this.prisma.user.findUnique({
      where: { email },
    })) as any;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      workspaceUrl: user.workspaceUrl,
    } as any;

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        workspaceUrl: user.workspaceUrl,
      },
    };
  }

  async validateUser(userId: string) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as any;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      workspaceUrl: user.workspaceUrl,
    } as any;
  }

  async refreshToken(userId: string) {
    const user = await this.validateUser(userId);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      workspaceUrl: user.workspaceUrl,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async getUserById(userId: string) {
    return this.validateUser(userId);
  }

  async updateUserProfile(userId: string, updateData: Partial<SignupDto>) {
    const user = (await this.prisma.user.update({
      where: { id: userId },
      data: updateData as any,
    })) as any;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      workspaceUrl: user.workspaceUrl,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as any;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword } as any,
    });

    return { message: 'Password updated successfully' };
  }
}
