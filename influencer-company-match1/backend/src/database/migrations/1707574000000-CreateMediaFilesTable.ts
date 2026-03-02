import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMediaFilesTable1707574000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create media_files table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "media_files" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "fileType" varchar(50) NOT NULL,
        "fileUrl" text NOT NULL,
        "thumbnailUrl" text,
        "fileSize" integer NOT NULL,
        "mimeType" varchar(100) NOT NULL,
        "width" integer,
        "height" integer,
        "altText" text,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_media_user_id" ON "media_files"("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_media_file_type" ON "media_files"("fileType")
    `);

    console.log('✅ Media files table migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_media_file_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_media_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media_files"`);
  }
}
