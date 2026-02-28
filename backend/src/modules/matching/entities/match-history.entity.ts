import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('match_history')
export class MatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'match_user_id' })
  matchUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'match_user_id' })
  matchUser: User;

  @Column({ type: 'integer' })
  score: number;

  @Column({ type: 'jsonb' })
  factors: {
    nicheCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    engagementTierMatch: number;
    audienceSizeMatch: number;
    locationCompatibility: number;
  };

  @Column({ type: 'jsonb', name: 'user_weights', nullable: true })
  userWeights?: Record<string, number>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
