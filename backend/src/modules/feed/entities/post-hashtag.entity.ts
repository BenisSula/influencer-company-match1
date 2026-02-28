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
import { Hashtag } from './hashtag.entity';

@Entity('post_hashtags')
@Index(['postId'])
@Index(['hashtagId'])
export class PostHashtag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => FeedPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: FeedPost;

  @Column({ name: 'hashtag_id' })
  hashtagId: string;

  @ManyToOne(() => Hashtag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hashtag_id' })
  hashtag: Hashtag;

  @Column({ name: 'position_start' })
  positionStart: number;

  @Column({ name: 'position_end' })
  positionEnd: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
