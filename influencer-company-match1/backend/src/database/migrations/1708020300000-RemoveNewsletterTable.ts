import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNewsletterTable1708020300000 implements MigrationInterface {
  name = 'RemoveNewsletterTable1708020300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop newsletter-related index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_newsletter_confirmation_token"`);
    
    // Drop newsletter_subscriptions table
    await queryRunner.query(`DROP TABLE IF EXISTS "newsletter_subscriptions"`);
    
    this.logger.log('Newsletter feature removed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate newsletter_subscriptions table if needed to rollback
    await queryRunner.query(`
      CREATE TABLE "newsletter_subscriptions" (
        "id" SERIAL NOT NULL,
        "email" character varying(255) NOT NULL,
        "source" character varying(50),
        "confirmationToken" character varying(255),
        "isConfirmed" boolean DEFAULT false,
        "confirmedAt" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "subscribedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "unsubscribedAt" TIMESTAMP,
        CONSTRAINT "UQ_newsletter_subscriptions_email" UNIQUE ("email"),
        CONSTRAINT "PK_newsletter_subscriptions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_newsletter_confirmation_token" 
      ON "newsletter_subscriptions" ("confirmationToken")
    `);
  }

  private logger = {
    log: (message: string) => console.log(`[RemoveNewsletterTable] ${message}`)
  };
}
