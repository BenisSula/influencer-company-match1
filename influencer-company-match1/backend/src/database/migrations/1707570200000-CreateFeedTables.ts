import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateFeedTables1707570200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create feed_posts table
    await queryRunner.createTable(
      new Table({
        name: 'feed_posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'postType',
            type: 'varchar',
            default: "'update'",
          },
          {
            name: 'mediaUrls',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'likeCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'commentCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create index on author_id and createdAt
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_FEED_POSTS_AUTHOR_CREATED" ON "feed_posts" ("author_id", "createdAt")`
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'feed_posts',
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create post_likes table
    await queryRunner.createTable(
      new Table({
        name: 'post_likes',
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
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_POST_LIKES_UNIQUE" ON "post_likes" ("post_id", "user_id")`
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'post_likes',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'feed_posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_likes',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create post_comments table
    await queryRunner.createTable(
      new Table({
        name: 'post_comments',
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
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create index on post_id and createdAt
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_POST_COMMENTS_POST_CREATED" ON "post_comments" ("post_id", "createdAt")`
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'post_comments',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'feed_posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_comments',
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_comments');
    await queryRunner.dropTable('post_likes');
    await queryRunner.dropTable('feed_posts');
  }
}
