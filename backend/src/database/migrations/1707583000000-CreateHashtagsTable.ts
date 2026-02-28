import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateHashtagsTable1707583000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hashtags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'normalized_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'usage_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Check if indexes exist before creating
    const hasNormalizedIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_HASHTAGS_NORMALIZED'`
    );
    if (!hasNormalizedIndex || hasNormalizedIndex.length === 0) {
      await queryRunner.createIndex(
        'hashtags',
        new TableIndex({
          name: 'IDX_HASHTAGS_NORMALIZED',
          columnNames: ['normalized_name'],
        }),
      );
    }

    const hasUsageIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_HASHTAGS_USAGE_COUNT'`
    );
    if (!hasUsageIndex || hasUsageIndex.length === 0) {
      await queryRunner.createIndex(
        'hashtags',
        new TableIndex({
          name: 'IDX_HASHTAGS_USAGE_COUNT',
          columnNames: ['usage_count'],
        }),
      );
    }

    const hasCreatedIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_HASHTAGS_CREATED_AT'`
    );
    if (!hasCreatedIndex || hasCreatedIndex.length === 0) {
      await queryRunner.createIndex(
        'hashtags',
        new TableIndex({
          name: 'IDX_HASHTAGS_CREATED_AT',
          columnNames: ['created_at'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hashtags');
  }
}
