#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests backend connectivity and basic functionality
 */

const https = require('https');

const BACKEND_URL = 'https://influencer-match-backend.onrender.com';
const FRONTEND_URL = 'https://influencer-match-frontend.onrender.com';

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Deployment Verification Tests\n');
  console.log('=' .repeat(50));

  let passed = 0;
  let failed = 0;

  // Test 1: Backend Health Check
  console.log('\n1️⃣  Testing Backend Health Check...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      console.log('   ✅ Backend is responding');
      console.log(`   Status: ${response.status}`);
      try {
        const body = JSON.parse(response.body);
        console.log(`   Response: ${JSON.stringify(body, null, 2)}`);
        passed++;
      } catch (e) {
        console.log(`   Response: ${response.body}`);
        passed++;
      }
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failed++;
  }

  // Test 2: API Root Endpoint
  console.log('\n2️⃣  Testing API Root Endpoint...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api`);
    console.log(`   Status: ${response.status}`);
    if (response.status === 200 || response.status === 404) {
      console.log('   ✅ API endpoint is accessible');
      passed++;
    } else {
      console.log(`   ⚠️  Unexpected status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failed++;
  }

  // Test 3: Frontend Access
  console.log('\n3️⃣  Testing Frontend Access...');
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200 || response.status === 301 || response.status === 302) {
      console.log('   ✅ Frontend is accessible');
      console.log(`   Status: ${response.status}`);
      passed++;
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Deployment is successful.\n');
    console.log('Next steps:');
    console.log('1. Visit https://influencer-match-frontend.onrender.com');
    console.log('2. Try logging in with test credentials');
    console.log('3. Check Render logs for any warnings\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n');
    console.log('Troubleshooting:');
    console.log('1. Check Render dashboard logs');
    console.log('2. Verify environment variables are set');
    console.log('3. Try manual deploy if needed\n');
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
