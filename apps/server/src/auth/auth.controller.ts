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
  Req,
  Res,
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
import type { Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

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
  async signup(@Body() signupDto: SignupDto, _req: Request, _res: Response) {
    // Create company and user with our business logic
    // We intentionally do NOT auto-login here to avoid read-after-write consistency issues
    // Frontend will call /auth/login immediately after.
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Validate credentials using our service (ensures correct errors and user exists)
    await this.authService.validateCredentials(loginDto);

    // Create Better Auth session with retry to handle possible read-after-write lag
    const attempt = async () => {
      const response = await this.betterAuthService.api.signInEmail({
        body: { email: loginDto.email, password: loginDto.password },
        headers: fromNodeHeaders(req.headers),
        asResponse: true,
      });
      const body = await response
        .clone()
        .json()
        .catch(() => ({}));

      // Forward cookies if any
      const cookies: string[] = [];
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') cookies.push(value);
      });
      if (cookies.length > 0) res.setHeader('Set-Cookie', cookies);

      return { response, body };
    };

    let last: { response: globalThis.Response; body: any } | null = null;
    const retries = [0, 200, 400]; // ms backoff
    for (let i = 0; i < retries.length; i++) {
      if (retries[i] > 0) await new Promise((r) => setTimeout(r, retries[i]));
      last = await attempt();
      if (last && last.body && !last.body.code) break; // success if no error code
      // If explicit invalid email or password, don't retry further
      if (last && last.body?.code === 'INVALID_EMAIL_OR_PASSWORD') break;
    }

    return last?.body ?? { message: 'login completed' };
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
  async logout(
    @Session() session: UserSession,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Invalidate the Better Auth session and clear cookies
    const authResponse = await this.betterAuthService.api.signOut({
      headers: fromNodeHeaders(req.headers),
      asResponse: true,
    });

    const logoutCookies: string[] = [];
    authResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        logoutCookies.push(value);
      }
    });
    if (logoutCookies.length > 0) {
      res.setHeader('Set-Cookie', logoutCookies);
    }

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
