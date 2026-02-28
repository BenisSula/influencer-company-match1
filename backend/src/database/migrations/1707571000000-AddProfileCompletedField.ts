import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfileCompletedField1707571000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if profileCompleted column exists
    const table = await queryRunner.getTable('users');
    const hasProfileCompleted = table?.columns.find(col => col.name === 'profileCompleted');
    const hasProfileCompletionPercentage = table?.columns.find(col => col.name === 'profileCompletionPercentage');

    // Add profileCompleted column if it doesn't exist
    if (!hasProfileCompleted) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'profileCompleted',
          type: 'boolean',
          default: false,
        }),
      );
    }

    // Add profileCompletionPercentage column if it doesn't exist
    if (!hasProfileCompletionPercentage) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'profileCompletionPercentage',
          type: 'int',
          default: 0,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'profileCompletionPercentage');
    await queryRunner.dropColumn('users', 'profileCompleted');
  }
}
