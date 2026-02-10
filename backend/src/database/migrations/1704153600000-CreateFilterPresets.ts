import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateFilterPresets1704153600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'filter_presets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'filters',
            type: 'json',
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

    await queryRunner.createIndex(
      'filter_presets',
      new TableIndex({
        name: 'IDX_FILTER_PRESETS_USER',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createForeignKey(
      'filter_presets',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('filter_presets');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('userId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('filter_presets', foreignKey);
      }
    }
    await queryRunner.dropIndex('filter_presets', 'IDX_FILTER_PRESETS_USER');
    await queryRunner.dropTable('filter_presets');
  }
}
