import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TransfersService } from './transfers.service';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { User } from '../../entities/user.entity';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TransfersService', () => {
  let service: TransfersService;
  let accountRepo: MockRepository;
  let txnRepo: MockRepository;
  let ledgerRepo: MockRepository;
  let dataSource: MockDataSource;

  type MockRepository = {
    findOne: any;
    findOneBy: any;
    find: any;
    save: any;
    create: any;
    insert: any;
  };

  type MockDataSource = {
    transaction: any;
  };

  beforeEach(async () => {
    const localMockAccount = (id: string, balance: string, tier: number = 1) => ({
      id,
      balance,
      tier,
      status: 'ACTIVE',
      daily_debit_sum: '0',
      updated_at: new Date(),
    });

    accountRepo = {
      findOne: vi.fn(async (opts: any) => {
        const where = opts?.where || {};
        if (where.id === 'acc1' || where.user?.id === 'user-1') return localMockAccount('acc1', '10000');
        if (where.id === 'acc2' || where.user?.id === 'user-2') return localMockAccount('acc2', '5000');
        if (where.id === 'A' || where.user?.id === 'user-A') return localMockAccount('A', '10000');
        if (where.id === 'B' || where.user?.id === 'user-B') return localMockAccount('B', '10000');
        return null;
      }),
      findOneBy: vi.fn(),
      find: vi.fn(),
      save: vi.fn(x => x),
      create: vi.fn(x => x),
      insert: vi.fn(),
    };

    txnRepo = {
      findOne: vi.fn(),
      findOneBy: vi.fn(),
      find: vi.fn(),
      save: vi.fn(x => x),
      create: vi.fn(x => ({ ...x, status: 'COMPLETED' })),
      insert: vi.fn(),
    };

    ledgerRepo = {
      insert: vi.fn(),
      find: vi.fn(async () => []),
      create: vi.fn(x => x),
      save: vi.fn(x => x),
    };

    const userRepo = {
      findOne: vi.fn(async (opts: any) => {
        const where = opts?.where || [];
        const firstCond = Array.isArray(where) ? where[0] : where;
        // Stringify to handle potential query objects
        const queryStr = JSON.stringify(firstCond || {}).toLowerCase();
        
        if (queryStr.includes('acc1')) {
          return { id: 'user-1' };
        }
        if (queryStr.includes('acc2')) {
          return { id: 'user-2' };
        }
        if (queryStr.includes('a')) {
          return { id: 'user-A' };
        }
        if (queryStr.includes('b')) {
          return { id: 'user-B' };
        }
        return { id: 'user-2' };
      }),
    };

    dataSource = {
      getRepository: vi.fn((entity: any) => {
        if (entity === User) return userRepo;
        if (entity === Account) return accountRepo;
        if (entity === Transaction) return txnRepo;
        return null;
      }),
      transaction: vi.fn(cb => cb({
        getRepository: (entity: any) => {
          if (entity === Account) return accountRepo;
          if (entity === Transaction) return txnRepo;
          if (entity === LedgerEntry) return ledgerRepo;
        }
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(Account), useValue: accountRepo },
        { provide: getRepositoryToken(Transaction), useValue: txnRepo },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
  });

  const mockAccount = (id: string, balance: string, tier: number = 1) => ({
    id,
    balance,
    tier,
    status: 'ACTIVE',
    daily_debit_sum: '0',
    updated_at: new Date(),
  });

  it('successful transfer updates balances and creates ledger entries', async () => {
    const sender = mockAccount('acc1', '10000');
    const receiver = mockAccount('acc2', '5000');
    
    txnRepo.findOne.mockResolvedValue(null);
    accountRepo.find.mockResolvedValue([sender, receiver]);

    const result = await service.transfer({
      senderAccountId: 'acc1',
      receiverAccountId: 'acc2',
      amountCentimes: 2000,
      type: 'P2P',
      idempotencyKey: 'key1',
    });

    expect(result.status).toBe('COMPLETED');
    expect(sender.balance).toBe('8000');
    expect(receiver.balance).toBe('7000');
    expect(ledgerRepo.save).toHaveBeenCalled();
  });

  it('idempotency: same key returns identical transaction', async () => {
    const existingTxn = { id: 'txn-123', status: 'COMPLETED' };
    txnRepo.findOne.mockResolvedValue(existingTxn);

    const result = await service.transfer({
      senderAccountId: 'acc1',
      receiverAccountId: 'acc2',
      amountCentimes: 1000,
      type: 'P2P',
      idempotencyKey: 'key_idem',
    });

    expect(result.id).toBe('txn-123');
    expect(accountRepo.find).not.toHaveBeenCalled();
  });

  it('insufficient balance throws ForbiddenException', async () => {
    const sender = mockAccount('acc1', '500');
    const receiver = mockAccount('acc2', '5000');
    
    txnRepo.findOne.mockResolvedValue(null);
    accountRepo.find.mockResolvedValue([sender, receiver]);

    await expect(service.transfer({
      senderAccountId: 'acc1',
      receiverAccountId: 'acc2',
      amountCentimes: 1000,
      type: 'P2P',
      idempotencyKey: 'key_fail',
    })).rejects.toThrow(ForbiddenException);
  });

  it('daily tier limit breach throws ForbiddenException', async () => {
    const sender = mockAccount('acc1', '5000000', 1);
    const receiver = mockAccount('acc2', '5000', 1);
    
    txnRepo.findOne.mockResolvedValue(null);
    accountRepo.find.mockResolvedValue([sender, receiver]);

    await expect(service.transfer({
      senderAccountId: 'acc1',
      receiverAccountId: 'acc2',
      amountCentimes: 2100000,
      type: 'P2P',
      idempotencyKey: 'key_limit',
    })).rejects.toThrow(ForbiddenException);
  });

  it('self-transfer prevention throws BadRequestException', async () => {
    const sender = mockAccount('acc1', '10000');
    
    txnRepo.findOne.mockResolvedValue(null);
    accountRepo.find.mockResolvedValue([sender]);

    await expect(service.transfer({
      senderAccountId: 'acc1',
      receiverAccountId: 'acc1',
      amountCentimes: 1000,
      type: 'P2P',
      idempotencyKey: 'key_self',
    })).rejects.toThrow(BadRequestException);
  });

  it('concurrent transfer deadlock safety: deterministic ordering logic', async () => {
    // This test verifies that we are sorting IDs before querying
    const sender = mockAccount('B', '10000');
    const receiver = mockAccount('A', '10000');
    
    txnRepo.findOne.mockResolvedValue(null);
    accountRepo.find.mockResolvedValue([receiver, sender]);

    await service.transfer({
      senderAccountId: 'B',
      receiverAccountId: 'A',
      amountCentimes: 100,
      type: 'P2P',
      idempotencyKey: 'key_ba',
    });

    // Check if find was called with sorted IDs
    expect(accountRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: [{ id: 'A' }, { id: 'B' }]
    }));
  });
});
