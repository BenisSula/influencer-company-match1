import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  HELD = 'held',
  RELEASED = 'released',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('collaboration_payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'collaboration_id', type: 'uuid', nullable: true })
  collaborationId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'influencer_id', type: 'uuid' })
  influencerId: string;

  @Column({ name: 'amount_total', type: 'decimal', precision: 10, scale: 2 })
  amountTotal: number;

  @Column({ name: 'amount_budget', type: 'decimal', precision: 10, scale: 2 })
  amountBudget: number;

  @Column({ name: 'amount_company_fee', type: 'decimal', precision: 10, scale: 2 })
  amountCompanyFee: number;

  @Column({ name: 'amount_influencer_fee', type: 'decimal', precision: 10, scale: 2 })
  amountInfluencerFee: number;

  @Column({ name: 'amount_platform_revenue', type: 'decimal', precision: 10, scale: 2 })
  amountPlatformRevenue: number;

  @Column({ type: 'varchar', length: 3, default: 'usd' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'payment_intent_id', type: 'varchar', length: 255, nullable: true })
  paymentIntentId: string;

  @Column({ name: 'client_secret', type: 'varchar', length: 255, nullable: true })
  clientSecret: string;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string;

  @Column({ name: 'transfer_id', type: 'varchar', length: 255, nullable: true })
  transferId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date;
}
