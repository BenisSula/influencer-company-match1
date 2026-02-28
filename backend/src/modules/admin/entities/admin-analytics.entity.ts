import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('admin_analytics')
export class AdminAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'jsonb' })
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalRevenue: number;
    mrr: number;
    churnRate: number;
    totalMatches: number;
    successfulMatches: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalMessages: number;
    avgResponseTime: number;
    totalConnections: number;
    totalPosts: number;
    engagementRate: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
