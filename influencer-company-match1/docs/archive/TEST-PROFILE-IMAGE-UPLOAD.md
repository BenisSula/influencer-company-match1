# Test Profile Image Upload - Quick Guide

## Prerequisites

✅ Backend running on http://localhost:3000
✅ Frontend running on http://localhost:5173
✅ Database setup complete
✅ Test user account available

## Test Steps

### 1. Login
```
Email: sarah.beauty@example.com
Password: password123
```

### 2. Navigate to Profile Edit
- Click on profile icon in header
- Click "Edit Profile" button
- OR navigate to http://localhost:5173/profile/edit

### 3. Upload Avatar

**Step 3.1**: Click on avatar upload area
- Should see file dialog open

**Step 3.2**: Select an image file
- Use JPEG, PNG, or WEBP format
- Keep file under 5MB

**Step 3.3**: Watch for preview
- Preview should appear immediately
- Progress bar should show upload progress
- Console should show upload logs

**Step 3.4**: Check for success
- Should see success toast message
- Preview should remain visible
- No console errors

### 4. Save Profile
- Click "Save Changes" button
- Wait for success message
- Should navigate to profile page

### 5. Verify Avatar
- Avatar should appear on profile page
- Avatar should appear in header
- Refresh page - avatar should persist

## Expected Console Logs

### Frontend (Browser Console)
```
[AvatarUpload] File selected: { name: "image.jpg", size: 123456, type: "image/jpeg" }
[AvatarUpload] Preview created
[AvatarUpload] Starting upload...
[MediaService] Starting upload: { fileName: "image.jpg", fileSize: 123456, fileType: "avatar" }
[MediaService] Sending upload request...
[MediaService] Upload progress: 25%
[MediaService] Upload progress: 50%
[MediaService] Upload progress: 75%
[MediaService] Upload progress: 100%
[MediaService] Upload completed: { status: 200, statusText: "OK" }
[MediaService] Upload successful: { id: "uuid", fileUrl: "/uploads/file-123.jpg" }
[AvatarUpload] Upload successful: { id: "uuid", fileUrl: "/uploads/file-123.jpg" }
```

### Backend (Terminal)
```
[MediaController] Upload request received: { hasFile: true, fileType: "avatar", userId: "uuid" }
[MediaController] File details: { filename: "file-123.jpg", size: 123456, mimetype: "image/jpeg" }
[MediaService] Creating media file record: { userId: "uuid", filename: "file-123.jpg", fileType: "avatar" }
[MediaService] Media file saved: { id: "uuid", fileUrl: "/uploads/file-123.jpg" }
[MediaController] Upload successful: { id: "uuid", fileUrl: "/uploads/file-123.jpg" }
```

## Verify Database

```sql
-- Check users table
SELECT id, email, "avatarUrl" 
FROM users 
WHERE email = 'sarah.beauty@example.com';

-- Check influencer_profiles table
SELECT "userId", name, "avatarUrl" 
FROM influencer_profiles 
WHERE "userId" = (SELECT id FROM users WHERE email = 'sarah.beauty@example.com');

-- Check media_files table
SELECT id, "userId", "fileType", "fileUrl", "createdAt"
FROM media_files 
WHERE "userId" = (SELECT id FROM users WHERE email = 'sarah.beauty@example.com')
AND "fileType" = 'avatar'
ORDER BY "createdAt" DESC;
```

**Expected Results**:
- All three tables should have the same avatarUrl
- media_files should have a record with fileType = 'avatar'

## Verify File System

```bash
# Check uploads directory
ls -la backend/uploads/

# Should see files like:
# file-1234567890-123456789.jpg
```

## Test Error Cases

### Test 1: Invalid File Type
1. Try to upload a .txt file
2. Should see error: "Please select a JPEG, PNG, or WEBP image"

### Test 2: File Too Large
1. Try to upload a file > 5MB
2. Should see error: "Image must be smaller than 5MB"

### Test 3: No File Selected
1. Click upload area
2. Cancel file dialog
3. Should not show any error

## Common Issues & Solutions

### Issue: "No authentication token found"
**Solution**: Logout and login again

### Issue: Upload progress stuck at 0%
**Solution**: Check backend is running and accessible

### Issue: 401 Unauthorized
**Solution**: Token expired - logout and login again

### Issue: Avatar doesn't appear after save
**Solution**: Check console for errors, verify database records

### Issue: 404 on avatar URL
**Solution**: Check file exists in backend/uploads/ directory

## Success Checklist

- [ ] File dialog opens when clicking avatar area
- [ ] Preview appears after selecting image
- [ ] Progress bar shows during upload
- [ ] Success message appears after upload
- [ ] Avatar updates in preview
- [ ] Save button works without errors
- [ ] Success message after save
- [ ] Avatar appears on profile page
- [ ] Avatar appears in header
- [ ] Avatar persists after page refresh
- [ ] Avatar persists after logout/login
- [ ] Database has correct avatarUrl in all tables
- [ ] File exists in backend/uploads/ directory
- [ ] No console errors

## Quick Test Script

```javascript
// Run in browser console after login

// 1. Check if token is set
console.log('Token:', localStorage.getItem('auth_token'));

// 2. Check if media service has token
// (This will be set automatically now)

// 3. Test upload (manual - use UI)
// Click avatar area, select image, watch console

// 4. Verify avatar URL
fetch('http://localhost:3000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(user => console.log('Avatar URL:', user.avatarUrl));
```

---

**Status**: Ready for Testing
**Estimated Time**: 5-10 minutes
**Priority**: HIGH
