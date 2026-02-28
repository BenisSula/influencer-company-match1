import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAIMatchingTables1707590000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create match_training_data table
    await queryRunner.createTable(
      new Table({
        name: 'match_training_data',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'match_id',
            type: 'uuid',
          },
          {
            name: 'features',
            type: 'jsonb',
          },
          {
            name: 'outcome',
            type: 'boolean',
          },
          {
            name: 'success_score',
            type: 'integer',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'match_training_data',
      new TableForeignKey({
        columnNames: ['match_id'],
        referencedTableName: 'matches',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create ml_models table
    await queryRunner.createTable(
      new Table({
        name: 'ml_models',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'version',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'model_config',
            type: 'jsonb',
          },
          {
            name: 'performance_metrics',
            type: 'jsonb',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create recommendations table
    await queryRunner.createTable(
      new Table({
        name: 'recommendations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'recommended_user_id',
            type: 'uuid',
          },
          {
            name: 'recommendation_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'score',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'reasoning',
            type: 'jsonb',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'recommendations',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'recommendations',
      new TableForeignKey({
        columnNames: ['recommended_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes with IF NOT EXISTS
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_match_training_data_match_id ON match_training_data(match_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_match_training_data_outcome ON match_training_data(outcome)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ml_models_active ON ml_models(is_active)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(recommendation_type)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('recommendations');
    await queryRunner.dropTable('ml_models');
    await queryRunner.dropTable('match_training_data');
  }
}
