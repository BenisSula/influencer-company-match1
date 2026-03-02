import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('industry_benchmarks')
export class IndustryBenchmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'metric_name', length: 50 })
  metricName: string;

  @Column({ length: 50, nullable: true })
  niche: string;

  @Column({ name: 'metric_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  metricValue: number;

  @Column({ name: 'sample_size', type: 'int', default: 0 })
  sampleSize: number;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceLevel: number;

  @Column({ name: 'last_calculated', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastCalculated: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
