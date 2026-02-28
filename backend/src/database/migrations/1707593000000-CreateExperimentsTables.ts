import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExperimentsTables1707593000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create experiments table
    await queryRunner.query(`
      CREATE TABLE experiments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        variants JSONB NOT NULL,
        traffic_allocation JSONB NOT NULL,
        success_metric VARCHAR(50) NOT NULL,
        minimum_sample_size INTEGER DEFAULT 100,
        confidence_level DECIMAL(3,2) DEFAULT 0.95,
        created_by UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create experiment_assignments table
    await queryRunner.query(`
      CREATE TABLE experiment_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        variant VARCHAR(50) NOT NULL,
        assigned_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(experiment_id, user_id)
      );
    `);

    // Create experiment_events table
    await queryRunner.query(`
      CREATE TABLE experiment_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        variant VARCHAR(50) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create rollouts table
    await queryRunner.query(`
      CREATE TABLE rollouts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        model_version VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        current_percentage INTEGER DEFAULT 0,
        target_percentage INTEGER DEFAULT 100,
        schedule JSONB NOT NULL,
        health_metrics JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX idx_experiments_status ON experiments(status);
      CREATE INDEX idx_experiments_created_at ON experiments(created_at);
      CREATE INDEX idx_experiment_assignments_user ON experiment_assignments(user_id);
      CREATE INDEX idx_experiment_assignments_experiment ON experiment_assignments(experiment_id);
      CREATE INDEX idx_experiment_events_experiment ON experiment_events(experiment_id);
      CREATE INDEX idx_experiment_events_created ON experiment_events(created_at);
      CREATE INDEX idx_experiment_events_variant ON experiment_events(variant);
      CREATE INDEX idx_rollouts_status ON rollouts(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_rollouts_status;
      DROP INDEX IF EXISTS idx_experiment_events_variant;
      DROP INDEX IF EXISTS idx_experiment_events_created;
      DROP INDEX IF EXISTS idx_experiment_events_experiment;
      DROP INDEX IF EXISTS idx_experiment_assignments_experiment;
      DROP INDEX IF EXISTS idx_experiment_assignments_user;
      DROP INDEX IF EXISTS idx_experiments_created_at;
      DROP INDEX IF EXISTS idx_experiments_status;
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS rollouts;`);
    await queryRunner.query(`DROP TABLE IF EXISTS experiment_events;`);
    await queryRunner.query(`DROP TABLE IF EXISTS experiment_assignments;`);
    await queryRunner.query(`DROP TABLE IF EXISTS experiments;`);
  }
}
