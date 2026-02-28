# Payment System - Frontend Location Guide

## 🎯 Where to See Payment System in Frontend

### 1. Payment Checkout Page
**Location:** `src/renderer/pages/PaymentCheckout.tsx`
**Route:** `/payment/checkout/:collaborationId`

**When you see it:**
- After a company accepts a collaboration request
- When company needs to confirm payment for a collaboration

**What it shows:**
- Collaboration details
- Payment amount breakdown
- Stripe payment form
- Confirm payment button

### 2. Payment Success Page
**Location:** `src/renderer/pages/PaymentSuccess.tsx`
**Route:** `/payment/success`

**When you see it:**
- After successful payment confirmation
- Redirected from Stripe checkout

**What it shows:**
- Success message
- Payment confirmation details
- Next steps

### 3. Invoices Page
**Location:** `src/renderer/pages/Invoices.tsx`
**Route:** `/invoices`

**When you see it:**
- Navigate from dashboard menu
- View all payment invoices

**What it shows:**
- List of all invoices
- Download PDF button
- Invoice details (date, amount, status)

### 4. Wallet/Balance (Influencer View)
**Location:** Integrated in Dashboard or Profile
**API Endpoint:** `GET /wallet/balance`

**When you see it:**
- Influencer dashboard
- Shows available balance
- Shows pending balance
- Transaction history

**What it shows:**
- Available balance
- Pending balance
- Total earned
- Total withdrawn
- Recent transactions
- Payout history

### 5. Payment Status Toast Notifications
**Location:** `src/renderer/components/PaymentStatusToast/PaymentStatusToast.tsx`

**When you see it:**
- Real-time payment updates
- Payment confirmed
- Payment released
- Payout completed

## 🔄 Payment Flow in Frontend

### For Companies:

1. **Match with Influencer**
   - Go to Matches page
   - Click on a match
   - Send collaboration request

2. **Collaboration Accepted**
   - Receive notification
   - Payment automatically created (PENDING status)
   - Redirected to Payment Checkout page

3. **Payment Checkout Page** (`/payment/checkout/:collaborationId`)
   ```
   ┌─────────────────────────────────────┐
   │  Payment Checkout                   │
   ├─────────────────────────────────────┤
   │  Collaboration Details:             │
   │  - Influencer: @username            │
   │  - Budget: $1,000                   │
   │                                     │
   │  Payment Breakdown:                 │
   │  - Collaboration Budget: $1,000     │
   │  - Platform Fee (5%): $50           │
   │  - Total to Pay: $1,050             │
   │                                     │
   │  [Stripe Payment Form]              │
   │  Card Number: [____________]        │
   │  Expiry: [____] CVV: [___]         │
   │                                     │
   │  [Confirm Payment Button]           │
   └─────────────────────────────────────┘
   ```

4. **Payment Success** (`/payment/success`)
   - Payment confirmed
   - Funds held in escrow
   - Can now message influencer

5. **After Collaboration Complete**
   - Release payment button appears
   - Click to release funds to influencer

### For Influencers:

1. **Receive Collaboration Request**
   - Accept collaboration request
   - Wait for company to confirm payment

2. **Payment Confirmed Notification**
   - Toast notification: "Payment received and held in escrow"
   - Can now start collaboration

3. **View Wallet Balance**
   - Navigate to Dashboard or Profile
   - See wallet section:
   ```
   ┌─────────────────────────────────────┐
   │  Wallet                             │
   ├─────────────────────────────────────┤
   │  Available Balance: $900            │
   │  Pending Balance: $0                │
   │  Total Earned: $5,400               │
   │  Total Withdrawn: $4,500            │
   │                                     │
   │  [Request Payout Button]            │
   │                                     │
   │  Recent Transactions:               │
   │  - Payment released: +$900          │
   │  - Payout to bank: -$500            │
   └─────────────────────────────────────┘
   ```

4. **Request Payout**
   - Click "Request Payout" button
   - Enter amount
   - Funds transferred to bank account

## 📱 How to Access Payment Features

### Navigation Routes:

1. **Payment Checkout:**
   ```
   URL: /payment/checkout/:collaborationId
   Access: Automatic redirect after collaboration accepted
   ```

2. **Payment Success:**
   ```
   URL: /payment/success
   Access: Automatic redirect after payment confirmed
   ```

3. **Invoices:**
   ```
   URL: /invoices
   Access: Dashboard menu → Invoices
   ```

4. **Wallet (Influencers):**
   ```
   URL: /dashboard or /profile
   Access: Dashboard → Wallet section
   ```

## 🧪 Testing Payment System in Frontend

### Test as Company:

1. Login as company user
2. Go to Matches page
3. Find an influencer match
4. Send collaboration request with budget
5. Wait for influencer to accept
6. You'll be redirected to `/payment/checkout/:collaborationId`
7. Enter test Stripe card: `4242 4242 4242 4242`
8. Confirm payment
9. See success page

### Test as Influencer:

1. Login as influencer user
2. Accept collaboration request from company
3. Wait for company to confirm payment
4. Check wallet balance in dashboard
5. See payment in "Pending" status
6. After collaboration complete, payment moves to "Available"
7. Request payout

## 🎨 UI Components

### Payment Method Form
**Location:** `src/renderer/components/Payments/PaymentMethodForm.tsx`
- Stripe Elements integration
- Card input fields
- Validation

### Payment Status Toast
**Location:** `src/renderer/components/PaymentStatusToast/PaymentStatusToast.tsx`
- Real-time payment updates
- Success/error notifications

### Invoice PDF
**Location:** `src/renderer/components/InvoicePDF/InvoicePDF.tsx`
- Generate PDF invoices
- Download functionality

## 🔗 API Integration

The frontend connects to these backend endpoints:

```typescript
// Payment endpoints
GET    /payments/onboarding-status
POST   /payments/create-account-link
GET    /payments/:id
GET    /payments/collaboration/:collaborationId
POST   /payments/:id/confirm
POST   /payments/collaboration/:collaborationId/release

// Wallet endpoints
GET    /wallet/balance
POST   /wallet/payout
GET    /wallet/payouts
```

## ✅ Quick Test Checklist

- [ ] Can access payment checkout page
- [ ] Can see payment breakdown
- [ ] Can enter payment method
- [ ] Can confirm payment
- [ ] Can see success page
- [ ] Can view invoices
- [ ] Can see wallet balance (influencer)
- [ ] Can request payout (influencer)
- [ ] Receive real-time payment notifications

## 🚀 Next Steps

To see the payment system in action:

1. Start the application
2. Login as a company user
3. Navigate to Matches
4. Send a collaboration request
5. Accept as influencer (different browser/incognito)
6. Return to company account
7. You'll see the payment checkout page automatically

The payment system is fully integrated and ready to use!
