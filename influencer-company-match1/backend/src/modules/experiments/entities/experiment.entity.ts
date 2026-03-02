import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

@Entity('experiments')
export class Experiment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: ExperimentStatus;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb' })
  variants: Record<string, any>;

  @Column({ type: 'jsonb' })
  trafficAllocation: Record<string, number>;

  @Column({ length: 50 })
  successMetric: string;

  @Column({ default: 100 })
  minimumSampleSize: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.95 })
  confidenceLevel: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
