import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('matches')
@Index(['influencer', 'company'])
@Index(['score'])
@Index(['tier'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  influencer: User;

  @ManyToOne(() => User)
  company: User;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column()
  tier: string; // 'Perfect', 'Excellent', 'Good', 'Fair'

  @Column({ type: 'json', nullable: true })
  scoreBreakdown: {
    nicheCompatibility: number;
    locationCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    audienceSizeMatch: number;
    engagementTierMatch: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  cachedUntil: Date;
}
