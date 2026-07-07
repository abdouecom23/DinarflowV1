import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { Account } from '../../entities/account.entity';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  async findByAccountId(accountId: string) {
    return this.ledgerRepo.find({
      where: { account: { id: accountId } },
      order: { ts: 'DESC' },
      take: 20,
    });
  }

  async getRecentActivity() {
    return this.ledgerRepo.find({
      relations: ['account'],
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
