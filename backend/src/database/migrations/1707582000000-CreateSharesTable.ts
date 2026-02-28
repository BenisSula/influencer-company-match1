import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSharesTable1707582000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shares',
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
            name: 'item_type',
            type: 'varchar',
            length: '50',
            comment: 'post, campaign, match',
          },
          {
            name: 'item_id',
            type: 'uuid',
          },
          {
            name: 'share_type',
            type: 'varchar',
            length: '50',
            comment: 'feed, message, link, twitter, linkedin, facebook',
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

    // Create indexes for performance
    await queryRunner.createIndex(
      'shares',
      new TableIndex({
        name: 'IDX_shares_item',
        columnNames: ['item_type', 'item_id'],
      }),
    );

    await queryRunner.createIndex(
      'shares',
      new TableIndex({
        name: 'IDX_shares_user',
        columnNames: ['user_id'],
      }),
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'shares',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shares');
  }
}
