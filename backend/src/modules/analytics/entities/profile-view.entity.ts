import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('profile_views')
export class ProfileView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'viewer_id', nullable: true })
  viewerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'viewer_id' })
  viewer: User;

  @Column({ type: 'uuid', name: 'profile_id' })
  profileId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'profile_id' })
  profile: User;

  @Column({ type: 'integer', name: 'view_duration', nullable: true })
  viewDuration: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
