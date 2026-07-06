import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { UserRole } from '../../types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  full_name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('text', { unique: true })
  payment_tag: string;

  @Column('int')
  kyc_level: number;

  @Column('text', { default: 'PENDING' })
  kyc_status: string;

  @Column('text', { default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;
}
