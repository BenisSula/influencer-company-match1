# Admin Dashboard Loading Issues - Root Cause Investigation

## Critical Issues Identified

### Issue 1: Invalid Admin Token (Tenants Page)
**Root Cause**: `apiClient` uses regular user token (`auth_token`), not admin token (`adminToken`)

**Problem**:
- `admin-tenant.service.ts` uses `apiClient.get('/admin/tenants')`
- `apiClient` reads `localStorage.getItem('auth_token')` 
- Admin pages store token as `localStorage.getItem('adminToken')`
- Backend guard expects admin JWT with `isAdmin: true` flag

**Impact**: All admin pages using `apiClient` fail with "Invalid admin token"

### Issue 2: Failed to Load Branding Settings
**Root Cause**: Wrong API endpoint path

**Problem**:
- Frontend calls: `http://localhost:3000/admin/customization/branding`
- Backend route: `@Controller('admin/customization')` with `@Get('branding')`
- But `admin-branding.service.ts` uses hardcoded `API_URL = 'http://localhost:3000/admin/customization'`
- Should be: `http://localhost:3000/api/admin/customization/branding`

**Impact**: 404 Not Found - endpoint doesn't exist

### Issue 3: Failed to Load Feature Flags
**Root Cause**: Same as Issue 2 - wrong API endpoint path

**Problem**:
- Frontend calls: `http://localhost:3000/admin/customization/features`
- Should be: `http://localhost:3000/api/admin/customization/features`

**Impact**: 404 Not Found

### Issue 4: Failed to Fetch Reviews
**Root Cause**: Multiple issues

**Problems**:
1. Uses wrong port: `http://localhost:3001/profiles/reviews/all`
2. Should be: `http://localhost:3000/api/profiles/reviews/all`
3. Uses regular user token instead of admin token
4. No admin reviews endpoint exists in backend

**Impact**: Connection refused or 404

### Issue 5: Settings Page Logs You Out
**Root Cause**: 401 error triggers logout in apiClient

**Problem**:
- `admin-system-settings.service.ts` uses axios directly with admin token
- When API returns 401, the page navigates to `/admin/login`
- But the navigation logic in `AdminSystemSettings.tsx` is:
  ```typescript
  if (error.response?.status === 401) {
    navigate('/admin/login');
  }
  ```
- This doesn't clear the admin token, causing confusion

**Impact**: User appears logged out but token still exists

## API Endpoint Mismatches

### Current Frontend Calls vs Backend Routes

| Frontend Service | Frontend Endpoint | Backend Route | Status |
|-----------------|-------------------|---------------|---------|
| admin-tenant.service | `/admin/tenants` | `/api/admin/tenants` | ❌ Missing `/api` |
| admin-branding.service | `/admin/customization/*` | `/api/admin/customization/*` | ❌ Missing `/api` |
| admin-system-settings.service | `/api/admin/system-settings` | `/api/admin/system-settings` | ✅ Correct |
| admin-analytics.service | `/api/admin/analytics` | `/api/admin/analytics` | ✅ Correct |
| admin-user.service | `/api/admin/users` | `/api/admin/users` | ✅ Correct |
| AdminReviews | `/profiles/reviews/all` | No admin endpoint | ❌ Wrong endpoint |

## Token Management Issues

### Current State
1. Admin login stores: `localStorage.setItem('adminToken', token)`
2. `apiClient` reads: `localStorage.getItem('auth_token')`
3. `admin-branding.service` reads: `localStorage.getItem('adminToken')` ✅
4. `admin-system-settings.service` reads: `localStorage.getItem('adminToken')` ✅
5. `admin-tenant.service` uses `apiClient` which reads wrong token ❌

### Backend JWT Payload Structure
```typescript
{
  sub: adminUser.id,
  email: adminUser.email,
  role: adminUser.role,
  tenantId: adminUser.tenantId,
  isAdmin: true  // Critical flag
}
```

### Guard Validation
```typescript
// AdminAuthGuard checks:
if (!payload.isAdmin) {
  throw new UnauthorizedException('Admin access required');
}

// RolesGuard checks:
requiredRoles.some((role: string) => user?.role === role)
```

## Missing Backend Implementations

### 1. Admin Reviews Endpoint
- No controller for admin review management
- Reviews exist in profiles module but no admin access
- Need: `/api/admin/reviews` endpoint

### 2. Feature Flags Service
- Backend has feature flags in `PlatformConfig.features`
- But no dedicated feature flags controller
- Handled through branding controller (confusing)

## Fix Strategy

### Phase 1: Token Management (Critical)
1. Create unified admin API client
2. Ensure all admin services use `adminToken`
3. Fix logout behavior to clear admin token properly

### Phase 2: API Endpoint Corrections
1. Fix `admin-tenant.service.ts` to use correct base URL
2. Fix `admin-branding.service.ts` to use correct base URL
3. Create admin reviews service with correct endpoint

### Phase 3: Backend Enhancements
1. Add admin reviews controller
2. Improve error messages in guards
3. Add proper CORS handling for admin routes

### Phase 4: Settings Page Fix
1. Fix navigation on 401 to properly clear token
2. Add better error handling
3. Prevent auto-logout on legitimate errors

## Implementation Priority

1. **CRITICAL**: Fix token management in apiClient
2. **CRITICAL**: Fix API endpoint paths
3. **HIGH**: Create admin reviews endpoint
4. **HIGH**: Fix settings page logout behavior
5. **MEDIUM**: Improve error messages
6. **LOW**: Add request interceptors for better debugging
