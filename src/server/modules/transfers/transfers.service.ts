import { Injectable, BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, ILike } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { TIER_LIMITS, DAILY_OUTFLOW_LIMITS } from '../../../types';

@Injectable()
export class TransfersService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
  ) {}

  async transfer(payload: {
    senderAccountId: string;
    receiverAccountId: string;
    amountCentimes: number;
    type: string;
    reference?: string;
    idempotencyKey: string;
  }) {
    // 1. Input validation
    if (!payload.amountCentimes || payload.amountCentimes <= 0) {
      throw new BadRequestException('Transfer amount must be a positive integer');
    }

    // 2. Idempotency guard
    const existing = await this.txnRepo.findOne({ where: { idempotencyKey: payload.idempotencyKey } });
    if (existing) return existing;

    // Resolve receiver account first (by account ID, user ID, email, or payment tag)
    let targetReceiverAccount: Account | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.receiverAccountId);

    if (isUuid) {
      targetReceiverAccount = await this.accountRepo.findOne({
        where: { id: payload.receiverAccountId },
        relations: { user: true },
      });

      if (!targetReceiverAccount) {
        targetReceiverAccount = await this.accountRepo.findOne({
          where: { user: { id: payload.receiverAccountId } },
          relations: { user: true },
        });
      }
    }

    if (!targetReceiverAccount) {
      const cleanIdentifier = payload.receiverAccountId.trim();
      const userRepo = this.dataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: [
          { email: ILike(cleanIdentifier) },
          { payment_tag: ILike(cleanIdentifier) },
          { payment_tag: ILike(cleanIdentifier.replace(/^@/, '')) }
        ]
      });

      if (user) {
        targetReceiverAccount = await this.accountRepo.findOne({
          where: { user: { id: user.id } },
          relations: { user: true },
        });
      }
    }

    if (!targetReceiverAccount) {
      throw new NotFoundException(`Recipient account not found for identifier: ${payload.receiverAccountId}`);
    }

    const receiverUuid = targetReceiverAccount.id;

    // 3. Run in a single ACID transaction
    return this.dataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const ledgerRepo = manager.getRepository(LedgerEntry);
      const txnRepo = manager.getRepository(Transaction);

      // Deadlock prevention: Lock accounts in deterministic order
      const ids = [payload.senderAccountId, receiverUuid].sort();
      
      const lockedAccounts = await accountRepo.find({
        where: ids.map(id => ({ id })),
        lock: { mode: 'pessimistic_write' },
      });

      const sender = lockedAccounts.find(a => a.id === payload.senderAccountId);
      const receiver = lockedAccounts.find(a => a.id === receiverUuid);

      if (!sender || !receiver) throw new NotFoundException('One or more accounts not found');
      if (sender.id === receiver.id) throw new BadRequestException('Cannot transfer to self');
      if (sender.status !== 'ACTIVE') throw new ForbiddenException('Sender account is not active');

      const amountBig = BigInt(payload.amountCentimes);
      const senderBalanceBig = BigInt(sender.balance);

      if (senderBalanceBig < amountBig) throw new ForbiddenException('Insufficient balance');

      // --- ALGERIAN PSP COMPLIANCE CHECKS ---
      
      const now = new Date();
      const lastUpdate = new Date(sender.updated_at);
      if (lastUpdate.toDateString() !== now.toDateString()) {
        sender.daily_debit_sum = 0;
      }

      const dailyLimitDA = BigInt(DAILY_OUTFLOW_LIMITS[sender.tier]);
      const dailyLimitCentimes = dailyLimitDA * 100n;
      const currentDailySum = BigInt(sender.daily_debit_sum);
      
      if (currentDailySum + amountBig > dailyLimitCentimes) {
        throw new ForbiddenException(`Daily outflow limit exceeded for Tier ${sender.tier} (${dailyLimitDA} DA)`);
      }

      const balanceCapDA = BigInt(TIER_LIMITS[receiver.tier]);
      const balanceCapCentimes = balanceCapDA * 100n;
      const receiverBalanceBig = BigInt(receiver.balance);
      
      if (receiverBalanceBig + amountBig > balanceCapCentimes) {
        throw new ForbiddenException(`Receiver balance cap would be exceeded for Tier ${receiver.tier} (${balanceCapDA} DA)`);
      }

      // --- END COMPLIANCE CHECKS ---

      // 4. Update balances
      const newSenderBal = senderBalanceBig - amountBig;
      const newReceiverBal = receiverBalanceBig + amountBig;
      
      sender.balance = newSenderBal.toString();
      sender.daily_debit_sum = (currentDailySum + amountBig).toString();
      
      receiver.balance = newReceiverBal.toString();

      await accountRepo.save([sender, receiver]);

      // 5. Ledger Entries
      const txnId = crypto.randomUUID();
      const entries = [
        ledgerRepo.create({ transactionId: txnId, account: sender, direction: 'DEBIT', amount: payload.amountCentimes, balanceAfter: Number(newSenderBal), ts: now }),
        ledgerRepo.create({ transactionId: txnId, account: receiver, direction: 'CREDIT', amount: payload.amountCentimes, balanceAfter: Number(newReceiverBal), ts: now }),
      ];
      await ledgerRepo.save(entries);

      // 6. Transaction Metadata
      const txn = txnRepo.create({
        id: txnId,
        type: payload.type,
        senderAccount: sender,
        receiverAccount: receiver,
        amount: payload.amountCentimes.toString(),
        reference: payload.reference,
        status: 'COMPLETED',
        idempotencyKey: payload.idempotencyKey,
        ts: now,
      });
      return txnRepo.save(txn);
    });
  }
}
