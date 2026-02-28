import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Privacy Settings
  @Column({ name: 'profile_visibility', default: 'public' })
  profileVisibility: string; // 'public' | 'connections' | 'private'

  @Column({ name: 'show_in_search', default: true })
  showInSearch: boolean;

  @Column({ name: 'show_activity_status', default: true })
  showActivityStatus: boolean;

  @Column({ name: 'show_in_public_feed', default: true })
  showInPublicFeed: boolean; // Show activities in public landing page feed

  @Column({ name: 'message_permission', default: 'everyone' })
  messagePermission: string; // 'everyone' | 'connections' | 'none'

  @Column({ name: 'email_visibility', default: 'none' })
  emailVisibility: string; // 'none' | 'connections' | 'everyone'

  // Notification Settings
  @Column({ name: 'email_new_match', default: true })
  emailNewMatch: boolean;

  @Column({ name: 'email_new_message', default: true })
  emailNewMessage: boolean;

  @Column({ name: 'email_connection_request', default: true })
  emailConnectionRequest: boolean;

  @Column({ name: 'email_post_interactions', default: true })
  emailPostInteractions: boolean;

  @Column({ name: 'email_weekly_summary', default: true })
  emailWeeklySummary: boolean;

  @Column({ name: 'email_marketing', default: false })
  emailMarketing: boolean;

  // Communication Settings
  @Column({ name: 'read_receipts', default: true })
  readReceipts: boolean;

  @Column({ name: 'typing_indicators', default: true })
  typingIndicators: boolean;

  // Preferences
  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
