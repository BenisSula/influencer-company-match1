import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCollaborationDataToConnections1707587000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add collaboration_request_data JSON column
    await queryRunner.addColumn(
      'connections',
      new TableColumn({
        name: 'collaboration_request_data',
        type: 'jsonb',
        isNullable: true,
        comment: 'Stores collaboration request details (budget, timeline, deliverables, etc.)',
      }),
    );

    // Add collaboration_status column
    await queryRunner.addColumn(
      'connections',
      new TableColumn({
        name: 'collaboration_status',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: null,
        comment: 'Status of collaboration (requested, negotiating, agreed, active, completed, cancelled)',
      }),
    );

    // Add collaboration_type column
    await queryRunner.addColumn(
      'connections',
      new TableColumn({
        name: 'collaboration_type',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: null,
        comment: 'Type of collaboration (one-time, ongoing, project-based)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('connections', 'collaboration_type');
    await queryRunner.dropColumn('connections', 'collaboration_status');
    await queryRunner.dropColumn('connections', 'collaboration_request_data');
  }
}
