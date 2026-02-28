import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConnectedStatusToConnections1707573000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, check if the enum type exists
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'connections_status_enum'
      );
    `);

    if (!enumExists[0].exists) {
      // Drop the default constraint first
      await queryRunner.query(`
        ALTER TABLE "connections" 
        ALTER COLUMN "status" DROP DEFAULT;
      `);

      // Create enum type if it doesn't exist
      await queryRunner.query(`
        CREATE TYPE "connections_status_enum" AS ENUM ('pending', 'connected', 'accepted', 'rejected');
      `);
      
      // Alter the column to use the enum type
      await queryRunner.query(`
        ALTER TABLE "connections" 
        ALTER COLUMN "status" TYPE "connections_status_enum" 
        USING "status"::text::"connections_status_enum";
      `);

      // Re-add the default
      await queryRunner.query(`
        ALTER TABLE "connections" 
        ALTER COLUMN "status" SET DEFAULT 'pending';
      `);
    } else {
      // If enum exists, just add the 'connected' value if not already there
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'connected' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'connections_status_enum')
          ) THEN
            ALTER TYPE "connections_status_enum" ADD VALUE 'connected';
          END IF;
        END $$;
      `);
    }

    console.log('✅ Added "connected" status to connections table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing enum values directly
    // You would need to recreate the enum without 'connected' if you want to revert
    console.log('⚠️  Cannot remove enum value in PostgreSQL. Manual intervention required if rollback needed.');
  }
}
