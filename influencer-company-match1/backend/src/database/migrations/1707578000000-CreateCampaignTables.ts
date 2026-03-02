import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampaignTables1707578000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create campaigns table
    await queryRunner.query(`
      CREATE TABLE campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        budget_min INTEGER,
        budget_max INTEGER,
        niche VARCHAR(100),
        platforms TEXT[],
        deliverables TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        start_date DATE,
        end_date DATE,
        application_deadline DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes for campaigns
    await queryRunner.query(`
      CREATE INDEX idx_campaigns_company_id ON campaigns(company_id);
      CREATE INDEX idx_campaigns_status ON campaigns(status);
      CREATE INDEX idx_campaigns_niche ON campaigns(niche);
      CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
    `);

    // Create campaign_applications table
    await queryRunner.query(`
      CREATE TABLE campaign_applications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        proposal TEXT NOT NULL,
        proposed_rate INTEGER,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(campaign_id, influencer_id)
      );
    `);

    // Create indexes for campaign_applications
    await queryRunner.query(`
      CREATE INDEX idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
      CREATE INDEX idx_campaign_applications_influencer_id ON campaign_applications(influencer_id);
      CREATE INDEX idx_campaign_applications_status ON campaign_applications(status);
    `);

    // Create collaborations table
    await queryRunner.query(`
      CREATE TABLE collaborations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        application_id UUID NOT NULL REFERENCES campaign_applications(id) ON DELETE CASCADE,
        company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        agreed_rate INTEGER,
        deliverables_status JSONB DEFAULT '{}',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(application_id)
      );
    `);

    // Create indexes for collaborations
    await queryRunner.query(`
      CREATE INDEX idx_collaborations_campaign_id ON collaborations(campaign_id);
      CREATE INDEX idx_collaborations_company_id ON collaborations(company_id);
      CREATE INDEX idx_collaborations_influencer_id ON collaborations(influencer_id);
      CREATE INDEX idx_collaborations_status ON collaborations(status);
    `);

    // Create campaign_milestones table
    await queryRunner.query(`
      CREATE TABLE campaign_milestones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        collaboration_id UUID NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        due_date DATE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes for campaign_milestones
    await queryRunner.query(`
      CREATE INDEX idx_campaign_milestones_collaboration_id ON campaign_milestones(collaboration_id);
      CREATE INDEX idx_campaign_milestones_status ON campaign_milestones(status);
      CREATE INDEX idx_campaign_milestones_due_date ON campaign_milestones(due_date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS campaign_milestones CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS collaborations CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS campaign_applications CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS campaigns CASCADE;`);
  }
}
