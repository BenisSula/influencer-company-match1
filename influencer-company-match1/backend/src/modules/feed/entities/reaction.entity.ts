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

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  WOW = 'wow',
  HAHA = 'haha',
  SAD = 'sad',
  ANGRY = 'angry',
}

export enum TargetType {
  POST = 'post',
  COMMENT = 'comment',
  MATCH = 'match',
}

@Entity('reactions')
@Index(['userId', 'targetType', 'targetId'])
@Index(['targetType', 'targetId'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'target_type',
    type: 'varchar',
    length: 50,
  })
  targetType: TargetType;

  @Column({ name: 'target_id' })
  targetId: string;

  @Column({
    name: 'reaction_type',
    type: 'varchar',
    length: 20,
  })
  reactionType: ReactionType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
