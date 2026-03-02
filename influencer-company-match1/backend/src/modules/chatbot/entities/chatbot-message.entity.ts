import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ChatbotConversation } from './chatbot-conversation.entity';

@Entity('chatbot_messages')
export class ChatbotMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => ChatbotConversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ChatbotConversation;

  @Column({ name: 'sender_type' })
  senderType: 'user' | 'bot';

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  intent: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidence: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ name: 'is_sensitive', default: false })
  isSensitive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
