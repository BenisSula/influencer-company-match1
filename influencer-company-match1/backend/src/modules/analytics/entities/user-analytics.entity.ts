import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('user_analytics')
export class UserAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer', name: 'total_profile_views', default: 0 })
  totalProfileViews: number;

  @Column({ type: 'integer', name: 'total_match_impressions', default: 0 })
  totalMatchImpressions: number;

  @Column({ type: 'integer', name: 'total_profile_clicks', default: 0 })
  totalProfileClicks: number;

  @Column({ type: 'integer', name: 'total_connections_sent', default: 0 })
  totalConnectionsSent: number;

  @Column({ type: 'integer', name: 'total_connections_received', default: 0 })
  totalConnectionsReceived: number;

  @Column({ type: 'integer', name: 'total_messages_sent', default: 0 })
  totalMessagesSent: number;

  @Column({ type: 'integer', name: 'total_messages_received', default: 0 })
  totalMessagesReceived: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'response_rate', default: 0 })
  responseRate: number;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
