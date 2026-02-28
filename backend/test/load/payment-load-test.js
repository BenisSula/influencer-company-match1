import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // Error rate should be below 5%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'company1@test.com', password: 'Test123!@#', role: 'COMPANY' },
  { email: 'influencer1@test.com', password: 'Test123!@#', role: 'INFLUENCER' },
];

// Helper function to register and login
function getAuthToken(user) {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    return JSON.parse(loginRes.body).token;
  }

  // If login fails, try to register
  const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (registerRes.status === 201) {
    return JSON.parse(registerRes.body).token;
  }

  return null;
}

export function setup() {
  // Setup phase - create test users
  console.log('Setting up test users...');
  
  const tokens = {};
  testUsers.forEach(user => {
    const token = getAuthToken(user);
    if (token) {
      tokens[user.role] = token;
    }
  });

  return tokens;
}

export default function (tokens) {
  // Test 1: Create Payment
  const createPaymentRes = http.post(
    `${BASE_URL}/api/payments/create`,
    JSON.stringify({
      influencerId: 'test-influencer-id',
      amount: Math.floor(Math.random() * 5000) + 500, // Random amount 500-5500
      description: `Load test payment ${__VU}-${__ITER}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.COMPANY}`,
      },
    }
  );

  check(createPaymentRes, {
    'payment created': (r) => r.status === 201,
    'payment has id': (r) => JSON.parse(r.body).id !== undefined,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Get Wallet Balance
  const walletRes = http.get(
    `${BASE_URL}/api/wallet/balance`,
    {
      headers: {
        'Authorization': `Bearer ${tokens.INFLUENCER}`,
      },
    }
  );

  check(walletRes, {
    'wallet balance retrieved': (r) => r.status === 200,
    'wallet has balance': (r) => JSON.parse(r.body).availableBalance !== undefined,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Get Transaction History
  const transactionsRes = http.get(
    `${BASE_URL}/api/wallet/transactions?page=1&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${tokens.INFLUENCER}`,
      },
    }
  );

  check(transactionsRes, {
    'transactions retrieved': (r) => r.status === 200,
    'transactions is array': (r) => Array.isArray(JSON.parse(r.body).transactions),
  }) || errorRate.add(1);

  sleep(2);

  // Test 4: Concurrent Payment Confirmations
  if (__ITER % 5 === 0) { // Every 5th iteration
    const paymentId = createPaymentRes.status === 201 
      ? JSON.parse(createPaymentRes.body).id 
      : 'test-payment-id';

    const confirmRes = http.post(
      `${BASE_URL}/api/payments/${paymentId}/confirm`,
      JSON.stringify({
        paymentMethodId: 'pm_card_visa',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.COMPANY}`,
        },
      }
    );

    check(confirmRes, {
      'payment confirmation processed': (r) => r.status === 200 || r.status === 400,
    }) || errorRate.add(1);
  }

  sleep(1);
}

export function teardown(tokens) {
  // Cleanup phase
  console.log('Load test completed');
  console.log('Check metrics for performance results');
}
