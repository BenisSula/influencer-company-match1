import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum NotificationType {
  COLLABORATION_REQUEST = 'collaboration_request',
  COLLABORATION_ACCEPTED = 'collaboration_accepted',
  COLLABORATION_REJECTED = 'collaboration_rejected',
  CONNECTION_REQUEST = 'connection_request',
  CONNECTION_ACCEPTED = 'connection_accepted',
  PROFILE_VIEW = 'profile_view',
  MATCH_FOUND = 'match_found',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipientId: string;

  // Relations removed - we load user data manually to avoid TypeORM relation issues
  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'recipientId' })
  // recipient: User;

  @Column()
  senderId: string;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'senderId' })
  // sender: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
