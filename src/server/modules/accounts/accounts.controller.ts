import { Controller, Get, Post, Body, Req, UseGuards, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
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

  @Post('kyc')
  async submitKYC(@Req() req: any, @Body() body: { docType: string }) {
    if (!body.docType) {
      throw new BadRequestException('docType is required');
    }
    return this.accountsService.submitKYC(req.user.userId, body.docType);
  }

  @Post('kyc/upload')
  async uploadKYCDocument(@Req() req: any, @Body() body: { docType: string; fileName?: string }) {
    if (!body.docType) {
      throw new BadRequestException('docType is required');
    }
    console.log(`[KYC Storage Integration] Simulated secure document upload to GCP Cloud Storage/S3 for User ${req.user.userId}. File name: ${body.fileName || 'national_id.pdf'}`);
    return this.accountsService.submitKYC(req.user.userId, body.docType);
  }

  @Post('deposit')
  async deposit(@Req() req: any, @Body() body: { amount: number }) {
    if (body.amount === undefined || body.amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }
    console.log(`[Payment Gateway] Processing deposit of ${body.amount} DA via local PCI-DSS gateway integration...`);
    return this.accountsService.deposit(req.user.userId, body.amount);
  }

  @Post('upgrade')
  async upgradeToPro(@Req() req: any) {
    console.log(`[Subscription Flow] Processing Pro membership upgrade for User ${req.user.userId}...`);
    return this.accountsService.upgradeToPro(req.user.userId);
  }
}
