import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Experiment } from './experiment.entity';

@Entity('experiment_events')
export class ExperimentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  experimentId: string;

  @ManyToOne(() => Experiment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'experimentId' })
  experiment: Experiment;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 50 })
  variant: string;

  @Column({ length: 50 })
  eventType: string;

  @Column({ type: 'jsonb', nullable: true })
  eventData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
