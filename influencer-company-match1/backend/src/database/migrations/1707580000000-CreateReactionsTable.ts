import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateReactionsTable1707580000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'target_type',
            type: 'varchar',
            length: '50',
            comment: 'post, comment, match',
          },
          {
            name: 'target_id',
            type: 'uuid',
          },
          {
            name: 'reaction_type',
            type: 'varchar',
            length: '20',
            comment: 'like, love, wow, haha, sad, angry',
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

    // Create indexes for performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reactions_user_target" ON "reactions" ("user_id", "target_type", "target_id")`
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reactions_target" ON "reactions" ("target_type", "target_id")`
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'reactions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add unique constraint (one reaction per user per target) if not exists
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_target'
        ) THEN
          ALTER TABLE reactions 
          ADD CONSTRAINT UQ_user_target 
          UNIQUE (user_id, target_type, target_id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reactions');
  }
}
