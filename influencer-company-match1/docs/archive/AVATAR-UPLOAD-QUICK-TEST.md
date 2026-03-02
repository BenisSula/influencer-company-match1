# Avatar Upload - Quick Test Guide

## Quick Start

### 1. Start Services
```bash
# Terminal 1 - Backend
cd influencer-company-match1/backend
npm run start:dev

# Terminal 2 - Frontend  
cd influencer-company-match1
npm run dev
```

### 2. Test Upload
1. Open http://localhost:5173
2. Login with: `john@example.com` / `password123`
3. Go to Profile → Edit Profile
4. Click avatar area
5. Select an image
6. Watch progress bar

### 3. Check Logs

**Browser Console (F12):**
```
[AvatarUpload] File selected: { name, size, type }
[MediaService] Starting upload...
[MediaService] Upload progress: 50%
[MediaService] Upload completed
[AvatarUpload] Upload successful
```

**Backend Terminal:**
```
[MediaController] Upload request received
[MediaController] File details: { filename, size }
[MediaService] Creating media file record
[MediaService] Media file saved
[MediaController] Upload successful
```

## Troubleshooting

### No logs appearing?
- Open browser DevTools (F12)
- Check Console tab
- Refresh page and try again

### Upload stuck at 0%?
- Check backend is running
- Verify token: `localStorage.getItem('auth_token')`
- Check network tab for errors

### "No authentication token" error?
- Login again
- Check if token exists in localStorage

### File not appearing?
- Check `backend/uploads/` directory
- Verify file permissions
- Check backend logs for errors

## Expected Behavior

✅ Progress bar: 0% → 100%
✅ Success toast appears
✅ Avatar updates immediately
✅ File in `backend/uploads/`
✅ Console shows success logs

## Test with Diagnostic Page

```bash
# Open in browser
start influencer-company-match1/test-avatar-upload.html
```

1. Test Connection → Should be ✅
2. Login → Should get token
3. Select file → Upload
4. Check preview appears

## Common File Requirements

- **Formats:** JPEG, PNG, WEBP
- **Max Size:** 5MB (frontend), 10MB (backend)
- **Recommended:** 500x500px or larger
- **Aspect Ratio:** Square works best

## Quick Fixes

### Clear cache and retry:
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Check backend health:
```bash
curl http://localhost:3000/api/auth/health
```

### Verify uploads directory:
```bash
cd influencer-company-match1/backend
dir uploads
```

## Success Indicators

1. ✅ Progress bar completes
2. ✅ Green success toast
3. ✅ Avatar preview updates
4. ✅ Console logs show success
5. ✅ File exists in uploads folder

If all 5 indicators pass, upload is working correctly!
