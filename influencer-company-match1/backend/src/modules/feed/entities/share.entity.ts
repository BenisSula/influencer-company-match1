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

export enum ShareType {
  FEED = 'feed',
  MESSAGE = 'message',
  LINK = 'link',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
}

export enum ItemType {
  POST = 'post',
  CAMPAIGN = 'campaign',
  MATCH = 'match',
}

@Entity('shares')
@Index(['itemType', 'itemId'])
@Index(['userId'])
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'item_type',
    type: 'varchar',
    length: 50,
  })
  itemType: ItemType;

  @Column({ name: 'item_id' })
  itemId: string;

  @Column({
    name: 'share_type',
    type: 'varchar',
    length: 50,
  })
  shareType: ShareType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
