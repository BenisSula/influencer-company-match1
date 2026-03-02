#!/usr/bin/env node

/**
 * Health Monitoring Script
 * Continuously monitors backend health and alerts on issues
 */

const https = require('https');

const BACKEND_URL = 'https://influencer-match-backend.onrender.com';
const CHECK_INTERVAL = 60000; // 1 minute
const ALERT_THRESHOLD = 3; // Alert after 3 consecutive failures

let consecutiveFailures = 0;
let totalChecks = 0;
let successfulChecks = 0;
let failedChecks = 0;

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
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
          body: data,
          responseTime: Date.now(),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    const startTime = Date.now();
    req.end();
    req.startTime = startTime;
  });
}

async function checkHealth() {
  const timestamp = new Date().toISOString();
  totalChecks++;

  try {
    const startTime = Date.now();
    const response = await makeRequest(`${BACKEND_URL}/health`);
    const responseTime = Date.now() - startTime;

    if (response.status === 200) {
      consecutiveFailures = 0;
      successfulChecks++;
      
      const uptime = ((successfulChecks / totalChecks) * 100).toFixed(2);
      
      console.log(`[${timestamp}] ✅ Health Check PASSED`);
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Uptime: ${uptime}%`);
      console.log(`   Total Checks: ${totalChecks} (✅ ${successfulChecks} | ❌ ${failedChecks})`);
      
      if (responseTime > 5000) {
        console.log(`   ⚠️  WARNING: Slow response time (${responseTime}ms)`);
      }
    } else {
      handleFailure(timestamp, `Unexpected status: ${response.status}`);
    }
  } catch (error) {
    handleFailure(timestamp, error.message);
  }

  console.log(''); // Empty line for readability
}

function handleFailure(timestamp, reason) {
  consecutiveFailures++;
  failedChecks++;
  
  console.log(`[${timestamp}] ❌ Health Check FAILED`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Consecutive Failures: ${consecutiveFailures}`);
  console.log(`   Total Checks: ${totalChecks} (✅ ${successfulChecks} | ❌ ${failedChecks})`);
  
  if (consecutiveFailures >= ALERT_THRESHOLD) {
    console.log('');
    console.log('🚨 ALERT: Multiple consecutive failures detected!');
    console.log('   Action Required:');
    console.log('   1. Check Render dashboard logs');
    console.log('   2. Verify database connection');
    console.log('   3. Check environment variables');
    console.log('   4. Consider manual deploy');
    console.log('');
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 Monitoring Summary');
  console.log('='.repeat(50));
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Successful: ${successfulChecks} (${((successfulChecks / totalChecks) * 100).toFixed(2)}%)`);
  console.log(`Failed: ${failedChecks} (${((failedChecks / totalChecks) * 100).toFixed(2)}%)`);
  console.log('='.repeat(50) + '\n');
}

console.log('🔍 Starting Health Monitoring...');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Check Interval: ${CHECK_INTERVAL / 1000} seconds`);
console.log(`Alert Threshold: ${ALERT_THRESHOLD} consecutive failures`);
console.log('Press Ctrl+C to stop\n');

// Initial check
checkHealth();

// Schedule periodic checks
const interval = setInterval(checkHealth, CHECK_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping health monitoring...');
  clearInterval(interval);
  printSummary();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Stopping health monitoring...');
  clearInterval(interval);
  printSummary();
  process.exit(0);
});
