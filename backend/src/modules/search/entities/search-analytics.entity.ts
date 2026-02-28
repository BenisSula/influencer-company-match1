import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('search_analytics')
export class SearchAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  query: string;

  @Column({ name: 'result_type', type: 'varchar', length: 50, nullable: true })
  resultType: string;

  @Column({ name: 'result_count', type: 'int', default: 0 })
  resultCount: number;

  @Column({ name: 'clicked_result_id', type: 'uuid', nullable: true })
  clickedResultId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
