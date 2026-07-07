import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { Account } from '../../entities/account.entity';

@Injectable()
export class LedgerService implements OnModuleInit {
  constructor(
    @InjectRepository(LedgerEntry)
    private ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  onModuleInit() {
    // Start background periodic reconciliation job.
    // 24 hours = 24 * 60 * 60 * 1000 ms.
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    // Run an initial reconciliation 5 seconds after startup to auto-heal any offline database crash discrepancies
    setTimeout(async () => {
      try {
        console.log('[Ledger Reconciliation Job] Triggering startup database-integrity reconciliation...');
        await this.reconcileAllAccounts();
      } catch (err) {
        console.error('[Ledger Reconciliation Job] Startup database-integrity reconciliation failed:', err);
      }
    }, 5000);

    // Run the job periodically every 24 hours
    setInterval(async () => {
      try {
        console.log('[Ledger Reconciliation Job] Triggering scheduled periodic 24-hour ledger reconciliation...');
        await this.reconcileAllAccounts();
      } catch (err) {
        console.error('[Ledger Reconciliation Job] Scheduled periodic 24-hour ledger reconciliation failed:', err);
      }
    }, TWENTY_FOUR_HOURS);
  }

  async reconcileAllAccounts(): Promise<{ totalAccounts: number; reconciledCount: number; status: string }> {
    const accounts = await this.accountRepo.find();
    let reconciledCount = 0;

    for (const account of accounts) {
      const res = await this.reconcileLedger(account.id);
      if (res.reconciled) {
        reconciledCount++;
      }
    }

    console.log(`[Ledger Reconciliation Job] Completed successfully. Total accounts analyzed: ${accounts.length}. Accounts healed/reconciled: ${reconciledCount}.`);
    return {
      totalAccounts: accounts.length,
      reconciledCount,
      status: 'SUCCESS',
    };
  }

  async findByAccountId(accountId: string) {
    return this.ledgerRepo.find({
      where: { account: { id: accountId } },
      order: { ts: 'DESC' },
      take: 20,
    });
  }

  async getRecentActivity() {
    return this.ledgerRepo.find({
      relations: { account: true },
      order: { ts: 'DESC' },
      take: 10,
    });
  }

  async auditLedger(accountId: string): Promise<{ cachedBalance: number; calculatedBalance: number; isIntegrityOk: boolean }> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found for ledger audit`);
    }

    const entries = await this.ledgerRepo.find({
      where: { account: { id: accountId } },
    });

    let calculated = 0;
    for (const entry of entries) {
      if (entry.direction === 'CREDIT') {
        calculated += Number(entry.amount);
      } else if (entry.direction === 'DEBIT') {
        calculated -= Number(entry.amount);
      }
    }

    const cached = Number(account.balance);
    const isIntegrityOk = calculated === cached;

    return {
      cachedBalance: cached,
      calculatedBalance: calculated,
      isIntegrityOk,
    };
  }

  async reconcileLedger(accountId: string): Promise<{ accountId: string; cachedBalance: number; calculatedBalance: number; reconciled: boolean; ok: boolean }> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found for ledger reconciliation`);
    }

    const entries = await this.ledgerRepo.find({
      where: { account: { id: accountId } },
    });

    let calculated = 0;
    for (const entry of entries) {
      if (entry.direction === 'CREDIT') {
        calculated += Number(entry.amount);
      } else if (entry.direction === 'DEBIT') {
        calculated -= Number(entry.amount);
      }
    }

    const cached = Number(account.balance);
    const isMatched = calculated === cached;

    if (!isMatched) {
      console.warn(`[Ledger Audit] Discrepancy detected for Account ${accountId}! Cached: ${cached}, Calculated: ${calculated}. Reconciling...`);
      account.balance = calculated;
      await this.accountRepo.save(account);
    }

    return {
      accountId,
      cachedBalance: cached,
      calculatedBalance: calculated,
      reconciled: !isMatched,
      ok: true,
    };
  }
}
