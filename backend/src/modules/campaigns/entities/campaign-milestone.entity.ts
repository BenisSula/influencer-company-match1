import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Collaboration } from './collaboration.entity';

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

@Entity('campaign_milestones')
export class CampaignMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'collaboration_id' })
  collaborationId: string;

  @ManyToOne(() => Collaboration, (collaboration) => collaboration.milestones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collaboration_id' })
  collaboration: Collaboration;

  @Column({ length: 200 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: MilestoneStatus.PENDING,
  })
  status: MilestoneStatus;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
