import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCollectionsTable1707581000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create collections table
    await queryRunner.createTable(
      new Table({
        name: 'collections',
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
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
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

    // Add foreign key
    await queryRunner.createForeignKey(
      'collections',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add index for user collections
    await queryRunner.createIndex(
      'collections',
      new TableIndex({
        name: 'IDX_collections_user',
        columnNames: ['user_id'],
      }),
    );

    // Add collection_id column to post_saves table
    await queryRunner.addColumn(
      'post_saves',
      new TableColumn({
        name: 'collection_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key for collection_id
    await queryRunner.createForeignKey(
      'post_saves',
      new TableForeignKey({
        columnNames: ['collection_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'collections',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key from post_saves
    const postSavesTable = await queryRunner.getTable('post_saves');
    const collectionForeignKey = postSavesTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('collection_id') !== -1,
    );
    if (collectionForeignKey) {
      await queryRunner.dropForeignKey('post_saves', collectionForeignKey);
    }

    // Remove collection_id column
    await queryRunner.dropColumn('post_saves', 'collection_id');

    // Drop collections table
    await queryRunner.dropTable('collections');
  }
}
