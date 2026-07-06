import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  async findByUserId(userId: string): Promise<Account | null> {
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return null;
    }
    return this.accountRepo.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });
  }

  async create(user: User): Promise<Account> {
    const account = new Account();
    account.user = user;
    
    // Generate a random 14-digit IBAN suffix
    const randomDigits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
    account.iban = `DZ91007999990000${randomDigits}`;
    
    account.balance = 250000; // 250,000 DA starting balance
    account.tier = 1;
    account.daily_debit_sum = 0;
    account.version = 1;
    account.status = 'ACTIVE' as any;
    
    return this.accountRepo.save(account);
  }
}
