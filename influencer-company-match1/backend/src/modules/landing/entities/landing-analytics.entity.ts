import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('landing_analytics')
export class LandingAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  visitorId: string;

  @Column({ length: 50 })
  pageSection: string;

  @Column({ length: 50 })
  actionType: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
