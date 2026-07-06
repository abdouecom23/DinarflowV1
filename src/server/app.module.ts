import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { LedgerModule } from './modules/ledger/ledger.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const usePostgres = process.env.DB_HOST && 
                            process.env.DB_NAME && 
                            process.env.DB_HOST !== '127.0.0.1' && 
                            process.env.DB_HOST !== 'localhost';
        if (usePostgres) {
          console.log('[DinarFlow] Connecting to PostgreSQL database...');
          return {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: false, // Disable synchronize to avoid permission errors
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
  ],
})
export class AppModule {}
