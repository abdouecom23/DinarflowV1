import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  level: string;

  @Column('text', { nullable: true })
  context: string;

  @Column('text')
  message: string;

  @CreateDateColumn()
  timestamp: Date;
}
