import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePlatformConfigTables1708002000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create platform_configs table
    await queryRunner.createTable(
      new Table({
        name: 'platform_configs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'branding',
            type: 'jsonb',
          },
          {
            name: 'features',
            type: 'jsonb',
          },
          {
            name: 'limits',
            type: 'jsonb',
          },
          {
            name: 'integrations',
            type: 'jsonb',
          },
          {
            name: 'emailSettings',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'seoSettings',
            type: 'jsonb',
            isNullable: true,
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
    );

    // Add foreign key for tenantId
    await queryRunner.createForeignKey(
      'platform_configs',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Create email_templates table
    await queryRunner.createTable(
      new Table({
        name: 'email_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'slug',
            type: 'varchar',
          },
          {
            name: 'subject',
            type: 'varchar',
          },
          {
            name: 'htmlContent',
            type: 'text',
          },
          {
            name: 'textContent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'variables',
            type: 'jsonb',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
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
    );

    // Add foreign key for tenantId
    await queryRunner.createForeignKey(
      'email_templates',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Create unique index on tenantId + slug
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_EMAIL_TEMPLATE_TENANT_SLUG" ON "email_templates" ("tenantId", "slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('email_templates');
    await queryRunner.dropTable('platform_configs');
  }
}
