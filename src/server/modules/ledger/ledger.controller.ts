import { Controller, Get, Param, UseGuards, Req, ForbiddenException, Inject } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../../types';

@Controller('api/v1/ledger')
@UseGuards(JwtAuthGuard)
export class LedgerController {
  constructor(@Inject(LedgerService) private readonly ledgerService: LedgerService) {}

  @Get('account/:id')
  async getByAccount(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== UserRole.ADMIN && req.user.accountId !== id) {
      throw new ForbiddenException('You can only view your own ledger entries');
    }
    return this.ledgerService.findByAccountId(id);
  }

  @Get('recent')
  async getRecent(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view recent global activity');
    }
    return this.ledgerService.getRecentActivity();
  }
}
