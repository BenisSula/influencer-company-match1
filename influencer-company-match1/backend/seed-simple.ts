import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'influencer_matching',
  });

  try {
    await client.connect();
    console.log('📦 Connected to database');

    // Check if data exists
    const checkResult = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(checkResult.rows[0].count) > 0) {
      console.log('⚠️  Database already has users. Skipping seed.');
      await client.end();
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert influencers
    const influencers = [
      ['sarah.fashion@example.com', 'Sarah Johnson', 'Fashion & Lifestyle'],
      ['mike.tech@example.com', 'Mike Chen', 'Technology'],
      ['emma.fitness@example.com', 'Emma Rodriguez', 'Fitness & Wellness'],
    ];

    for (const [email, name, niche] of influencers) {
      const userResult = await client.query(
        `INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage") 
         VALUES ($1, $2, $3, true, 100) RETURNING id`,
        [email, hashedPassword, 'INFLUENCER']
      );
      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO influencer_profiles ("userId", name, niche, bio, "followerCount", "engagementRate", location, platforms) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, name, niche, `${name} - Professional influencer`, 150000, 4.5, 'USA', JSON.stringify(['Instagram', 'TikTok'])]
      );
      console.log(`✅ Created influencer: ${name}`);
    }

    // Insert companies
    const companies = [
      ['contact@techstartup.com', 'TechStartup Inc', 'Technology'],
      ['marketing@fashionbrand.com', 'Fashion Brand Co', 'Fashion'],
      ['partnerships@fitnessapp.com', 'FitnessApp', 'Health & Fitness'],
    ];

    for (const [email, name, industry] of companies) {
      const userResult = await client.query(
        `INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage") 
         VALUES ($1, $2, $3, true, 100) RETURNING id`,
        [email, hashedPassword, 'COMPANY']
      );
      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO company_profiles ("userId", "companyName", industry, description, budget, location, platforms, "companySize") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, name, industry, `${name} - Leading company`, 50000, 'USA', JSON.stringify(['Instagram', 'YouTube']), 'medium']
      );
      console.log(`✅ Created company: ${name}`);
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: sarah.fashion@example.com');
    console.log('   Password: password123');
    console.log('\n   Or any other seeded email with password: password123\n');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

seed();
