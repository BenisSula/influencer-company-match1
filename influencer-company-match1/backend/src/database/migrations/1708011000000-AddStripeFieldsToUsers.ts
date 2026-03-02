import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStripeFieldsToUsers1708011000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add Stripe account ID for influencers (Connect accounts)
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'stripe_account_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add Stripe customer ID for companies (Customers)
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'stripe_customer_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add Stripe onboarding completion status
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'stripe_onboarding_complete',
        type: 'boolean',
        default: false,
      }),
    );

    // Create indexes for faster lookups
    await queryRunner.query(
      `CREATE INDEX idx_users_stripe_account_id ON users(stripe_account_id) WHERE stripe_account_id IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_stripe_account_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_stripe_customer_id`);

    // Drop columns
    await queryRunner.dropColumn('users', 'stripe_onboarding_complete');
    await queryRunner.dropColumn('users', 'stripe_customer_id');
    await queryRunner.dropColumn('users', 'stripe_account_id');
  }
}
