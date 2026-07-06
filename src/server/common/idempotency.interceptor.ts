import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private cache = new Map<string, { body: any; expiresAt: number }>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];

    if (request.method === 'GET' || request.url.includes('/auth/')) {
      return next.handle();
    }

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required for this request');
    }

    const cached = this.cache.get(idempotencyKey);
    if (cached) {
      if (Date.now() < cached.expiresAt) {
        return of(cached.body);
      } else {
        this.cache.delete(idempotencyKey);
      }
    }

    return next.handle().pipe(
      tap((responseBody) => {
        this.cache.set(idempotencyKey, {
          body: responseBody,
          expiresAt: Date.now() + this.TTL_MS,
        });
      }),
    );
  }
}
