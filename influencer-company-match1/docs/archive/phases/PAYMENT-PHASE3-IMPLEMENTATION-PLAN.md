# Payment System - Phase 3: Work Completion & Payouts

**Date:** February 18, 2026  
**Status:** Implementation Plan

---

## 📋 Overview

Phase 3 implements the complete payment lifecycle:
1. **Payment Release** - When collaboration is completed
2. **Wallet System** - Track influencer balances
3. **Payout System** - Withdraw funds to bank account

---

## 🎯 Implementation Steps

### Step 3.1 - Release Payment on Work Approval

**Trigger:** Company marks collaboration as completed

**Backend Implementation:**

1. **Add releasePayment method to PaymentsService**
2. **Update Payment status to 'released'**
3. **Update Wallet balance**
4. **Send notifications**

### Step 3.2 - Wallet & Balance Tracking

**Create:**
1. **Wallet Entity** - Track user balances
2. **Transaction Entity** - Log all balance changes
3. **WalletModule** - Manage wallet operations
4. **Frontend Wallet Component** - Display balance

### Step 3.3 - Payout (Withdrawal) for Influencers

**Create:**
1. **Payout Entity** - Track withdrawal requests
2. **Payout Service** - Process withdrawals via Stripe
3. **Frontend Payout Modal** - Request withdrawals
4. **Payout History** - View past withdrawals

---

## 📁 Files to Create/Modify

### Backend Files:

```
backend/src/modules/
├── payments/
│   ├── payments.service.ts          [MODIFY] Add releasePayment
│   ├── payments.controller.ts       [MODIFY] Add release endpoint
│   └── entities/
│       └── payment.entity.ts        [MODIFY] Add 'released' status
│
└── wallet/                          [NEW MODULE]
    ├── wallet.module.ts
    ├── wallet.service.ts
    ├── wallet.controller.ts
    ├── entities/
    │   ├── wallet.entity.ts
    │   ├── transaction.entity.ts
    │   └── payout.entity.ts
    └── dto/
        ├── create-payout.dto.ts
        └── payout-response.dto.ts

backend/src/database/migrations/
├── 1708013000000-CreateWalletTables.ts
└── 1708014000000-CreatePayoutTables.ts
```

### Frontend Files:

```
src/renderer/
├── components/
│   ├── WalletCard/
│   │   ├── WalletCard.tsx
│   │   └── WalletCard.css
│   ├── PayoutModal/
│   │   ├── PayoutModal.tsx
│   │   └── PayoutModal.css
│   └── TransactionHistory/
│       ├── TransactionHistory.tsx
│       └── TransactionHistory.css
│
├── pages/
│   ├── Wallet.tsx
│   └── Wallet.css
│
└── services/
    └── wallet.service.ts
```

---

## 🔄 Complete Payment Lifecycle

```
1. Application Accepted
   ↓
2. Payment Created (status: pending)
   ↓
3. Company Pays (status: held) ← Phase 2
   ↓
4. Funds Held in Escrow
   ↓
5. Collaboration Work Completed
   ↓
6. Company Approves Work ← Phase 3 START
   ↓
7. Payment Released (status: released)
   ↓
8. Influencer Wallet Updated (+balance)
   ↓
9. Influencer Requests Payout
   ↓
10. Stripe Transfer to Bank
   ↓
11. Payout Complete (status: completed)
```

---

## 💰 Fee Structure & Amounts

### Example: $1,000 Campaign

**Company Pays:**
- Campaign Budget: $1,000
- Company Fee (5%): $50
- **Total Charged: $1,050**

**Platform Holds:**
- Total Amount: $1,050
- Platform Revenue (15%): $150

**Influencer Receives:**
- Campaign Budget: $1,000
- Influencer Fee (10%): -$100
- **Net to Wallet: $900**

**On Payout:**
- Available Balance: $900
- Stripe Payout Fee: ~$0.25
- **Deposited to Bank: ~$899.75**

---

## 🗄️ Database Schema

### Wallets Table
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- 'payment_released', 'payout', 'refund', 'fee'
  amount DECIMAL(10,2),
  balance_after DECIMAL(10,2),
  reference_type VARCHAR(50), -- 'payment', 'payout'
  reference_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Payouts Table
```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wallet_id UUID REFERENCES wallets(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
  stripe_payout_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  destination_account VARCHAR(255),
  failure_reason TEXT,
  metadata JSONB,
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Implementation Order

### Phase 3.1: Payment Release (2-3 hours)

1. Update Payment entity with 'released' status
2. Add releasePayment() to PaymentsService
3. Add POST /payments/:id/release endpoint
4. Test payment release flow

### Phase 3.2: Wallet System (3-4 hours)

1. Create Wallet, Transaction entities
2. Create WalletModule, WalletService
3. Create migration for wallet tables
4. Add GET /wallet/balance endpoint
5. Create frontend WalletCard component
6. Test wallet balance updates

### Phase 3.3: Payout System (4-5 hours)

1. Create Payout entity
2. Add payout methods to WalletService
3. Integrate Stripe Payouts API
4. Add POST /wallet/payout endpoint
5. Create PayoutModal component
6. Create TransactionHistory component
7. Test complete payout flow

**Total Estimated Time: 9-12 hours**

---

## 📝 Next Steps

1. Review this implementation plan
2. Confirm approach and timeline
3. Begin with Phase 3.1 (Payment Release)
4. Test each phase before moving to next
5. Document all endpoints and flows

---

**Ready to proceed with implementation?**

