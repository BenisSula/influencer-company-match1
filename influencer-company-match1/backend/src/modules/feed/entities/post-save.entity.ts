import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { FeedPost } from './feed-post.entity';
import { Collection } from './collection.entity';

@Entity('post_saves')
@Index(['postId', 'userId'], { unique: true })
export class PostSave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => FeedPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: FeedPost;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'collection_id', nullable: true })
  collectionId: string;

  @ManyToOne(() => Collection, (collection) => collection.savedItems, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @CreateDateColumn()
  createdAt: Date;
}
