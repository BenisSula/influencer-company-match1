import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted', // ✅ Removed CONNECTED, use ACCEPTED only
  REJECTED = 'rejected'
}

export enum CollaborationStatus {
  REQUESTED = 'requested',
  NEGOTIATING = 'negotiating',
  AGREED = 'agreed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CollaborationType {
  ONE_TIME = 'one-time',
  ONGOING = 'ongoing',
  PROJECT_BASED = 'project-based'
}

export interface CollaborationRequestData {
  // Core
  message: string;
  
  // Project
  projectTitle?: string;
  projectDescription?: string;
  
  // Budget
  budgetMin?: number;
  budgetMax?: number;
  
  // Timeline
  timeline?: string;
  startDate?: string;
  endDate?: string;
  
  // Deliverables
  deliverables?: string[];
  platforms?: string[];
  
  // Type
  collaborationType?: CollaborationType;
  
  // Additional
  additionalNotes?: string;
}

@Entity('connections')
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesterId: string;

  @Column()
  recipientId: string;

  // Relations removed - we load user data manually to avoid TypeORM relation issues
  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'requesterId' })
  // requester: User;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'recipientId' })
  // recipient: User;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING
  })
  status: ConnectionStatus;

  // New collaboration fields
  @Column({
    name: 'collaboration_request_data',
    type: 'jsonb',
    nullable: true,
  })
  collaborationRequestData?: CollaborationRequestData;

  @Column({
    name: 'collaboration_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  collaborationStatus?: CollaborationStatus;

  @Column({
    name: 'collaboration_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  collaborationType?: CollaborationType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
