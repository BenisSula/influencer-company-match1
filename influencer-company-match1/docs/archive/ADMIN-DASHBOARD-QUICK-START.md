# Admin Dashboard - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install stripe @types/stripe
```

### Step 2: Configure Environment
Add to `backend/.env`:
```env
# Stripe (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# JWT (Use existing or generate new)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Step 3: Run Migrations
```bash
npm run migration:run
```

### Step 4: Create Super Admin
```bash
# Generate password hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(console.log)"

# Copy the hash and run this SQL
```

```sql
INSERT INTO admin_users (
  id, email, password, "fullName", role, "isActive", "createdAt", "updatedAt"
)
VALUES (
  uuid_generate_v4(),
  'admin@example.com',
  'PASTE_HASH_HERE',
  'Super Admin',
  'SUPER_ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

### Step 5: Start Backend
```bash
npm run start:dev
```

### Step 6: Test Login
```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

---

## 📋 What's Implemented

### ✅ Phase 1: Core Admin Infrastructure
- Multi-tenant architecture
- Admin authentication (JWT)
- Role-based access control (5 roles)
- Audit logging
- Tenant management
- Admin user management

### ✅ Phase 2: Payment Integration
- Stripe integration
- Subscription management
- Payment tracking
- Invoice generation
- Webhook handling
- Multiple subscription tiers

---

## 🎯 API Endpoints Ready

### Authentication
- `POST /admin/auth/login` - Login
- `GET /admin/auth/me` - Get profile

### Tenants
- `POST /admin/tenants` - Create tenant
- `GET /admin/tenants` - List tenants
- `GET /admin/tenants/:id` - Get tenant
- `PATCH /admin/tenants/:id` - Update tenant
- `DELETE /admin/tenants/:id` - Delete tenant

### Payments
- `POST /admin/payments/subscriptions` - Create subscription
- `DELETE /admin/payments/subscriptions/:id` - Cancel subscription
- `GET /admin/payments/subscriptions/tenant/:id` - Get subscriptions
- `GET /admin/payments/payments/tenant/:id` - Get payments
- `GET /admin/payments/invoices/tenant/:id` - Get invoices
- `POST /admin/payments/webhook` - Stripe webhook

---

## 🧪 Quick Test Flow

### 1. Login as Super Admin
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' \
  | jq -r '.accessToken')

echo "Token: $TOKEN"
```

### 2. Create a Tenant
```bash
curl -X POST http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "acme",
    "name": "Acme Corporation",
    "adminEmail": "admin@acme.com",
    "adminPassword": "SecurePass123!",
    "adminFullName": "John Doe",
    "subscriptionTier": "PRO",
    "branding": {
      "primaryColor": "#6366f1",
      "secondaryColor": "#8b5cf6"
    }
  }'
```

### 3. List All Tenants
```bash
curl -X GET "http://localhost:3000/admin/tenants?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Create Stripe Customer (for tenant)
This happens automatically when creating a subscription, but you can test:
```bash
# First, get tenant ID from step 2 response
TENANT_ID="paste-tenant-id-here"

# Create subscription (requires Stripe test price ID)
curl -X POST http://localhost:3000/admin/payments/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "priceId": "price_xxx",
    "paymentMethodId": "pm_card_visa"
  }'
```

---

## 💡 Subscription Tiers

| Tier | Users | Matches | AI | Analytics | Branding | API |
|------|-------|---------|----|-----------| ---------|-----|
| **Trial** | 10 | 50 | ❌ | ❌ | ❌ | ❌ |
| **Basic** | 50 | 500 | ✅ | ✅ | ❌ | ❌ |
| **Pro** | 200 | 2,000 | ✅ | ✅ | ✅ | ✅ |
| **Enterprise** | ∞ | ∞ | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Admin Roles

1. **SUPER_ADMIN** - Full system access
2. **TENANT_ADMIN** - Manage own tenant
3. **MODERATOR** - Content moderation
4. **SUPPORT** - User support
5. **ANALYST** - View analytics

---

## 📊 Database Tables Created

- `tenants` - Tenant management
- `admin_users` - Admin users
- `audit_logs` - Action tracking
- `subscriptions` - Stripe subscriptions
- `payments` - Payment history
- `invoices` - Invoice records

---

## 🎨 Frontend Login Page

Navigate to: `http://localhost:5173/admin/login`

**Credentials:**
- Email: `admin@example.com`
- Password: `Admin123!`

---

## 🔧 Troubleshooting

### Migration Errors
```bash
# Reset migrations if needed
npm run migration:revert
npm run migration:run
```

### Stripe Webhook Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/admin/payments/webhook

# Trigger test events
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

### Password Hash Generation
```bash
# Node.js
node -e "require('bcrypt').hash('YourPassword', 10).then(console.log)"

# Or use online tool (for testing only)
# https://bcrypt-generator.com/
```

---

## 📝 Next Steps

### Phase 3: User Management (Next)
- User CRUD operations
- Bulk import/export
- User activity logs
- Advanced filtering
- User impersonation

### Phase 4: Platform Configuration
- White-label branding UI
- Email template management
- Feature flags UI
- Integration management

### Phase 5: Analytics & Reporting
- Revenue analytics
- User engagement metrics
- Report generation
- Data visualization

---

## 🎯 Current Status

✅ **Phase 1 Complete** - Core Admin Infrastructure
✅ **Phase 2 Complete** - Payment Integration
⏳ **Phase 3 Next** - User Management

**26 files created, 2 files modified**
**All backend APIs working and tested**
**Frontend login page ready**

---

## 💬 Support

For issues or questions:
1. Check the detailed documentation in `WHITE-LABEL-ADMIN-DASHBOARD-MASTER-PLAN.md`
2. Review implementation status in `ADMIN-DASHBOARD-PHASE1-2-COMPLETE.md`
3. Test using the examples above

**Ready to build the future of white-label platforms! 🚀**
