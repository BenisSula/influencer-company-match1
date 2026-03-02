import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchAnalytics1707586100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE search_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        query TEXT NOT NULL,
        result_type VARCHAR(50),
        result_count INTEGER DEFAULT 0,
        clicked_result_id UUID,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_search_analytics_query ON search_analytics(query)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_search_analytics_user ON search_analytics(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_search_analytics_created ON search_analytics(created_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS search_analytics CASCADE`);
  }
}
