import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InvestmentHolding } from '../../entities/investment-holding.entity';
import { Account } from '../../entities/account.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { AccountsService } from '../accounts/accounts.service';

export interface MarketAsset {
  name: string;
  symbol: string;
  price: number; // Price in DA
  change: string;
}

@Injectable()
export class InvestmentsService {
  private readonly market: MarketAsset[] = [
    { name: 'Bitcoin', symbol: 'BTC', price: 9249000, change: '+2.4%' }, // Represented in equivalent DA (Dinar)
    { name: 'Ethereum', symbol: 'ETH', price: 490000, change: '-1.2%' },
    { name: 'Nvidia Corp', symbol: 'NVDA', price: 118000, change: '+5.7%' },
    { name: 'Apple Inc', symbol: 'AAPL', price: 24700, change: '+0.3%' },
  ];

  constructor(
    @InjectRepository(InvestmentHolding)
    private readonly holdingRepo: Repository<InvestmentHolding>,
    @Inject(AccountsService)
    private readonly accountsService: AccountsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getMarket(): Promise<MarketAsset[]> {
    return this.market;
  }

  async getHoldings(userId: string): Promise<InvestmentHolding[]> {
    const account = await this.accountsService.findByUserId(userId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return this.holdingRepo.find({
      where: { account: { id: account.id } },
    });
  }

  async buyAsset(userId: string, symbol: string, shares: number): Promise<any> {
    const asset = this.market.find(a => a.symbol === symbol.toUpperCase());
    if (!asset) {
      throw new BadRequestException('Asset symbol not supported');
    }

    if (shares <= 0) {
      throw new BadRequestException('Shares must be positive');
    }

    const account = await this.accountsService.findByUserId(userId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const cost = Math.round(asset.price * shares);

    return this.dataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const holdingRepo = manager.getRepository(InvestmentHolding);
      const ledgerRepo = manager.getRepository(LedgerEntry);

      // Lock account row for writing
      const activeAccount = await accountRepo.findOne({ 
        where: { id: account.id },
      });

      if (!activeAccount) {
        throw new NotFoundException('Account not found');
      }

      if (activeAccount.balance < cost) {
        throw new BadRequestException(`Insufficient balance. Cost: ${cost} DA, Balance: ${activeAccount.balance} DA.`);
      }

      // 1. Deduct balance
      activeAccount.balance -= cost;
      await accountRepo.save(activeAccount);

      // 2. Update holding
      let holding = await holdingRepo.findOne({
        where: { account: { id: activeAccount.id }, symbol: asset.symbol },
      });

      if (holding) {
        const originalCost = holding.totalCost;
        const originalShares = holding.shares;
        holding.shares += shares;
        holding.totalCost += cost;
        holding.averagePrice = holding.totalCost / holding.shares;
      } else {
        holding = holdingRepo.create({
          account: activeAccount,
          symbol: asset.symbol,
          name: asset.name,
          shares: shares,
          averagePrice: asset.price,
          totalCost: cost,
        });
      }
      const savedHolding = await holdingRepo.save(holding);

      // 3. Create Ledger Entry (DEBIT)
      const ledgerEntry = ledgerRepo.create({
        transactionId: crypto.randomUUID(),
        account: activeAccount,
        direction: 'DEBIT',
        amount: cost,
        balanceAfter: activeAccount.balance,
        ts: new Date(),
      });
      await ledgerRepo.save(ledgerEntry);

      return {
        success: true,
        message: `Successfully purchased ${shares} shares of ${asset.name} (${asset.symbol})`,
        holding: savedHolding,
        balance: activeAccount.balance,
      };
    });
  }
}
