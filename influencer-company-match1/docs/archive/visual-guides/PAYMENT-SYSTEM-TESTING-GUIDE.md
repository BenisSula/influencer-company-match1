# Payment System Testing Guide

## Overview

This guide covers all testing procedures for the payment system, including unit tests, integration tests, load tests, and manual testing procedures.

---

## Prerequisites

### Required Tools

```bash
# Node.js and npm
node --version  # v18+ required
npm --version

# k6 for load testing (Windows)
choco install k6

# PostgreSQL
psql --version

# Stripe CLI (optional, for webhook testing)
stripe --version
```

### Environment Setup

Create `.env.test` file:

```env
NODE_ENV=test
DATABASE_URL=postgresql://user:password@localhost:5432/test_db
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_test_secret
JWT_SECRET=test_jwt_secret
```

---

## Unit Tests

### Running Unit Tests

```bash
cd backend

# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch

# Run specific test file
npm run test -- payments.service.spec.ts
```

### Writing Unit Tests

Example test structure:

```typescript
describe('PaymentsService', () => {
  let service: PaymentsService;
  let stripeService: StripeConnectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: StripeConnectService,
          useValue: {
            createPaymentIntent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    stripeService = module.get<StripeConnectService>(StripeConnectService);
  });

  it('should create payment', async () => {
    const result = await service.createPayment({
      companyId: 'test-id',
      influencerId: 'test-id',
      amount: 1000,
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('pending');
  });
});
```

### Coverage Goals

- Overall coverage: > 80%
- Critical paths: > 95%
- Payment flow: 100%

---

## Integration Tests (E2E)

### Running Integration Tests

```bash
cd backend

# Run all e2e tests
npm run test:e2e

# Run specific test suite
npm run test:e2e -- --testNamePattern="Payment System"
```

### Test Database Setup

```bash
# Create test database
createdb test_influencer_platform

# Run migrations
npm run migration:run

# Seed test data (optional)
npm run seed
```

### Integration Test Scenarios

#### 1. Complete Payment Flow

```bash
# Test creates:
1. Company user
2. Influencer user
3. Payment creation
4. Payment confirmation
5. Payment release
6. Wallet update
7. Payout request
```

#### 2. Webhook Processing

```bash
# Test processes:
1. payment_intent.succeeded
2. payment_intent.payment_failed
3. transfer.created
4. payout.paid
```

#### 3. Error Handling

```bash
# Test handles:
1. Insufficient funds
2. Invalid payment method
3. Duplicate payments
4. Unauthorized access
```

---

## Load Testing

### Setup k6

```bash
# Windows
choco install k6

# Verify installation
k6 version
```

### Running Load Tests

```bash
cd backend

# Basic load test
npm run test:load

# Custom configuration
k6 run --vus 50 --duration 2m test/load/payment-load-test.js

# With environment variables
BASE_URL=https://staging.example.com k6 run test/load/payment-load-test.js
```

### Load Test Scenarios

#### Scenario 1: Normal Load
- 20 concurrent users
- 2 minute duration
- Target: < 500ms response time

```bash
k6 run --vus 20 --duration 2m test/load/payment-load-test.js
```

#### Scenario 2: Peak Load
- 100 concurrent users
- 5 minute duration
- Target: < 2s response time

```bash
k6 run --vus 100 --duration 5m test/load/payment-load-test.js
```

#### Scenario 3: Stress Test
- Ramp up to 200 users
- 10 minute duration
- Identify breaking point

```bash
k6 run --vus 200 --duration 10m test/load/payment-load-test.js
```

### Performance Metrics

Monitor these metrics:

```javascript
// Response time thresholds
http_req_duration: p(95) < 2000ms  // 95th percentile
http_req_duration: p(99) < 5000ms  // 99th percentile

// Error rate
http_req_failed: rate < 0.05       // < 5% error rate

// Throughput
http_reqs: rate > 100              // > 100 req/s
```

### Analyzing Results

```bash
# k6 outputs:
✓ payment created
✓ wallet balance retrieved
✓ transactions retrieved

checks.........................: 98.50% ✓ 2955  ✗ 45
data_received..................: 1.2 MB 20 kB/s
data_sent......................: 890 kB 15 kB/s
http_req_duration..............: avg=450ms min=120ms med=380ms max=2.1s p(95)=890ms
http_reqs......................: 3000   50/s
```

---

## Manual Testing

### Test Accounts

Create test accounts:

```javascript
// Company Account
{
  email: 'test-company@example.com',
  password: 'Test123!@#',
  role: 'COMPANY'
}

// Influencer Account
{
  email: 'test-influencer@example.com',
  password: 'Test123!@#',
  role: 'INFLUENCER'
}
```

### Test Cards (Stripe)

```javascript
// Success
4242 4242 4242 4242

// Decline
4000 0000 0000 0002

// Insufficient funds
4000 0000 0000 9995

// Requires authentication
4000 0025 0000 3155

// Expired card
4000 0000 0000 0069
```

### Manual Test Checklist

#### Payment Creation
- [ ] Company can create payment
- [ ] Payment amount is calculated correctly
- [ ] Platform fees are applied
- [ ] Payment status is 'pending'

#### Payment Confirmation
- [ ] Company can confirm payment
- [ ] Stripe payment intent is created
- [ ] Payment status changes to 'held'
- [ ] Funds are held in escrow

#### Payment Release
- [ ] Company can release payment
- [ ] Influencer wallet is updated
- [ ] Payment status changes to 'released'
- [ ] Transaction is recorded

#### Wallet Management
- [ ] Wallet balance is accurate
- [ ] Transaction history is complete
- [ ] Payout requests work
- [ ] Minimum payout enforced

#### Invoice Generation
- [ ] Invoice is generated
- [ ] PDF is downloadable
- [ ] Invoice number is unique
- [ ] All details are correct

#### Error Handling
- [ ] Invalid payment method rejected
- [ ] Insufficient funds handled
- [ ] Unauthorized access blocked
- [ ] Duplicate payments prevented

---

## Webhook Testing

### Using Stripe CLI

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger transfer.created
```

### Manual Webhook Testing

```bash
# Send test webhook
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 50000,
        "status": "succeeded"
      }
    }
  }'
```

---

## Performance Optimization

### Database Query Optimization

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM collaboration_payments
WHERE company_id = 'xxx' AND status = 'pending';
```

### Index Verification

```sql
-- Check if indexes are being used
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### Caching Strategy

```typescript
// Cache wallet balance
const balance = await redis.get(`wallet:${userId}:balance`);
if (!balance) {
  const freshBalance = await this.calculateBalance(userId);
  await redis.setex(`wallet:${userId}:balance`, 300, freshBalance);
  return freshBalance;
}
return balance;
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Payment Success Rate**
   - Target: > 95%
   - Alert: < 90%

2. **Average Processing Time**
   - Target: < 500ms
   - Alert: > 2s

3. **Webhook Processing**
   - Target: < 200ms
   - Alert: > 1s

4. **Failed Payments**
   - Target: < 5%
   - Alert: > 10%

5. **Payout Success Rate**
   - Target: > 98%
   - Alert: < 95%

### Setting Up Alerts

```javascript
// Example: New Relic alert
if (paymentSuccessRate < 0.90) {
  alert('Payment success rate below 90%');
}

if (avgResponseTime > 2000) {
  alert('Average response time above 2s');
}
```

---

## Troubleshooting Test Failures

### Common Issues

#### 1. Database Connection Errors

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Reset test database
dropdb test_influencer_platform
createdb test_influencer_platform
npm run migration:run
```

#### 2. Stripe API Errors

```bash
# Verify API keys
stripe config --list

# Check API status
curl https://status.stripe.com/api/v2/status.json
```

#### 3. Timeout Errors

```javascript
// Increase timeout in jest config
{
  "testTimeout": 30000
}
```

#### 4. Race Conditions

```javascript
// Use transactions for atomic operations
await queryRunner.startTransaction();
try {
  // operations
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Payment System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
      
      - name: Run migrations
        run: npm run migration:run
        working-directory: ./backend
      
      - name: Run unit tests
        run: npm run test:cov
        working-directory: ./backend
      
      - name: Run e2e tests
        run: npm run test:e2e
        working-directory: ./backend
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Test Data Cleanup

### After Each Test

```typescript
afterEach(async () => {
  await dataSource.query('DELETE FROM collaboration_payments WHERE 1=1');
  await dataSource.query('DELETE FROM transactions WHERE 1=1');
  await dataSource.query('DELETE FROM wallets WHERE 1=1');
});
```

### Complete Cleanup

```bash
# Reset test database
npm run migration:revert
npm run migration:run
```

---

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Use Transactions**: Wrap tests in transactions for easy rollback
3. **Mock External Services**: Mock Stripe API calls in unit tests
4. **Test Edge Cases**: Test boundary conditions and error scenarios
5. **Monitor Performance**: Track test execution time
6. **Keep Tests Fast**: Unit tests < 100ms, E2E tests < 5s
7. **Use Factories**: Create test data with factories
8. **Document Tests**: Add clear descriptions to test cases

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [k6 Documentation](https://k6.io/docs/)
- [Stripe Testing](https://stripe.com/docs/testing)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

## Support

For testing issues:
1. Check test logs
2. Verify environment variables
3. Review database state
4. Contact dev team with:
   - Test name
   - Error message
   - Environment details
