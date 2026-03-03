# 🚀 Quick Fix Guide - Demo Accounts & Stripe

## ⚡ Immediate Actions (5 Minutes)

### 1. Update Database with All Users
```bash
cd backend
npm run seed
```

This will create all 10 demo users (5 influencers + 5 companies).

### 2. Create Admin Account
```bash
cd backend
node create-super-admin.js
```

Admin credentials:
- Email: `admin@example.com`
- Password: `Admin123!`

### 3. Verify Everything Works
```bash
cd backend
node verify-system.js
```

This checks:
- ✅ Database connection
- ✅ All 10 users exist
- ✅ Admin account exists
- ✅ Backend is running
- ✅ Stripe configuration

---

## 🔐 Demo Account Credentials

### Regular Users (Main Platform)
**URL:** http://localhost:5173  
**Password:** `password123` (for all accounts)

**Influencers:**
- mike.tech@example.com
- sarah.fashion@example.com
- emma.fitness@example.com
- lisa.foodtravel@example.com
- alex.gaming@example.com

**Companies:**
- contact@techstartup.com
- marketing@fashionbrand.com
- partnerships@fitnessapp.com
- sales@gaminggear.com
- partnerships@travelworld.com

### Admin Dashboard
**URL:** http://localhost:5173/admin/login  
**Email:** admin@example.com  
**Password:** Admin123!

---

## 💳 Fix Stripe Configuration

### Step 1: Get Webhook Secret
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `http://localhost:3000/api/payments/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.*`
   - `account.updated`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Update `backend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

### Step 2: Get Connect Client ID (Optional - for payouts)
1. Go to https://dashboard.stripe.com/settings/connect
2. Copy the Client ID (starts with `ca_`)
3. Add to `backend/.env`:
   ```env
   STRIPE_CONNECT_CLIENT_ID=ca_your_client_id_here
   ```

### Step 3: Verify Stripe Config
```bash
cd backend
node verify-stripe-config.js
```

---

## 🧪 Test Everything

### Test All User Logins
```bash
cd backend
node test-all-logins.js
```

Expected output:
```
✅ Mike Chen (mike.tech@example.com) ... SUCCESS
✅ Sarah Johnson (sarah.fashion@example.com) ... SUCCESS
... (all 10 accounts)

Success Rate: 100%
```

### Test Admin Login
```bash
cd backend
node test-admin-login.js
```

### Full System Check
```bash
cd backend
node verify-system.js
```

---

## 🔧 Troubleshooting

### "User not found" error
```bash
cd backend
npm run seed
```

### "Admin not found" error
```bash
cd backend
node create-super-admin.js
```

### "Database connection failed"
1. Check PostgreSQL is running
2. Verify credentials in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=influencer_matching
   ```

### "Backend not responding"
```bash
cd backend
npm run start:dev
```

### "Stripe webhook failed"
1. Check webhook secret is not `whsec_...`
2. Run: `node verify-stripe-config.js`
3. Follow instructions to get real webhook secret

---

## 📝 What Was Fixed

### ✅ Seed Script Updated
- Added Lisa Wang (Food & Travel influencer)
- Added Alex Martinez (Gaming influencer)
- Added GamingGear Pro (Gaming company)
- Added TravelWorld Agency (Travel company)
- Now creates all 10 documented users

### ✅ Verification Scripts Created
- `verify-system.js` - Complete system check
- `test-all-logins.js` - Test all user accounts
- `verify-stripe-config.js` - Check Stripe setup

### ✅ Documentation Updated
- Comprehensive fix plan created
- Quick reference guide (this file)
- All credentials documented

---

## 🎯 Success Criteria

Run this command to verify everything is working:
```bash
cd backend
node verify-system.js
```

You should see:
```
✅ Database:     OK
✅ Users:        OK (10 users)
✅ Admin:        OK
✅ Backend API:  OK
✅ Stripe:       OK

🎉 All systems are operational!
```

---

## 📚 Related Files

- [DEMO-ACCOUNTS-COMPREHENSIVE-FIX-PLAN.md](./DEMO-ACCOUNTS-COMPREHENSIVE-FIX-PLAN.md) - Detailed analysis
- [ALL-USER-CREDENTIALS.md](./ALL-USER-CREDENTIALS.md) - Complete user list
- [ADMIN-CREDENTIALS.md](./ADMIN-CREDENTIALS.md) - Admin access
- [CREDENTIALS-QUICK-CARD.md](./CREDENTIALS-QUICK-CARD.md) - Quick reference

---

**Last Updated:** March 3, 2026  
**Status:** Ready to Use
