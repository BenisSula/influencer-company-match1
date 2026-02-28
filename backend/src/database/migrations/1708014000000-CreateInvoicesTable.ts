import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInvoicesTable1708014000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'invoice_number',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'payment_id',
            type: 'uuid',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'influencer_id',
            type: 'uuid',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'issued', 'paid', 'cancelled'],
            default: "'draft'",
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'platform_fee',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'influencer_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'usd'",
          },
          {
            name: 'issue_date',
            type: 'timestamp',
          },
          {
            name: 'due_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'paid_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'line_items',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'billing_address',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'pdf_url',
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

    // Foreign keys
    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['payment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'payments',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['influencer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes
    await queryRunner.query(`
      CREATE INDEX idx_invoices_company_id ON invoices(company_id);
      CREATE INDEX idx_invoices_influencer_id ON invoices(influencer_id);
      CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
      CREATE INDEX idx_invoices_status ON invoices(status);
      CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('invoices');
  }
}
