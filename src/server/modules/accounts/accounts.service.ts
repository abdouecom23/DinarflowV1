import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { User } from '../../entities/user.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectDataSource()
    private dataSource: DataSource,
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
    // Generate a random 14-digit IBAN suffix
    const randomDigits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
    const iban = `DZ91007999990000${randomDigits}`;

    return this.dataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const ledgerRepo = manager.getRepository(LedgerEntry);

      const account = new Account();
      account.user = user;
      account.iban = iban;
      account.balance = 250000; // 250,000 DA starting balance
      account.tier = 1;
      account.daily_debit_sum = 0;
      account.version = 1;
      account.status = 'ACTIVE' as any;

      const savedAccount = await accountRepo.save(account);

      // Create ledger entry for initial balance to maintain strict Ledger integrity
      const ledgerEntry = ledgerRepo.create({
        transactionId: crypto.randomUUID(),
        account: savedAccount,
        direction: 'CREDIT',
        amount: 250000,
        balanceAfter: 250000,
        ts: new Date(),
      });
      await ledgerRepo.save(ledgerEntry);

      return savedAccount;
    });
  }

  async submitKYC(userId: string, docType: string): Promise<any> {
    const account = await this.findByUserId(userId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Move to IN_REVIEW status
    user.kyc_status = 'PENDING';
    await userRepo.save(user);

    // Asynchronous local verification hook - trigger background verification simulation
    setTimeout(async () => {
      try {
        console.log(`[KYC Pipeline] Running async local verification hook for user ${userId}...`);
        
        // Reload user to get fresh state in background thread
        const freshUser = await userRepo.findOne({ where: { id: userId } });
        if (!freshUser) return;

        // Auto-approve and elevate limits/tiers
        freshUser.kyc_status = 'VERIFIED';
        await userRepo.save(freshUser);

        const freshAccount = await this.accountRepo.findOne({
          where: { user: { id: userId } },
        });
        if (freshAccount) {
          freshAccount.tier = 2; // Level 2
          await this.accountRepo.save(freshAccount);
        }

        console.log(`[KYC Pipeline] Async verification complete! User ${userId} verified, upgraded to Tier 2.`);
      } catch (err) {
        console.error('[KYC Pipeline] Error during asynchronous verification execution:', err);
      }
    }, 10000); // 10 seconds async processing time

    return {
      status: 'PENDING',
      message: 'KYC documents received. Asynchronous verification pipeline has been triggered.',
    };
  }
}
