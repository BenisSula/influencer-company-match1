const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetAndSeed() {
  console.log('🔄 Reset and Reseed Database\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'influencer_matching',
  });

  try {
    await client.connect();
    console.log('📦 Connected to database\n');

    // 1. Clear existing data
    console.log('1️⃣  Clearing existing data...\n');
    
    await client.query('DELETE FROM influencer_profiles');
    console.log('   ✅ Cleared influencer_profiles');
    
    await client.query('DELETE FROM company_profiles');
    console.log('   ✅ Cleared company_profiles');
    
    await client.query('DELETE FROM users WHERE role IN (\'INFLUENCER\', \'COMPANY\')');
    console.log('   ✅ Cleared users\n');

    // 2. Hash password
    console.log('2️⃣  Hashing password...\n');
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log(`   ✅ Password hashed: ${hashedPassword.substring(0, 20)}...\n`);

    // 3. Insert influencers
    console.log('3️⃣  Creating influencers...\n');
    const influencers = [
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
        `INSERT INTO influencer_profiles ("userId", name, niche, bio, "audienceSize", "engagementRate", location, platforms) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          name,
          niche,
          `${name} - Professional ${niche.toLowerCase()} influencer`,
          followers,
          engagement,
          'USA',
          JSON.stringify(['Instagram', 'TikTok', 'YouTube'])
        ]
      );
      console.log(`   ✅ ${name} (${followers.toLocaleString()} followers)`);
    }

    // 4. Insert companies
    console.log('\n4️⃣  Creating companies...\n');
    const companies = [
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
        [
          userId,
          name,
          industry,
          `${name} - Leading ${industry.toLowerCase()} company`,
          budget,
          'USA',
          JSON.stringify(['Instagram', 'YouTube', 'TikTok']),
          'medium'
        ]
      );
      console.log(`   ✅ ${name} ($${(budget/1000).toFixed(0)}K budget)`);
    }

    // 5. Verify data
    console.log('\n5️⃣  Verifying data...\n');
    const userCount = await client.query('SELECT COUNT(*) FROM users WHERE role IN (\'INFLUENCER\', \'COMPANY\')');
    const influencerCount = await client.query('SELECT COUNT(*) FROM influencer_profiles');
    const companyCount = await client.query('SELECT COUNT(*) FROM company_profiles');

    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Influencer Profiles: ${influencerCount.rows[0].count}`);
    console.log(`   Company Profiles: ${companyCount.rows[0].count}\n`);

    // 6. Test password
    console.log('6️⃣  Testing password...\n');
    const testUser = await client.query('SELECT password FROM users WHERE email = $1', ['mike.tech@example.com']);
    if (testUser.rows.length > 0) {
      const isValid = await bcrypt.compare('password123', testUser.rows[0].password);
      if (isValid) {
        console.log('   ✅ Password verification successful\n');
      } else {
        console.log('   ❌ Password verification failed\n');
      }
    }

    await client.end();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Database reset and seeding completed!\n');
    console.log('📝 Test Credentials:');
    console.log('   Email: mike.tech@example.com (or any other email)');
    console.log('   Password: password123\n');
    console.log('🔐 Admin Account:');
    console.log('   Run: node create-super-admin.js\n');
    console.log('🧪 Test Login:');
    console.log('   Run: node diagnose-auth-flow.js\n');

    return true;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    await client.end();
    return false;
  }
}

// Run reset and seed
resetAndSeed()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  });
