import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction, LedgerEntry])],
  providers: [TransfersService],
  controllers: [TransfersController],
})
export class TransfersModule {}
