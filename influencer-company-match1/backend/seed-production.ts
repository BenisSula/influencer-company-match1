/**
 * Production Seed Script
 * Run this to seed demo accounts in the production database
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run seed:prod
 * 
 * Or set environment variables and run:
 *   npm run seed:prod
 */

import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function seed() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('Usage: DATABASE_URL="postgresql://..." node seed-production.ts');
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase
    },
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
    const influencers: [string, string, string, number, number][] = [
      ['mike.tech@example.com', 'Mike Chen', 'Technology', 200000, 4.8],
      ['sarah.fashion@example.com', 'Sarah Johnson', 'Fashion & Lifestyle', 150000, 5.2],
      ['emma.fitness@example.com', 'Emma Rodriguez', 'Fitness & Wellness', 180000, 4.5],
      ['lisa.foodtravel@example.com', 'Lisa Wang', 'Food & Travel', 175000, 4.9],
      ['alex.gaming@example.com', 'Alex Martinez', 'Gaming & Esports', 250000, 5.5],
    ];

    for (const [email, name, niche, followers, engagement] of influencers) {
      const userResult = await client.query(
        `INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage") 
         VALUES ($1, $2, $3, true, 100) RETURNING id`,
        [email, hashedPassword, 'INFLUENCER']
      );
      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO influencer_profiles ("userId", name, niche, bio, "followerCount", "engagementRate", location, platforms) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, name, niche, `${name} - Professional ${niche.toLowerCase()} influencer`, followers, engagement, 'USA', JSON.stringify(['Instagram', 'TikTok', 'YouTube'])]
      );
      console.log(`✅ Created influencer: ${name} (${followers.toLocaleString()} followers)`);
    }

    // Insert companies
    const companies: [string, string, string, number][] = [
      ['contact@techstartup.com', 'TechStartup Inc', 'Technology', 50000],
      ['marketing@fashionbrand.com', 'Fashion Brand Co', 'Fashion', 45000],
      ['partnerships@fitnessapp.com', 'FitnessApp', 'Health & Fitness', 40000],
      ['sales@gaminggear.com', 'GamingGear Pro', 'Gaming & Electronics', 55000],
      ['partnerships@travelworld.com', 'TravelWorld Agency', 'Travel & Tourism', 60000],
    ];

    for (const [email, name, industry, budget] of companies) {
      const userResult = await client.query(
        `INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage") 
         VALUES ($1, $2, $3, true, 100) RETURNING id`,
        [email, hashedPassword, 'COMPANY']
      );
      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO company_profiles ("userId", name, industry, description, budget, location, platforms, "companySize") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, name, industry, `${name} - Leading ${industry.toLowerCase()} company`, budget, 'USA', JSON.stringify(['Instagram', 'YouTube', 'TikTok']), 'medium']
      );
      console.log(`✅ Created company: ${name} ($${(budget/1000).toFixed(0)}K budget)`);
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ 5 Influencers created');
    console.log('   ✅ 5 Companies created');
    console.log('   ✅ Total: 10 users\n');
    console.log('📝 Test Credentials:');
    console.log('   Email: mike.tech@example.com (or any other seeded email)');
    console.log('   Password: password123');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

seed();
