import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePostSavesTable1707576000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_saves',
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
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create unique index on post_id and user_id
    await queryRunner.createIndex(
      'post_saves',
      new TableIndex({
        name: 'IDX_POST_SAVES_POST_USER',
        columnNames: ['post_id', 'user_id'],
        isUnique: true,
      }),
    );

    // Add foreign key for post_id
    await queryRunner.createForeignKey(
      'post_saves',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'feed_posts',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for user_id
    await queryRunner.createForeignKey(
      'post_saves',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_saves');
  }
}
