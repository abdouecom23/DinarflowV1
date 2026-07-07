import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerService } from './ledger.service';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { Account } from '../../entities/account.entity';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LedgerService', () => {
  let service: LedgerService;
  let ledgerRepo: Repository<LedgerEntry>;
  let accountRepo: Repository<Account>;

  const mockLedgerRepo = {
    find: vi.fn(),
  };

  const mockAccountRepo = {
    findOne: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        {
          provide: getRepositoryToken(LedgerEntry),
          useValue: mockLedgerRepo,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepo,
        },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
    ledgerRepo = module.get<Repository<LedgerEntry>>(getRepositoryToken(LedgerEntry));
    accountRepo = module.get<Repository<Account>>(getRepositoryToken(Account));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('auditLedger', () => {
    it('should throw NotFoundException if account does not exist', async () => {
      mockAccountRepo.findOne.mockResolvedValue(null);

      await expect(service.auditLedger('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should correctly calculate ledger balance and report isIntegrityOk true if matched', async () => {
      const mockAccount = { id: 'acc-123', balance: 100 };
      const mockEntries = [
        { direction: 'CREDIT', amount: 150 },
        { direction: 'DEBIT', amount: 50 },
      ];

      mockAccountRepo.findOne.mockResolvedValue(mockAccount);
      mockLedgerRepo.find.mockResolvedValue(mockEntries);

      const result = await service.auditLedger('acc-123');

      expect(result.cachedBalance).toBe(100);
      expect(result.calculatedBalance).toBe(100);
      expect(result.isIntegrityOk).toBe(true);
    });

    it('should report isIntegrityOk false if there is a balance mismatch', async () => {
      const mockAccount = { id: 'acc-123', balance: 500 }; // incorrect cached balance
      const mockEntries = [
        { direction: 'CREDIT', amount: 150 },
        { direction: 'DEBIT', amount: 50 },
      ];

      mockAccountRepo.findOne.mockResolvedValue(mockAccount);
      mockLedgerRepo.find.mockResolvedValue(mockEntries);

      const result = await service.auditLedger('acc-123');

      expect(result.cachedBalance).toBe(500);
      expect(result.calculatedBalance).toBe(100);
      expect(result.isIntegrityOk).toBe(false);
    });
  });

  describe('reconcileLedger', () => {
    it('should auto-heal (save reconciled balance) if there is a mismatch', async () => {
      const mockAccount = { id: 'acc-123', balance: 500 };
      const mockEntries = [
        { direction: 'CREDIT', amount: 300 },
        { direction: 'DEBIT', amount: 100 },
      ];

      mockAccountRepo.findOne.mockResolvedValue(mockAccount);
      mockLedgerRepo.find.mockResolvedValue(mockEntries);
      mockAccountRepo.save.mockResolvedValue({ ...mockAccount, balance: 200 });

      const result = await service.reconcileLedger('acc-123');

      expect(result.cachedBalance).toBe(500);
      expect(result.calculatedBalance).toBe(200);
      expect(result.reconciled).toBe(true);
      expect(mockAccountRepo.save).toHaveBeenCalled();
    });
  });
});
