const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'influencer_matching',
  synchronize: false,
  logging: false,
});

async function getAllCredentials() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('           ALL USER CREDENTIALS IN DATABASE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get all users with their profiles
    const users = await AppDataSource.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u."isActive",
        ip.name as influencer_name,
        ip.niche,
        ip.bio as influencer_bio,
        ip."followerCount",
        ip.platforms as influencer_platforms,
        cp.name as company_name,
        cp.industry,
        cp.bio as company_bio,
        cp.platforms as company_platforms
      FROM users u
      LEFT JOIN influencer_profiles ip ON u.id = ip."userId"
      LEFT JOIN company_profiles cp ON u.id = cp."userId"
      WHERE u.email NOT LIKE 'test%'
      ORDER BY u.role, u.email
    `);

    console.log(`Total Users: ${users.length}\n`);

    // Group by role
    const influencers = users.filter(u => u.role === 'INFLUENCER');
    const companies = users.filter(u => u.role === 'COMPANY');

    // Display Influencers
    console.log('🎭 INFLUENCERS');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    influencers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.influencer_name || 'Unknown'}`);
      console.log(`   Email:     ${user.email}`);
      console.log(`   Password:  password123`);
      console.log(`   Niche:     ${user.niche || 'Not set'}`);
      console.log(`   Followers: ${user.followerCount ? user.followerCount.toLocaleString() : 'Not set'}`);
      if (user.influencer_bio) {
        console.log(`   Bio:       ${user.influencer_bio.substring(0, 60)}...`);
      }
      console.log(`   Status:    ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log('');
    });

    // Display Companies
    console.log('\n🏢 COMPANIES');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    companies.forEach((user, index) => {
      console.log(`${index + 1}. ${user.company_name || 'Unknown'}`);
      console.log(`   Email:     ${user.email}`);
      console.log(`   Password:  password123`);
      console.log(`   Industry:  ${user.industry || 'Not set'}`);
      if (user.company_bio) {
        console.log(`   Bio:       ${user.company_bio.substring(0, 60)}...`);
      }
      console.log(`   Status:    ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n📝 NOTES:');
    console.log('   • All accounts use password: password123');
    console.log('   • All accounts are active and ready to use');
    console.log('   • Login at: http://localhost:5173');
    console.log('   • API endpoint: http://localhost:3000/api/auth/login');
    console.log('\n═══════════════════════════════════════════════════════════════\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getAllCredentials();
