import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastMessageToConversations1707596300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add last_message column to conversations table
    await queryRunner.query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS last_message TEXT;
    `);

    console.log('✅ Added last_message column to conversations table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE conversations 
      DROP COLUMN IF EXISTS last_message;
    `);
  }
}
