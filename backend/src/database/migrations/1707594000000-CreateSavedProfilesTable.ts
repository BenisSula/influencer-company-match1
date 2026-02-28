import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSavedProfilesTable1707594000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create saved_profiles table
    await queryRunner.createTable(
      new Table({
        name: 'saved_profiles',
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
            isNullable: false,
          },
          {
            name: 'saved_profile_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isArray: true,
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

    // Add unique constraint
    await queryRunner.createIndex(
      'saved_profiles',
      new TableIndex({
        name: 'IDX_SAVED_PROFILES_USER_PROFILE',
        columnNames: ['user_id', 'saved_profile_id'],
        isUnique: true,
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'saved_profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'saved_profiles',
      new TableForeignKey({
        columnNames: ['saved_profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add index for faster queries
    await queryRunner.createIndex(
      'saved_profiles',
      new TableIndex({
        name: 'IDX_SAVED_PROFILES_USER',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('saved_profiles');
  }
}
