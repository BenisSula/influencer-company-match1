import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLandingTables1708020000000 implements MigrationInterface {
  name = 'CreateLandingTables1708020000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Landing statistics table
    await queryRunner.query(`
      CREATE TABLE "landing_statistics" (
        "id" SERIAL NOT NULL,
        "metricName" character varying(50) NOT NULL,
        "metricValue" bigint NOT NULL,
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_landing_statistics_metricName" UNIQUE ("metricName"),
        CONSTRAINT "PK_landing_statistics" PRIMARY KEY ("id")
      )
    `);

    // Testimonials table
    await queryRunner.query(`
      CREATE TABLE "testimonials" (
        "id" SERIAL NOT NULL,
        "authorName" character varying(100) NOT NULL,
        "authorRole" character varying(100),
        "authorAvatar" character varying(255),
        "content" text NOT NULL,
        "rating" integer NOT NULL DEFAULT '5',
        "isApproved" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_testimonials" PRIMARY KEY ("id")
      )
    `);

    // Landing analytics table
    await queryRunner.query(`
      CREATE TABLE "landing_analytics" (
        "id" SERIAL NOT NULL,
        "visitorId" character varying(100),
        "pageSection" character varying(50) NOT NULL,
        "actionType" character varying(50) NOT NULL,
        "metadata" jsonb,
        "ipAddress" character varying(45),
        "userAgent" character varying(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_landing_analytics" PRIMARY KEY ("id")
      )
    `);

    // Insert initial statistics
    await queryRunner.query(`
      INSERT INTO "landing_statistics" ("metricName", "metricValue", "description") VALUES
      ('active_users', 12500, 'Total active users on the platform'),
      ('successful_matches', 68000, 'Total successful influencer-brand matches'),
      ('ai_accuracy', 94, 'AI matching accuracy percentage'),
      ('partnerships', 8, 'Number of major partnerships')
    `);

    // Insert sample testimonials
    await queryRunner.query(`
      INSERT INTO "testimonials" ("authorName", "authorRole", "authorAvatar", "content", "rating", "isApproved", "isActive") VALUES
      ('Sarah Johnson', 'Fashion Influencer', '/avatars/sarah.jpg', 'ICMatch connected me with amazing brands that align perfectly with my values. The AI matching is incredibly accurate!', 5, true, true),
      ('Mike Chen', 'Tech Company CMO', '/avatars/mike.jpg', 'We found the perfect influencers for our campaign in just 24 hours. The ROI has been exceptional.', 5, true, true),
      ('Emma Rodriguez', 'Lifestyle Blogger', '/avatars/emma.jpg', 'The platform makes collaboration so easy. I love the transparent communication tools.', 5, true, true),
      ('David Kim', 'Fitness Influencer', '/avatars/david.jpg', 'Finally, a platform that understands my niche and connects me with relevant brands.', 5, true, true),
      ('Lisa Wang', 'Beauty Brand Manager', '/avatars/lisa.jpg', 'The analytics and reporting features help us track campaign performance perfectly.', 5, true, true),
      ('Alex Thompson', 'Travel Content Creator', '/avatars/alex.jpg', 'ICMatch has transformed how I approach brand partnerships. Highly recommended!', 5, true, true)
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_landing_analytics_section" ON "landing_analytics" ("pageSection")`);
    await queryRunner.query(`CREATE INDEX "IDX_landing_analytics_action" ON "landing_analytics" ("actionType")`);
    await queryRunner.query(`CREATE INDEX "IDX_landing_analytics_created" ON "landing_analytics" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_testimonials_approved" ON "testimonials" ("isApproved", "isActive")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_testimonials_approved"`);
    await queryRunner.query(`DROP INDEX "IDX_landing_analytics_created"`);
    await queryRunner.query(`DROP INDEX "IDX_landing_analytics_action"`);
    await queryRunner.query(`DROP INDEX "IDX_landing_analytics_section"`);
    await queryRunner.query(`DROP TABLE "landing_analytics"`);
    await queryRunner.query(`DROP TABLE "testimonials"`);
    await queryRunner.query(`DROP TABLE "landing_statistics"`);
  }
}
