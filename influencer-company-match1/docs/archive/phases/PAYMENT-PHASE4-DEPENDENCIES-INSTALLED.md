# Payment Phase 4 - Dependencies Installed ✅

## Installation Complete

All required dependencies for Phase 4 (Webhooks & Real-Time Updates) have been successfully installed.

---

## Backend Dependencies Installed

```bash
✅ @nestjs/bull - Bull queue integration for NestJS
✅ bull - Redis-based queue for Node.js
✅ @nestjs/websockets - WebSocket support for NestJS
✅ @nestjs/platform-socket.io - Socket.io platform adapter
✅ socket.io - Real-time bidirectional event-based communication
✅ @types/bull - TypeScript definitions for Bull
```

**Installation Command:**
```bash
cd backend
npm install @nestjs/bull bull @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/bull
```

---

## Frontend Dependencies Installed

```bash
✅ socket.io-client - Socket.io client library
```

**Installation Command:**
```bash
npm install socket.io-client
```

---

## Remaining Setup Steps

### 1. Fix TypeScript Errors

The following issues need to be addressed in the webhook service:

**A. Update Stripe API Version**
```typescript
// File: backend/src/modules/payments/payments-webhook.service.ts
// Line 31: Change from '2023-10-16' to latest version

this.stripe = new Stripe(
  this.configService.get<string>('STRIPE_SECRET_KEY'),
  { apiVersion: '2024-11-20.acacia' }, // Update to latest
);
```

**B. Add stripePaymentIntentId to Payment Entity**
```typescript
// File: backend/src/modules/payments/entities/payment.entity.ts
// Add this field:

@Column({ nullable: true })
stripePaymentIntentId: string;
```

**C. Update Transaction Types**
```typescript
// File: backend/src/modules/wallet/entities/transaction.entity.ts
// Add these to the enum:

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PAYMENT_RELEASED = 'payment_released',
  PAYMENT_REFUNDED = 'payment_refunded',
  PAYOUT_FAILED_REFUND = 'payout_failed_refund',
}
```

**D. Add getWalletById Method**
```typescript
// File: backend/src/modules/wallet/wallet.service.ts
// Add this method:

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

**E. Update NotificationsService**
```typescript
// File: backend/src/modules/notifications/notifications.service.ts
// Ensure this method exists:

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

### 2. Install Redis

Bull queue requires Redis to be running.

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from:
# https://github.com/microsoftarchive/redis/releases
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

### 3. Configure Environment Variables

Add to `backend/.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

### 4. Update App Module

Add Bull configuration to `backend/src/app.module.ts`:

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

### 5. Install Stripe CLI

For local webhook testing:

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

**Login and Forward Webhooks:**
```bash
stripe login
stripe listen --forward-to localhost:3000/payments/webhook
```

---

## Quick Start Commands

After fixing the TypeScript errors:

```bash
# 1. Start Redis
redis-server

# 2. Start Stripe webhook forwarding (in new terminal)
stripe listen --forward-to localhost:3000/payments/webhook

# 3. Start backend (in new terminal)
cd backend
npm run start:dev

# 4. Start frontend (in new terminal)
npm run dev
```

---

## Verification Checklist

- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [ ] TypeScript errors fixed
- [ ] Redis installed and running
- [ ] Stripe CLI installed
- [ ] Environment variables configured
- [ ] App module updated with Bull
- [ ] Backend builds successfully
- [ ] Frontend builds successfully

---

## Next Steps

1. Fix the TypeScript errors listed above
2. Install and start Redis
3. Configure environment variables
4. Update App module with Bull configuration
5. Run `npm run build` in backend to verify
6. Follow testing guide in `PAYMENT-PHASE4-WEBHOOKS-REALTIME-COMPLETE.md`

---

## Documentation References

- Setup Instructions: `PAYMENT-PHASE4-SETUP-INSTRUCTIONS.md`
- Implementation Guide: `PAYMENT-PHASE4-WEBHOOKS-REALTIME-COMPLETE.md`
- Complete System Overview: `PAYMENT-SYSTEM-COMPLETE-ALL-PHASES.md`

---

**Status:** Dependencies installed ✅ | Configuration needed ⚠️
