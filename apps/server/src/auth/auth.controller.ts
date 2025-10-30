import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Put,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  AuthGuard,
  Session,
  AllowAnonymous,
} from '@thallesp/nestjs-better-auth';
import { AuthService as BetterAuthService } from '@thallesp/nestjs-better-auth';

// Define the session type with our custom fields
interface UserSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    // Our custom multi-tenant fields
    companyId: string;
    role: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly betterAuthService: BetterAuthService,
  ) {}

  @Post('signup')
  @AllowAnonymous()
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authService.signup(signupDto);

    // Create Better Auth session
    // Note: Better Auth will handle session creation via its built-in mechanisms
    // We return the data and let the frontend call login after signup
    return result;
  }

  @Post('login')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // Validate credentials using our service
    const result = await this.authService.validateCredentials(loginDto);

    // Better Auth will create the session automatically via its internal mechanisms
    // The session will include our custom companyId and role fields via the database hooks
    return result;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Session() session: UserSession) {
    // Extract userId from Better Auth session
    const userId = session.session.userId;
    return this.authService.getUserById(userId);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Session() session: UserSession,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = session.session.userId;
    return this.authService.updateUserProfile(userId, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Session() session: UserSession,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = session.session.userId;
    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Session() session: UserSession) {
    // Better Auth handles logout via its internal mechanisms
    // We just need to return success
    return { message: 'Logged out successfully' };
  }

  @Get('validate')
  @UseGuards(AuthGuard)
  async validateToken(@Session() session: UserSession) {
    return {
      valid: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.session.role,
        companyId: session.session.companyId,
      },
    };
  }

  @Get('company')
  @UseGuards(AuthGuard)
  async getCurrentCompany(@Session() session: UserSession) {
    // Return company ID from session
    return { companyId: session.session.companyId };
  }

  @Get('session')
  @UseGuards(AuthGuard)
  async getSession(@Session() session: UserSession) {
    // Return full session data including our custom fields
    return {
      userId: session.session.userId,
      role: session.session.role,
      companyId: session.session.companyId,
      expiresAt: session.session.expiresAt,
    };
  }
}
