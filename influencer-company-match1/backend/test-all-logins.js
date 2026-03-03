const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const testAccounts = [
  // Influencers
  { email: 'mike.tech@example.com', name: 'Mike Chen', role: 'INFLUENCER' },
  { email: 'sarah.fashion@example.com', name: 'Sarah Johnson', role: 'INFLUENCER' },
  { email: 'emma.fitness@example.com', name: 'Emma Rodriguez', role: 'INFLUENCER' },
  { email: 'lisa.foodtravel@example.com', name: 'Lisa Wang', role: 'INFLUENCER' },
  { email: 'alex.gaming@example.com', name: 'Alex Martinez', role: 'INFLUENCER' },
  // Companies
  { email: 'contact@techstartup.com', name: 'TechStartup Inc', role: 'COMPANY' },
  { email: 'marketing@fashionbrand.com', name: 'Fashion Brand Co', role: 'COMPANY' },
  { email: 'partnerships@fitnessapp.com', name: 'FitnessApp', role: 'COMPANY' },
  { email: 'sales@gaminggear.com', name: 'GamingGear Pro', role: 'COMPANY' },
  { email: 'partnerships@travelworld.com', name: 'TravelWorld Agency', role: 'COMPANY' },
];

const password = 'password123';

async function testLogin(account) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: account.email,
      password: password,
    });

    if (response.data && response.data.token) {
      return {
        success: true,
        account: account,
        token: response.data.token.substring(0, 20) + '...',
        user: response.data.user,
      };
    } else {
      return {
        success: false,
        account: account,
        error: 'No token received',
      };
    }
  } catch (error) {
    return {
      success: false,
      account: account,
      error: error.response?.data?.message || error.message,
    };
  }
}

async function testAllLogins() {
  console.log('🧪 Testing All Demo Account Logins\n');
  console.log(`API URL: ${API_URL}/api/auth/login`);
  console.log(`Password: ${password}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const account of testAccounts) {
    process.stdout.write(`Testing ${account.name.padEnd(25)} (${account.email.padEnd(35)}) ... `);
    
    const result = await testLogin(account);
    results.push(result);

    if (result.success) {
      console.log('✅ SUCCESS');
      successCount++;
    } else {
      console.log(`❌ FAILED: ${result.error}`);
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Test Summary:\n');
  console.log(`   Total Accounts: ${testAccounts.length}`);
  console.log(`   ✅ Successful:   ${successCount}`);
  console.log(`   ❌ Failed:       ${failCount}`);
  console.log(`   Success Rate:   ${((successCount / testAccounts.length) * 100).toFixed(1)}%\n`);

  if (failCount > 0) {
    console.log('❌ Failed Accounts:\n');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.account.name} (${r.account.email})`);
        console.log(`     Error: ${r.error}\n`);
      });
  }

  if (successCount === testAccounts.length) {
    console.log('🎉 All accounts are working correctly!\n');
    return true;
  } else {
    console.log('⚠️  Some accounts failed. Please check the errors above.\n');
    console.log('💡 Troubleshooting:');
    console.log('   1. Ensure backend is running: npm run start:dev');
    console.log('   2. Check database is seeded: npm run seed');
    console.log('   3. Verify database connection in .env file\n');
    return false;
  }
}

// Run the test
testAllLogins()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  });
