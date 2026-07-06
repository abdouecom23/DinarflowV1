import { Injectable, UnauthorizedException, Inject, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(AccountsService) private accountsService: AccountsService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      console.log('Validating user:', email);
      const user = await this.usersService.findByEmail(email);
      console.log('User found:', user ? 'yes' : 'no');
      if (user && (await bcrypt.compare(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (err) {
      console.error('validateUser error:', err);
      throw err;
    }
  }

  async register(signupData: { email: string; pass: string; fullName: string; role: string }) {
    const existingUser = await this.usersService.findByEmail(signupData.email);
    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(signupData.pass, 10);

    const baseTag = signupData.fullName
      ? signupData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')
      : 'user';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const payment_tag = `${baseTag}_${randomSuffix}`;

    const newUser = await this.usersService.create({
      email: signupData.email,
      password: hashedPassword,
      full_name: signupData.fullName,
      payment_tag,
      kyc_level: 1,
      kyc_status: 'PENDING',
      role: signupData.role as any,
    });

    await this.accountsService.create(newUser);

    return this.login(newUser);
  }

  async login(user: any) {
    const payload = { userId: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name || user.fullName,
      },
    };
  }
}
