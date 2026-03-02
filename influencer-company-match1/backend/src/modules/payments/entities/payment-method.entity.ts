import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserType {
  COMPANY = 'company',
  INFLUENCER = 'influencer',
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'user_type',
    type: 'enum',
    enum: UserType,
  })
  userType: UserType;

  @Column({ name: 'method_type', type: 'varchar', length: 50 })
  methodType: string; // card, bank_account

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'stripe_payment_method_id', type: 'varchar', length: 255 })
  stripePaymentMethodId: string;

  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 255, nullable: true })
  stripeCustomerId: string;

  @Column({ name: 'card_last4', type: 'varchar', length: 4, nullable: true })
  cardLast4: string;

  @Column({ name: 'card_brand', type: 'varchar', length: 20, nullable: true })
  cardBrand: string;

  @Column({ name: 'card_exp_month', type: 'integer', nullable: true })
  cardExpMonth: number;

  @Column({ name: 'card_exp_year', type: 'integer', nullable: true })
  cardExpYear: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
