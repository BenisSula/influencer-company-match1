import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('landing_activities')
export class LandingActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  activityType: string; // 'match', 'collaboration', 'signup', etc.

  @Column({ length: 100 })
  userName: string;

  @Column({ length: 50, nullable: true })
  userRole: string; // 'influencer', 'company'

  @Column({ length: 100, nullable: true })
  companyName: string;

  @Column({ length: 200, nullable: true })
  description: string; // Human-readable activity description

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional activity data

  @CreateDateColumn()
  createdAt: Date;
}
