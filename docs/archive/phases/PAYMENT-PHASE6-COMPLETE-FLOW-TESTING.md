# ✅ Phase 6: Complete Payment Flow Testing Guide

## Overview

This guide provides comprehensive testing steps for the entire payment flow from onboarding through checkout.

## Prerequisites

- Backend server running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- Stripe test API keys configured in `.env`
- Database migrations completed

## Test Flow Summary

```
1. Company Onboarding → Stripe Customer Creation
2. Influencer Onboarding → Stripe Connect Account Setup
3. Collaboration Request → Budget Specified
4. Accept Collaboration → Payment Creation
5. Checkout Page → Stripe PaymentElement
6. Payment Submission → Success/Failure Handling
7. Database Verification → Payment Status
```

---

## Manual Testing Steps

### Step 1: Company Onboarding

**Objective:** Verify company gets Stripe customer ID

1. **Register as Company**
   - Navigate to: `http://localhost:5173/auth`
   - Register with:
     - Email: `testcompany@example.com`
     - Password: `Test123!`
     - Role: Company
     - Company Name: `Test Corp`

2. **Visit Onboarding Page**
   - Navigate to: `http://localhost:5173/onboarding/company`
   - Expected outcomes:
     - ✅ If already onboarded: "Already onboarded" message
     - ✅ If not: Stripe customer created automatically
     - ✅ Redirect to dashboard

3. **Verify in Database**
   ```sql
   SELECT id, email, role, "stripeCustomerId" 
   FROM users 
   WHERE email = 'testcompany@example.com';
   ```
   - Should have `stripeCustomerId` populated

---

### Step 2: Influencer Onboarding

**Objective:** Verify influencer completes Stripe Connect onboarding

1. **Register as Influencer**
   - Navigate to: `http://localhost:5173/auth`
   - Register with:
     - Email: `testinfluencer@example.com`
     - Password: `Test123!`
     - Role: Influencer
     - Name: `Test Influencer`

2. **Visit Onboarding Page**
   - Navigate to: `http://localhost:5173/onboarding/influencer`
   - Expected: Redirect to Stripe Connect onboarding

3. **Complete Stripe Onboarding**
   - Use Stripe test data:
     - Business name: Any name
     - Address: Any US address
     - SSN: `000-00-0000` (test SSN)
     - DOB: Any date (18+ years ago)
     - Bank account: Use test routing `110000000` and any account number
   - Click "Submit"

4. **Return to Platform**
   - After Stripe redirect, should return to platform
   - Navigate to: `http://localhost:5173/onboarding/influencer`
   - Expected: "Already onboarded" or redirect to dashboard

5. **Verify in Database**
   ```sql
   SELECT id, email, role, "stripeAccountId", "stripeOnboardingComplete" 
   FROM users 
   WHERE email = 'testinfluencer@example.com';
   ```
   - Should have `stripeAccountId` populated
   - `stripeOnboardingComplete` should be `true`

---

### Step 3: Create Collaboration Request

**Objective:** Company sends collaboration request with budget

1. **Login as Company**
   - Email: `testcompany@example.com`
   - Password: `Test123!`

2. **Find Influencer**
   - Navigate to: `http://localhost:5173/matches`
   - Find the test influencer profile

3. **Send Collaboration Request**
   - Click "Collaborate" button
   - Fill in collaboration details:
     - Project Title: `Test Campaign`
     - Collaboration Type: `Sponsored Post`
     - Budget: Min `$1000`, Max `$2000`
     - Timeline: `2 weeks`
     - Message: `Let's work together!`
   - Click "Send Request"

4. **Verify Request Sent**
   - Check database:
   ```sql
   SELECT id, "requesterId", "recipientId", collaboration_status, 
          collaboration_request_data 
   FROM connections 
   WHERE collaboration_status = 'requested'
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```

---

### Step 4: Accept Collaboration & Payment Creation

**Objective:** Influencer accepts, payment is created

1. **Login as Influencer**
   - Email: `testinfluencer@example.com`
   - Password: `Test123!`

2. **View Collaboration Request**
   - Navigate to: `http://localhost:5173/connections`
   - Should see pending collaboration request from Test Corp

3. **Accept Collaboration**
   - Click "✓ Accept Collaboration" button
   - Watch backend logs for payment creation

4. **Expected Backend Logs**
   ```
   [PaymentsService] Creating payment for collaboration...
   [PaymentsService] Stripe customer ID: cus_xxxxx
   [PaymentsService] Stripe account ID: acct_xxxxx
   [PaymentsService] Creating PaymentIntent...
   [PaymentsService] PaymentIntent created: pi_xxxxx
   [PaymentsService] Payment created successfully
   ```

5. **Check for Errors**
   - ✅ Success: Redirected to checkout page
   - ❌ Error: Toast notification shows error message
   - ❌ Payment Setup Modal: Stripe setup incomplete

6. **Verify Payment in Database**
   ```sql
   SELECT id, "collaborationId", amount, status, 
          "stripePaymentIntentId", "clientSecret"
   FROM payments 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```
   - Status should be `pending`
   - `stripePaymentIntentId` should start with `pi_`
   - `clientSecret` should be populated

---

### Step 5: Payment Checkout Page

**Objective:** Verify Stripe PaymentElement loads correctly

1. **Should Auto-Redirect**
   - After accepting, should redirect to:
   - `http://localhost:5173/payments/checkout/:collaborationId`

2. **Verify Page Elements**
   - ✅ Collaboration details displayed
   - ✅ Amount shown correctly ($1000-$2000)
   - ✅ Stripe PaymentElement loads (card input fields)
   - ✅ "Pay Now" button visible
   - ✅ Security indicators shown

3. **Check Browser Console**
   - Should see: `Stripe loaded successfully`
   - Should NOT see: `Failed to load payment details`

4. **If Payment Form Doesn't Load**
   - Check backend logs for errors
   - Verify `clientSecret` in database
   - Check Stripe API keys in `.env`

---

### Step 6: Submit Payment

**Objective:** Complete payment with test card

1. **Enter Test Card Details**
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

2. **Click "Pay Now"**
   - Button should show loading state
   - Wait for Stripe processing

3. **Expected Outcomes**

   **Success Scenario:**
   - ✅ Success toast: "Payment successful!"
   - ✅ Redirect to: `http://localhost:5173/payments/success`
   - ✅ Success page shows confirmation

   **Error Scenario:**
   - ❌ Error toast with specific message
   - ❌ Form remains on page
   - ❌ Can retry payment

4. **Backend Logs (Success)**
   ```
   [PaymentsService] Confirming payment...
   [PaymentsService] Payment confirmed: pi_xxxxx
   [PaymentsService] Payment status: succeeded
   ```

---

### Step 7: Database Verification

**Objective:** Verify payment status updated correctly

1. **Check Payment Status**
   ```sql
   SELECT id, amount, status, "stripePaymentIntentId", 
          "paidAt", "createdAt"
   FROM payments 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```
   - Status should be `succeeded` or `held`
   - `paidAt` should be populated

2. **Check Collaboration Status**
   ```sql
   SELECT id, collaboration_status, status
   FROM connections 
   WHERE collaboration_status = 'active'
   ORDER BY "updatedAt" DESC 
   LIMIT 1;
   ```
   - `collaboration_status` should be `active`

3. **Check Stripe Dashboard**
   - Login to: https://dashboard.stripe.com/test/payments
   - Find the PaymentIntent
   - Verify amount and status

---

## Automated Testing Script

Create this file: `test-complete-payment-flow.js`

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Payment Flow\n');

  try {
    // Step 1: Register Company
    console.log('1️⃣ Registering company...');
    const companyRes = await axios.post(`${API_URL}/auth/register`, {
      email: `testcompany${Date.now()}@example.com`,
      password: 'Test123!',
      role: 'COMPANY',
      name: 'Test Corp'
    });
    const companyToken = companyRes.data.access_token;
    console.log('✅ Company registered');

    // Step 2: Register Influencer
    console.log('\n2️⃣ Registering influencer...');
    const influencerRes = await axios.post(`${API_URL}/auth/register`, {
      email: `testinfluencer${Date.now()}@example.com`,
      password: 'Test123!',
      role: 'INFLUENCER',
      name: 'Test Influencer'
    });
    const influencerToken = influencerRes.data.access_token;
    console.log('✅ Influencer registered');

    // Step 3: Company Onboarding
    console.log('\n3️⃣ Company onboarding...');
    const companyOnboard = await axios.post(
      `${API_URL}/payments/onboarding/company`,
      {},
      { headers: { Authorization: `Bearer ${companyToken}` }}
    );
    console.log('✅ Company onboarded:', companyOnboard.data.message);

    // Step 4: Get Influencer ID
    console.log('\n4️⃣ Getting influencer profile...');
    const influencerProfile = await axios.get(
      `${API_URL}/auth/me`,
      { headers: { Authorization: `Bearer ${influencerToken}` }}
    );
    const influencerId = influencerProfile.data.id;
    console.log('✅ Influencer ID:', influencerId);

    // Step 5: Create Collaboration Request
    console.log('\n5️⃣ Creating collaboration request...');
    const collabReq = await axios.post(
      `${API_URL}/matching/collaborate`,
      {
        recipientId: influencerId,
        collaborationType: 'SPONSORED_POST',
        budgetMin: 1000,
        budgetMax: 2000,
        timeline: '2 weeks',
        message: 'Test collaboration'
      },
      { headers: { Authorization: `Bearer ${companyToken}` }}
    );
    const connectionId = collabReq.data.id;
    console.log('✅ Collaboration request created:', connectionId);

    // Step 6: Accept Collaboration
    console.log('\n6️⃣ Accepting collaboration...');
    const acceptRes = await axios.post(
      `${API_URL}/matching/connections/${connectionId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${influencerToken}` }}
    );
    
    console.log('\n📊 Accept Response:');
    console.log('- Message:', acceptRes.data.message);
    console.log('- Requires Payment:', acceptRes.data.requiresPayment);
    console.log('- Payment Error:', acceptRes.data.paymentError || 'None');
    
    if (acceptRes.data.paymentInfo) {
      console.log('- Payment Info:', acceptRes.data.paymentInfo);
      console.log('- Client Secret:', acceptRes.data.paymentInfo.clientSecret ? 'Present' : 'Missing');
    }

    // Step 7: Verify Payment Created
    if (acceptRes.data.requiresPayment && !acceptRes.data.paymentError) {
      console.log('\n✅ Payment created successfully!');
      console.log('🎉 Complete flow test PASSED');
    } else if (acceptRes.data.paymentError) {
      console.log('\n❌ Payment error:', acceptRes.data.paymentError);
      console.log('💡 Check Stripe onboarding status');
    } else {
      console.log('\n⚠️ No payment required (unexpected)');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteFlow();
```

Run with:
```bash
node test-complete-payment-flow.js
```

---

## Common Issues & Solutions

### Issue 1: Payment Error - "Stripe customer not found"
**Solution:** Company needs to complete onboarding first
```bash
# Visit: http://localhost:5173/onboarding/company
```

### Issue 2: Payment Error - "Stripe account not found"
**Solution:** Influencer needs to complete Stripe Connect onboarding
```bash
# Visit: http://localhost:5173/onboarding/influencer
```

### Issue 3: PaymentElement Not Loading
**Solutions:**
- Check Stripe publishable key in frontend `.env`
- Verify `clientSecret` in database
- Check browser console for errors
- Verify backend Stripe secret key

### Issue 4: Payment Fails with "Card Declined"
**Solution:** Use correct test card: `4242 4242 4242 4242`

### Issue 5: Redirect Loop After Stripe Onboarding
**Solution:** Clear browser cookies and try again

---

## Test Card Numbers

### Success Cards
- `4242 4242 4242 4242` - Succeeds
- `5555 5555 5555 4444` - Mastercard succeeds

### Failure Cards
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

### 3D Secure Cards
- `4000 0025 0000 3155` - Requires authentication

---

## Success Criteria

✅ Company can complete onboarding
✅ Influencer can complete Stripe Connect onboarding
✅ Collaboration request created with budget
✅ Payment created on acceptance
✅ Checkout page loads with Stripe form
✅ Payment succeeds with test card
✅ Database updated with payment status
✅ Stripe dashboard shows payment

---

## Next Steps After Testing

1. Test error scenarios (declined cards, network errors)
2. Test payment setup modal flow
3. Test webhook handling
4. Test payout flow for influencers
5. Load testing with multiple concurrent payments

---

## Quick Test Checklist

- [ ] Company onboarding creates Stripe customer
- [ ] Influencer onboarding creates Stripe account
- [ ] Collaboration request includes budget
- [ ] Accept creates payment in database
- [ ] Checkout page loads Stripe form
- [ ] Test card payment succeeds
- [ ] Success page displays
- [ ] Database shows payment succeeded
- [ ] Stripe dashboard shows payment
- [ ] Error handling works (wrong card)

---

**Phase 6 Complete!** The entire payment flow is now ready for production testing.
