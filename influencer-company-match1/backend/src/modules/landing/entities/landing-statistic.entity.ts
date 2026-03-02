import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('landing_statistics')
export class LandingStatistic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  metricName: string;

  @Column('bigint')
  metricValue: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdated: Date;
}
