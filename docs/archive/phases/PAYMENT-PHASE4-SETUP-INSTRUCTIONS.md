# Payment Phase 4 - Setup Instructions

## Required Dependencies

### Backend Dependencies

Install Bull queue and Socket.io:

```bash
cd backend
npm install @nestjs/bull bull @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/bull
```

### Frontend Dependencies

Install Socket.io client:

```bash
cd ..
npm install socket.io-client
```

### Redis Setup

Bull queue requires Redis. Install Redis:

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

---

## Configuration Updates

### 1. Update Payment Entity

Add `stripePaymentIntentId` field to Payment entity:

```typescript
// backend/src/modules/payments/entities/payment.entity.ts

@Column({ nullable: true })
stripePaymentIntentId: string;
```

### 2. Update Stripe API Version

The webhook service uses Stripe API version `2023-10-16`. Update to latest:

```typescript
// In payments-webhook.service.ts, line 31
{ apiVersion: '2024-11-20.acacia' }  // or latest version
```

### 3. Update Transaction Types

Add new transaction types to the enum:

```typescript
// backend/src/modules/wallet/entities/transaction.entity.ts

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PAYMENT_RELEASED = 'payment_released',
  PAYMENT_REFUNDED = 'payment_refunded',
  PAYOUT_FAILED_REFUND = 'payout_failed_refund',
}
```

### 4. Add Wallet Methods

Add missing methods to WalletService:

```typescript
// backend/src/modules/wallet/wallet.service.ts

async getWalletById(walletId: string): Promise<Wallet> {
  const wallet = await this.walletRepository.findOne({
    where: { id: walletId },
  });
  
  if (!wallet) {
    throw new NotFoundException('Wallet not found');
  }
  
  return wallet;
}
```

### 5. Update Notifications Service

Ensure NotificationsService has a `create` method:

```typescript
// backend/src/modules/notifications/notifications.service.ts

async create(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}): Promise<Notification> {
  const notification = this.notificationRepository.create(data);
  return await this.notificationRepository.save(notification);
}
```

---

## Environment Variables

Add to `backend/.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe Webhook Secret (get from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## App Module Configuration

Update `backend/src/app.module.ts` to include Bull:

```typescript
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    // ... other imports
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

---

## Main.ts Configuration

Update `backend/src/main.ts` to handle raw body for webhooks:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,  // Enable raw body for webhook signature verification
  });

  // Configure body parsers
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // ... rest of configuration
  
  await app.listen(3000);
}
bootstrap();
```

---

## Testing Setup

### 1. Install Stripe CLI

**Windows:**
```bash
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe

```bash
stripe login
```

### 3. Forward Webhooks

```bash
stripe listen --forward-to localhost:3000/payments/webhook
```

This will output a webhook signing secret like:
```
whsec_xxxxxxxxxxxxxxxxxxxxx
```

Copy this and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

### 4. Trigger Test Events

```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test payment failure
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded

# Test payout success
stripe trigger payout.paid

# Test payout failure
stripe trigger payout.failed
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
cd backend
npm install @nestjs/bull bull @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/bull

cd ..
npm install socket.io-client

# 2. Start Redis
redis-server

# 3. Start Stripe webhook forwarding (in new terminal)
stripe listen --forward-to localhost:3000/payments/webhook

# 4. Start backend (in new terminal)
cd backend
npm run start:dev

# 5. Start frontend (in new terminal)
npm run dev
```

---

## Verification Checklist

- [ ] Redis is running (`redis-cli ping` returns PONG)
- [ ] Bull dependencies installed
- [ ] Socket.io dependencies installed
- [ ] Stripe CLI installed and logged in
- [ ] Webhook forwarding active
- [ ] STRIPE_WEBHOOK_SECRET in .env
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] WebSocket connects successfully
- [ ] Test webhook triggers work

---

## Common Issues

### Issue: "Cannot find module '@nestjs/bull'"
**Solution:** Run `npm install @nestjs/bull bull`

### Issue: "Redis connection refused"
**Solution:** Start Redis with `redis-server`

### Issue: "Webhook signature verification failed"
**Solution:** 
1. Ensure Stripe CLI is running
2. Copy the correct webhook secret from CLI output
3. Update STRIPE_WEBHOOK_SECRET in .env
4. Restart backend server

### Issue: "WebSocket connection failed"
**Solution:**
1. Check JWT token is valid
2. Verify CORS configuration
3. Ensure Socket.io versions match (client and server)

---

## Next Steps

After setup is complete:

1. Test webhook events with Stripe CLI
2. Test real-time updates with two browser windows
3. Verify notifications appear correctly
4. Check wallet balance updates in real-time
5. Test payment failure and retry flow

---

## Production Deployment

For production:

1. Set up Redis cluster or managed Redis (AWS ElastiCache, Redis Cloud)
2. Configure webhook endpoint in Stripe Dashboard
3. Use production webhook secret
4. Enable WSS (secure WebSocket) with HTTPS
5. Configure load balancer with sticky sessions
6. Set up monitoring for webhook processing
7. Configure retry policies for failed events

---

**Status:** Setup instructions complete. Follow steps above to enable Phase 4 features.
