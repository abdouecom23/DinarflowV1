import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  public readonly register: Registry;
  public httpRequestCounter!: Counter<string>;
  public httpRequestDuration!: Histogram<string>;
  public activeRequestsGauge!: Gauge<string>;
  public httpErrorCounter!: Counter<string>;

  constructor() {
    this.register = new Registry();
  }

  onModuleInit() {
    // Collect standard node.js and system metrics
    collectDefaultMetrics({ register: this.register, prefix: 'dinarflow_' });

    // HTTP Request total counter
    this.httpRequestCounter = new Counter({
      name: 'dinarflow_http_requests_total',
      help: 'Total number of HTTP requests processed',
      labelNames: ['method', 'path', 'status'],
      registers: [this.register],
    });

    // HTTP Request latency histogram
    this.httpRequestDuration = new Histogram({
      name: 'dinarflow_http_request_duration_seconds',
      help: 'HTTP request latency distribution in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // Active requests gauge
    this.activeRequestsGauge = new Gauge({
      name: 'dinarflow_http_active_requests',
      help: 'Number of concurrent active HTTP requests',
      registers: [this.register],
    });

    // Exception counter
    this.httpErrorCounter = new Counter({
      name: 'dinarflow_http_errors_total',
      help: 'Total number of HTTP errors thrown',
      labelNames: ['status', 'error_type'],
      registers: [this.register],
    });
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
