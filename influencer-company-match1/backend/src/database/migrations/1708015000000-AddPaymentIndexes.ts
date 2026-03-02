import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentIndexes1708015000000 implements MigrationInterface {
  name = 'AddPaymentIndexes1708015000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Payments table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_company" 
      ON "collaboration_payments" ("company_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_influencer" 
      ON "collaboration_payments" ("influencer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_status" 
      ON "collaboration_payments" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_collaboration" 
      ON "collaboration_payments" ("collaboration_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_created" 
      ON "collaboration_payments" ("created_at" DESC)
    `);

    // Wallet table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_wallet_user" 
      ON "wallets" ("user_id")
    `);

    // Transactions table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_wallet" 
      ON "transactions" ("wallet_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_type" 
      ON "transactions" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_created" 
      ON "transactions" ("created_at" DESC)
    `);

    // Payouts table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payouts_wallet" 
      ON "payouts" ("wallet_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payouts_status" 
      ON "payouts" ("status")
    `);

    // Invoices table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_payment" 
      ON "invoices" ("payment_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_company" 
      ON "invoices" ("company_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_influencer" 
      ON "invoices" ("influencer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_status" 
      ON "invoices" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_number" 
      ON "invoices" ("invoice_number")
    `);

    // Composite indexes for common queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_company_status" 
      ON "collaboration_payments" ("company_id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payments_influencer_status" 
      ON "collaboration_payments" ("influencer_id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_wallet_created" 
      ON "transactions" ("wallet_id", "created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_company"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_influencer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_collaboration"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_wallet"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payouts_wallet"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payouts_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_payment"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_company"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_influencer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_number"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_company_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payments_influencer_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_wallet_created"`);
  }
}
