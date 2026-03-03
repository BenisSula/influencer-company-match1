import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('influencer_profiles')
export class InfluencerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'uuid' })
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

  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 2 })
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

  @Column('simple-array', { nullable: true, name: 'contentType' })
  contentType: string[]; // ✅ Types of content creator produces (video, image, blog, etc.)

  @Column({ default: false, name: 'verificationStatus' })
  verificationStatus: boolean; // ✅ Whether influencer is verified

  @Column({ type: 'json', nullable: true })
  mediaGallery: MediaItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Media item interface for gallery
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}
