import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateModerationTables1708004000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create content_flags table
    await queryRunner.createTable(
      new Table({
        name: 'content_flags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'content_type',
            type: 'varchar',
          },
          {
            name: 'content_id',
            type: 'uuid',
          },
          {
            name: 'reporter_id',
            type: 'uuid',
          },
          {
            name: 'reason',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'REMOVED'],
            default: "'PENDING'",
          },
          {
            name: 'reviewed_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'review_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for content_flags
    await queryRunner.createForeignKey(
      'content_flags',
      new TableForeignKey({
        columnNames: ['reporter_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'content_flags',
      new TableForeignKey({
        columnNames: ['reviewed_by_id'],
        referencedTableName: 'admin_users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create user_bans table
    await queryRunner.createTable(
      new Table({
        name: 'user_bans',
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
            name: 'banned_by_id',
            type: 'uuid',
          },
          {
            name: 'reason',
            type: 'varchar',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['TEMPORARY', 'PERMANENT'],
            default: "'TEMPORARY'",
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for user_bans
    await queryRunner.createForeignKey(
      'user_bans',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_bans',
      new TableForeignKey({
        columnNames: ['banned_by_id'],
        referencedTableName: 'admin_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_content_flags_status ON content_flags(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_content_flags_content_type ON content_flags(content_type)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_user_bans_user_id ON user_bans(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_user_bans_is_active ON user_bans(is_active)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_bans');
    await queryRunner.dropTable('content_flags');
  }
}
