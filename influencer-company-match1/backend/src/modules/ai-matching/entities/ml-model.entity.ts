import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ml_models')
export class MLModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'jsonb', name: 'model_config' })
  modelConfig: {
    weights: Record<string, number>;
    biases: Record<string, number>;
    hyperparameters: Record<string, any>;
  };

  @Column({ type: 'jsonb', name: 'performance_metrics' })
  performanceMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingSize: number;
  };

  @Column({ type: 'boolean', name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
