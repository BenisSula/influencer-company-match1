import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Campaign } from './campaign.entity';
import { CampaignApplication } from './campaign-application.entity';
import { CampaignMilestone } from './campaign-milestone.entity';

export enum CollaborationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id' })
  campaignId: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.collaborations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ name: 'application_id' })
  applicationId: string;

  @OneToOne(() => CampaignApplication, (application) => application.collaboration, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'application_id' })
  application: CampaignApplication;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: User;

  @Column({ name: 'influencer_id' })
  influencerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencer_id' })
  influencer: User;

  @Column({
    type: 'varchar',
    length: 50,
    default: CollaborationStatus.ACTIVE,
  })
  status: CollaborationStatus;

  @Column({ name: 'agreed_rate', type: 'int', nullable: true })
  agreedRate: number;

  @Column({ name: 'deliverables_status', type: 'jsonb', default: {} })
  deliverablesStatus: Record<string, any>;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @OneToMany(() => CampaignMilestone, (milestone) => milestone.collaboration)
  milestones: CampaignMilestone[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
