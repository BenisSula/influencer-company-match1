import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// Campaign entity will be created in Phase 6
// For now, we'll use a string reference
@Entity('campaign_invites')
@Index(['campaignId', 'influencer', 'status'])
export class CampaignInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  campaignId: string;

  @ManyToOne(() => User, { eager: true })
  influencer: User;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
