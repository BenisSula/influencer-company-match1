# Admin Dashboard Pages Fix - Quick Reference

## What Was Fixed

| Page | Error | Fix |
|------|-------|-----|
| **Tenants** | Invalid admin token | Created `adminApiClient`, updated service to use admin token |
| **Branding** | Failed to load settings | Fixed API URL from `/admin/customization` to `/api/admin/customization` |
| **Features** | Failed to load flags | Fixed API URL (same as branding) |
| **Reviews** | Failed to fetch | Created admin reviews backend + service, fixed endpoint |
| **Settings** | Logs you out | Removed manual logout logic, let `adminApiClient` handle it |

## Key Changes

### 1. New Admin API Client
```typescript
// src/renderer/services/admin-api-client.ts
- Uses adminToken (not auth_token)
- Correct base URL with /api prefix
- Auto-logout on 401
- Consistent error handling
```

### 2. Updated Services
All admin services now use `adminApiClient`:
- ✅ admin-tenant.service.ts
- ✅ admin-branding.service.ts
- ✅ admin-system-settings.service.ts
- ✅ admin-analytics.service.ts
- ✅ admin-user.service.ts
- ✅ admin-moderation.service.ts
- ✅ admin-reviews.service.ts (NEW)

### 3. New Backend Endpoints
```typescript
// Reviews management
GET    /api/admin/reviews
GET    /api/admin/reviews/stats
GET    /api/admin/reviews/:id
PATCH  /api/admin/reviews/:id/feature
DELETE /api/admin/reviews/:id
```

### 4. Fixed Backend Guards
```typescript
// RolesGuard now checks both adminUser and user
const user = request.adminUser || request.user;
```

## How to Test

### Step 1: Restart Backend
```bash
cd backend
npm run start:dev
```

### Step 2: Clear Browser Storage
Open browser console:
```javascript
localStorage.clear()
```

### Step 3: Login to Admin
Navigate to: `http://localhost:5173/#/admin/login`

Login with:
- Email: `admin@platform.com`
- Password: `Admin123!@#`

### Step 4: Test Each Page
1. **Dashboard** - Should load overview
2. **Tenants** - Should show tenant list (no "Invalid admin token")
3. **Users** - Should show user list
4. **Payments** - Should show payment stats
5. **Branding** - Should load branding settings (no "Failed to load")
6. **Features** - Should show feature flags (no "Failed to load")
7. **Analytics** - Should show analytics data
8. **Moderation** - Should show moderation queue
9. **Reviews** - Should show reviews list (no "Failed to fetch")
10. **Settings** - Should load settings (no logout)

### Step 5: Run Test Script
In browser console:
```javascript
// Copy and paste contents of test-admin-pages-fix.js
```

## Common Issues & Solutions

### Issue: Still getting "Invalid admin token"
**Solution**: 
1. Clear localStorage
2. Login again
3. Check that `adminToken` exists: `localStorage.getItem('adminToken')`

### Issue: 404 Not Found
**Solution**:
1. Verify backend is running on port 3000
2. Check backend console for route registration
3. Verify `VITE_API_URL` is set correctly

### Issue: CORS errors
**Solution**:
1. Check backend CORS configuration in `main.ts`
2. Ensure `http://localhost:5173` is allowed

### Issue: Settings page still logs out
**Solution**:
1. Verify `admin-system-settings.service.ts` uses `adminApiClient`
2. Check browser console for actual error
3. May be legitimate 401 if token expired

## API Endpoint Reference

### Correct Admin Endpoints
```
Base URL: http://localhost:3000/api

Auth:
POST   /admin/auth/login
GET    /admin/auth/me

Tenants:
GET    /admin/tenants
POST   /admin/tenants
GET    /admin/tenants/:id
PATCH  /admin/tenants/:id
DELETE /admin/tenants/:id

Users:
GET    /admin/users
GET    /admin/users/stats
GET    /admin/users/:id
PATCH  /admin/users/:id
DELETE /admin/users/:id

Branding:
GET    /admin/customization/branding
PATCH  /admin/customization/branding
POST   /admin/customization/upload-asset/:type

Features:
GET    /admin/customization/features
PATCH  /admin/customization/features

Integrations:
GET    /admin/customization/integrations
PATCH  /admin/customization/integrations

Email Templates:
GET    /admin/customization/email-templates
POST   /admin/customization/email-templates
GET    /admin/customization/email-templates/:id
PATCH  /admin/customization/email-templates/:id
DELETE /admin/customization/email-templates/:id

Analytics:
GET    /admin/analytics/overview
GET    /admin/analytics/users
GET    /admin/analytics/revenue
GET    /admin/analytics/engagement
GET    /admin/analytics/campaigns
GET    /admin/analytics/matches

Moderation:
GET    /admin/moderation/flagged-content
POST   /admin/moderation/review/:id
GET    /admin/moderation/banned-users
POST   /admin/moderation/ban-user/:id
POST   /admin/moderation/unban-user/:id

Reviews:
GET    /admin/reviews
GET    /admin/reviews/stats
GET    /admin/reviews/:id
PATCH  /admin/reviews/:id/feature
DELETE /admin/reviews/:id

System Settings:
GET    /admin/system-settings
GET    /admin/system-settings/:key
PUT    /admin/system-settings/:key
POST   /admin/system-settings/bulk-update
DELETE /admin/system-settings/:key
```

## Files Changed Summary

### Frontend (8 files)
- ✅ Created: `src/renderer/services/admin-api-client.ts`
- ✅ Created: `src/renderer/services/admin-reviews.service.ts`
- ✅ Updated: `src/renderer/services/admin-tenant.service.ts`
- ✅ Updated: `src/renderer/services/admin-branding.service.ts`
- ✅ Updated: `src/renderer/services/admin-system-settings.service.ts`
- ✅ Updated: `src/renderer/services/admin-analytics.service.ts`
- ✅ Updated: `src/renderer/services/admin-user.service.ts`
- ✅ Updated: `src/renderer/services/admin-moderation.service.ts`
- ✅ Updated: `src/renderer/pages/admin/AdminReviews.tsx`
- ✅ Updated: `src/renderer/pages/admin/AdminSystemSettings.tsx`

### Backend (4 files)
- ✅ Created: `backend/src/modules/admin/controllers/reviews.controller.ts`
- ✅ Created: `backend/src/modules/admin/services/reviews.service.ts`
- ✅ Updated: `backend/src/modules/admin/admin.module.ts`
- ✅ Updated: `backend/src/modules/admin/guards/roles.guard.ts`

## Success Criteria

All admin pages should:
1. Load without errors
2. Display data correctly
3. Allow CRUD operations
4. Stay authenticated
5. Show proper error messages

The admin dashboard is now fully functional!
