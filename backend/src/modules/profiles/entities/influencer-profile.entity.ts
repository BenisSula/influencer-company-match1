import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('influencer_profiles')
export class InfluencerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  niche: string;

  @Column({ type: 'int' })
  audienceSize: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  engagementRate: number;

  @Column('simple-array')
  platforms: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'int', nullable: true })
  minBudget: number;

  @Column({ type: 'int', nullable: true })
  maxBudget: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  // Phase 1: Enhanced Profile Fields
  @Column('simple-array', { nullable: true })
  contentType: string[]; // ['video', 'image', 'blog', 'podcast']

  @Column({ nullable: true })
  collaborationPreference: string; // 'one-time', 'long-term', 'flexible'

  @Column({ default: false })
  verificationStatus: boolean;

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
