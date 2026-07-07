import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { MonitoringMiddleware } from './common/monitoring.middleware';
import { IdempotencyInterceptor } from './common/idempotency.interceptor';
import { CacheService } from './common/cache.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const usePostgres = process.env.DB_HOST && 
                            process.env.DB_NAME && 
                            process.env.DB_HOST !== '127.0.0.1' && 
                            process.env.DB_HOST !== 'localhost';
        if (usePostgres) {
          console.log('[DinarFlow] Connecting to PostgreSQL database with optimal pooling settings...');
          return {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: false, // Disable synchronize to avoid permission errors
            extra: {
              max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Limit pool size for stability
              min: parseInt(process.env.DB_POOL_MIN || '2', 10),
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 5000,
            },
          };
        } else {
          console.log('[DinarFlow] No PostgreSQL configuration found, falling back to local SQLite...');
          return {
            type: 'sqljs',
            location: 'dinarflow.db',
            autoSave: true,
            autoLoadEntities: true,
            synchronize: true, // Automatically synchronize tables in SQLite/sql.js
          };
        }
      },
    }),
    AuthModule,
    AccountsModule,
    TransfersModule,
    LedgerModule,
    MonitoringModule,
    InvestmentsModule,
  ],
  providers: [
    CacheService,
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MonitoringMiddleware).forRoutes('*');
  }
}

