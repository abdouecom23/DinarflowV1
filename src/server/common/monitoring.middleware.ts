import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../modules/monitoring/metrics.service';
import { StructuredLogger } from './structured-logger';

@Injectable()
export class MonitoringMiddleware implements NestMiddleware {
  private readonly logger = new StructuredLogger();

  constructor(@Inject(MetricsService) private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip static assets and public file checks to avoid log/metrics spam
    const path = req.path;
    if (
      path.startsWith('/assets') ||
      path.includes('.') ||
      path === '/favicon.ico'
    ) {
      return next();
    }

    const start = process.hrtime();
    
    // Increment active request gauge
    if (this.metricsService.activeRequestsGauge) {
      this.metricsService.activeRequestsGauge.inc();
    }

    res.on('finish', () => {
      // Decrement active request gauge
      if (this.metricsService.activeRequestsGauge) {
        this.metricsService.activeRequestsGauge.dec();
      }

      // Calculate elapsed time
      const diff = process.hrtime(start);
      const durationInSeconds = diff[0] + diff[1] / 1e9;
      const durationInMs = Math.round(durationInSeconds * 1000);
      const status = res.statusCode;

      // Extract high-level path template (e.g. /api/v1/accounts/me instead of specific IDs if possible, but keep simple for now)
      // Normalizing UUIDs or specific paths helps prevent high-cardinality label issues in Prometheus
      const normalizedPath = this.normalizePath(path);

      // Log structured HTTP access entry
      if (status >= 500) {
        this.logger.error(
          `HTTP ${status} - ${req.method} ${path} - Fail - ${durationInMs}ms`,
          undefined,
          'HttpAccess'
        );
      } else if (status >= 400) {
        this.logger.warn(
          `HTTP ${status} - ${req.method} ${path} - ClientError - ${durationInMs}ms`,
          'HttpAccess'
        );
      } else {
        this.logger.log(
          `HTTP ${status} - ${req.method} ${path} - Success - ${durationInMs}ms`,
          'HttpAccess'
        );
      }

      // Record Prometheus metrics
      if (this.metricsService.httpRequestCounter) {
        this.metricsService.httpRequestCounter.inc({
          method: req.method,
          path: normalizedPath,
          status: status.toString(),
        });
      }

      if (this.metricsService.httpRequestDuration) {
        this.metricsService.httpRequestDuration.observe(
          {
            method: req.method,
            path: normalizedPath,
            status: status.toString(),
          },
          durationInSeconds
        );
      }

      if (status >= 400 && this.metricsService.httpErrorCounter) {
        this.metricsService.httpErrorCounter.inc({
          status: status.toString(),
          error_type: status >= 500 ? 'Server' : 'Client',
        });
      }
    });

    next();
  }

  private normalizePath(path: string): string {
    // Replace raw UUIDs with :id placeholder to avoid high metric cardinality
    const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
    // Replace numeric IDs with :id placeholder
    const numericIdRegex = /\/\d+(\/|$)/g;

    let normalized = path.replace(uuidRegex, ':id');
    normalized = normalized.replace(numericIdRegex, '/:id$1');
    return normalized;
  }
}
