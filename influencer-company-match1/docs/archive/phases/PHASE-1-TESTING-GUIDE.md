# Phase 1: Testing Guide

## Quick Start Testing

### 1. Start the Application

**Backend**:
```bash
cd backend
npm run start:dev
```

**Frontend**:
```bash
cd influencer-company-match1
npm run dev
```

### 2. Quick Visual Tests

**Test 1: Navigation (30 seconds)**
1. Log into the application
2. Look at the left sidebar
3. ✅ Verify "Campaigns" link is NOT visible
4. ✅ Verify other links (Dashboard, Feed, Matches, Profile, Messages, Settings) are visible

**Test 2: Direct URL Access (1 minute)**
1. In browser, navigate to: `http://localhost:5173/campaigns`
2. ✅ Should see disabled feature page with:
   - Blue info icon (animated)
   - "Campaigns Temporarily Unavailable" title
   - Explanation message
   - Info box about transformation
   - "Go Back" and "Discover Matches" buttons
3. Click "Discover Matches" button
4. ✅ Should navigate to `/matches` page

**Test 3: Search (30 seconds)**
1. Click on search bar in header
2. ✅ Placeholder should say "Search users, posts..." (no "campaigns")
3. Type any search query
4. ✅ Search should work normally

**Test 4: Mobile Responsive (1 minute)**
1. Open browser dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or mobile device
4. Navigate to `/campaigns`
5. ✅ Disabled page should look good on mobile
6. ✅ Buttons should stack vertically

### 3. Backend API Test (Optional)

**Using curl or Postman**:
```bash
# Should return 503 Service Unavailable
curl http://localhost:3000/campaigns
```

Expected response:
```json
{
  "statusCode": 503,
  "message": "This feature is temporarily unavailable. Please check back later."
}
```

---

## Detailed Testing Checklist

### Navigation Tests

- [ ] Campaigns link hidden in sidebar
- [ ] Dashboard link works
- [ ] Feed link works
- [ ] Matches link works
- [ ] Profile link works
- [ ] Messages link works
- [ ] Settings link works
- [ ] Mobile menu works (< 768px)

### Route Protection Tests

- [ ] `/campaigns` shows disabled page
- [ ] `/campaigns/create` shows disabled page
- [ ] `/campaigns/123` shows disabled page
- [ ] "Go Back" button works
- [ ] "Discover Matches" button navigates to `/matches`
- [ ] All other routes work normally

### Search Tests

- [ ] Search placeholder correct
- [ ] User search works
- [ ] Post search works
- [ ] No console errors

### Responsive Tests

**Desktop (> 1024px)**:
- [ ] Disabled page centered
- [ ] Buttons side-by-side
- [ ] Icon size appropriate
- [ ] Text readable

**Tablet (768px - 1024px)**:
- [ ] Layout adjusts properly
- [ ] Buttons still side-by-side
- [ ] Content fits screen

**Mobile (< 768px)**:
- [ ] Buttons stack vertically
- [ ] Full-width buttons
- [ ] Icon scales down
- [ ] Text sizes adjust
- [ ] Padding appropriate

### Accessibility Tests

- [ ] Tab through disabled page
- [ ] Focus visible on buttons
- [ ] Enter key activates buttons
- [ ] Screen reader announces content
- [ ] Color contrast sufficient

### Backend Tests

- [ ] GET `/campaigns` returns 503
- [ ] POST `/campaigns` returns 503
- [ ] GET `/campaigns/:id` returns 503
- [ ] Error message user-friendly
- [ ] Other endpoints work normally

---

## Expected Behavior Summary

### ✅ What Should Work

- All navigation except campaigns
- All pages except campaign pages
- Search functionality
- User profiles
- Feed
- Matches
- Messages
- Settings
- Dashboard

### ❌ What Should Be Disabled

- Campaigns navigation link
- `/campaigns` route (shows disabled page)
- `/campaigns/create` route (shows disabled page)
- `/campaigns/:id` route (shows disabled page)
- Campaign API endpoints (return 503)

---

## Troubleshooting

### Issue: Campaigns link still visible

**Solution**: 
1. Check `src/renderer/config/features.ts`
2. Verify `CAMPAIGNS_ENABLED: false`
3. Restart frontend dev server

### Issue: Direct URL shows error instead of disabled page

**Solution**:
1. Check browser console for errors
2. Verify all new files were created
3. Check `src/renderer/components/index.ts` has exports
4. Restart frontend dev server

### Issue: Backend returns 500 instead of 503

**Solution**:
1. Check `backend/.env` has `FEATURE_CAMPAIGNS=false`
2. Verify guard files were created
3. Restart backend server

### Issue: Disabled page looks broken

**Solution**:
1. Check `DisabledFeature.css` was created
2. Verify global.css variables exist
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

---

## Re-enabling Campaigns (For Testing)

### To Test Re-enable

1. **Frontend**: Change `CAMPAIGNS_ENABLED: true` in `features.ts`
2. **Backend**: Change `FEATURE_CAMPAIGNS=true` in `.env`
3. Restart both servers
4. ✅ Campaigns link should reappear
5. ✅ Campaign routes should work
6. ✅ Campaign API should work

### To Disable Again

1. Change both flags back to `false`
2. Restart both servers
3. ✅ Should be disabled again

---

## Performance Checks

- [ ] No console errors
- [ ] No console warnings
- [ ] Page loads quickly
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] No layout shifts

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

---

## Sign-off

**Tested By**: _________________  
**Date**: _________________  
**Result**: ☐ Pass ☐ Fail  
**Notes**: _________________

---

## Quick Commands Reference

```bash
# Start backend
cd backend && npm run start:dev

# Start frontend
npm run dev

# Check backend logs
# Look for "Feature flag guard" messages

# Test API
curl http://localhost:3000/campaigns

# Clear browser cache
Ctrl+Shift+Delete (Chrome)
Ctrl+Shift+R (Hard refresh)
```

---

**Testing Time**: ~10 minutes for quick tests  
**Full Testing**: ~30 minutes for comprehensive tests
