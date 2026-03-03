const { Client } = require('pg');
const bcrypt = require('bcrypt');
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'mike.tech@example.com';
const TEST_PASSWORD = 'password123';

async function diagnoseAuthFlow() {
  console.log('🔍 Authentication Flow Diagnosis\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = {
    database: false,
    userExists: false,
    passwordHash: false,
    backendRunning: false,
    loginEndpoint: false,
    authFlow: false,
  };

  // 1. Check Database Connection
  console.log('1️⃣  Database Connection\n');
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'influencer_matching',
  });

  try {
    await client.connect();
    console.log('   ✅ Connected to PostgreSQL');
    console.log(`   Database: ${process.env.DB_DATABASE}\n`);
    results.database = true;

    // 2. Check if user exists
    console.log('2️⃣  User Existence Check\n');
    const userQuery = await client.query(
      'SELECT id, email, password, role FROM users WHERE email = $1',
      [TEST_EMAIL]
    );

    if (userQuery.rows.length === 0) {
      console.log(`   ❌ User not found: ${TEST_EMAIL}`);
      console.log('   Action: Run npm run seed\n');
    } else {
      const user = userQuery.rows[0];
      console.log(`   ✅ User found: ${TEST_EMAIL}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...\n`);
      results.userExists = true;

      // 3. Verify password hash
      console.log('3️⃣  Password Hash Verification\n');
      try {
        const isValid = await bcrypt.compare(TEST_PASSWORD, user.password);
        if (isValid) {
          console.log(`   ✅ Password hash is valid`);
          console.log(`   Test password "${TEST_PASSWORD}" matches stored hash\n`);
          results.passwordHash = true;
        } else {
          console.log(`   ❌ Password hash mismatch`);
          console.log(`   Test password "${TEST_PASSWORD}" does NOT match stored hash`);
          console.log('   This means the password in database is different\n');
        }
      } catch (error) {
        console.log(`   ❌ Error verifying password: ${error.message}\n`);
      }

      // 4. Check profile exists
      console.log('4️⃣  Profile Check\n');
      const profileQuery = await client.query(
        'SELECT * FROM influencer_profiles WHERE "userId" = $1',
        [user.id]
      );

      if (profileQuery.rows.length > 0) {
        const profile = profileQuery.rows[0];
        console.log(`   ✅ Profile found`);
        console.log(`   Name: ${profile.name || 'N/A'}`);
        console.log(`   Niche: ${profile.niche || 'N/A'}`);
        console.log(`   Followers: ${profile.followerCount || profile.audienceSize || 'N/A'}\n`);
      } else {
        console.log(`   ⚠️  No profile found for user\n`);
      }
    }

    await client.end();
  } catch (error) {
    console.log(`   ❌ Database Error: ${error.message}\n`);
  }

  // 5. Check Backend API
  console.log('5️⃣  Backend API Health\n');
  try {
    const healthResponse = await axios.get(`${API_URL.replace('/api', '')}/health`, { timeout: 5000 });
    console.log(`   ✅ Backend is running`);
    console.log(`   URL: ${API_URL}`);
    console.log(`   Status: ${healthResponse.data.status || 'OK'}\n`);
    results.backendRunning = true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ Backend is NOT running`);
      console.log(`   URL: ${API_URL}`);
      console.log('   Action: Run npm run start:dev in backend folder\n');
    } else {
      console.log(`   ⚠️  Backend check failed: ${error.message}\n`);
    }
  }

  // 6. Test Login Endpoint
  if (results.backendRunning && results.userExists) {
    console.log('6️⃣  Login Endpoint Test\n');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (loginResponse.data && loginResponse.data.token) {
        console.log(`   ✅ Login successful!`);
        console.log(`   Token received: ${loginResponse.data.token.substring(0, 30)}...`);
        console.log(`   User ID: ${loginResponse.data.user?.id || 'N/A'}`);
        console.log(`   User Role: ${loginResponse.data.user?.role || 'N/A'}\n`);
        results.loginEndpoint = true;

        // 7. Test /auth/me endpoint
        console.log('7️⃣  Profile Endpoint Test\n');
        try {
          const profileResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${loginResponse.data.token}`,
            },
          });

          console.log(`   ✅ Profile endpoint working`);
          console.log(`   Name: ${profileResponse.data.name || 'N/A'}`);
          console.log(`   Email: ${profileResponse.data.email}`);
          console.log(`   Role: ${profileResponse.data.role}\n`);
          results.authFlow = true;
        } catch (error) {
          console.log(`   ❌ Profile endpoint failed`);
          console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
        }
      } else {
        console.log(`   ❌ Login response missing token`);
        console.log(`   Response: ${JSON.stringify(loginResponse.data)}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Login failed`);
      console.log(`   Status: ${error.response?.status || 'N/A'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      console.log(`   Full response: ${JSON.stringify(error.response?.data || {})}\n`);
    }
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Diagnosis Summary:\n');
  console.log(`   Database Connection:    ${results.database ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   User Exists:            ${results.userExists ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Password Hash Valid:    ${results.passwordHash ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Backend Running:        ${results.backendRunning ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Login Endpoint:         ${results.loginEndpoint ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Complete Auth Flow:     ${results.authFlow ? '✅ OK' : '❌ FAILED'}\n`);

  // Recommendations
  console.log('💡 Recommendations:\n');

  if (!results.database) {
    console.log('   🔧 Database:');
    console.log('      • Check PostgreSQL is running');
    console.log('      • Verify credentials in backend/.env\n');
  }

  if (!results.userExists) {
    console.log('   🔧 Users:');
    console.log('      • Run: cd backend && npm run seed\n');
  }

  if (results.userExists && !results.passwordHash) {
    console.log('   🔧 Password:');
    console.log('      • Password hash mismatch detected');
    console.log('      • Run seed script again to reset passwords');
    console.log('      • Command: cd backend && npm run seed\n');
  }

  if (!results.backendRunning) {
    console.log('   🔧 Backend:');
    console.log('      • Run: cd backend && npm run start:dev\n');
  }

  if (results.backendRunning && results.userExists && results.passwordHash && !results.loginEndpoint) {
    console.log('   🔧 Login Endpoint:');
    console.log('      • Check backend logs for errors');
    console.log('      • Verify JWT_SECRET is set in backend/.env');
    console.log('      • Check auth.service.ts for issues\n');
  }

  if (results.loginEndpoint && !results.authFlow) {
    console.log('   🔧 Profile Endpoint:');
    console.log('      • Check JWT token validation');
    console.log('      • Verify profile data exists in database\n');
  }

  if (results.authFlow) {
    console.log('   🎉 Everything is working correctly!');
    console.log('   ✅ Frontend should be able to login with demo accounts\n');
  }

  return results.authFlow;
}

// Run diagnosis
diagnoseAuthFlow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  });
