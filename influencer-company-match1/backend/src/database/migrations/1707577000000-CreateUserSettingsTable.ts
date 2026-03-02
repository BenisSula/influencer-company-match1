import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserSettingsTable1707577000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_settings',
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
          // Privacy Settings
          {
            name: 'profile_visibility',
            type: 'varchar',
            default: "'public'",
          },
          {
            name: 'show_in_search',
            type: 'boolean',
            default: true,
          },
          {
            name: 'show_activity_status',
            type: 'boolean',
            default: true,
          },
          {
            name: 'message_permission',
            type: 'varchar',
            default: "'everyone'",
          },
          {
            name: 'email_visibility',
            type: 'varchar',
            default: "'none'",
          },
          // Notification Settings
          {
            name: 'email_new_match',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_new_message',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_connection_request',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_post_interactions',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_weekly_summary',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_marketing',
            type: 'boolean',
            default: false,
          },
          // Communication Settings
          {
            name: 'read_receipts',
            type: 'boolean',
            default: true,
          },
          {
            name: 'typing_indicators',
            type: 'boolean',
            default: true,
          },
          // Preferences
          {
            name: 'language',
            type: 'varchar',
            default: "'en'",
          },
          {
            name: 'timezone',
            type: 'varchar',
            default: "'UTC'",
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

    // Add foreign key
    await queryRunner.createForeignKey(
      'user_settings',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_settings');
  }
}
