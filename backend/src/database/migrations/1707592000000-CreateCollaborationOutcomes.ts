import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCollaborationOutcomes1707592000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'collaboration_outcomes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'connection_id',
            type: 'uuid',
          },
          {
            name: 'success_rating',
            type: 'integer',
          },
          {
            name: 'completion_status',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'user_feedback',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'factors_at_match',
            type: 'jsonb',
          },
          {
            name: 'roi_achieved',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'would_collaborate_again',
            type: 'boolean',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'collaboration_outcomes',
      new TableForeignKey({
        columnNames: ['connection_id'],
        referencedTableName: 'connections',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collaboration_outcomes',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(
      `CREATE INDEX idx_collaboration_outcomes_connection ON collaboration_outcomes(connection_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_collaboration_outcomes_user ON collaboration_outcomes(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_collaboration_outcomes_rating ON collaboration_outcomes(success_rating)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_collaboration_outcomes_status ON collaboration_outcomes(completion_status)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('collaboration_outcomes');
  }
}
