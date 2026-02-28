import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientSecretToPayments1708000000000 implements MigrationInterface {
  name = 'AddClientSecretToPayments1708000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add client_secret column to collaboration_payments table
    await queryRunner.query(`
      ALTER TABLE collaboration_payments 
      ADD COLUMN client_secret VARCHAR(255) NULL
    `);
    
    console.log('Added client_secret column to collaboration_payments table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE collaboration_payments 
      DROP COLUMN client_secret
    `);
    
    console.log('Dropped client_secret column from collaboration_payments table');
  }
}
