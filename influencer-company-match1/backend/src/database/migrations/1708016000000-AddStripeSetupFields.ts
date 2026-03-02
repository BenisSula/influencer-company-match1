import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeSetupFields1708016000000 implements MigrationInterface {
  name = 'AddStripeSetupFields1708016000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add stripe_setup_completed field to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "stripe_setup_completed" boolean DEFAULT false
    `);

    // Add stripe_setup_reminder_sent field to track if we've reminded the user
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "stripe_setup_reminder_sent" boolean DEFAULT false
    `);

    // Add stripe_setup_reminder_count to track how many times we've reminded
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "stripe_setup_reminder_count" integer DEFAULT 0
    `);

    // Add last_stripe_setup_reminder timestamp
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "last_stripe_setup_reminder" timestamp
    `);

    // Update existing users who have Stripe accounts to mark as completed
    await queryRunner.query(`
      UPDATE "users" 
      SET "stripe_setup_completed" = true 
      WHERE "stripe_customer_id" IS NOT NULL 
         OR "stripe_account_id" IS NOT NULL
    `);

    // Create index for faster queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_stripe_setup_completed" 
      ON "users" ("stripe_setup_completed")
    `);

    // Add comment to explain the field
    await queryRunner.query(`
      COMMENT ON COLUMN "users"."stripe_setup_completed" IS 
      'Indicates whether the user has completed Stripe payment/payout setup'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_stripe_setup_completed"
    `);

    // Remove columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "last_stripe_setup_reminder"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "stripe_setup_reminder_count"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "stripe_setup_reminder_sent"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "stripe_setup_completed"
    `);
  }
}
