import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards, Query, ForbiddenException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { UserRole } from '../../../types';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    @Inject(AdminService)
    private readonly adminService: AdminService,
  ) {}

  private checkAdmin(req: any) {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
  }

  @Get('users')
  async getUsers(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getUsers();
  }

  @Get('kyc/:userId/documents')
  async getKYCDocuments(@Req() req: any, @Param('userId') userId: string) {
    this.checkAdmin(req);
    return this.adminService.getKYCDocuments(userId);
  }

  @Post('kyc/:userId/status')
  async updateKYCStatus(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() body: { status: 'VERIFIED' | 'REJECTED' },
  ) {
    this.checkAdmin(req);
    return this.adminService.updateKYCStatus(userId, body.status);
  }

  @Post('aml/generate-report')
  async generateAMLReport(
    @Req() req: any,
    @Body() body: { userId: string; notes?: string },
  ) {
    this.checkAdmin(req);
    return this.adminService.generateAMLReport(body.userId, body.notes);
  }

  @Get('system/config')
  async getSystemConfig(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getSystemConfig();
  }

  @Patch('system/config')
  async updateSystemConfig(@Req() req: any, @Body() body: any) {
    this.checkAdmin(req);
    return this.adminService.updateSystemConfig(body);
  }

  @Get('logs')
  async getAuditLogs(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('level') level?: string,
    @Query('context') context?: string,
  ) {
    this.checkAdmin(req);
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return this.adminService.getAuditLogs(parsedLimit, level, context);
  }
}
