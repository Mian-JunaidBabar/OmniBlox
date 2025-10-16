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

    // Check if workspace URL is already taken (use findFirst so we can query on a non-unique input safely)
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
        // role is an enum in Prisma; cast to any to avoid TS mismatch here
        role: 'ADMIN' as any,
        companyName,
        workspaceUrl,
        industry,
        otherIndustry: industry === 'other' ? otherIndustry : null,
        country,
      } as any,
    });

    // Fetch the full user record with the fields we need (explicit select)
    // Fetch the created user record (cast to any to avoid generated type mismatches)
    const user = (await this.prisma.user.findUnique({
      where: { id: created.id },
    })) as any;

    if (!user) {
      throw new ConflictException('Failed to create user');
    }

    // Generate JWT token
    const payload = {
      sub: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
      workspaceUrl: (user as any).workspaceUrl,
    } as any;

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email and include password for verification
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
      (user as any).password as string,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
      workspaceUrl: (user as any).workspaceUrl,
    } as any;

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
        companyName: (user as any).companyName,
        workspaceUrl: (user as any).workspaceUrl,
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
}
