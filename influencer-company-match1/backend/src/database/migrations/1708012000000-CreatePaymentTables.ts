import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePaymentTables1708012000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create collaboration_payments table
    await queryRunner.createTable(
      new Table({
        name: 'collaboration_payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'collaboration_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'influencer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'amount_total',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'amount_budget',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'amount_company_fee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'amount_influencer_fee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'amount_platform_revenue',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'usd'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'payment_intent_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'transfer_id',
            type: 'varchar',
            length: '255',
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
          {
            name: 'released_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['company_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['influencer_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes for collaboration_payments table
    await queryRunner.createIndex(
      'collaboration_payments',
      new TableIndex({
        name: 'idx_collaboration_payments_company_id',
        columnNames: ['company_id'],
      }),
    );

    await queryRunner.createIndex(
      'collaboration_payments',
      new TableIndex({
        name: 'idx_collaboration_payments_influencer_id',
        columnNames: ['influencer_id'],
      }),
    );

    await queryRunner.createIndex(
      'collaboration_payments',
      new TableIndex({
        name: 'idx_collaboration_payments_collaboration_id',
        columnNames: ['collaboration_id'],
      }),
    );

    await queryRunner.createIndex(
      'collaboration_payments',
      new TableIndex({
        name: 'idx_collaboration_payments_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'collaboration_payments',
      new TableIndex({
        name: 'idx_collaboration_payments_payment_intent_id',
        columnNames: ['payment_intent_id'],
      }),
    );

    // Create payouts table
    await queryRunner.createTable(
      new Table({
        name: 'payouts',
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
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'usd'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: "'pending'",
          },
          {
            name: 'payout_method',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'payout_details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'stripe_payout_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'requested_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes for payouts table
    await queryRunner.createIndex(
      'payouts',
      new TableIndex({
        name: 'idx_payouts_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new TableIndex({
        name: 'idx_payouts_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'payouts',
      new TableIndex({
        name: 'idx_payouts_stripe_payout_id',
        columnNames: ['stripe_payout_id'],
      }),
    );

    // Create payment_methods table
    await queryRunner.createTable(
      new Table({
        name: 'payment_methods',
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
            name: 'user_type',
            type: 'enum',
            enum: ['company', 'influencer'],
            isNullable: false,
          },
          {
            name: 'method_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'stripe_payment_method_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'stripe_customer_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'card_last4',
            type: 'varchar',
            length: '4',
            isNullable: true,
          },
          {
            name: 'card_brand',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'card_exp_month',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'card_exp_year',
            type: 'integer',
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
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes for payment_methods table
    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({
        name: 'idx_payment_methods_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({
        name: 'idx_payment_methods_stripe_payment_method_id',
        columnNames: ['stripe_payment_method_id'],
      }),
    );

    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({
        name: 'idx_payment_methods_is_default',
        columnNames: ['is_default'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop payment_methods table
    await queryRunner.dropIndex('payment_methods', 'idx_payment_methods_is_default');
    await queryRunner.dropIndex('payment_methods', 'idx_payment_methods_stripe_payment_method_id');
    await queryRunner.dropIndex('payment_methods', 'idx_payment_methods_user_id');
    await queryRunner.dropTable('payment_methods');

    // Drop payouts table
    await queryRunner.dropIndex('payouts', 'idx_payouts_stripe_payout_id');
    await queryRunner.dropIndex('payouts', 'idx_payouts_status');
    await queryRunner.dropIndex('payouts', 'idx_payouts_user_id');
    await queryRunner.dropTable('payouts');

    // Drop collaboration_payments table
    await queryRunner.dropIndex('collaboration_payments', 'idx_collaboration_payments_payment_intent_id');
    await queryRunner.dropIndex('collaboration_payments', 'idx_collaboration_payments_status');
    await queryRunner.dropIndex('collaboration_payments', 'idx_collaboration_payments_collaboration_id');
    await queryRunner.dropIndex('collaboration_payments', 'idx_collaboration_payments_influencer_id');
    await queryRunner.dropIndex('collaboration_payments', 'idx_collaboration_payments_company_id');
    await queryRunner.dropTable('collaboration_payments');
  }
}
