import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePaymentTables1708001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'stripeSubscriptionId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'stripePriceId',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING', 'INCOMPLETE'],
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
          },
          {
            name: 'interval',
            type: 'varchar',
          },
          {
            name: 'currentPeriodStart',
            type: 'timestamp',
          },
          {
            name: 'currentPeriodEnd',
            type: 'timestamp',
          },
          {
            name: 'cancelAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'canceledAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'trialStart',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'trialEnd',
            type: 'timestamp',
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
      true,
    );

    // Create payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'stripePaymentIntentId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['SUCCEEDED', 'PENDING', 'FAILED', 'REFUNDED'],
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'invoiceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'failureReason',
            type: 'varchar',
            isNullable: true,
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

    // Create invoices table
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
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'stripeInvoiceId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'invoiceNumber',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE'],
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
          },
          {
            name: 'lineItems',
            type: 'jsonb',
          },
          {
            name: 'pdfUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dueDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'paidAt',
            type: 'timestamp',
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
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_TENANT_CREATED',
        columnNames: ['tenantId', 'createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('invoices');
    await queryRunner.dropTable('payments');
    await queryRunner.dropTable('subscriptions');
  }
}
