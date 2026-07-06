import { Controller, Get, Req, UseGuards, NotFoundException, Inject } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(@Inject(AccountsService) private readonly accountsService: AccountsService) {}

  @Get('me')
  async getMyAccount(@Req() req: any) {
    const account = await this.accountsService.findByUserId(req.user.userId);
    if (!account) {
      throw new NotFoundException('Account not found for this user');
    }
    return account;
  }
}
