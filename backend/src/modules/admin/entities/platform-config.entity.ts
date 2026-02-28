import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('platform_configs')
export class PlatformConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'jsonb' })
  branding: {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    successColor: string;
    warningColor: string;
    infoColor: string;
    fontFamily: string;
    platformName: string;
    tagline: string;
    footerText: string;
    customCSS: string;
  };

  @Column({ type: 'jsonb' })
  features: {
    enableCampaigns: boolean;
    enableMessaging: boolean;
    enableFeed: boolean;
    enableAIMatching: boolean;
    enableAnalytics: boolean;
    enableReviews: boolean;
    enableSearch: boolean;
    enableNotifications: boolean;
    enableCollaborations: boolean;
  };

  @Column({ type: 'jsonb' })
  limits: {
    maxUsersPerTenant: number;
    maxCampaignsPerUser: number;
    maxMessagesPerDay: number;
    maxFileUploadSize: number; // in MB
    maxStoragePerTenant: number; // in GB
    maxConnectionsPerUser: number;
  };

  @Column({ type: 'jsonb' })
  integrations: {
    stripe: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
    };
    sendgrid: {
      enabled: boolean;
      apiKey: string;
      fromEmail: string;
      fromName: string;
    };
    aws: {
      enabled: boolean;
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
      region: string;
    };
    google: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    ogImage: string;
    twitterCard: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
