import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  name: string; // ✅ Fixed: matches migration (was companyName)

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true, type: 'int' })
  budget: number;

  @Column({ nullable: true, type: 'jsonb' })
  platforms: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, type: 'int' })
  minAudienceSize: number;

  @Column({ nullable: true, type: 'int' })
  maxAudienceSize: number;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  companySize: string; // 'startup', 'small', 'medium', 'large', 'enterprise'

  @Column('simple-array', { nullable: true })
  campaignType: string[]; // 'product-launch', 'brand-awareness', 'event', 'sponsored-content'

  @Column({ nullable: true, type: 'text' })
  preferredInfluencerNiches: string;

  @Column({ nullable: true })
  collaborationDuration: string; // 'short-term', 'medium-term', 'long-term'

  @Column({ default: false })
  verificationStatus: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
