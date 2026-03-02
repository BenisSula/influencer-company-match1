import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAnalyticsTables1707602000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Profile Views Table
    await queryRunner.createTable(
      new Table({
        name: 'profile_views',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'viewer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'profile_id',
            type: 'uuid',
          },
          {
            name: 'view_duration',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'source',
            type: 'varchar',
            length: '50',
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

    // Match Impressions Table
    await queryRunner.createTable(
      new Table({
        name: 'match_impressions',
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
            name: 'match_user_id',
            type: 'uuid',
          },
          {
            name: 'match_score',
            type: 'integer',
          },
          {
            name: 'position',
            type: 'integer',
          },
          {
            name: 'clicked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'source',
            type: 'varchar',
            length: '50',
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

    // User Analytics Summary Table
    await queryRunner.createTable(
      new Table({
        name: 'user_analytics',
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
            isUnique: true,
          },
          {
            name: 'total_profile_views',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_match_impressions',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_profile_clicks',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_connections_sent',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_connections_received',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_messages_sent',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_messages_received',
            type: 'integer',
            default: 0,
          },
          {
            name: 'response_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'last_updated',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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

    // Foreign Keys
    await queryRunner.createForeignKey(
      'profile_views',
      new TableForeignKey({
        columnNames: ['viewer_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'profile_views',
      new TableForeignKey({
        columnNames: ['profile_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'match_impressions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'match_impressions',
      new TableForeignKey({
        columnNames: ['match_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_analytics',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for Performance
    await queryRunner.createIndex(
      'profile_views',
      new TableIndex({
        name: 'idx_profile_views_profile_date',
        columnNames: ['profile_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'profile_views',
      new TableIndex({
        name: 'idx_profile_views_viewer',
        columnNames: ['viewer_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'match_impressions',
      new TableIndex({
        name: 'idx_match_impressions_user_date',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'match_impressions',
      new TableIndex({
        name: 'idx_match_impressions_match_user',
        columnNames: ['match_user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_analytics',
      new TableIndex({
        name: 'idx_user_analytics_user',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_analytics');
    await queryRunner.dropTable('match_impressions');
    await queryRunner.dropTable('profile_views');
  }
}
