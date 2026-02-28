# 🚀 Payment Testing Quick Reference

## Quick Start

```bash
# 1. Start servers
npm run dev          # Frontend (port 5173)
cd backend && npm run start:dev  # Backend (port 3000)

# 2. Run automated test
node test-complete-payment-flow.js

# 3. Manual testing
# Follow steps below
```

---

## Test Accounts

### Company Account
- Email: `testcompany@example.com`
- Password: `Test123!`
- Role: Company

### Influencer Account
- Email: `testinfluencer@example.com`
- Password: `Test123!`
- Role: Influencer

---

## Test URLs

| Step | URL | Purpose |
|------|-----|---------|
| Company Onboarding | `http://localhost:5173/onboarding/company` | Create Stripe customer |
| Influencer Onboarding | `http://localhost:5173/onboarding/influencer` | Stripe Connect setup |
| Matches | `http://localhost:5173/matches` | Find users to collaborate |
| Connections | `http://localhost:5173/connections` | Accept requests |
| Checkout | `http://localhost:5173/payments/checkout/:id` | Complete payment |

---

## Stripe Test Data

### Test Cards
```
Success:     4242 4242 4242 4242
Declined:    4000 0000 0000 0002
3D Secure:   4000 0025 0000 3155
```

### Onboarding Data
```
SSN:         000-00-0000
Routing:     110000000
Account:     000123456789
DOB:         01/01/1990
```

---

## Quick Test Flow

### 1. Company Setup (2 min)
```bash
1. Register as company
2. Visit /onboarding/company
3. Verify Stripe customer created
```

### 2. Influencer Setup (3 min)
```bash
1. Register as influencer
2. Visit /onboarding/influencer
3. Complete Stripe Connect form
4. Return to platform
```

### 3. Collaboration (1 min)
```bash
1. Login as company
2. Find influencer in /matches
3. Send collaboration request with budget
```

### 4. Payment (2 min)
```bash
1. Login as influencer
2. Accept request in /connections
3. Redirected to checkout
4. Enter test card: 4242 4242 4242 4242
5. Submit payment
```

---

## Database Checks

### Check Stripe IDs
```sql
SELECT email, role, "stripeCustomerId", "stripeAccountId" 
FROM users 
WHERE email LIKE 'test%';
```

### Check Payment Status
```sql
SELECT id, amount, status, "stripePaymentIntentId", "createdAt"
FROM payments 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

### Check Collaboration Status
```sql
SELECT id, collaboration_status, status, "createdAt"
FROM connections 
WHERE collaboration_status IS NOT NULL
ORDER BY "createdAt" DESC 
LIMIT 5;
```

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Stripe customer not found" | Complete company onboarding |
| "Stripe account not found" | Complete influencer onboarding |
| PaymentElement not loading | Check Stripe keys in .env |
| "Card declined" | Use test card 4242... |
| Redirect loop | Clear cookies, try again |

---

## Success Indicators

✅ Company has `stripeCustomerId`
✅ Influencer has `stripeAccountId`
✅ Payment has `stripePaymentIntentId`
✅ Payment status is `succeeded`
✅ Collaboration status is `active`
✅ Stripe dashboard shows payment

---

## Backend Logs to Watch

```
[PaymentsService] Creating payment for collaboration...
[PaymentsService] Stripe customer ID: cus_xxxxx
[PaymentsService] Stripe account ID: acct_xxxxx
[PaymentsService] Creating PaymentIntent...
[PaymentsService] PaymentIntent created: pi_xxxxx
[PaymentsService] Payment created successfully
```

---

## Automated Test

```bash
# Run complete flow test
node test-complete-payment-flow.js

# Expected output:
✅ Company Registration: PASSED
✅ Influencer Registration: PASSED
✅ Company Onboarding: PASSED
⚠️  Influencer Onboarding: MANUAL
✅ Collaboration Request: PASSED
⚠️  Payment Creation: CHECK LOGS
```

---

## Manual Verification Checklist

- [ ] Company onboarding creates customer
- [ ] Influencer onboarding creates account
- [ ] Collaboration request sent
- [ ] Payment created on accept
- [ ] Checkout page loads
- [ ] Payment succeeds
- [ ] Success page shows
- [ ] Database updated
- [ ] Stripe dashboard shows payment

---

## Time Estimates

- Full manual test: ~10 minutes
- Automated test: ~30 seconds
- Stripe onboarding: ~3 minutes
- Single payment: ~1 minute

---

## Support Links

- Stripe Test Cards: https://stripe.com/docs/testing
- Stripe Dashboard: https://dashboard.stripe.com/test
- API Docs: http://localhost:3000/api

---

**Ready to test!** Start with the automated script, then complete manual steps.
