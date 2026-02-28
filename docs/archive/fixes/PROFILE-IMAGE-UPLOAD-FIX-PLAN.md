# Profile Image Upload - Investigation & Fix Plan

## Date: February 14, 2026

## Investigation Summary

### ✅ What's Already Working

1. **Backend Infrastructure**:
   - ✅ Media controller exists with proper file upload handling
   - ✅ Multer configured with diskStorage
   - ✅ File validation (JPEG, PNG, WEBP, GIF)
   - ✅ Size limit: 10MB
   - ✅ Uploads directory exists
   - ✅ Static file serving configured in main.ts
   - ✅ JWT authentication guard in place

2. **Frontend Components**:
   - ✅ AvatarUpload component exists
   - ✅ File validation (JPEG, PNG, WEBP, max 5MB)
   - ✅ Preview functionality
   - ✅ Progress tracking
   - ✅ Error handling

3. **Database**:
   - ✅ media_files table exists
   - ✅ users.avatarUrl column exists
   - ✅ influencer_profiles.avatarUrl column exists
   - ✅ company_profiles.avatarUrl column exists

### ⚠️ Potential Issues Identified

#### Issue 1: Avatar URL Sync Inconsistency
**Problem**: When avatar is uploaded, it needs to be synced across 3 tables:
- `users.avatarUrl`
- `influencer_profiles.avatarUrl` OR `company_profiles.avatarUrl`
- `media_files.fileUrl`

**Current Flow**:
1. User uploads image → `media_files` table gets record
2. Frontend gets `mediaFile.fileUrl` (e.g., `/uploads/file-123.jpg`)
3. Frontend calls `/auth/profile` with `avatarUrl: "/uploads/file-123.jpg"`
4. Backend updates profile table
5. ✅ Backend has `syncAvatarUrl()` helper method (GOOD!)

**Status**: ✅ Sync method exists but needs verification

#### Issue 2: File Path Inconsistency
**Problem**: Different path formats being used:
- Media service returns: `/uploads/filename.jpg`
- Frontend expects: Full URL or relative path
- Static serving: `/uploads/` prefix

**Current Behavior**:
```typescript
// Backend returns
fileUrl: `/uploads/${file.filename}`

// Frontend getMediaUrl() handles
if (fileUrl.startsWith('http')) return fileUrl;
if (fileUrl.startsWith('/')) return `${API_URL}${fileUrl}`;
```

**Status**: ✅ Should work but needs testing

#### Issue 3: Token Management
**Problem**: Media service needs auth token
```typescript
// Frontend media service
if (!this.token) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  this.token = token;
}
```

**Status**: ⚠️ Token might not be set initially

#### Issue 4: CORS Configuration
**Problem**: File uploads might be blocked by CORS
```typescript
// Current CORS config
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
```

**Status**: ✅ Should work but needs verification

#### Issue 5: Upload Directory Permissions
**Problem**: Backend might not have write permissions to uploads directory

**Status**: ⚠️ Needs verification

#### Issue 6: Profile Update Flow
**Problem**: After upload, profile needs to be updated and refreshed

**Current Flow**:
1. Upload completes → `onUploadComplete(mediaFile)`
2. Sets `profileData.avatarUrl = mediaFile.fileUrl`
3. User clicks "Save Changes"
4. Calls `/auth/profile` with updated data
5. Calls `refreshProfile()` to reload user data

**Status**: ✅ Flow looks correct but needs testing

## Root Cause Analysis

Based on code review, the most likely issues are:

### 1. Token Not Set in Media Service (HIGH PRIORITY)
The media service might not have the auth token when upload is attempted.

### 2. File Path Resolution (MEDIUM PRIORITY)
The path returned from backend might not match what frontend expects.

### 3. Profile Refresh Timing (MEDIUM PRIORITY)
Profile might not refresh immediately after save, causing avatar not to appear.

### 4. Upload Directory Permissions (LOW PRIORITY)
Backend might not be able to write to uploads directory.

## Fix Plan

### Phase 1: Token Management Fix (IMMEDIATE)

**Problem**: Media service token might not be initialized

**Solution**:
```typescript
// In AuthContext.tsx - after login/register
import { mediaService } from '../services/media.service';

const login = async (email: string, password: string) => {
  const response = await authService.login(email, password);
  localStorage.setItem('auth_token', response.token);
  
  // ✅ Set token in media service
  mediaService.setToken(response.token);
  
  setUser(response.user);
  setIsAuthenticated(true);
};
```

**Files to Modify**:
1. `src/renderer/contexts/AuthContext.tsx` - Add mediaService.setToken() calls
2. `src/renderer/services/media.service.ts` - Ensure token is always checked

### Phase 2: Avatar URL Sync Verification (IMMEDIATE)

**Problem**: Need to ensure avatar URL is synced across all tables

**Solution**: Verify the `syncAvatarUrl()` method is called correctly

**Files to Check**:
1. `backend/src/modules/auth/auth.service.ts` - syncAvatarUrl() method
2. Ensure it's called in updateProfile()

### Phase 3: File Path Consistency (HIGH PRIORITY)

**Problem**: Ensure consistent file path handling

**Solution**:
```typescript
// Backend - media.service.ts
const mediaFile = this.mediaRepository.create({
  userId,
  fileType,
  fileUrl: `/uploads/${file.filename}`, // ✅ Consistent format
  fileSize: file.size,
  mimeType: file.mimetype,
});
```

**Files to Verify**:
1. `backend/src/modules/media/media.service.ts`
2. `src/renderer/services/media.service.ts` - getMediaUrl()

### Phase 4: Upload Directory Setup (HIGH PRIORITY)

**Problem**: Ensure uploads directory exists and is writable

**Solution**:
```bash
# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

# Set permissions (Linux/Mac)
chmod 755 backend/uploads

# Add .gitkeep to track directory
touch backend/uploads/.gitkeep
```

**Files to Create**:
1. `backend/uploads/.gitkeep`
2. Update `.gitignore` to ignore uploads/* but keep .gitkeep

### Phase 5: Error Logging Enhancement (MEDIUM PRIORITY)

**Problem**: Need better error messages to debug issues

**Solution**: Add comprehensive logging at each step

**Files to Modify**:
1. `backend/src/modules/media/media.controller.ts` - Add detailed logs
2. `backend/src/modules/media/media.service.ts` - Add detailed logs
3. `src/renderer/components/AvatarUpload/AvatarUpload.tsx` - Add detailed logs
4. `src/renderer/services/media.service.ts` - Add detailed logs

### Phase 6: Profile Refresh Fix (MEDIUM PRIORITY)

**Problem**: Profile might not refresh immediately after save

**Solution**:
```typescript
// In ProfileEdit.tsx
const handleSave = async () => {
  // ... save logic ...
  
  // ✅ Force refresh profile
  await refreshProfile();
  
  // ✅ Show success message
  showToast('Profile updated successfully! 🎉', 'success');
  
  // ✅ Navigate after refresh completes
  navigate('/profile');
};
```

**Files to Verify**:
1. `src/renderer/pages/ProfileEdit.tsx`
2. `src/renderer/contexts/AuthContext.tsx` - refreshProfile()

### Phase 7: Testing & Verification (HIGH PRIORITY)

**Test Cases**:
1. ✅ Upload JPEG image
2. ✅ Upload PNG image
3. ✅ Upload WEBP image
4. ✅ Try to upload invalid file type (should fail)
5. ✅ Try to upload file > 5MB (should fail)
6. ✅ Verify image appears in preview
7. ✅ Save profile and verify avatar persists
8. ✅ Refresh page and verify avatar still shows
9. ✅ Check database - verify all 3 tables have avatarUrl
10. ✅ Check uploads directory - verify file exists

## Implementation Steps

### Step 1: Fix Token Management ✅
```typescript
// File: src/renderer/contexts/AuthContext.tsx

import { mediaService } from '../services/media.service';

// In login function
const login = async (email: string, password: string) => {
  const response = await authService.login(email, password);
  localStorage.setItem('auth_token', response.token);
  mediaService.setToken(response.token); // ✅ ADD THIS
  setUser(response.user);
  setIsAuthenticated(true);
};

// In register function
const register = async (data: RegisterData) => {
  const response = await authService.register(data);
  localStorage.setItem('auth_token', response.token);
  mediaService.setToken(response.token); // ✅ ADD THIS
  setUser(response.user);
  setIsAuthenticated(true);
};

// In useEffect (on mount)
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    mediaService.setToken(token); // ✅ ADD THIS
    // ... rest of code
  }
}, []);
```

### Step 2: Create .gitkeep for Uploads Directory ✅
```bash
cd backend/uploads
touch .gitkeep
```

### Step 3: Update .gitignore ✅
```
# File: backend/.gitignore

# Uploads directory - keep structure but ignore files
uploads/*
!uploads/.gitkeep
```

### Step 4: Add Comprehensive Logging ✅

**Backend - media.controller.ts**:
```typescript
@Post('upload')
async uploadFile(...) {
  console.log('=== UPLOAD REQUEST START ===');
  console.log('User ID:', req.user?.sub);
  console.log('File:', file ? 'Present' : 'Missing');
  console.log('File Type:', fileType);
  
  if (!file) {
    console.error('ERROR: No file in request');
    throw new BadRequestException('No file uploaded');
  }
  
  console.log('File Details:', {
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    destination: file.destination,
  });
  
  const result = await this.mediaService.createMediaFile(...);
  
  console.log('Upload Success:', {
    id: result.id,
    fileUrl: result.fileUrl,
  });
  console.log('=== UPLOAD REQUEST END ===');
  
  return result;
}
```

### Step 5: Verify Avatar Sync Method ✅

The `syncAvatarUrl()` method already exists in auth.service.ts and is called correctly:

```typescript
// Already implemented ✅
private async syncAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  await this.userRepository.update(userId, { avatarUrl });
  await this.influencerProfileRepository.update({ userId }, { avatarUrl });
  await this.companyProfileRepository.update({ userId }, { avatarUrl });
}
```

### Step 6: Test Upload Flow ✅

**Manual Test Steps**:
1. Login to application
2. Go to Profile Edit page
3. Click on avatar upload area
4. Select an image file
5. Watch console for logs
6. Verify preview appears
7. Click "Save Changes"
8. Verify success message
9. Navigate to Profile page
10. Verify avatar appears
11. Refresh page
12. Verify avatar persists

**Database Verification**:
```sql
-- Check if avatar URL is in all tables
SELECT 
  u.id,
  u.email,
  u.role,
  u."avatarUrl" as user_avatar,
  CASE 
    WHEN u.role = 'INFLUENCER' THEN ip."avatarUrl"
    WHEN u.role = 'COMPANY' THEN cp."avatarUrl"
  END as profile_avatar
FROM users u
LEFT JOIN influencer_profiles ip ON ip."userId" = u.id
LEFT JOIN company_profiles cp ON cp."userId" = u.id
WHERE u.email = 'test@example.com';

-- Check media_files table
SELECT * FROM media_files 
WHERE "userId" = 'user-id-here' 
AND "fileType" = 'avatar'
ORDER BY "createdAt" DESC;
```

## Quick Fix Checklist

- [ ] Add mediaService.setToken() in AuthContext
- [ ] Create backend/uploads/.gitkeep
- [ ] Update backend/.gitignore
- [ ] Add comprehensive logging
- [ ] Test upload with JPEG
- [ ] Test upload with PNG
- [ ] Test upload with WEBP
- [ ] Test invalid file type
- [ ] Test file too large
- [ ] Verify database sync
- [ ] Verify file in uploads directory
- [ ] Test profile refresh
- [ ] Test page reload

## Expected Behavior After Fix

1. **Upload Flow**:
   - User clicks avatar area
   - File dialog opens
   - User selects image
   - Preview appears immediately
   - Progress bar shows upload progress
   - Success message appears
   - Avatar URL stored in profileData

2. **Save Flow**:
   - User clicks "Save Changes"
   - Profile update API called
   - Avatar URL synced to all 3 tables
   - Profile refreshed
   - Success message shown
   - Navigate to profile page
   - Avatar displays correctly

3. **Persistence**:
   - Page refresh shows avatar
   - Logout/login shows avatar
   - Avatar visible on all pages (header, profile, etc.)

## Files to Modify

### High Priority
1. ✅ `src/renderer/contexts/AuthContext.tsx` - Add token management
2. ✅ `backend/uploads/.gitkeep` - Create file
3. ✅ `backend/.gitignore` - Update ignore rules

### Medium Priority
4. ⚠️ `backend/src/modules/media/media.controller.ts` - Add logging
5. ⚠️ `backend/src/modules/media/media.service.ts` - Add logging
6. ⚠️ `src/renderer/components/AvatarUpload/AvatarUpload.tsx` - Add logging
7. ⚠️ `src/renderer/services/media.service.ts` - Add logging

### Low Priority (Already Good)
8. ✅ `backend/src/modules/auth/auth.service.ts` - syncAvatarUrl exists
9. ✅ `src/renderer/pages/ProfileEdit.tsx` - Flow looks correct
10. ✅ `backend/src/main.ts` - Static serving configured

## Success Criteria

✅ User can upload profile image
✅ Image preview appears immediately
✅ Progress bar shows during upload
✅ Image saves to uploads directory
✅ Database records created in media_files
✅ Avatar URL synced to all 3 tables
✅ Avatar appears on profile page
✅ Avatar persists after page refresh
✅ Avatar appears in header/navigation
✅ No console errors
✅ Proper error messages for invalid files

---

**Status**: Investigation Complete - Ready for Implementation
**Priority**: HIGH
**Estimated Time**: 1-2 hours
**Next Step**: Implement Phase 1 (Token Management)
