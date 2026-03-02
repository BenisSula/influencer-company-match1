import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'recommended_user_id' })
  recommendedUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recommended_user_id' })
  recommendedUser: User;

  @Column({ type: 'varchar', length: 50, name: 'recommendation_type' })
  recommendationType: 'personalized' | 'trending' | 'similar' | 'collaborative';

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'jsonb' })
  reasoning: {
    factors: string[];
    similarUsers?: string[];
    trendingScore?: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
