# 🔧 Demo Accounts & Stripe - Comprehensive Fixing Plan

## 📋 Executive Summary

This document provides a complete analysis and fixing plan for all demo accounts, authentication systems, and Stripe payment integration in the Influencer-Company Matching Platform.

**Status Date:** March 3, 2026  
**Investigation Completed:** ✅  
**Priority:** HIGH

---

## 🔍 Current State Analysis

### 1. Demo Accounts Inventory

#### A. Regular User Accounts (Main Matching Platform)

**Total Users:** 10 (5 Influencers + 5 Companies)  
**Universal Password:** `password123`  
**Status:** ✅ Properly seeded in database

| Type | Name | Email | Role | Status |
|------|------|-------|------|--------|
| Influencer | Mike Chen | mike.tech@example.com | INFLUENCER | ✅ Active |
| Influencer | Sarah Johnson | sarah.fashion@example.com | INFLUENCER | ✅ Active |
| Influencer | Emma Rodriguez | emma.fitness@example.com | INFLUENCER | ✅ Active |
| Influencer | Lisa Wang | lisa.foodtravel@example.com | INFLUENCER | ✅ Active |
| Influencer | Alex Martinez | alex.gaming@example.com | INFLUENCER | ✅ Active |
| Company | TechStartup Inc | contact@techstartup.com | COMPANY | ✅ Active |
| Company | Fashion Brand Co | marketing@fashionbrand.com | COMPANY | ✅ Active |
| Company | FitnessApp | partnerships@fitnessapp.com | COMPANY | ✅ Active |
| Company | GamingGear Pro | sales@gaminggear.com | COMPANY | ✅ Active |
| Company | TravelWorld Agency | partnerships@travelworld.com | COMPANY | ✅ Active |

#### B. Admin Dashboard Account

**Total Admins:** 1 (Super Admin)  
**Access URL:** http://localhost:5173/admin/login  
**Status:** ✅ Properly configured

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@example.com | Admin123! | SUPER_ADMIN | ✅ Active |

---

## 🚨 Identified Issues

### Issue #1: Seed File Incomplete
**Severity:** MEDIUM  
**File:** `backend/seed-simple.ts`

**Problem:**
- Only seeds 3 influencers (Sarah, Mike, Emma)
- Only seeds 3 companies (TechStartup, Fashion Brand, FitnessApp)
- Missing 2 influencers: Lisa Wang, Alex Martinez
- Missing 2 companies: GamingGear Pro, TravelWorld Agency

**Impact:**
- Documentation shows 10 users but only 6 are actually seeded
- Users trying to login with documented credentials will fail
- Inconsistency between docs and actual database

### Issue #2: Stripe Configuration Incomplete
**Severity:** HIGH  
**Files:** `backend/.env`, `backend/src/config/stripe.config.ts`

**Problem:**
- `STRIPE_WEBHOOK_SECRET` is set to placeholder: `whsec_...`
- Missing `STRIPE_CONNECT_CLIENT_ID` in .env
- Frontend has publishable key but backend webhook secret is incomplete

**Impact:**
- Payment webhooks will fail
- Stripe Connect onboarding won't work
- Payment status updates won't be received
- Influencer payouts cannot be processed

### Issue #3: Password Hashing Inconsistency
**Severity:** LOW  
**Files:** Multiple auth services

**Problem:**
- Seed script uses bcrypt with 10 rounds
- Admin creation uses bcrypt with 10 rounds
- Both are consistent ✅

**Status:** No issue - working correctly

### Issue #4: Profile Completion Status
**Severity:** MEDIUM  
**Files:** `backend/seed-simple.ts`

**Problem:**
- Seeded users have `profileCompleted: true` and `profileCompletionPercentage: 100`
- But profiles may not have all required fields filled
- This could cause issues with profile validation

**Impact:**
- Users might skip profile setup wizard
- Matching algorithm might not work properly with incomplete data

---

## 🛠️ Comprehensive Fixing Plan

### Phase 1: Complete User Seeding (Priority: HIGH)

#### Task 1.1: Update seed-simple.ts
**File:** `backend/seed-simple.ts`

**Action:** Add missing users to seed script

```typescript
// Add these influencers:
['lisa.foodtravel@example.com', 'Lisa Wang', 'Food & Travel', 175000],
['alex.gaming@example.com', 'Alex Martinez', 'Gaming & Esports', 250000],

// Add these companies:
['sales@gaminggear.com', 'GamingGear Pro', 'Gaming & Electronics', 45000],
['partnerships@travelworld.com', 'TravelWorld Agency', 'Travel & Tourism', 60000],
```

**Expected Outcome:**
- All 10 documented users will be seeded
- Credentials documentation will match database reality

#### Task 1.2: Create Enhanced Seed Script
**File:** `backend/seed-complete.ts` (NEW)

**Action:** Create comprehensive seed script with:
- All 10 users with complete profiles
- Realistic follower counts and engagement rates
- Sample connections between compatible users
- Sample messages and collaboration requests
- Sample feed posts

**Expected Outcome:**
- Demo environment will have realistic data
- Testing will be more comprehensive

---

### Phase 2: Fix Stripe Configuration (Priority: HIGH)

#### Task 2.1: Generate Stripe Webhook Secret
**File:** `backend/.env`

**Action:**
1. Login to Stripe Dashboard (test mode)
2. Go to Developers → Webhooks
3. Create endpoint: `http://localhost:3000/api/payments/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `account.updated` (for Connect)
5. Copy webhook signing secret
6. Update `.env` file

**Expected Outcome:**
- Webhook secret will be valid
- Payment events will be processed correctly

#### Task 2.2: Add Stripe Connect Client ID
**File:** `backend/.env`

**Action:**
1. Login to Stripe Dashboard
2. Go to Settings → Connect
3. Copy Client ID
4. Add to `.env`:
```env
STRIPE_CONNECT_CLIENT_ID=ca_...
```

**Expected Outcome:**
- Stripe Connect onboarding will work
- Influencers can receive payouts

#### Task 2.3: Update Frontend Stripe Key
**File:** `.env.local`

**Action:** Verify publishable key matches backend

**Current Status:** ✅ Already correct

---

### Phase 3: Enhance Admin Dashboard (Priority: MEDIUM)

#### Task 3.1: Create Additional Admin Roles
**File:** `backend/create-admin-roles.js` (NEW)

**Action:** Create script to add:
- Moderator account (limited permissions)
- Support account (read-only)
- Billing admin (payment management only)

**Expected Outcome:**
- Role-based access control can be tested
- Multi-admin scenarios can be demonstrated

#### Task 3.2: Seed Admin Test Data
**File:** `backend/seed-admin-data.js` (NEW)

**Action:** Create:
- Sample audit logs
- Sample system settings
- Sample feature flags
- Sample tenant configurations

**Expected Outcome:**
- Admin dashboard will have realistic data
- All admin features can be demonstrated

---

### Phase 4: Profile Data Enhancement (Priority: MEDIUM)

#### Task 4.1: Add Complete Profile Data
**File:** `backend/seed-complete.ts`

**Action:** For each user, add:
- Bio (realistic description)
- Portfolio URLs (for influencers)
- Website URLs (for companies)
- Social media links
- Avatar URLs (placeholder images)
- Location data
- Platform preferences
- Budget ranges
- Collaboration preferences

**Expected Outcome:**
- Profiles will look professional
- Matching algorithm will have complete data
- Profile pages will display properly

#### Task 4.2: Add Sample Content
**File:** `backend/seed-content.ts` (NEW)

**Action:** Create:
- 20+ sample feed posts
- 50+ sample comments
- Sample reactions (likes, loves, etc.)
- Sample shares
- Sample saved posts

**Expected Outcome:**
- Feed will be populated
- Social features can be tested
- User engagement can be demonstrated

---

### Phase 5: Testing & Validation (Priority: HIGH)

#### Task 5.1: Create Test Scripts
**Files:** Create in `backend/test/`

**Scripts to create:**
1. `test-user-login.js` - Test all 10 user logins
2. `test-admin-login.js` - Test admin login
3. `test-stripe-connection.js` - Verify Stripe API connection
4. `test-profile-completion.js` - Verify all profiles are complete
5. `test-matching-algorithm.js` - Test matching between users

**Expected Outcome:**
- All accounts can be verified programmatically
- Issues can be detected early
- Automated testing for future changes

#### Task 5.2: Create Verification Dashboard
**File:** `backend/verify-demo-accounts.js` (NEW)

**Action:** Create comprehensive verification script that checks:
- All users exist in database
- All passwords work
- All profiles are complete
- Stripe configuration is valid
- Admin account works
- Database connections work

**Expected Outcome:**
- One-command verification of entire system
- Clear reporting of any issues

---

## 📝 Implementation Checklist

### Immediate Actions (Do First)

- [ ] **1. Update seed-simple.ts** - Add missing 4 users
- [ ] **2. Run updated seed script** - Populate database
- [ ] **3. Generate Stripe webhook secret** - Fix payment webhooks
- [ ] **4. Add Stripe Connect Client ID** - Enable payouts
- [ ] **5. Test all 10 user logins** - Verify credentials work
- [ ] **6. Test admin login** - Verify admin access
- [ ] **7. Test Stripe payment flow** - Verify payments work

### Short-term Actions (This Week)

- [ ] **8. Create seed-complete.ts** - Enhanced seeding
- [ ] **9. Add profile data** - Complete all profiles
- [ ] **10. Create test scripts** - Automated testing
- [ ] **11. Create verification script** - System health check
- [ ] **12. Update documentation** - Reflect actual state

### Long-term Actions (This Month)

- [ ] **13. Create admin roles** - Multi-admin support
- [ ] **14. Seed admin data** - Admin dashboard content
- [ ] **15. Add sample content** - Feed posts, comments
- [ ] **16. Create demo video** - Show all features
- [ ] **17. Production deployment plan** - Real credentials

---

## 🔐 Security Considerations

### Development Environment
- ✅ Using test Stripe keys
- ✅ Simple passwords acceptable for demo
- ✅ Local database only
- ⚠️ JWT secret should be changed

### Production Environment
- ❌ Must use strong passwords
- ❌ Must use production Stripe keys
- ❌ Must enable MFA for admin
- ❌ Must use secure JWT secret
- ❌ Must enable rate limiting
- ❌ Must enable account lockout
- ❌ Must use HTTPS only

---

## 📊 Success Metrics

### How to Verify Fix is Complete

1. **User Login Test**
   - All 10 users can login successfully
   - Passwords work as documented
   - Profiles load correctly

2. **Admin Login Test**
   - Admin can access dashboard
   - All admin features work
   - Audit logs are created

3. **Stripe Test**
   - Test payment succeeds
   - Webhook is received
   - Payment status updates
   - Connect onboarding works

4. **Profile Test**
   - All profiles are 100% complete
   - Matching algorithm works
   - Profile pages display correctly

5. **Integration Test**
   - Users can send messages
   - Users can create connections
   - Users can post to feed
   - Users can create campaigns

---

## 🚀 Quick Start Commands

### Reset and Reseed Database
```bash
cd backend
npm run migration:revert
npm run migration:run
npm run seed
node create-super-admin.js
```

### Test All Accounts
```bash
cd backend
node test-user-login.js
node test-admin-login.js
```

### Verify Stripe
```bash
cd backend
node test-stripe-connection.js
```

### Full System Check
```bash
cd backend
node verify-demo-accounts.js
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** User login fails
- Check database is running
- Verify user exists: `SELECT * FROM users WHERE email = 'mike.tech@example.com'`
- Check password hash: Should start with `$2b$10$`

**Issue:** Admin login fails
- Check admin_users table exists
- Run: `node create-super-admin.js`
- Verify email is exactly: `admin@example.com`

**Issue:** Stripe webhook fails
- Check webhook secret is not placeholder
- Verify endpoint URL is correct
- Check Stripe dashboard for webhook logs

**Issue:** Profile incomplete
- Run seed script again
- Check profile tables have data
- Verify foreign keys are correct

---

## 📚 Related Documentation

- [ALL-USER-CREDENTIALS.md](./ALL-USER-CREDENTIALS.md) - Complete user list
- [ADMIN-CREDENTIALS.md](./ADMIN-CREDENTIALS.md) - Admin access
- [CREDENTIALS-QUICK-CARD.md](./CREDENTIALS-QUICK-CARD.md) - Quick reference
- [.env.local.example](./.env.local.example) - Environment variables
- [backend/.env.example](./backend/.env.example) - Backend config

---

## ✅ Next Steps

1. **Review this plan** - Ensure all issues are covered
2. **Prioritize tasks** - Start with immediate actions
3. **Execute fixes** - Follow implementation checklist
4. **Test thoroughly** - Use verification scripts
5. **Update docs** - Keep documentation current
6. **Deploy changes** - Push to repository

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2026  
**Status:** Ready for Implementation
