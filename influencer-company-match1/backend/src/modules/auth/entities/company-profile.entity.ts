import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  name: string; // ✅ Changed from companyName to name for consistency

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
  companySize: string;

  @Column({ nullable: true, type: 'jsonb' })
  campaignType: string[];

  @Column({ nullable: true, type: 'text' })
  preferredInfluencerNiches: string;

  @Column({ nullable: true })
  collaborationDuration: string;

  @Column({ default: false })
  verificationStatus: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
