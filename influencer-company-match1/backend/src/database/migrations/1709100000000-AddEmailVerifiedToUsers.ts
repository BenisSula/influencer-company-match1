import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEmailVerifiedToUsers1709100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add email_verified column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'email_verified',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );

    // Optionally: Mark existing users as verified (or keep as false)
    // await queryRunner.query(`UPDATE users SET email_verified = true WHERE created_at < NOW()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'email_verified');
  }
}
