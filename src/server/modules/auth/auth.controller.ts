import { Controller, Post, Body, UnauthorizedException, Inject, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import type { Response } from 'express';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  role?: string;
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const result = await this.authService.login(user);
    
    // Secure HTTP-Only cookie setting
    response.cookie('df_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.register({
      email: signupDto.email,
      pass: signupDto.password,
      fullName: signupDto.fullName,
      role: signupDto.role || 'USER',
    });

    // Secure HTTP-Only cookie setting
    response.cookie('df_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('df_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, message: 'Logged out successfully' };
  }
}
