import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('market_rates')
export class MarketRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  niche: string;

  @Column({ length: 20 })
  tier: string; // 'micro', 'mid', 'macro'

  @Column({ name: 'min_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minRate: number;

  @Column({ name: 'max_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxRate: number;

  @Column({ name: 'avg_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  avgRate: number;

  @Column({ name: 'avg_engagement_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgEngagementRate: number;

  @Column({ name: 'sample_size', type: 'int', default: 0 })
  sampleSize: number;

  @Column({ name: 'last_updated', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
