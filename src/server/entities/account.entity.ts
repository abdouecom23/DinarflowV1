import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { AccountTier, AccountStatus } from '../../types';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text', { unique: true })
  iban: string;

  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @Column({ type: 'int', default: AccountTier.LEVEL_1 })
  tier: AccountTier;

  @Column({ type: 'bigint', default: 0 })
  daily_debit_sum: number;

  @Column('int', { default: 1 })
  version: number;

  @Column('text', { default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
