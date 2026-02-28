import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AdminUser } from './admin-user.entity';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  CANCELLED = 'CANCELLED'
}

export enum SubscriptionTier {
  TRIAL = 'TRIAL',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  subdomain: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.TRIAL })
  subscriptionTier: SubscriptionTier;

  @Column({ type: 'jsonb', nullable: true })
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    customCss?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  features: {
    maxUsers?: number;
    maxMatches?: number;
    aiMatching?: boolean;
    analytics?: boolean;
    customBranding?: boolean;
    apiAccess?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndsAt: Date;

  @OneToMany(() => AdminUser, adminUser => adminUser.tenant)
  adminUsers: AdminUser[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
