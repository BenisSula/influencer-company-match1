import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Experiment } from './experiment.entity';

@Entity('experiment_assignments')
@Unique(['experimentId', 'userId'])
export class ExperimentAssignment {
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

  @CreateDateColumn()
  assignedAt: Date;
}
