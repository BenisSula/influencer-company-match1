import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CampaignApplication } from './campaign-application.entity';
import { Collaboration } from './collaboration.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  COMPLETED = 'completed',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: User;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  requirements: string;

  @Column({ name: 'budget_min', type: 'int', nullable: true })
  budgetMin: number;

  @Column({ name: 'budget_max', type: 'int', nullable: true })
  budgetMax: number;

  @Column({ length: 100, nullable: true })
  niche: string;

  @Column('text', { array: true, nullable: true })
  platforms: string[];

  @Column('text', { nullable: true })
  deliverables: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'application_deadline', type: 'date', nullable: true })
  applicationDeadline: Date;

  @OneToMany(() => CampaignApplication, (application) => application.campaign)
  applications: CampaignApplication[];

  @OneToMany(() => Collaboration, (collaboration) => collaboration.campaign)
  collaborations: Collaboration[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
