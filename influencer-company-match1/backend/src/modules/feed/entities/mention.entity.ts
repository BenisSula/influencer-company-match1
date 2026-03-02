import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { FeedPost } from './feed-post.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('mentions')
@Index(['postId'])
@Index(['mentionedUserId'])
@Index(['mentionerUserId'])
export class Mention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => FeedPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: FeedPost;

  @Column({ name: 'mentioned_user_id' })
  mentionedUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentioned_user_id' })
  mentionedUser: User;

  @Column({ name: 'mentioner_user_id' })
  mentionerUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentioner_user_id' })
  mentionerUser: User;

  @Column({ name: 'position_start' })
  positionStart: number;

  @Column({ name: 'position_end' })
  positionEnd: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
