import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  transactionId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column('text')
  direction: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ name: 'balanceafter', type: 'bigint' })
  balanceAfter: number;

  @CreateDateColumn()
  ts: Date;
}
