import { Injectable } from '@nestjs/common';
import { StructuredLogger } from './structured-logger';

@Injectable()
export class CacheService {
  private readonly logger = new StructuredLogger();
  private store = new Map<string, { value: string; expiresAt: number }>();
  private redisClient: any = null;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        const { default: Redis } = await import('ioredis');
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          connectTimeout: 5000,
        });
        this.logger.log('Redis Cache Provider connected successfully.', 'CacheService');
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Redis client. Falling back to local scalable cache: ${err.message}`, 'CacheService');
      }
    } else {
      this.logger.log('REDIS_URL not set. Utilizing optimized local in-memory Cache Provider.', 'CacheService');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch (err: any) {
        this.logger.error(`Redis GET error: ${err.message}`, undefined, 'CacheService');
      }
    }

    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err: any) {
        this.logger.error(`Redis SET error: ${err.message}`, undefined, 'CacheService');
      }
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // Cleanup expired keys periodically to prevent memory leak
    if (this.store.size > 1000) {
      this.pruneExpired();
    }
  }

  async delete(key: string): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
        return;
      } catch (err: any) {
        this.logger.error(`Redis DEL error: ${err.message}`, undefined, 'CacheService');
      }
    }
    this.store.delete(key);
  }

  private pruneExpired() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
