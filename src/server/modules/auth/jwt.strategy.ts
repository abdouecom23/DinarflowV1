import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(AccountsService) private accountsService: AccountsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_key_low_entropy',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const account = await this.accountsService.findByUserId(user.id);

    return { 
      userId: payload.userId, 
      role: payload.role,
      accountId: account?.id,
    };
  }
}
