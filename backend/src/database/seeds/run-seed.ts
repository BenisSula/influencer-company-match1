import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';
import * as dotenv from 'dotenv';
import { User } from '../../modules/auth/entities/user.entity';
import { InfluencerProfile } from '../../modules/auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../../modules/auth/entities/company-profile.entity';

dotenv.config();

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'influencer_matching',
    entities: [User, InfluencerProfile, CompanyProfile],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connection established');

    await seedDatabase(dataSource);

    await dataSource.destroy();
    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
