# Stripe Onboarding Quick Guide

## For Companies (Payment Setup)

### Endpoint
```
POST /payments/onboarding/company
```

### Frontend Route
```
/onboarding/company
```

### What It Does
1. Creates Stripe Customer ID
2. Saves to `user.stripeCustomerId`
3. Enables company to make payments

### When to Use
- Before sending first collaboration request
- Before making first payment
- Check: `!user.stripeCustomerId`

### Response
```json
{
  "message": "Onboarding complete"
}
```

---

## For Influencers (Payout Setup)

### Endpoint
```
POST /payments/onboarding/influencer
```

### Frontend Route
```
/onboarding/influencer
```

### What It Does
1. Creates Stripe Connect Account
2. Generates onboarding link
3. Redirects to Stripe
4. Saves to `user.stripeAccountId`

### When to Use
- Before accepting first collaboration
- Before receiving first payment
- Check: `!user.stripeAccountId`

### Response
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

---

## Integration Example

```typescript
// Check before creating payment
const checkOnboarding = async (userId: string, role: string) => {
  const user = await getUserById(userId);
  
  if (role === 'company' && !user.stripeCustomerId) {
    return {
      needsOnboarding: true,
      redirectTo: '/onboarding/company',
      message: 'Please complete payment setup first'
    };
  }
  
  if (role === 'influencer' && !user.stripeAccountId) {
    return {
      needsOnboarding: true,
      redirectTo: '/onboarding/influencer',
      message: 'Please complete payout setup first'
    };
  }
  
  return { needsOnboarding: false };
};
```

---

## Testing

### Company Onboarding
```bash
# 1. Login as company user
# 2. Navigate to /onboarding/company
# 3. Verify success message
# 4. Check database for stripeCustomerId
```

### Influencer Onboarding
```bash
# 1. Login as influencer user
# 2. Navigate to /onboarding/influencer
# 3. Complete Stripe onboarding
# 4. Return to /onboarding/complete
# 5. Check database for stripeAccountId
```

---

## Stripe Dashboard

### View Customers (Companies)
1. Go to Stripe Dashboard
2. Click "Customers"
3. Find by email or metadata.userId

### View Connect Accounts (Influencers)
1. Go to Stripe Dashboard
2. Click "Connect" → "Accounts"
3. Find by email or metadata.userId

---

## Troubleshooting

### "Already onboarded" message
- User already has Stripe ID
- Check database: `stripeCustomerId` or `stripeAccountId`
- This is normal, not an error

### Stripe redirect fails
- Check `FRONTEND_URL` environment variable
- Verify Stripe API keys are correct
- Check browser console for errors

### Account not saving
- Check database connection
- Verify user exists
- Check backend logs for errors

---

## Environment Variables

```env
# Required for onboarding
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173

# For production
STRIPE_SECRET_KEY=sk_live_...
FRONTEND_URL=https://yourdomain.com
```

---

## Next Steps After Onboarding

1. **For Companies:**
   - Can now create payments
   - Can send collaboration requests
   - Can make payments via Stripe

2. **For Influencers:**
   - Can now receive payouts
   - Can accept collaborations
   - Can receive payments to Connect account

---

## Quick Commands

```bash
# Check onboarding status
curl -X GET http://localhost:3000/payments/onboarding-status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Company onboarding
curl -X POST http://localhost:3000/payments/onboarding/company \
  -H "Authorization: Bearer YOUR_TOKEN"

# Influencer onboarding
curl -X POST http://localhost:3000/payments/onboarding/influencer \
  -H "Authorization: Bearer YOUR_TOKEN"
```
