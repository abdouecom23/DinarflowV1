import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', { default: false })
  maintenanceMode: boolean;

  @Column('boolean', { default: true })
  sandboxMode: boolean;

  @Column('boolean', { default: true })
  autoSettlement: boolean;

  @Column('boolean', { default: false })
  manualReview: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
