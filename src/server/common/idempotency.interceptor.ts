import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Observable, of, from } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { Idempotency } from '../entities/idempotency.entity';
import { CacheService } from './cache.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CacheService) private readonly cacheService: CacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];

    if (
      request.method === 'GET' ||
      request.url.includes('/auth/') ||
      request.url.includes('/accounts/kyc')
    ) {
      return next.handle();
    }

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required for this request');
    }

    return from(this.getCachedResponse(idempotencyKey)).pipe(
      mergeMap((cachedResponse) => {
        if (cachedResponse) {
          return of(cachedResponse);
        }
        return next.handle().pipe(
          tap(async (responseBody) => {
            await this.cacheResponse(idempotencyKey, responseBody);
          }),
        );
      }),
    );
  }

  private async getCachedResponse(key: string): Promise<any | null> {
    try {
      // 1. Try CacheService first (Fast path)
      const cached = await this.cacheService.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      // 2. Fallback to Database (Audit trail / cold storage)
      const repo = this.dataSource.getRepository(Idempotency);
      const record = await repo.findOne({ where: { key } });
      if (record) {
        if (new Date() < record.expiresAt) {
          // Populate fast cache for subsequent queries
          await this.cacheService.set(key, record.responseBody, 24 * 60 * 60);
          return JSON.parse(record.responseBody);
        } else {
          await repo.delete({ key });
        }
      }
    } catch (err: any) {
      console.warn('[Idempotency] Database lookup failed:', err.message);
    }
    return null;
  }

  private async cacheResponse(key: string, body: any): Promise<void> {
    try {
      const responseStr = JSON.stringify(body);
      
      // 1. Store in CacheService first
      await this.cacheService.set(key, responseStr, 24 * 60 * 60);

      // 2. Store in Database as durable ledger/audit trace
      const repo = this.dataSource.getRepository(Idempotency);
      const record = repo.create({
        key,
        responseBody: responseStr,
        expiresAt: new Date(Date.now() + this.TTL_MS),
      });
      await repo.save(record);
    } catch (err: any) {
      console.warn('[Idempotency] Cache write failed:', err.message);
    }
  }
}

