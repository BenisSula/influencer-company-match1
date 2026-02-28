import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthAndMatchingTables1707570000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        role varchar(50) NOT NULL,
        "isActive" boolean DEFAULT true,
        "profileCompleted" boolean DEFAULT false,
        "profileCompletionPercentage" integer DEFAULT 0,
        "avatarUrl" varchar(500),
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create influencer_profiles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS influencer_profiles (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid UNIQUE NOT NULL,
        name varchar(255),
        bio text,
        niche varchar(100),
        platforms jsonb,
        "followerCount" integer,
        "engagementRate" decimal(5,2),
        location varchar(255),
        "audienceSize" integer,
        "portfolioUrl" varchar(500),
        "minBudget" integer,
        "maxBudget" integer,
        "collaborationPreference" varchar(100),
        "avatarUrl" varchar(500),
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create company_profiles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_profiles (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid UNIQUE NOT NULL,
        name varchar(255),
        industry varchar(100),
        bio text,
        description text,
        website varchar(255),
        budget integer,
        location varchar(255),
        platforms jsonb,
        "companySize" varchar(50),
        "campaignType" jsonb,
        "preferredInfluencerNiches" text,
        "collaborationDuration" varchar(100),
        "minAudienceSize" integer,
        "maxAudienceSize" integer,
        "verificationStatus" boolean DEFAULT false,
        "avatarUrl" varchar(500),
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create connections table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS connections (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "requesterId" uuid NOT NULL,
        "recipientId" uuid NOT NULL,
        status varchar NOT NULL DEFAULT 'pending',
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("requesterId") REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY ("recipientId") REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create matches table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "influencerId" uuid NOT NULL,
        "companyId" uuid NOT NULL,
        score decimal(5,2) NOT NULL,
        factors jsonb,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("influencerId") REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY ("companyId") REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Auth and matching tables migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS matches`);
    await queryRunner.query(`DROP TABLE IF EXISTS connections`);
    await queryRunner.query(`DROP TABLE IF EXISTS company_profiles`);
    await queryRunner.query(`DROP TABLE IF EXISTS influencer_profiles`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
