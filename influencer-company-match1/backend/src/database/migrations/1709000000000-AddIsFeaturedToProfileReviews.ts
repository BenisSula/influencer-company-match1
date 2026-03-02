import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsFeaturedToProfileReviews1709000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'profile_reviews',
      new TableColumn({
        name: 'is_featured',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profile_reviews', 'is_featured');
  }
}
