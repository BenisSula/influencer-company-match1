# Payment System - Quick Test Guide

**Quick reference for testing the payment system**

---

## 🚀 Quick Start (5 Minutes)

### 1. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

### 2. Login as Company
```
Email: techcorp@example.com
Password: password123
```

### 3. Test Payment Flow
1. Go to Campaigns page
2. Find a campaign with applications
3. Accept an influencer application
4. Click "Pay Now" button
5. Enter test card: `4242 4242 4242 4242`
6. Expiry: Any future date (e.g., 12/25)
7. CVC: Any 3 digits (e.g., 123)
8. Click "Pay $1,050.00"
9. Wait 2-3 seconds
10. See success page ✅

---

## 🧪 Test Scenarios

### ✅ Successful Payment
**Card:** 4242 4242 4242 4242  
**Expected:** Payment succeeds, status = 'held'

### ❌ Declined Card
**Card:** 4000 0000 0000 0002  
**Expected:** Error message "Your card was declined"

### ❌ Insufficient Funds
**Card:** 4000 0000 0000 9995  
**Expected:** Error message "Insufficient funds"

### 🔐 3D Secure
**Card:** 4000 0025 0000 3155  
**Expected:** Additional authentication required

---

## 🔍 Verify Payment

### Check Database
```sql
SELECT 
  id,
  status,
  amount_total,
  payment_intent_id,
  created_at
FROM collaboration_payments
ORDER BY created_at DESC
LIMIT 5;
```

### Check Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/payments
2. Find latest PaymentIntent
3. Verify:
   - Amount: $1,050.00
   - Status: Succeeded
   - Application Fee: $150.00

### Check API
```bash
# Get payment by ID
curl http://localhost:3000/api/v1/payments/:id \
  -H "Authorization: Bearer <token>"

# Get all payments
curl http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer <token>"
```

---

## 🐛 Troubleshooting

### Payment Button Disabled
- ✅ Check card number is complete
- ✅ Check expiry date is valid
- ✅ Check CVC is entered

### "Payment not found" Error
- ✅ Verify collaboration has payment created
- ✅ Check payment status is 'pending'
- ✅ Verify you're logged in as company

### Stripe Error
- ✅ Check `.env` has correct Stripe keys
- ✅ Verify Stripe account is in test mode
- ✅ Check backend logs for details

### Frontend Not Loading
- ✅ Check `.env.local` has `VITE_STRIPE_PUBLISHABLE_KEY`
- ✅ Verify API URL is correct
- ✅ Check browser console for errors

---

## 📊 Expected Results

### Database After Payment
```
status: 'held'
payment_intent_id: 'pi_xxx'
metadata: {
  confirmedAt: '2026-02-18T10:30:00Z',
  paymentMethodId: 'pm_xxx'
}
```

### Stripe Dashboard
```
PaymentIntent: pi_xxx
Amount: $1,050.00
Status: succeeded
Application Fee: $150.00
Destination: acct_xxx (influencer)
```

### Frontend
```
✅ Success page displayed
✅ "What happens next" guide shown
✅ Action buttons visible
```

---

## 🔑 Test Credentials

### Company Account
```
Email: techcorp@example.com
Password: password123
Role: COMPANY
```

### Influencer Account
```
Email: sarah.j@example.com
Password: password123
Role: INFLUENCER
```

---

## 📝 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Can login as company
- [ ] Can see campaigns
- [ ] Can accept application
- [ ] Payment is created (status: pending)
- [ ] Can navigate to checkout page
- [ ] Stripe Elements loads
- [ ] Can enter card information
- [ ] Card validation works
- [ ] Submit button enables when card complete
- [ ] Payment processes successfully
- [ ] Redirects to success page
- [ ] Payment status is 'held' in database
- [ ] PaymentIntent visible in Stripe Dashboard

---

## 🎯 Quick Commands

### Run Test Script
```bash
node test-payment-confirm.js
```

### Check Backend Logs
```bash
# Backend terminal shows:
[PaymentsService] Confirming payment...
[PaymentsService] PaymentIntent confirmed: requires_capture
[PaymentsService] PaymentIntent captured: succeeded
[PaymentsService] Payment xxx confirmed and held in escrow
```

### Check Payment Status
```bash
curl http://localhost:3000/api/v1/payments/:id \
  -H "Authorization: Bearer <token>" | jq '.status'
```

---

## 💡 Tips

1. **Use Test Mode:** Always use Stripe test keys
2. **Check Logs:** Backend logs show detailed payment flow
3. **Stripe Dashboard:** Best way to verify payments
4. **Test Cards:** Use official Stripe test cards only
5. **Clear Cache:** If issues, clear browser cache

---

## 🆘 Common Issues

### Issue: "Only the company can confirm this payment"
**Solution:** Make sure you're logged in as the company who created the collaboration

### Issue: "Payment is already held"
**Solution:** Payment was already processed. Create a new collaboration.

### Issue: Stripe Elements not loading
**Solution:** Check `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`

### Issue: Backend error "Stripe account not found"
**Solution:** Run migrations and seed data to create Stripe accounts

---

## 📞 Need Help?

1. Check backend logs
2. Check browser console
3. Check Stripe Dashboard
4. Review documentation:
   - `PAYMENT-PHASE2-STEP2.3-COMPLETE.md`
   - `PAYMENT-PHASE2-COMPLETE.md`
   - `PAYMENT-SYSTEM-CURRENT-STATUS.md`

---

**Happy Testing! 🎉**
