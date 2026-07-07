import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { MerchantLink } from '../../entities/merchant-link.entity';
import { MerchantSettings } from '../../entities/merchant-settings.entity';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantLink,
      MerchantSettings,
      Account,
      Transaction,
      User,
    ]),
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
