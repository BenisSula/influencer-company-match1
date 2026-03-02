import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMentionsTable1707584000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mentions',
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
            name: 'mentioned_user_id',
            type: 'uuid',
          },
          {
            name: 'mentioner_user_id',
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
      'mentions',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'feed_posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'mentions',
      new TableForeignKey({
        columnNames: ['mentioned_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'mentions',
      new TableForeignKey({
        columnNames: ['mentioner_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Check if indexes exist before creating
    const hasPostIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_MENTIONS_POST'`
    );
    if (!hasPostIndex || hasPostIndex.length === 0) {
      await queryRunner.createIndex(
        'mentions',
        new TableIndex({
          name: 'IDX_MENTIONS_POST',
          columnNames: ['post_id'],
        }),
      );
    }

    const hasMentionedIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_MENTIONS_MENTIONED_USER'`
    );
    if (!hasMentionedIndex || hasMentionedIndex.length === 0) {
      await queryRunner.createIndex(
        'mentions',
        new TableIndex({
          name: 'IDX_MENTIONS_MENTIONED_USER',
          columnNames: ['mentioned_user_id'],
        }),
      );
    }

    const hasMentionerIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_MENTIONS_MENTIONER_USER'`
    );
    if (!hasMentionerIndex || hasMentionerIndex.length === 0) {
      await queryRunner.createIndex(
        'mentions',
        new TableIndex({
          name: 'IDX_MENTIONS_MENTIONER_USER',
          columnNames: ['mentioner_user_id'],
        }),
      );
    }

    const hasUniqueIndex = await queryRunner.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_MENTIONS_UNIQUE'`
    );
    if (!hasUniqueIndex || hasUniqueIndex.length === 0) {
      await queryRunner.createIndex(
        'mentions',
        new TableIndex({
          name: 'IDX_MENTIONS_UNIQUE',
          columnNames: ['post_id', 'mentioned_user_id', 'position_start'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mentions');
  }
}
