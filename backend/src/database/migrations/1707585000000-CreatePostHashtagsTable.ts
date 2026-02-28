import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePostHashtagsTable1707585000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_hashtags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'post_id',
            type: 'uuid',
          },
          {
            name: 'hashtag_id',
            type: 'uuid',
          },
          {
            name: 'position_start',
            type: 'integer',
          },
          {
            name: 'position_end',
            type: 'integer',
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
      'post_hashtags',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'feed_posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_hashtags',
      new TableForeignKey({
        columnNames: ['hashtag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hashtags',
        onDelete: 'CASCADE',
      }),
    );

    // Check if indexes exist before creating
    const hasPostIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_POST_HASHTAGS_POST'`
    );
    if (!hasPostIndex || hasPostIndex.length === 0) {
      await queryRunner.createIndex(
        'post_hashtags',
        new TableIndex({
          name: 'IDX_POST_HASHTAGS_POST',
          columnNames: ['post_id'],
        }),
      );
    }

    const hasHashtagIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_POST_HASHTAGS_HASHTAG'`
    );
    if (!hasHashtagIndex || hasHashtagIndex.length === 0) {
      await queryRunner.createIndex(
        'post_hashtags',
        new TableIndex({
          name: 'IDX_POST_HASHTAGS_HASHTAG',
          columnNames: ['hashtag_id'],
        }),
      );
    }

    const hasUniqueIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_POST_HASHTAGS_UNIQUE'`
    );
    if (!hasUniqueIndex || hasUniqueIndex.length === 0) {
      await queryRunner.createIndex(
        'post_hashtags',
        new TableIndex({
          name: 'IDX_POST_HASHTAGS_UNIQUE',
          columnNames: ['post_id', 'hashtag_id', 'position_start'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_hashtags');
  }
}
