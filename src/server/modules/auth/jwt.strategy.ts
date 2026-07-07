import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';

const cookieOrBearerExtractor = (req: any) => {
  if (!req) return null;
  let token = null;

  // 1. Try to read token from cookies or parsed cookie header
  if (req.cookies && req.cookies.df_token) {
    token = req.cookies.df_token;
  } else if (req.headers && req.headers.cookie) {
    const rawCookies = req.headers.cookie;
    const match = rawCookies.match(/(?:^|; )df_token=([^;]*)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 2. Fallback to standard Authorization Bearer header
  if (!token) {
    token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  }

  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(AccountsService) private accountsService: AccountsService,
  ) {
    super({
      jwtFromRequest: cookieOrBearerExtractor,
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
