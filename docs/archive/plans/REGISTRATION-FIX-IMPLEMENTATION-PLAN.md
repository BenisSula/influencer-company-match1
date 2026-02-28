# Registration Fix - Implementation Plan

## Problem Investigation Summary

### Issue Reported
User cannot create an account on the registration page.

### Root Causes Identified

1. **Backend Server Not Running** ❌
   - Test showed: `Cannot POST /auth/register - 404 Not Found`
   - Backend needs to be started

2. **API Configuration** ✅ (Already Correct)
   - Backend: Global prefix `/api` configured
   - Frontend: API client correctly uses `http://localhost:3000/api`
   - No mismatch found

3. **Potential Issues to Verify**
   - Database connection
   - Environment variables
   - Password validation strictness
   - CORS configuration
   - TypeORM entities sync

## Implementation Plan

### Phase 1: Backend Startup & Verification (CRITICAL)

#### Step 1.1: Check Environment Variables
**File**: `backend/.env`

Required variables:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=influencer_match

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Action**: Verify `.env` file exists and has all required variables

#### Step 1.2: Start PostgreSQL Database
```bash
# Windows (if using PostgreSQL service)
net start postgresql-x64-14

# Or check if running
pg_isready -h localhost -p 5432
```

**Action**: Ensure PostgreSQL is running

#### Step 1.3: Run Database Migrations
```bash
cd backend
npm run migration:run
```

**Action**: Ensure all tables are created

#### Step 1.4: Start Backend Server
```bash
cd backend
npm run start:dev
```

**Expected Output**:
```
🚀 Backend API running on http://localhost:3000/api
```

**Action**: Keep backend running in terminal

### Phase 2: Frontend Verification

#### Step 2.1: Check Frontend Environment
**File**: `.env` or `.env.local` (root directory)

```env
VITE_API_URL=http://localhost:3000/api
```

**Action**: Verify frontend env variable

#### Step 2.2: Start Frontend
```bash
npm run dev
```

**Expected Output**:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

**Action**: Keep frontend running

### Phase 3: Registration Flow Testing

#### Step 3.1: Manual Test Registration
1. Navigate to `http://localhost:5173/register`
2. Fill form:
   - Email: `newuser@example.com`
   - Password: `Test123!@#` (must meet requirements)
   - Role: Select Influencer or Company
   - Agree to terms: Check
3. Click "Create Account"

**Expected**: Success → Redirect to dashboard

#### Step 3.2: API Test (Alternative)
```bash
# Test registration endpoint directly
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "role": "INFLUENCER"
  }'
```

**Expected Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "INFLUENCER"
  },
  "token": "jwt-token-here"
}
```

### Phase 4: Common Issues & Fixes

#### Issue 4.1: Password Validation Fails

**Symptoms**: Error "Password must contain uppercase, lowercase, number, and special character"

**Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*(),.?":{}|<>)

**Valid Examples**:
- `Test123!@#`
- `MyPass123!`
- `Secure@2024`

**Fix**: Use a password that meets all requirements

#### Issue 4.2: Email Already Exists

**Symptoms**: Error "Email already exists"

**Fix**: Use a different email address or delete existing user from database

```sql
-- Check if email exists
SELECT * FROM users WHERE email = 'test@example.com';

-- Delete if needed (for testing)
DELETE FROM users WHERE email = 'test@example.com';
```

#### Issue 4.3: Database Connection Failed

**Symptoms**: 
- Backend crashes on startup
- Error: "Connection refused" or "ECONNREFUSED"

**Fix**:
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Test connection:
```bash
psql -h localhost -U postgres -d influencer_match
```

#### Issue 4.4: CORS Error

**Symptoms**: Browser console shows "CORS policy blocked"

**Fix**: Verify backend CORS configuration in `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});
```

#### Issue 4.5: JWT_SECRET Missing

**Symptoms**: Error "JWT_SECRET environment variable is not set"

**Fix**: Add to `backend/.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

### Phase 5: Validation & Error Handling Improvements

#### Enhancement 5.1: Better Error Messages

**Current**: Generic error messages
**Improvement**: Specific, user-friendly messages

**File**: `src/renderer/components/RegisterForm/RegisterForm.tsx`

Add better error parsing:
```typescript
catch (error: any) {
  let message = 'Registration failed. Please try again.';
  
  if (error.response?.data?.message) {
    const apiMessage = error.response.data.message;
    
    // Parse common errors
    if (Array.isArray(apiMessage)) {
      message = apiMessage.join(', ');
    } else if (apiMessage.includes('email')) {
      message = 'This email is already registered. Please login instead.';
    } else if (apiMessage.includes('password')) {
      message = 'Password does not meet requirements. Please use a stronger password.';
    } else {
      message = apiMessage;
    }
  }
  
  setError(message);
  showToast(message, 'error');
}
```

#### Enhancement 5.2: Real-time Password Validation

**File**: `src/renderer/components/RegisterForm/RegisterForm.tsx`

Add validation feedback as user types:
```typescript
const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

const validatePasswordRealtime = (pwd: string) => {
  const errors: string[] = [];
  if (pwd.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(pwd)) errors.push('One number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('One special character');
  setPasswordErrors(errors);
};
```

#### Enhancement 5.3: Email Validation

Add email format validation before submission:
```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Phase 6: Database Schema Verification

#### Step 6.1: Verify Tables Exist

```sql
-- Check if users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'influencer_profiles', 'company_profiles');

-- Check users table structure
\d users

-- Check profile tables
\d influencer_profiles
\d company_profiles
```

**Expected**: All 3 tables should exist

#### Step 6.2: Check Constraints

```sql
-- Check unique constraint on email
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users' AND constraint_type = 'UNIQUE';
```

**Expected**: Unique constraint on email column

### Phase 7: Testing Checklist

- [ ] PostgreSQL database is running
- [ ] Backend `.env` file configured
- [ ] Database migrations completed
- [ ] Backend server started successfully
- [ ] Frontend `.env` file configured
- [ ] Frontend dev server running
- [ ] Can access registration page
- [ ] Password meets all requirements
- [ ] Email is valid format
- [ ] Terms checkbox is checked
- [ ] Registration submits without errors
- [ ] User is created in database
- [ ] JWT token is returned
- [ ] User is redirected to dashboard
- [ ] User data persists after page refresh

## Quick Start Commands

### Terminal 1: Database
```bash
# Start PostgreSQL (Windows)
net start postgresql-x64-14

# Or check status
pg_isready
```

### Terminal 2: Backend
```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

### Terminal 3: Frontend
```bash
npm install
npm run dev
```

### Terminal 4: Testing
```bash
# Test backend health
curl http://localhost:3000/api/auth/me

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","role":"INFLUENCER"}'
```

## Troubleshooting Guide

### Problem: "Cannot connect to database"
**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `backend/.env`
3. Test connection: `psql -h localhost -U postgres`

### Problem: "JWT_SECRET not set"
**Solution**: Add to `backend/.env`:
```env
JWT_SECRET=your-secret-key-at-least-32-characters-long-for-security
```

### Problem: "Port 3000 already in use"
**Solution**:
```bash
# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

### Problem: "CORS error in browser"
**Solution**: Verify frontend URL matches CORS origin in `backend/src/main.ts`

### Problem: "Password validation fails"
**Solution**: Use password with:
- 8+ characters
- Uppercase + lowercase
- Number
- Special character
Example: `Test123!@#`

### Problem: "Email already exists"
**Solution**: 
```sql
-- Delete test user
DELETE FROM users WHERE email = 'test@example.com';
```

## Success Criteria

✅ Backend server running on port 3000
✅ Frontend server running on port 5173
✅ Database connected and migrations applied
✅ Registration form accessible
✅ Can submit registration with valid data
✅ User created in database
✅ JWT token received and stored
✅ Redirected to dashboard
✅ User session persists after refresh

## Next Steps After Fix

1. **Test Demo Accounts**: Verify existing demo accounts still work
2. **Test Login**: Ensure login works with newly created account
3. **Test Profile Setup**: Complete profile setup wizard
4. **Test Logout**: Verify logout clears session
5. **Test Password Reset**: Implement forgot password flow (future)

## Files to Monitor

### Backend Logs
- Watch for errors in terminal running `npm run start:dev`
- Check for database connection errors
- Monitor API request/response logs

### Frontend Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Monitor Network tab for API calls
- Verify 200 OK responses

### Database
- Monitor user creation: `SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 5;`
- Check profile creation: `SELECT * FROM influencer_profiles;`

---

**Status**: Ready for Implementation
**Priority**: CRITICAL
**Estimated Time**: 30-60 minutes
**Dependencies**: PostgreSQL, Node.js, npm
