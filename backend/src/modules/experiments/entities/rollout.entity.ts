import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type RolloutStatus = 'pending' | 'in_progress' | 'completed' | 'rolled_back';

export interface RolloutSchedule {
  startTime: Date;
  stages: RolloutStage[];
}

export interface RolloutStage {
  percentage: number;
  durationHours: number;
}

@Entity('rollouts')
export class Rollout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50 })
  modelVersion: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: RolloutStatus;

  @Column({ default: 0 })
  currentPercentage: number;

  @Column({ default: 100 })
  targetPercentage: number;

  @Column({ type: 'jsonb' })
  schedule: RolloutSchedule;

  @Column({ type: 'jsonb', nullable: true })
  healthMetrics: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
