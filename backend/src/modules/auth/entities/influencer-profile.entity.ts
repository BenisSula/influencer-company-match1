import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('influencer_profiles')
export class InfluencerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  niche: string;

  @Column({ nullable: true, type: 'int' })
  audienceSize: number;

  @Column({ nullable: true, type: 'decimal' })
  engagementRate: number;

  @Column({ nullable: true, type: 'jsonb' })
  platforms: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, type: 'int' })
  minBudget: number;

  @Column({ nullable: true, type: 'int' })
  maxBudget: number;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @Column({ nullable: true })
  collaborationPreference: string;

  @Column({ nullable: true, type: 'simple-array', name: 'contenttype' })
  contentType: string[]; // ✅ Added: Types of content creator produces (video, image, blog, etc.)

  @Column({ default: false, name: 'verificationstatus' })
  verificationStatus: boolean; // ✅ Added: Whether influencer is verified

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
