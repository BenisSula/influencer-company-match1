import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateProfileReviewsTable1707595000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create profile_reviews table
    await queryRunner.createTable(
      new Table({
        name: 'profile_reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'profile_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reviewer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'connection_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'overall_rating',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'communication_rating',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'professionalism_rating',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'quality_rating',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'timeliness_rating',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'collaboration_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'project_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'helpful_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add indexes
    await queryRunner.createIndex(
      'profile_reviews',
      new TableIndex({
        name: 'idx_profile_reviews_profile',
        columnNames: ['profile_id'],
      }),
    );

    await queryRunner.createIndex(
      'profile_reviews',
      new TableIndex({
        name: 'idx_profile_reviews_reviewer',
        columnNames: ['reviewer_id'],
      }),
    );

    await queryRunner.createIndex(
      'profile_reviews',
      new TableIndex({
        name: 'idx_profile_reviews_rating',
        columnNames: ['overall_rating'],
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'profile_reviews',
      new TableForeignKey({
        columnNames: ['profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'profile_reviews',
      new TableForeignKey({
        columnNames: ['reviewer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'profile_reviews',
      new TableForeignKey({
        columnNames: ['connection_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'connections',
        onDelete: 'SET NULL',
      }),
    );

    // Create unique constraint to prevent duplicate reviews for same connection
    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_profile_reviews_unique_connection 
       ON profile_reviews(profile_id, reviewer_id, connection_id) 
       WHERE connection_id IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('profile_reviews');
  }
}
