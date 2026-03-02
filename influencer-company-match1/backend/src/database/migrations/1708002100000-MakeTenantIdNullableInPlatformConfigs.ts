import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTenantIdNullableInPlatformConfigs1708002100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_configs" 
      ALTER COLUMN "tenantId" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_configs" 
      ALTER COLUMN "tenantId" SET NOT NULL
    `);
  }
}
