import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('idempotency_keys')
export class Idempotency {
  @PrimaryColumn('text')
  key: string;

  @Column('text')
  responseBody: string;

  @Column('timestamp')
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
