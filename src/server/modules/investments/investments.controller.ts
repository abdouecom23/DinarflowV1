import { Controller, Get, Post, Body, Req, UseGuards, BadRequestException, Inject } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(
    @Inject(InvestmentsService) private readonly investmentsService: InvestmentsService,
  ) {}

  @Get('market')
  async getMarket() {
    return this.investmentsService.getMarket();
  }

  @Get('holdings')
  async getHoldings(@Req() req: any) {
    return this.investmentsService.getHoldings(req.user.userId);
  }

  @Post('buy')
  async buyAsset(@Req() req: any, @Body() body: { symbol: string; shares: number }) {
    if (!body.symbol) {
      throw new BadRequestException('Asset symbol is required');
    }
    if (body.shares === undefined || body.shares <= 0) {
      throw new BadRequestException('Shares must be positive');
    }
    return this.investmentsService.buyAsset(req.user.userId, body.symbol, body.shares);
  }
}
