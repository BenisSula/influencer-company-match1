import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Enhance Profile Fields
 * Phase 1: Enhanced Profile Fields
 * 
 * This migration adds new columns to influencer_profiles and company_profiles tables
 * to support enhanced profile information including content types, collaboration preferences,
 * verification status, and media galleries.
 * 
 * Requirements: 1.1.1-1.1.9, 1.2.1-1.2.7
 */
export class EnhanceProfileFields1707596100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper function to check if column exists
    const columnExists = async (table: string, column: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`
      );
      return result.length > 0;
    };

    // Add new columns to influencer_profiles table
    if (!(await columnExists('influencer_profiles', 'contentType'))) {
      await queryRunner.addColumn(
        'influencer_profiles',
        new TableColumn({
          name: 'contentType',
          type: 'text',
          isNullable: true,
          comment: 'Comma-separated list of content types: video, image, blog, podcast',
        }),
      );
    }

    if (!(await columnExists('influencer_profiles', 'collaborationPreference'))) {
      await queryRunner.addColumn(
        'influencer_profiles',
        new TableColumn({
          name: 'collaborationPreference',
          type: 'varchar',
          length: '50',
          isNullable: true,
          comment: 'Collaboration preference: one-time, long-term, flexible',
        }),
      );
    }

    if (!(await columnExists('influencer_profiles', 'verificationStatus'))) {
      await queryRunner.addColumn(
        'influencer_profiles',
        new TableColumn({
          name: 'verificationStatus',
          type: 'boolean',
          default: false,
          isNullable: false,
          comment: 'Whether the profile has been verified by admins',
        }),
      );
    }

    if (!(await columnExists('influencer_profiles', 'mediaGallery'))) {
      await queryRunner.addColumn(
        'influencer_profiles',
        new TableColumn({
          name: 'mediaGallery',
          type: 'json',
          isNullable: true,
          comment: 'JSON array of media items with metadata (id, url, type, caption, uploadedAt, fileSize, mimeType)',
        }),
      );
    }

    // Add new columns to company_profiles table
    if (!(await columnExists('company_profiles', 'companySize'))) {
      await queryRunner.addColumn(
        'company_profiles',
        new TableColumn({
          name: 'companySize',
          type: 'varchar',
          length: '50',
          isNullable: true,
          comment: 'Company size: startup, small, medium, large, enterprise',
        }),
      );
    }

    if (!(await columnExists('company_profiles', 'campaignType'))) {
      await queryRunner.addColumn(
        'company_profiles',
        new TableColumn({
          name: 'campaignType',
          type: 'text',
          isNullable: true,
          comment: 'Comma-separated list of campaign types: product-launch, brand-awareness, event, sponsored-content',
        }),
      );
    }

    if (!(await columnExists('company_profiles', 'preferredInfluencerNiches'))) {
      await queryRunner.addColumn(
        'company_profiles',
        new TableColumn({
          name: 'preferredInfluencerNiches',
          type: 'text',
          isNullable: true,
          comment: 'Comma-separated list of preferred influencer niches',
        }),
      );
    }

    if (!(await columnExists('company_profiles', 'collaborationDuration'))) {
      await queryRunner.addColumn(
        'company_profiles',
        new TableColumn({
          name: 'collaborationDuration',
          type: 'varchar',
          length: '50',
          isNullable: true,
          comment: 'Collaboration duration preference: short-term, medium-term, long-term',
        }),
      );
    }

    if (!(await columnExists('company_profiles', 'verificationStatus'))) {
      await queryRunner.addColumn(
        'company_profiles',
        new TableColumn({
          name: 'verificationStatus',
          type: 'boolean',
          default: false,
          isNullable: false,
          comment: 'Whether the profile has been verified by admins',
        }),
      );
    }

    console.log('✅ Enhanced profile fields migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from influencer_profiles table
    await queryRunner.dropColumn('influencer_profiles', 'contentType');
    await queryRunner.dropColumn('influencer_profiles', 'collaborationPreference');
    await queryRunner.dropColumn('influencer_profiles', 'verificationStatus');
    await queryRunner.dropColumn('influencer_profiles', 'mediaGallery');

    // Remove columns from company_profiles table
    await queryRunner.dropColumn('company_profiles', 'companySize');
    await queryRunner.dropColumn('company_profiles', 'campaignType');
    await queryRunner.dropColumn('company_profiles', 'preferredInfluencerNiches');
    await queryRunner.dropColumn('company_profiles', 'collaborationDuration');
    await queryRunner.dropColumn('company_profiles', 'verificationStatus');

    console.log('✅ Enhanced profile fields migration rolled back');
  }
}
