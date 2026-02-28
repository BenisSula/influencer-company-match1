import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  name: string;

  @Column()
  slug: string; // welcome_email, password_reset, etc.

  @Column()
  subject: string;

  @Column({ type: 'text' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true })
  textContent: string;

  @Column({ type: 'jsonb' })
  variables: string[]; // Available variables like {{userName}}, {{platformName}}

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    category: string; // 'transactional', 'marketing', 'notification'
    description: string;
    previewText: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean; // System default template

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
