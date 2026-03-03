import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INFLUENCER,
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
  stripeAccountId: string;

  @Column({ nullable: true, name: 'stripe_customer_id' })
  stripeCustomerId: string;

  @Column({ default: false, name: 'stripe_onboarding_complete' })
  stripeOnboardingComplete: boolean;

  @Column({ default: false, name: 'email_verified' })
  emailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
