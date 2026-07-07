import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Account } from './account.entity';

@Entity('investment_holdings')
export class InvestmentHolding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  @Index()
  account: Account;

  @Column('varchar')
  symbol: string;

  @Column('varchar')
  name: string;

  @Column('float')
  shares: number;

  @Column('float')
  averagePrice: number;

  @Column('float')
  totalCost: number;
}
