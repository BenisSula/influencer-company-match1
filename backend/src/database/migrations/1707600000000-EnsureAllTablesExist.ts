import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureAllTablesExist1707600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check and create ml_models table if it doesn't exist
    const mlModelsExists = await queryRunner.hasTable('ml_models');
    if (!mlModelsExists) {
      await queryRunner.query(`
        CREATE TABLE ml_models (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          version VARCHAR(50) NOT NULL,
          model_config JSONB NOT NULL,
          performance_metrics JSONB NOT NULL,
          is_active BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_ml_models_active ON ml_models(is_active);
      `);
    }

    // Check and create reactions table if it doesn't exist
    const reactionsExists = await queryRunner.hasTable('reactions');
    if (!reactionsExists) {
      await queryRunner.query(`
        CREATE TABLE reactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          target_type VARCHAR(50) NOT NULL,
          target_id UUID NOT NULL,
          reaction_type VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT uq_user_target UNIQUE (user_id, target_type, target_id)
        );
        CREATE INDEX idx_reactions_user_target ON reactions(user_id, target_type, target_id);
        CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
      `);
    }

    // Check and create match_training_data table if it doesn't exist
    const trainingDataExists = await queryRunner.hasTable('match_training_data');
    if (!trainingDataExists) {
      await queryRunner.query(`
        CREATE TABLE match_training_data (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          match_id UUID NOT NULL,
          features JSONB NOT NULL,
          outcome BOOLEAN NOT NULL,
          success_score INTEGER NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_training_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
        );
        CREATE INDEX idx_match_training_data_match_id ON match_training_data(match_id);
        CREATE INDEX idx_match_training_data_outcome ON match_training_data(outcome);
      `);
    }

    // Check and create recommendations table if it doesn't exist
    const recommendationsExists = await queryRunner.hasTable('recommendations');
    if (!recommendationsExists) {
      await queryRunner.query(`
        CREATE TABLE recommendations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          recommended_user_id UUID NOT NULL,
          recommendation_type VARCHAR(50) NOT NULL,
          score DECIMAL(5,2) NOT NULL,
          reasoning JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_recommendations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_recommendations_recommended FOREIGN KEY (recommended_user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
        CREATE INDEX idx_recommendations_type ON recommendations(recommendation_type);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Don't drop tables in down migration to prevent data loss
    console.log('Down migration skipped to prevent data loss');
  }
}
