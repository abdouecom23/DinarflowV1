import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../../entities/user.entity';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { SystemConfig } from '../../entities/system-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Account,
      Transaction,
      AuditLog,
      SystemConfig,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
