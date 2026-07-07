import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('merchant_links')
export class MerchantLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  userId: string;

  @Column('text')
  name: string;

  @Column({ type: 'bigint', default: 0 })
  amountCentimes: number;

  @Column('text', { default: 'Active' })
  status: string;

  @Column('int', { default: 0 })
  used: number;

  @Column({ type: 'bigint', default: 0 })
  revenue: number;

  @CreateDateColumn()
  created_at: Date;
}
