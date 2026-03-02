import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCompanyNameToName1707596400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if companyName column exists before renaming
    const result = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'company_profiles' 
      AND column_name = 'companyName';
    `);

    if (result.length > 0) {
      // Rename companyName to name in company_profiles table
      await queryRunner.query(`
        ALTER TABLE company_profiles 
        RENAME COLUMN "companyName" TO name;
      `);
      console.log('✅ Renamed companyName to name in company_profiles table');
    } else {
      console.log('ℹ️  Column companyName does not exist, skipping rename');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE company_profiles 
      RENAME COLUMN name TO "companyName";
    `);
  }
}
