import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Connection } from '../../matching/entities/connection.entity';

@Entity('profile_reviews')
@Index(['profileId', 'reviewerId', 'connectionId'], { unique: true, where: 'connection_id IS NOT NULL' })
export class ProfileReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id', type: 'uuid' })
  @Index()
  profileId: string;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  @Index()
  reviewerId: string;

  @Column({ name: 'connection_id', type: 'uuid', nullable: true })
  connectionId: string;

  @Column({ name: 'overall_rating', type: 'integer' })
  @Index()
  overallRating: number; // 1-5

  @Column({ name: 'communication_rating', type: 'integer', nullable: true })
  communicationRating: number;

  @Column({ name: 'professionalism_rating', type: 'integer', nullable: true })
  professionalismRating: number;

  @Column({ name: 'quality_rating', type: 'integer', nullable: true })
  qualityRating: number;

  @Column({ name: 'timeliness_rating', type: 'integer', nullable: true })
  timelinessRating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'collaboration_type', type: 'varchar', length: 100, nullable: true })
  collaborationType: string;

  @Column({ name: 'project_name', type: 'varchar', length: 255, nullable: true })
  projectName: string;

  @Column({ name: 'helpful_count', type: 'integer', default: 0 })
  helpfulCount: number;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => Connection, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'connection_id' })
  connection: Connection;
}
