import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEntry } from '../../entities/ledger-entry.entity';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private ledgerRepo: Repository<LedgerEntry>,
  ) {}

  async findByAccountId(accountId: string) {
    return this.ledgerRepo.find({
      where: { account: { id: accountId } },
      order: { ts: 'DESC' },
      take: 20,
    });
  }

  async getRecentActivity() {
    // For demo: get all recent entries
    return this.ledgerRepo.find({
      relations: ['account'],
      order: { ts: 'DESC' },
      take: 10,
    });
  }
}
