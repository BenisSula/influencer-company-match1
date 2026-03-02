import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchIndexes1707586000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add full-text search indexes for influencer profiles
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_influencer_profile_search 
      ON influencer_profiles 
      USING GIN (to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(bio, '') || ' ' || 
        COALESCE(niche, '') || ' ' || 
        COALESCE(location, '')
      ))
    `);

    // Add full-text search indexes for company profiles
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_company_profile_search 
      ON company_profiles 
      USING GIN (to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(industry, '') || ' ' || 
        COALESCE(location, '')
      ))
    `);

    // Add full-text search indexes for feed posts
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_feed_posts_search 
      ON feed_posts 
      USING GIN (to_tsvector('english', 
        COALESCE(content, '')
      ))
    `);

    // Add full-text search indexes for campaigns
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_search 
      ON campaigns 
      USING GIN (to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '')
      ))
    `);

    // Add regular indexes for common search filters
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_influencer_profiles_location 
      ON influencer_profiles(location)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_influencer_profiles_niche 
      ON influencer_profiles(niche)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_company_profiles_location 
      ON company_profiles(location)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_company_profiles_industry 
      ON company_profiles(industry)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_influencer_profile_search`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_company_profile_search`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_feed_posts_search`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_campaigns_search`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_influencer_profiles_location`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_influencer_profiles_niche`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_company_profiles_location`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_company_profiles_industry`);
  }
}
