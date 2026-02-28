import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Connection } from '../../matching/entities/connection.entity';

@Entity('collaboration_outcomes')
export class CollaborationOutcome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'connection_id' })
  connectionId: string;

  @ManyToOne(() => Connection)
  @JoinColumn({ name: 'connection_id' })
  connection: Connection;

  @Column({ type: 'integer', name: 'success_rating' })
  successRating: number; // 1-5 stars

  @Column({ type: 'varchar', length: 50, name: 'completion_status' })
  completionStatus: string; // completed, cancelled, ongoing

  @Column({ type: 'text', nullable: true, name: 'user_feedback' })
  userFeedback?: string;

  @Column({ type: 'jsonb', name: 'factors_at_match' })
  factorsAtMatch: {
    nicheAlignment: number;
    audienceMatch: number;
    engagementRate: number;
    brandFit: number;
    locationMatch: number;
    budgetAlignment: number;
    contentQuality: number;
    responseRate: number;
    accountAge: number;
    activityScore: number;
    networkStrength: number;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'roi_achieved' })
  roiAchieved?: number;

  @Column({ type: 'boolean', name: 'would_collaborate_again' })
  wouldCollaborateAgain: boolean;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
