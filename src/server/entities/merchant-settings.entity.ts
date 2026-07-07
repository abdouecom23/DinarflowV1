import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('merchant_settings')
export class MerchantSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  userId: string;

  @Column('text', { default: 'TechDZ Store' })
  businessName: string;

  @Column('text', { default: 'PENDING' }) // PENDING, VERIFIED
  kycStatus: string;

  @Column('text', { nullable: true })
  rcDocument: string;

  @Column('text', { nullable: true })
  nifDocument: string;

  @Column('boolean', { default: false })
  apiKeysEnabled: boolean;

  @Column('text', { default: 'Admin' })
  teamPermissions: string;

  @Column('text', { default: '' })
  bankAccount: string;

  @CreateDateColumn()
  created_at: Date;
}
