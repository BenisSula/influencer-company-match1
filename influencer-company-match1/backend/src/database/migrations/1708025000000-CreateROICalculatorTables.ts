import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateROICalculatorTables1708025000000 implements MigrationInterface {
  name = 'CreateROICalculatorTables1708025000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Market Rates Table - Stores niche-specific pricing data
    await queryRunner.query(`
      CREATE TABLE "market_rates" (
        "id" SERIAL NOT NULL,
        "niche" character varying(50) NOT NULL,
        "tier" character varying(20) NOT NULL,
        "min_rate" decimal(10,2),
        "max_rate" decimal(10,2),
        "avg_rate" decimal(10,2),
        "avg_engagement_rate" decimal(5,2),
        "sample_size" integer DEFAULT 0,
        "last_updated" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_market_rates_niche_tier" UNIQUE ("niche", "tier"),
        CONSTRAINT "PK_market_rates" PRIMARY KEY ("id")
      )
    `);

    // Campaign Performance Metrics Table - Tracks actual campaign outcomes
    await queryRunner.query(`
      CREATE TABLE "campaign_performance_metrics" (
        "id" SERIAL NOT NULL,
        "campaign_id" uuid,
        "collaboration_id" uuid,
        "actual_reach" integer,
        "actual_engagement_rate" decimal(5,2),
        "actual_conversions" integer,
        "actual_revenue" decimal(10,2),
        "actual_roi" decimal(10,2),
        "cost_per_conversion" decimal(10,2),
        "recorded_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_campaign_performance_metrics" PRIMARY KEY ("id")
      )
    `);

    // ROI Calculations History Table - Tracks all calculator usage
    await queryRunner.query(`
      CREATE TABLE "roi_calculations_history" (
        "id" SERIAL NOT NULL,
        "visitor_id" character varying(100),
        "user_id" uuid,
        "input_followers" integer,
        "input_engagement_rate" decimal(5,2),
        "input_niche" character varying(50),
        "input_posts_per_month" integer,
        "calculated_budget" decimal(10,2),
        "calculated_roi" decimal(10,2),
        "calculated_reach" integer,
        "calculated_conversions" integer,
        "calculated_revenue" decimal(10,2),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roi_calculations_history" PRIMARY KEY ("id")
      )
    `);

    // Industry Benchmarks Table - Stores calculated industry averages
    await queryRunner.query(`
      CREATE TABLE "industry_benchmarks" (
        "id" SERIAL NOT NULL,
        "metric_name" character varying(50) NOT NULL,
        "niche" character varying(50),
        "metric_value" decimal(10,2),
        "sample_size" integer DEFAULT 0,
        "confidence_level" decimal(5,2),
        "last_calculated" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_industry_benchmarks_metric_niche" UNIQUE ("metric_name", "niche"),
        CONSTRAINT "PK_industry_benchmarks" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "campaign_performance_metrics"
      ADD CONSTRAINT "FK_campaign_performance_metrics_campaign"
      FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "campaign_performance_metrics"
      ADD CONSTRAINT "FK_campaign_performance_metrics_collaboration"
      FOREIGN KEY ("collaboration_id") REFERENCES "collaborations"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "roi_calculations_history"
      ADD CONSTRAINT "FK_roi_calculations_history_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_market_rates_niche" ON "market_rates" ("niche")`);
    await queryRunner.query(`CREATE INDEX "IDX_market_rates_tier" ON "market_rates" ("tier")`);
    await queryRunner.query(`CREATE INDEX "IDX_campaign_performance_campaign" ON "campaign_performance_metrics" ("campaign_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_campaign_performance_collaboration" ON "campaign_performance_metrics" ("collaboration_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_roi_history_visitor" ON "roi_calculations_history" ("visitor_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_roi_history_user" ON "roi_calculations_history" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_roi_history_niche" ON "roi_calculations_history" ("input_niche")`);
    await queryRunner.query(`CREATE INDEX "IDX_roi_history_created" ON "roi_calculations_history" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_industry_benchmarks_metric" ON "industry_benchmarks" ("metric_name")`);
    await queryRunner.query(`CREATE INDEX "IDX_industry_benchmarks_niche" ON "industry_benchmarks" ("niche")`);

    // Insert initial market rates based on industry standards
    await queryRunner.query(`
      INSERT INTO "market_rates" ("niche", "tier", "min_rate", "max_rate", "avg_rate", "avg_engagement_rate", "sample_size") VALUES
      ('fashion', 'micro', 100, 500, 250, 3.5, 0),
      ('fashion', 'mid', 500, 2500, 1200, 3.2, 0),
      ('fashion', 'macro', 2500, 12000, 6000, 2.8, 0),
      ('tech', 'micro', 150, 700, 350, 2.8, 0),
      ('tech', 'mid', 700, 3000, 1500, 2.5, 0),
      ('tech', 'macro', 3000, 15000, 7500, 2.2, 0),
      ('beauty', 'micro', 120, 600, 300, 4.2, 0),
      ('beauty', 'mid', 600, 2800, 1400, 3.8, 0),
      ('beauty', 'macro', 2800, 14000, 7000, 3.5, 0),
      ('fitness', 'micro', 80, 400, 200, 3.8, 0),
      ('fitness', 'mid', 400, 2000, 1000, 3.5, 0),
      ('fitness', 'macro', 2000, 10000, 5000, 3.2, 0),
      ('food', 'micro', 100, 450, 225, 4.5, 0),
      ('food', 'mid', 450, 2200, 1100, 4.0, 0),
      ('food', 'macro', 2200, 11000, 5500, 3.8, 0),
      ('travel', 'micro', 120, 600, 300, 3.2, 0),
      ('travel', 'mid', 600, 3000, 1500, 2.9, 0),
      ('travel', 'macro', 3000, 15000, 7500, 2.6, 0),
      ('lifestyle', 'micro', 100, 500, 250, 3.6, 0),
      ('lifestyle', 'mid', 500, 2500, 1250, 3.3, 0),
      ('lifestyle', 'macro', 2500, 12500, 6250, 3.0, 0),
      ('gaming', 'micro', 180, 800, 400, 5.2, 0),
      ('gaming', 'mid', 800, 4000, 2000, 4.8, 0),
      ('gaming', 'macro', 4000, 20000, 10000, 4.5, 0),
      ('business', 'micro', 200, 900, 450, 2.5, 0),
      ('business', 'mid', 900, 4500, 2250, 2.2, 0),
      ('business', 'macro', 4500, 22500, 11250, 2.0, 0),
      ('other', 'micro', 80, 400, 200, 3.0, 0),
      ('other', 'mid', 400, 2000, 1000, 2.7, 0),
      ('other', 'macro', 2000, 10000, 5000, 2.5, 0)
    `);

    // Insert initial industry benchmarks
    await queryRunner.query(`
      INSERT INTO "industry_benchmarks" ("metric_name", "niche", "metric_value", "sample_size", "confidence_level") VALUES
      ('engagement_rate', 'fashion', 3.5, 0, 0.85),
      ('engagement_rate', 'tech', 2.8, 0, 0.85),
      ('engagement_rate', 'beauty', 4.2, 0, 0.85),
      ('engagement_rate', 'fitness', 3.8, 0, 0.85),
      ('engagement_rate', 'food', 4.5, 0, 0.85),
      ('engagement_rate', 'travel', 3.2, 0, 0.85),
      ('engagement_rate', 'lifestyle', 3.6, 0, 0.85),
      ('engagement_rate', 'gaming', 5.2, 0, 0.85),
      ('engagement_rate', 'business', 2.5, 0, 0.85),
      ('engagement_rate', 'other', 3.0, 0, 0.85),
      ('conversion_rate', NULL, 2.0, 0, 0.80),
      ('average_order_value', NULL, 50.0, 0, 0.75),
      ('reach_multiplier', NULL, 2.5, 0, 0.80),
      ('platform_fee_traditional', NULL, 20.0, 0, 0.95),
      ('platform_fee_our_platform', NULL, 10.0, 0, 0.95)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_industry_benchmarks_niche"`);
    await queryRunner.query(`DROP INDEX "IDX_industry_benchmarks_metric"`);
    await queryRunner.query(`DROP INDEX "IDX_roi_history_created"`);
    await queryRunner.query(`DROP INDEX "IDX_roi_history_niche"`);
    await queryRunner.query(`DROP INDEX "IDX_roi_history_user"`);
    await queryRunner.query(`DROP INDEX "IDX_roi_history_visitor"`);
    await queryRunner.query(`DROP INDEX "IDX_campaign_performance_collaboration"`);
    await queryRunner.query(`DROP INDEX "IDX_campaign_performance_campaign"`);
    await queryRunner.query(`DROP INDEX "IDX_market_rates_tier"`);
    await queryRunner.query(`DROP INDEX "IDX_market_rates_niche"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "roi_calculations_history" DROP CONSTRAINT "FK_roi_calculations_history_user"`);
    await queryRunner.query(`ALTER TABLE "campaign_performance_metrics" DROP CONSTRAINT "FK_campaign_performance_metrics_collaboration"`);
    await queryRunner.query(`ALTER TABLE "campaign_performance_metrics" DROP CONSTRAINT "FK_campaign_performance_metrics_campaign"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "industry_benchmarks"`);
    await queryRunner.query(`DROP TABLE "roi_calculations_history"`);
    await queryRunner.query(`DROP TABLE "campaign_performance_metrics"`);
    await queryRunner.query(`DROP TABLE "market_rates"`);
  }
}
