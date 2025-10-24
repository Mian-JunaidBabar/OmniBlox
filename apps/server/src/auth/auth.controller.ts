import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Put,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  GetCurrentUser,
  GetCurrentUserId,
  GetCurrentCompanyId,
} from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetCurrentUserId() userId: string) {
    return this.authService.getUserById(userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @GetCurrentUserId() userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateUserProfile(userId, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetCurrentUserId() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // For JWT, logout is typically handled client-side by removing the token
    // You could implement token blacklisting here if needed
    return { message: 'Logged out successfully' };
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(@GetCurrentUser() user: any) {
    return {
      valid: true,
      user,
    };
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCurrentCompany(@GetCurrentCompanyId() companyId: string) {
    // This endpoint can be used to get current company info if needed
    return { companyId };
  }
}
