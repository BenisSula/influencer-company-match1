import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLandingActivitiesTable1708020100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "landing_activities" (
        "id" SERIAL NOT NULL,
        "activityType" character varying(50) NOT NULL,
        "userName" character varying(100) NOT NULL,
        "companyName" character varying(100),
        "location" character varying(100),
        "isVerified" boolean NOT NULL DEFAULT false,
        "isPublic" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_landing_activities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_landing_activities_type" ON "landing_activities" ("activityType")
    `);
    
    await queryRunner.query(`
      CREATE INDEX "IDX_landing_activities_created" ON "landing_activities" ("createdAt")
    `);

    // Insert sample activities
    await queryRunner.query(`
      INSERT INTO "landing_activities" ("activityType", "userName", "companyName", "location", "isVerified", "isPublic") VALUES
      ('match', 'Sarah Martinez', 'Nike', 'Los Angeles, CA', true, true),
      ('collaboration', 'James Chen', 'TechCorp', 'San Francisco, CA', true, true),
      ('signup', 'Emily Johnson', NULL, 'New York, NY', false, true),
      ('match', 'Michael Brown', 'Adidas', 'Chicago, IL', true, true),
      ('collaboration', 'Jessica Davis', 'Beauty Co', 'Miami, FL', true, true),
      ('signup', 'David Wilson', NULL, 'Seattle, WA', false, true),
      ('match', 'Amanda Lee', 'Samsung', 'Austin, TX', true, true),
      ('collaboration', 'Chris Taylor', 'Fashion Brand', 'Boston, MA', true, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_landing_activities_created"`);
    await queryRunner.query(`DROP INDEX "IDX_landing_activities_type"`);
    await queryRunner.query(`DROP TABLE "landing_activities"`);
  }
}
