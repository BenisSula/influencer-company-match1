import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { AdminUser } from './admin-user.entity';

@Entity('user_bans')
export class UserBan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => AdminUser)
  @JoinColumn({ name: 'banned_by_id' })
  bannedBy: AdminUser;

  @Column({ name: 'banned_by_id' })
  bannedById: string;

  @Column()
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: ['TEMPORARY', 'PERMANENT'],
    default: 'TEMPORARY',
  })
  type: string;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
