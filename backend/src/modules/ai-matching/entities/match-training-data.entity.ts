import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from '../../matching/entities/match.entity';

@Entity('match_training_data')
export class MatchTrainingData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ type: 'jsonb' })
  features: {
    nicheAlignment: number;
    audienceMatch: number;
    engagementRate: number;
    brandFit: number;
    locationMatch: number;
    budgetAlignment: number;
    contentQuality: number;
    responseRate: number;
  };

  @Column({ type: 'boolean' })
  outcome: boolean;

  @Column({ type: 'integer', name: 'success_score' })
  successScore: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
