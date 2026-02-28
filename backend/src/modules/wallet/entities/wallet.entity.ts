import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'available_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  availableBalance: number;

  @Column({
    name: 'pending_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  pendingBalance: number;

  @Column({
    name: 'total_earned',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalEarned: number;

  @Column({
    name: 'total_withdrawn',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalWithdrawn: number;

  @Column({ type: 'varchar', length: 3, default: 'usd' })
  currency: string;

  @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
