import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencerId: string;

  @Column()
  companyId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'influencerId' })
  influencer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companyId' })
  company: User;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'jsonb', nullable: true })
  factors: any;

  @CreateDateColumn()
  createdAt: Date;
}
