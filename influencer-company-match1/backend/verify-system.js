const { Client } = require('pg');
const axios = require('axios');
require('dotenv').config();

async function verifySystem() {
  console.log('🔍 System Verification - Demo Accounts & Configuration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = {
    database: false,
    users: false,
    admin: false,
    stripe: false,
    backend: false,
  };

  // 1. Check Database Connection
  console.log('1️⃣  Database Connection\n');
  try {
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'influencer_matching',
    });

    await client.connect();
    console.log('   ✅ Connected to PostgreSQL');
    console.log(`   Database: ${process.env.DB_DATABASE}`);
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}\n`);

    // Check tables exist
    const tables = ['users', 'influencer_profiles', 'company_profiles', 'admin_users'];
    console.log('   Checking tables:');
    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );
      if (result.rows[0].exists) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        results.database = false;
      }
    }

    // Check user count
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const count = parseInt(userCount.rows[0].count);
    console.log(`\n   Total Users: ${count}`);
    
    if (count >= 10) {
      console.log('   ✅ Expected 10 users, found ' + count);
      results.users = true;
    } else {
      console.log(`   ⚠️  Expected 10 users, found ${count}`);
      console.log('   Action: Run npm run seed');
    }

    // Check admin user
    const adminCount = await client.query('SELECT COUNT(*) FROM admin_users');
    const adminTotal = parseInt(adminCount.rows[0].count);
    console.log(`\n   Admin Users: ${adminTotal}`);
    
    if (adminTotal >= 1) {
      console.log('   ✅ Admin user exists');
      results.admin = true;
    } else {
      console.log('   ⚠️  No admin user found');
      console.log('   Action: Run node create-super-admin.js');
    }

    await client.end();
    results.database = true;
    console.log('');
  } catch (error) {
    console.log(`   ❌ Database Error: ${error.message}\n`);
  }

  // 2. Check Backend API
  console.log('2️⃣  Backend API\n');
  try {
    const backendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const response = await axios.get(`${backendUrl}/api/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log(`   ✅ Backend is running at ${backendUrl}`);
      console.log(`   Status: ${response.data.status || 'OK'}\n`);
      results.backend = true;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Backend is not running');
      console.log('   Action: Run npm run start:dev in backend folder\n');
    } else {
      console.log(`   ⚠️  Backend check failed: ${error.message}\n`);
    }
  }

  // 3. Check Stripe Configuration
  console.log('3️⃣  Stripe Configuration\n');
  const stripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID,
  };

  let stripeIssues = 0;

  if (!stripeConfig.secretKey || !stripeConfig.secretKey.startsWith('sk_')) {
    console.log('   ❌ Secret Key missing or invalid');
    stripeIssues++;
  } else {
    console.log('   ✅ Secret Key configured');
  }

  if (!stripeConfig.publishableKey || !stripeConfig.publishableKey.startsWith('pk_')) {
    console.log('   ❌ Publishable Key missing or invalid');
    stripeIssues++;
  } else {
    console.log('   ✅ Publishable Key configured');
  }

  if (!stripeConfig.webhookSecret || stripeConfig.webhookSecret === 'whsec_...') {
    console.log('   ⚠️  Webhook Secret missing or placeholder');
    console.log('   Impact: Payment webhooks will not work');
    stripeIssues++;
  } else {
    console.log('   ✅ Webhook Secret configured');
  }

  if (!stripeConfig.connectClientId) {
    console.log('   ⚠️  Connect Client ID missing');
    console.log('   Impact: Influencer payouts will not work');
  } else {
    console.log('   ✅ Connect Client ID configured');
  }

  results.stripe = stripeIssues === 0;
  console.log('');

  // 4. Test Sample Login
  console.log('4️⃣  Sample Login Test\n');
  if (results.backend && results.users) {
    try {
      const backendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
        email: 'mike.tech@example.com',
        password: 'password123',
      });

      if (loginResponse.data && loginResponse.data.token) {
        console.log('   ✅ Login successful (mike.tech@example.com)');
        console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
        console.log(`   User: ${loginResponse.data.user.name || 'N/A'}\n`);
      }
    } catch (error) {
      console.log('   ❌ Login failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }
  } else {
    console.log('   ⏭️  Skipped (backend or users not ready)\n');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Verification Summary:\n');
  
  console.log(`   Database:     ${results.database ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Users:        ${results.users ? '✅ OK' : '⚠️  INCOMPLETE'}`);
  console.log(`   Admin:        ${results.admin ? '✅ OK' : '⚠️  MISSING'}`);
  console.log(`   Backend API:  ${results.backend ? '✅ OK' : '❌ NOT RUNNING'}`);
  console.log(`   Stripe:       ${results.stripe ? '✅ OK' : '⚠️  INCOMPLETE'}\n`);

  const allGood = Object.values(results).every(v => v === true);

  if (allGood) {
    console.log('🎉 All systems are operational!\n');
    console.log('✅ You can now:');
    console.log('   • Login with any demo account (password: password123)');
    console.log('   • Access admin dashboard (admin@example.com / Admin123!)');
    console.log('   • Test payment features (if Stripe is configured)\n');
    return true;
  } else {
    console.log('⚠️  Some issues need attention:\n');
    
    if (!results.database) {
      console.log('   🔧 Database:');
      console.log('      • Check PostgreSQL is running');
      console.log('      • Verify .env database credentials');
      console.log('      • Run: npm run migration:run\n');
    }
    
    if (!results.users) {
      console.log('   🔧 Users:');
      console.log('      • Run: npm run seed\n');
    }
    
    if (!results.admin) {
      console.log('   🔧 Admin:');
      console.log('      • Run: node create-super-admin.js\n');
    }
    
    if (!results.backend) {
      console.log('   🔧 Backend:');
      console.log('      • Run: npm run start:dev\n');
    }
    
    if (!results.stripe) {
      console.log('   🔧 Stripe:');
      console.log('      • Run: node verify-stripe-config.js');
      console.log('      • Follow instructions to configure Stripe\n');
    }

    return false;
  }
}

// Run verification
verifySystem()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  });
