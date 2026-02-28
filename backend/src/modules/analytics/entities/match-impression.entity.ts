import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('match_impressions')
export class MatchImpression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'match_user_id' })
  matchUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'match_user_id' })
  matchUser: User;

  @Column({ type: 'integer', name: 'match_score' })
  matchScore: number;

  @Column({ type: 'integer' })
  position: number;

  @Column({ type: 'boolean', default: false })
  clicked: boolean;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
