import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum PostType {
  UPDATE = 'update',
  COLLABORATION_STORY = 'collaboration_story',
  CAMPAIGN_ANNOUNCEMENT = 'campaign_announcement',
  PORTFOLIO = 'portfolio',
}

@Entity('feed_posts')
@Index(['authorId', 'createdAt'])
export class FeedPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.UPDATE,
  })
  postType: PostType;

  @Column('simple-array', { nullable: true })
  mediaUrls: string[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
