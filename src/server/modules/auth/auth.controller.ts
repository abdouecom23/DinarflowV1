import { Controller, Post, Body, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

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
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.register({
      email: signupDto.email,
      pass: signupDto.password,
      fullName: signupDto.fullName,
      role: signupDto.role || 'USER',
    });
  }
}
