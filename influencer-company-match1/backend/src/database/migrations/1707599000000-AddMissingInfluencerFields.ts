import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingInfluencerFields1707599000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add contentType field (simple-array stored as text with comma separation)
    await queryRunner.query(`
      ALTER TABLE influencer_profiles 
      ADD COLUMN IF NOT EXISTS "contentType" text;
    `);

    // Add verificationStatus field
    await queryRunner.query(`
      ALTER TABLE influencer_profiles 
      ADD COLUMN IF NOT EXISTS "verificationStatus" boolean DEFAULT false;
    `);

    console.log('✅ Added contentType and verificationStatus to influencer_profiles');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE influencer_profiles 
      DROP COLUMN IF EXISTS "contentType";
    `);

    await queryRunner.query(`
      ALTER TABLE influencer_profiles 
      DROP COLUMN IF EXISTS "verificationStatus";
    `);

    console.log('✅ Removed contentType and verificationStatus from influencer_profiles');
  }
}
