import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1707601000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM (
        'collaboration_request',
        'collaboration_accepted',
        'collaboration_rejected',
        'connection_request',
        'connection_accepted',
        'profile_view',
        'match_found'
      );
    `);

    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'recipientId',
            type: 'uuid',
          },
          {
            name: 'senderId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'notification_type_enum',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isRead',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['recipientId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['senderId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['recipientId', 'isRead'],
          },
          {
            columnNames: ['createdAt'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.query(`DROP TYPE notification_type_enum;`);
  }
}
