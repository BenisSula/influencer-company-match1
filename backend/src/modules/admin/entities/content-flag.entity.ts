import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { AdminUser } from './admin-user.entity';

@Entity('content_flags')
export class ContentFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_type' })
  contentType: string; // 'POST', 'COMMENT', 'MESSAGE', 'PROFILE', 'CAMPAIGN'

  @Column({ name: 'content_id' })
  contentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'reporter_id' })
  reporterId: string;

  @Column()
  reason: string; // 'SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'FAKE', 'OTHER'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'REMOVED'],
    default: 'PENDING',
  })
  status: string;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: AdminUser;

  @Column({ name: 'reviewed_by_id', nullable: true })
  reviewedById: string;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'review_notes' })
  reviewNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Additional context about the flagged content

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
