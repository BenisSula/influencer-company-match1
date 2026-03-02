import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingLandingActivityColumns1708020150000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to landing_activities table
    await queryRunner.query(`
      ALTER TABLE "landing_activities" 
      ADD COLUMN IF NOT EXISTS "userRole" character varying(50),
      ADD COLUMN IF NOT EXISTS "description" character varying(200),
      ADD COLUMN IF NOT EXISTS "metadata" json
    `);

    // Update existing records with default userRole based on activityType
    await queryRunner.query(`
      UPDATE "landing_activities" 
      SET "userRole" = CASE 
        WHEN "companyName" IS NOT NULL THEN 'company'
        ELSE 'influencer'
      END
      WHERE "userRole" IS NULL
    `);

    // Update existing records with descriptions
    await queryRunner.query(`
      UPDATE "landing_activities" 
      SET "description" = CASE 
        WHEN "activityType" = 'match' THEN "userName" || ' matched with ' || COALESCE("companyName", 'a company')
        WHEN "activityType" = 'collaboration' THEN "userName" || ' started collaborating with ' || COALESCE("companyName", 'a company')
        WHEN "activityType" = 'signup' THEN "userName" || ' joined the platform'
        ELSE "userName" || ' performed an activity'
      END
      WHERE "description" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "landing_activities" 
      DROP COLUMN IF EXISTS "metadata",
      DROP COLUMN IF EXISTS "description",
      DROP COLUMN IF EXISTS "userRole"
    `);
  }
}
