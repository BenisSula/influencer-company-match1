import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixConnectionStatusEnum1707596500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update all 'connected' status to 'accepted'
    await queryRunner.query(`
      UPDATE connections 
      SET status = 'accepted' 
      WHERE status = 'connected';
    `);

    console.log('✅ Updated connection status from "connected" to "accepted"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert accepted back to connected
    await queryRunner.query(`
      UPDATE connections 
      SET status = 'connected' 
      WHERE status = 'accepted';
    `);
  }
}
