# Payment UI Not Loading - Quick Fix Guide

## Issue
After accepting a collaboration, the payment configuration UI does not load.

## Most Likely Cause
**Stripe API keys not configured** (80% probability)

## Quick Fix

### 1. Check Environment Variables

**Backend `.env` file:**
```env
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**Frontend `.env.local` file:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_API_URL=http://localhost:3000
```

### 2. Get Stripe Test Keys

If you don't have Stripe keys:
1. Go to https://dashboard.stripe.com/register
2. Create a free account
3. Go to Developers → API keys
4. Copy the "Publishable key" (starts with `pk_test_`)
5. Copy the "Secret key" (starts with `sk_test_`)

### 3. Restart Servers

```bash
# Stop both servers (Ctrl+C)

# Restart backend
cd backend
npm run start:dev

# Restart frontend (in new terminal)
cd ..
npm run dev
```

### 4. Test the Fix

Run the diagnostic script:
```bash
node test-payment-ui-loading.js
```

Expected output:
```
✓ Company logged in
✓ Influencer logged in
✓ Collaboration accepted!
✓ Payment data fetched successfully!
✓ Client secret fetched successfully!
✅ PAYMENT UI SHOULD LOAD CORRECTLY!
```

## Other Possible Issues

### Issue 2: Users Missing Stripe Accounts

**Symptom:** Error "Company needs to set up payment account first"

**Fix:** Users need to complete Stripe onboarding:
- Companies need `stripeCustomerId`
- Influencers need `stripeAccountId`

**Temporary workaround for testing:**
```sql
-- Add test Stripe IDs to users
UPDATE users 
SET stripe_customer_id = 'cus_test_123' 
WHERE role = 'COMPANY';

UPDATE users 
SET stripe_account_id = 'acct_test_123' 
WHERE role = 'INFLUENCER';
```

### Issue 3: Payment Not Created

**Symptom:** 404 error when fetching payment data

**Check backend logs for:**
- "Payment creation failed"
- "Stripe not configured"
- "Invalid budget amount"

**Fix:** Check the `paymentError` field in the accept response

## Debugging Steps

1. **Check Browser Console** (F12)
   - Look for errors when payment page loads
   - Check Network tab for failed API calls

2. **Check Backend Logs**
   - Look for payment creation errors
   - Check Stripe API errors

3. **Run Test Script**
   ```bash
   node test-payment-ui-loading.js
   ```

4. **Check Database**
   ```sql
   SELECT * FROM collaboration_payments 
   WHERE collaboration_id = 'your-id';
   ```

## Expected Flow

1. Influencer accepts collaboration
2. Backend creates Stripe PaymentIntent
3. Backend stores payment with `client_secret`
4. Frontend redirects to `/payments/checkout/:id`
5. Checkout page fetches payment data
6. Stripe Elements loads with client secret
7. Company enters payment details
8. Payment processed and held in escrow

## Status After Fix

✅ "user is not defined" error - FIXED
⚠️ Payment UI loading - NEEDS STRIPE KEYS

Once Stripe keys are configured, the entire flow should work end-to-end!
