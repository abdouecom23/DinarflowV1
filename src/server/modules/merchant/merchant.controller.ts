import { Controller, Get, Post, Patch, Body, Req, UseGuards, Res, Inject, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/merchant')
@UseGuards(JwtAuthGuard)
export class MerchantController {
  constructor(
    @Inject(MerchantService)
    private readonly merchantService: MerchantService,
  ) {}

  @Get('settings')
  async getSettings(@Req() req: any) {
    return this.merchantService.getSettings(req.user.userId);
  }

  @Patch('settings')
  async updateSettings(@Req() req: any, @Body() body: any) {
    return this.merchantService.updateSettings(req.user.userId, body);
  }

  @Post('kyc')
  async submitKYC(@Req() req: any, @Body() body: { rcDocument: string; nifDocument: string }) {
    if (!body.rcDocument || !body.nifDocument) {
      throw new BadRequestException('rcDocument and nifDocument are required');
    }
    return this.merchantService.submitKYC(req.user.userId, body.rcDocument, body.nifDocument);
  }

  @Post('links')
  async createLink(@Req() req: any, @Body() body: { name: string; amountCentimes: number }) {
    return this.merchantService.createLink(req.user.userId, body.name, body.amountCentimes);
  }

  @Get('links')
  async getLinks(@Req() req: any) {
    return this.merchantService.getLinks(req.user.userId);
  }

  @Get('transactions')
  async getTransactions(@Req() req: any) {
    return this.merchantService.getTransactions(req.user.userId);
  }

  @Get('reports/download')
  async downloadReport(@Req() req: any, @Res() res: any) {
    const csvContent = await this.merchantService.generateCSVReport(req.user.userId);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="settlement_report.csv"');
    res.status(200).send(csvContent);
  }
}
