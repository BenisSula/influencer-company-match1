import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCompanyNameField1707597000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before renaming
    const table = await queryRunner.getTable('company_profiles');
    const hasCompanyName = table?.columns.find(col => col.name === 'companyName');
    const hasName = table?.columns.find(col => col.name === 'name');

    if (hasCompanyName && !hasName) {
      await queryRunner.query(`
        ALTER TABLE company_profiles 
        RENAME COLUMN "companyName" TO name
      `);
      console.log('✅ Renamed companyName to name in company_profiles');
    } else if (hasName) {
      console.log('✅ Column "name" already exists, skipping migration');
    } else {
      console.log('⚠️  Neither companyName nor name column found');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('company_profiles');
    const hasName = table?.columns.find(col => col.name === 'name');

    if (hasName) {
      await queryRunner.query(`
        ALTER TABLE company_profiles 
        RENAME COLUMN name TO "companyName"
      `);
      console.log('✅ Reverted name to companyName in company_profiles');
    }
  }
}
