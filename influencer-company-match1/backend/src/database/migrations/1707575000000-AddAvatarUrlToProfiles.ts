import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToProfiles1707575000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add avatarUrl to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "avatarUrl" text;
    `);

    // Add avatarUrl to influencer_profiles table
    await queryRunner.query(`
      ALTER TABLE "influencer_profiles" 
      ADD COLUMN IF NOT EXISTS "avatarUrl" text;
    `);

    // Add avatarUrl to company_profiles table
    await queryRunner.query(`
      ALTER TABLE "company_profiles" 
      ADD COLUMN IF NOT EXISTS "avatarUrl" text;
    `);

    console.log('✅ Added avatarUrl column to users and profile tables');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "avatarUrl";
    `);

    await queryRunner.query(`
      ALTER TABLE "influencer_profiles" 
      DROP COLUMN IF EXISTS "avatarUrl";
    `);

    await queryRunner.query(`
      ALTER TABLE "company_profiles" 
      DROP COLUMN IF EXISTS "avatarUrl";
    `);

    console.log('✅ Removed avatarUrl column from users and profile tables');
  }
}
