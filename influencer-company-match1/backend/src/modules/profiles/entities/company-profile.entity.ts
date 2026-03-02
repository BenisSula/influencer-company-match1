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

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  companyName: string;

  @Column()
  industry: string;

  @Column({ type: 'int' })
  budget: number;

  @Column('simple-array')
  targetPlatforms: string[];

  @Column({ nullable: true })
  targetLocation: string;

  @Column({ type: 'int', nullable: true })
  minAudienceSize: number;

  @Column({ type: 'int', nullable: true })
  maxAudienceSize: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  website: string;

  // Phase 1: Enhanced Profile Fields
  @Column({ nullable: true })
  companySize: string; // 'startup', 'small', 'medium', 'large', 'enterprise'

  @Column('simple-array', { nullable: true })
  campaignType: string[]; // ['product-launch', 'brand-awareness', 'event', 'sponsored-content']

  @Column('simple-array', { nullable: true })
  preferredInfluencerNiches: string[];

  @Column({ nullable: true })
  collaborationDuration: string; // 'short-term', 'medium-term', 'long-term'

  @Column({ default: false })
  verificationStatus: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
