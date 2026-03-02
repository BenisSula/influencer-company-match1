import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Message } from '../../messaging/entities/message.entity';
import { FeedPost } from '../../feed/entities/feed-post.entity';

export enum UserRole {
  INFLUENCER = 'INFLUENCER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string; // Optional for delete operations

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INFLUENCER
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  profileCompleted: boolean;

  @Column({ default: 0 })
  profileCompletionPercentage: number;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true, name: 'stripe_account_id' })
  stripeAccountId: string; // For influencers (Stripe Connect accounts)

  @Column({ nullable: true, name: 'stripe_customer_id' })
  stripeCustomerId: string; // For companies (Stripe Customers)

  @Column({ default: false, name: 'stripe_onboarding_complete' })
  stripeOnboardingComplete: boolean;

  @Column({ default: false, name: 'email_verified' })
  emailVerified: boolean;

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => FeedPost, post => post.author)
  posts: FeedPost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties populated from profiles
  name?: string;
  avatar?: string;
  bio?: string;
  niche?: string;
  audienceSize?: number;
  engagementRate?: number;
  industry?: string;
  budget?: number;
  platforms?: string[];
  location?: string;
  profile?: {
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
  };
}
