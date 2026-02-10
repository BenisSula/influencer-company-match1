import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('bookmarks')
@Index(['user', 'bookmarkedProfile'], { unique: true })
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => User, { eager: true })
  bookmarkedProfile: User;

  @CreateDateColumn()
  createdAt: Date;
}
