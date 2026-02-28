# Payment System Documentation

## Overview

The payment system provides secure, escrow-based payments between companies and influencers using Stripe Connect. It includes wallet management, automated payouts, and real-time payment tracking.

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Payment Flow](#payment-flow)
3. [API Endpoints](#api-endpoints)
4. [Multi-Tenant Considerations](#multi-tenant-considerations)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Setup & Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Platform Fee Configuration
PLATFORM_FEE_PERCENTAGE=10
COMPANY_FEE_PERCENTAGE=2.5
INFLUENCER_FEE_PERCENTAGE=2.5

# Payout Configuration
MIN_PAYOUT_AMOUNT=50
PAYOUT_SCHEDULE=weekly
```

### Stripe Connect Setup

1. **Create Stripe Account**
   - Sign up at https://stripe.com
   - Get your API keys from Dashboard > Developers > API keys

2. **Enable Stripe Connect**
   - Go to Dashboard > Connect > Settings
   - Enable "Standard" or "Express" accounts
   - Set up your platform profile

3. **Configure Webhooks**
   - Go to Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `transfer.created`
     - `transfer.failed`
     - `payout.paid`
     - `payout.failed`

4. **Test Mode**
   - Use test API keys during development
   - Test cards: https://stripe.com/docs/testing

---

## Payment Flow

### For Developers

```
1. Collaboration Accepted
   ↓
2. Payment Created (status: pending)
   ↓
3. Company Confirms Payment
   ↓
4. Stripe Payment Intent Created
   ↓
5. Payment Held in Escrow (status: held)
   ↓
6. Collaboration Completed
   ↓
7. Payment Released (status: released)
   ↓
8. Funds Added to Influencer Wallet
   ↓
9. Influencer Requests Payout
   ↓
10. Payout Processed to Bank Account
```

### Payment States

- **pending**: Payment created, awaiting confirmation
- **processing**: Payment being processed by Stripe
- **held**: Funds held in escrow
- **released**: Funds released to influencer wallet
- **completed**: Payment fully processed
- **failed**: Payment failed
- **refunded**: Payment refunded to company

---

## API Endpoints

### Payments

#### Create Payment
```http
POST /api/payments/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "collaborationId": "uuid",
  "influencerId": "uuid",
  "amount": 1000,
  "description": "Campaign collaboration"
}

Response: 201 Created
{
  "id": "uuid",
  "status": "pending",
  "amountTotal": 1000,
  "amountBudget": 1000,
  "amountCompanyFee": 25,
  "amountInfluencerFee": 25,
  "amountPlatformRevenue": 100,
  "currency": "usd"
}
```

#### Confirm Payment
```http
POST /api/payments/:id/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethodId": "pm_card_visa"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "held",
  "stripePaymentIntentId": "pi_xxx"
}
```

#### Release Payment
```http
POST /api/payments/:id/release
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "uuid",
  "status": "released",
  "releasedAt": "2026-02-18T10:00:00Z"
}
```

#### Get Payment Details
```http
GET /api/payments/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "uuid",
  "status": "completed",
  "amount": 1000,
  "company": { ... },
  "influencer": { ... }
}
```

### Wallet

#### Get Wallet Balance
```http
GET /api/wallet/balance
Authorization: Bearer {token}

Response: 200 OK
{
  "availableBalance": 5000,
  "pendingBalance": 1000,
  "totalEarnings": 10000,
  "currency": "usd"
}
```

#### Request Payout
```http
POST /api/wallet/payout
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500
}

Response: 201 Created
{
  "id": "uuid",
  "amount": 500,
  "status": "pending",
  "estimatedArrival": "2026-02-25"
}
```

#### Get Transaction History
```http
GET /api/wallet/transactions?page=1&limit=20
Authorization: Bearer {token}

Response: 200 OK
{
  "transactions": [
    {
      "id": "uuid",
      "type": "payment_received",
      "amount": 1000,
      "createdAt": "2026-02-18T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

### Invoices

#### Generate Invoice
```http
POST /api/invoices/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentId": "uuid"
}

Response: 201 Created
{
  "id": "uuid",
  "invoiceNumber": "INV-2026-001",
  "pdfUrl": "https://..."
}
```

#### Download Invoice PDF
```http
GET /api/invoices/:id/pdf
Authorization: Bearer {token}

Response: 200 OK
Content-Type: application/pdf
```

### Webhooks

#### Stripe Webhook Endpoint
```http
POST /api/payments/webhook
Stripe-Signature: {signature}
Content-Type: application/json

{
  "type": "payment_intent.succeeded",
  "data": { ... }
}

Response: 200 OK
```

---

## Multi-Tenant Considerations

### Tenant Isolation

Each tenant has:
- Separate Stripe Connect account
- Isolated payment records
- Independent fee structures
- Custom branding on invoices

### Configuration

```typescript
// Per-tenant configuration
{
  tenantId: "uuid",
  stripeAccountId: "acct_xxx",
  platformFeePercentage: 10,
  companyFeePercentage: 2.5,
  influencerFeePercentage: 2.5,
  currency: "usd",
  minPayoutAmount: 50
}
```

### Database Indexes

Ensure these indexes exist for performance:

```sql
CREATE INDEX idx_payments_tenant ON collaboration_payments(tenant_id);
CREATE INDEX idx_payments_company ON collaboration_payments(company_id);
CREATE INDEX idx_payments_influencer ON collaboration_payments(influencer_id);
CREATE INDEX idx_payments_status ON collaboration_payments(status);
CREATE INDEX idx_wallet_user ON wallets(user_id);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
```

---

## Testing

### Unit Tests

```bash
cd backend
npm run test
```

### Integration Tests

```bash
cd backend
npm run test:e2e
```

### Manual Testing with Stripe Test Cards

```javascript
// Success
const testCard = {
  number: '4242424242424242',
  exp_month: 12,
  exp_year: 2030,
  cvc: '123'
};

// Decline
const declineCard = {
  number: '4000000000000002',
  exp_month: 12,
  exp_year: 2030,
  cvc: '123'
};

// Insufficient funds
const insufficientCard = {
  number: '4000000000009995',
  exp_month: 12,
  exp_year: 2030,
  cvc: '123'
};
```

### Load Testing

```bash
# Install k6
choco install k6  # Windows
brew install k6   # Mac

# Run load test
k6 run backend/test/load/payment-load-test.js
```

---

## Troubleshooting

### Common Issues

#### 1. Webhook Signature Verification Failed

**Problem**: Webhook returns 400 error

**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint URL matches Stripe dashboard
- Ensure raw body is passed to verification

#### 2. Payment Stuck in "Processing"

**Problem**: Payment doesn't complete

**Solution**:
- Check Stripe dashboard for payment intent status
- Verify webhook events are being received
- Check application logs for errors

#### 3. Payout Fails

**Problem**: Payout request returns error

**Solution**:
- Verify influencer has completed Stripe Connect onboarding
- Check wallet has sufficient balance
- Ensure minimum payout amount is met

#### 4. Invoice Generation Fails

**Problem**: PDF generation returns error

**Solution**:
- Verify payment exists and is completed
- Check user data is complete
- Ensure file system permissions for temp files

### Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=debug
STRIPE_LOG_LEVEL=debug
```

### Support

For issues:
1. Check application logs
2. Review Stripe dashboard
3. Contact support with:
   - Payment ID
   - Error message
   - Timestamp
   - User ID

---

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Validate webhook signatures** on all webhook endpoints
3. **Use HTTPS** for all payment endpoints
4. **Implement rate limiting** on payment creation
5. **Log all payment events** for audit trail
6. **Encrypt sensitive data** at rest
7. **Use Stripe's SCA** (Strong Customer Authentication)
8. **Implement fraud detection** rules in Stripe dashboard

---

## Performance Optimization

### Database Queries

- Use indexes on frequently queried fields
- Implement pagination for transaction lists
- Cache wallet balances with Redis

### API Response Times

Target response times:
- Payment creation: < 500ms
- Payment confirmation: < 2s (Stripe API call)
- Wallet balance: < 100ms (cached)
- Transaction history: < 200ms

### Monitoring

Monitor these metrics:
- Payment success rate
- Average payment processing time
- Webhook processing time
- Failed payment rate
- Payout success rate

---

## Changelog

### Version 1.0.0 (2026-02-18)
- Initial payment system implementation
- Stripe Connect integration
- Wallet management
- Invoice generation
- Webhook handling
- Multi-tenant support
