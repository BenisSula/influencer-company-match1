import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user1_id' })
  user1Id: string;

  @Column({ name: 'user2_id' })
  user2Id: string;

  // Relations removed - we load user data manually to avoid TypeORM relation issues
  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'user1_id' })
  // user1: User;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'user2_id' })
  // user2: User;

  // Virtual properties populated manually
  user1?: any;
  user2?: any;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ name: 'last_message', type: 'text', nullable: true })
  lastMessage: string;

  @Column({ name: 'unread_count_1', default: 0 })
  unreadCount1: number;

  @Column({ name: 'unread_count_2', default: 0 })
  unreadCount2: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
