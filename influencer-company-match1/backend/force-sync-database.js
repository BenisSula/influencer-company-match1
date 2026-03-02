#!/usr/bin/env node

/**
 * Force Database Synchronization Script
 * This script forces TypeORM to create all tables
 */

const { DataSource } = require('typeorm');
require('dotenv').config();

// Import all entities
const { User } = require('./dist/modules/auth/entities/user.entity');
const { InfluencerProfile } = require('./dist/modules/auth/entities/influencer-profile.entity');
const { CompanyProfile } = require('./dist/modules/auth/entities/company-profile.entity');

async function forceSyncDatabase() {
  console.log('🔄 Starting forced database synchronization...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
    console.error('Please set DATABASE_URL in your .env file or environment variables.');
    process.exit(1);
  }

  console.log('📊 Database URL:', databaseUrl.substring(0, 30) + '...');

  try {
    // Create DataSource with synchronize enabled
    const AppDataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      synchronize: true, // Force synchronization
      logging: true,
      entities: ['dist/**/*.entity.js'],
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('\n🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully!');

    console.log('\n🔨 Synchronizing database schema...');
    await AppDataSource.synchronize(true); // Force drop and recreate
    console.log('✅ Database synchronized successfully!');

    // Check if tables were created
    console.log('\n📋 Checking created tables...');
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    
    console.log(`\n✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log('\n🎉 Database synchronization completed successfully!');
    console.log('\n✅ You can now try logging in again.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR during database synchronization:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

forceSyncDatabase();
