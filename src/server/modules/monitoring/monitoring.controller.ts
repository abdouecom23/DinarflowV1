import { Controller, Get, Res, ServiceUnavailableException, Inject } from '@nestjs/common';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { MetricsService } from './metrics.service';

@Controller()
export class MonitoringController {
  constructor(
    @Inject(MetricsService) private readonly metricsService: MetricsService,
    @Inject(DataSource) private readonly dataSource: DataSource
  ) {}

  // Liveness Probe: Simple check to confirm application is up and running
  @Get('health/live')
  getLive() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // Dual mapping for Kubernetes / standard health checking paths
  @Get('api/v1/health/live')
  getApiLive() {
    return this.getLive();
  }

  // Readiness Probe: Confirms the application and database are healthy and ready to accept traffic
  @Get('health/ready')
  async getReady() {
    try {
      // Perform a lightweight database query to verify active connectivity
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new ServiceUnavailableException({
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Dual mapping for ready checks
  @Get('api/v1/health/ready')
  async getApiReady() {
    return this.getReady();
  }

  // Prometheus scraping endpoint
  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    try {
      res.set('Content-Type', this.metricsService.register.contentType);
      const metrics = await this.metricsService.getMetrics();
      res.send(metrics);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  // Dual mapping for metrics
  @Get('api/v1/metrics')
  async getApiMetrics(@Res() res: Response) {
    return this.getMetrics(res);
  }
}
