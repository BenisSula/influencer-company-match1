# Admin Dashboard Loading Fixes - Implementation Plan

## Fix 1: Create Unified Admin API Client

**Problem**: `apiClient` uses regular user token, admin services need admin token

**Solution**: Create dedicated `adminApiClient` that:
- Uses `adminToken` from localStorage
- Has correct base URL with `/api` prefix
- Handles admin-specific 401 errors
- Redirects to `/admin/login` on auth failure

**Files to Create**:
- `src/renderer/services/admin-api-client.ts`

## Fix 2: Update Admin Tenant Service

**Problem**: Uses `apiClient` which has wrong token

**Solution**: Switch to `adminApiClient`

**Files to Update**:
- `src/renderer/services/admin-tenant.service.ts`

## Fix 3: Fix Admin Branding Service

**Problem**: Wrong base URL (missing `/api` prefix)

**Solution**: 
- Change `API_URL` from `http://localhost:3000/admin/customization` 
- To: `http://localhost:3000/api/admin/customization`
- Or better: use `adminApiClient`

**Files to Update**:
- `src/renderer/services/admin-branding.service.ts`

## Fix 4: Fix Admin System Settings Service

**Problem**: Correct URL but manual axios calls, inconsistent with other services

**Solution**: Switch to `adminApiClient` for consistency

**Files to Update**:
- `src/renderer/services/admin-system-settings.service.ts`

## Fix 5: Create Admin Reviews Service & Backend

**Problem**: No admin reviews endpoint, using wrong port and endpoint

**Solution**: 
- Create backend admin reviews controller
- Create frontend admin reviews service
- Update AdminReviews page to use new service

**Files to Create**:
- `backend/src/modules/admin/controllers/reviews.controller.ts`
- `backend/src/modules/admin/services/reviews.service.ts`
- `src/renderer/services/admin-reviews.service.ts`

**Files to Update**:
- `backend/src/modules/admin/admin.module.ts`
- `src/renderer/pages/admin/AdminReviews.tsx`

## Fix 6: Fix Settings Page Logout Behavior

**Problem**: 401 error navigates to login but doesn't clear token

**Solution**: 
- Use `adminApiClient` which handles logout properly
- Add proper error handling
- Clear admin token before navigation

**Files to Update**:
- `src/renderer/pages/admin/AdminSystemSettings.tsx`

## Implementation Order

1. Create `adminApiClient` (foundation)
2. Update all admin services to use `adminApiClient`
3. Create admin reviews backend
4. Update AdminReviews page
5. Test all pages

## Expected Results

After fixes:
- ✅ Tenants page loads with proper admin token
- ✅ Branding page loads settings correctly
- ✅ Feature flags page works
- ✅ Reviews page displays data
- ✅ Settings page doesn't log you out
- ✅ All admin pages use consistent authentication
- ✅ Better error messages for debugging
