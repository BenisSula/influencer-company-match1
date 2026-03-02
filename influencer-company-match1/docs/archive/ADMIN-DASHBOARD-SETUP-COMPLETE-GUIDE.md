# Admin Dashboard - Complete Setup Guide

## 🚀 Quick Setup (5 Minutes)

Follow these steps to get the admin dashboard running:

---

## Step 1: Install Stripe Package

```bash
cd backend
npm install stripe @types/stripe
```

**Expected Output:**
```
added 2 packages, and audited X packages in Xs
```

---

## Step 2: Configure Environment Variables

### Option A: Copy and Edit .env.example

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

### Option B: Create .env Manually

Create `backend/.env` with this content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=influencer_match

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Account Lockout
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MS=1800000

# Stripe Configuration (Optional for now - can add later)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Admin Dashboard
ADMIN_JWT_SECRET=your-admin-super-secret-jwt-key-change-this
```

### Generate Secure JWT Secrets

**On Mac/Linux:**
```bash
# Generate JWT_SECRET
openssl rand -base64 64

# Generate ADMIN_JWT_SECRET
openssl rand -base64 64
```

**On Windows (PowerShell):**
```powershell
# Generate random string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

**Or use online generator:**
- https://randomkeygen.com/ (Fort Knox Passwords section)

---

## Step 3: Run Database Migrations

```bash
# Make sure you're in the backend directory
cd backend

# Run all migrations (including admin dashboard tables)
npm run migration:run
```

**Expected Output:**
```
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = 'migrations'
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
...
Migration CreateAdminTables1708000000000 has been executed successfully.
Migration CreatePaymentTables1708001000000 has been executed successfully.
```

**Migrations Created:**
- ✅ `tenants` table
- ✅ `admin_users` table
- ✅ `audit_logs` table
- ✅ `subscriptions` table
- ✅ `payments` table
- ✅ `invoices` table

---

## Step 4: Create Super Admin User

### Option A: Using SQL (Recommended)

```bash
# Generate password hash first
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(console.log)"
```

**Copy the hash output**, then run this SQL:

```sql
-- Connect to your database
psql -U postgres -d influencer_match

-- Insert super admin (replace PASTE_HASH_HERE with your hash)
INSERT INTO admin_users (
  id, 
  email, 
  password, 
  "fullName", 
  role, 
  "isActive", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'PASTE_HASH_HERE',
  'Super Admin',
  'SUPER_ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

### Option B: Using Node Script

Create `backend/create-admin.js`:

```javascript
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createAdmin() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'influencer_match',
  });

  try {
    await client.connect();
    
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await client.query(`
      INSERT INTO admin_users (
        email, password, "fullName", role, "isActive", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, ['admin@example.com', hashedPassword, 'Super Admin', 'SUPER_ADMIN', true]);
    
    console.log('✅ Super admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();
```

Run it:
```bash
node create-admin.js
```

---

## Step 5: Start the Backend Server

```bash
# Make sure you're in the backend directory
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [InstanceLoader] AdminModule dependencies initialized
[Nest] INFO [RoutesResolver] AdminAuthController {/admin/auth}:
[Nest] INFO [RouterExplorer] Mapped {/admin/auth/login, POST} route
[Nest] INFO [RouterExplorer] Mapped {/admin/auth/me, GET} route
[Nest] INFO [RoutesResolver] TenantController {/admin/tenants}:
[Nest] INFO [RoutesResolver] PaymentController {/admin/payments}:
[Nest] INFO [RoutesResolver] UserManagementController {/admin/users}:
[Nest] INFO [NestApplication] Nest application successfully started
```

---

## Step 6: Test Admin Login

### Using cURL:

```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "adminUser": {
    "id": "uuid-here",
    "email": "admin@example.com",
    "fullName": "Super Admin",
    "role": "SUPER_ADMIN",
    "tenantId": null,
    "tenant": null
  }
}
```

### Using Browser:

1. Start frontend: `npm run dev` (from root directory)
2. Navigate to: `http://localhost:5173/admin/login`
3. Login with:
   - Email: `admin@example.com`
   - Password: `Admin123!`

---

## Step 7: Verify Installation

### Check Database Tables:

```sql
-- Connect to database
psql -U postgres -d influencer_match

-- List admin tables
\dt admin*
\dt tenants
\dt subscriptions
\dt payments
\dt invoices
\dt audit_logs

-- Check admin user
SELECT id, email, "fullName", role, "isActive" FROM admin_users;
```

### Test API Endpoints:

```bash
# Save your token
TOKEN="your-token-from-login-response"

# Get user stats
curl -X GET http://localhost:3000/admin/users/stats \
  -H "Authorization: Bearer $TOKEN"

# List users
curl -X GET http://localhost:3000/admin/users?page=1&limit=10 \
  -H "Authorization: Bearer $TOKEN"

# Get tenants
curl -X GET http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 What's Available Now

### Backend APIs (23 endpoints)

**Authentication:**
- `POST /admin/auth/login` - Admin login
- `GET /admin/auth/me` - Get admin profile

**Tenant Management:**
- `POST /admin/tenants` - Create tenant
- `GET /admin/tenants` - List tenants
- `GET /admin/tenants/:id` - Get tenant
- `PATCH /admin/tenants/:id` - Update tenant
- `DELETE /admin/tenants/:id` - Delete tenant

**User Management:**
- `GET /admin/users` - List users with filters
- `GET /admin/users/stats` - Get statistics
- `GET /admin/users/export` - Export users
- `GET /admin/users/:id` - Get user details
- `GET /admin/users/:id/activity` - Get activity logs
- `PATCH /admin/users/:id` - Update user
- `PATCH /admin/users/:id/toggle-status` - Toggle status
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/users/bulk-delete` - Bulk delete
- `POST /admin/users/bulk-update-status` - Bulk update

**Payment Management:**
- `POST /admin/payments/subscriptions` - Create subscription
- `DELETE /admin/payments/subscriptions/:id` - Cancel subscription
- `GET /admin/payments/subscriptions/tenant/:id` - Get subscriptions
- `GET /admin/payments/payments/tenant/:id` - Get payments
- `GET /admin/payments/invoices/tenant/:id` - Get invoices
- `POST /admin/payments/webhook` - Stripe webhook

### Frontend Pages

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard with stats

---

## 🔧 Troubleshooting

### Migration Errors

**Error: "relation already exists"**
```bash
# Check which migrations ran
npm run migration:show

# Revert last migration if needed
npm run migration:revert

# Run migrations again
npm run migration:run
```

### Connection Errors

**Error: "ECONNREFUSED"**
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -U postgres -l`
- Check .env database credentials

### Authentication Errors

**Error: "Invalid credentials"**
- Verify admin user exists in database
- Check password hash was created correctly
- Ensure JWT_SECRET matches in .env

### Stripe Errors (Optional)

**Error: "Stripe key not configured"**
- Stripe is optional for basic functionality
- Add keys later when ready for payment testing
- Get test keys from: https://dashboard.stripe.com/test/apikeys

---

## 📱 Frontend Setup

### Start Development Server

```bash
# From root directory
npm run dev
```

### Access Admin Dashboard

```
URL: http://localhost:5173/admin/login
Email: admin@example.com
Password: Admin123!
```

### Available Routes

- `/admin/login` - Login page
- `/admin/dashboard` - Dashboard with stats
- `/admin/users` - User management (coming soon)
- `/admin/tenants` - Tenant management (coming soon)
- `/admin/payments` - Payment management (coming soon)

---

## 🎨 Features Implemented

### Phase 1: Core Admin Infrastructure ✅
- Multi-tenant architecture
- Admin authentication (JWT)
- Role-based access control (5 roles)
- Audit logging
- Database migrations

### Phase 2: Payment Integration ✅
- Stripe integration
- Subscription management
- Payment tracking
- Invoice generation
- Webhook handling

### Phase 3: User Management ✅
- User CRUD operations
- Advanced filtering
- Bulk operations
- Export functionality
- Statistics dashboard
- Responsive design (mobile, tablet, desktop)
- Brand color integration

---

## 📊 Database Schema

### Admin Tables Created

```sql
-- Tenants (6 columns + metadata)
tenants (
  id, subdomain, name, logo, status, subscriptionTier,
  branding, features, settings,
  stripeCustomerId, stripeSubscriptionId,
  trialEndsAt, subscriptionEndsAt,
  createdAt, updatedAt
)

-- Admin Users (14 columns)
admin_users (
  id, email, password, fullName, role, tenantId,
  permissions, isActive, mfaEnabled, mfaSecret,
  lastLoginAt, lastLoginIp,
  createdAt, updatedAt
)

-- Audit Logs (9 columns)
audit_logs (
  id, adminUserId, action, entityType, entityId,
  changes, ipAddress, userAgent, createdAt
)

-- Subscriptions (16 columns)
subscriptions (
  id, tenantId, stripeSubscriptionId, stripePriceId,
  status, amount, currency, interval,
  currentPeriodStart, currentPeriodEnd,
  cancelAt, canceledAt, trialStart, trialEnd,
  createdAt, updatedAt
)

-- Payments (10 columns)
payments (
  id, tenantId, stripePaymentIntentId,
  amount, currency, status, description,
  invoiceId, metadata, failureReason, createdAt
)

-- Invoices (14 columns)
invoices (
  id, tenantId, stripeInvoiceId, invoiceNumber,
  status, subtotal, tax, total, currency,
  lineItems, pdfUrl, dueDate, paidAt,
  createdAt, updatedAt
)
```

---

## 🔐 Default Credentials

**Super Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`
- Role: `SUPER_ADMIN`

**⚠️ IMPORTANT:** Change these credentials in production!

---

## 🎯 Next Steps

1. ✅ Install Stripe package
2. ✅ Configure environment variables
3. ✅ Run migrations
4. ✅ Create super admin
5. ✅ Start backend server
6. ✅ Test admin login
7. ✅ Access admin dashboard

**You're all set! The admin dashboard is ready to use.**

---

## 📚 Additional Resources

- **Master Plan:** `WHITE-LABEL-ADMIN-DASHBOARD-MASTER-PLAN.md`
- **Phase 1-2 Details:** `ADMIN-DASHBOARD-PHASE1-2-COMPLETE.md`
- **Phase 3 Details:** `ADMIN-DASHBOARD-PHASE3-USER-MANAGEMENT-COMPLETE.md`
- **Quick Start:** `ADMIN-DASHBOARD-QUICK-START.md`
- **Progress:** `ADMIN-DASHBOARD-IMPLEMENTATION-PROGRESS.md`

---

## 💬 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure PostgreSQL is running
4. Check backend logs for errors
5. Verify migrations ran successfully

**Status: Ready for Production Testing! 🚀**
