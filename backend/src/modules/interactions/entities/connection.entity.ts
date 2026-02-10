import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('connections')
@Index(['user1', 'user2'], { unique: true })
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user1: User;

  @ManyToOne(() => User, { eager: true })
  user2: User;

  @CreateDateColumn()
  createdAt: Date;
}
