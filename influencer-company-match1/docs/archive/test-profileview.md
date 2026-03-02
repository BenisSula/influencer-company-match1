# ProfileView Quick Test Guide

## Quick Start Testing

### 1. Start the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run start:dev

# Terminal 2 - Start Frontend
cd influencer-company-match1
npm run dev
```

### 2. Test Scenarios

#### Scenario A: View Another User's Profile
1. Open browser to `http://localhost:5173`
2. Log in with test account
3. Navigate to "Matches" page
4. Click "View Profile" on any match card
5. **Verify:**
   - ✅ Profile loads with user information
   - ✅ "Back" button appears at top
   - ✅ "Send Message" button appears at top
   - ✅ Avatar shows with user initial
   - ✅ Name and niche/industry display
   - ✅ Location shows (if available)
   - ✅ Stats display (audience/engagement or budget)
   - ✅ Platforms section shows (if available)
   - ✅ About section shows bio (if available)

#### Scenario B: Test Send Message
1. On a profile page, click "Send Message"
2. **Verify:**
   - ✅ Navigates to Messages page
   - ✅ Conversation opens with selected user
   - ✅ Can send messages

#### Scenario C: Test Back Button
1. On a profile page, click "Back"
2. **Verify:**
   - ✅ Returns to previous page (Matches)
   - ✅ Smooth navigation

#### Scenario D: Test Error Handling
1. Navigate to `/profile/invalid-user-id-12345`
2. **Verify:**
   - ✅ Shows error message
   - ✅ "Go Back" button appears
   - ✅ No app crash

#### Scenario E: Test Responsive Design
1. Open profile page
2. Resize browser window to mobile size (375px)
3. **Verify:**
   - ✅ Layout adapts to mobile
   - ✅ All content readable
   - ✅ Buttons accessible
   - ✅ No horizontal scroll

### 3. Check Browser Console
- ✅ No JavaScript errors
- ✅ API calls successful (200 status)
- ✅ No warning messages

### 4. Network Tab Verification
1. Open DevTools → Network tab
2. Load a profile
3. **Verify:**
   - ✅ GET request to `/api/profiles/user/{userId}`
   - ✅ Status: 200 OK
   - ✅ Response contains profile data
   - ✅ Authorization header present

## Expected Profile Data Structure

```json
{
  "id": "user-id-123",
  "name": "John Doe",
  "type": "influencer",
  "niche": "Fashion & Lifestyle",
  "location": "New York, NY",
  "audienceSize": 250000,
  "engagementRate": 4.5,
  "platforms": ["Instagram", "TikTok", "YouTube"],
  "bio": "Fashion influencer passionate about sustainable style...",
  "portfolioUrl": "https://example.com/portfolio",
  "website": "https://example.com"
}
```

## Common Issues & Solutions

### Issue: Profile doesn't load
**Solution:** 
- Check backend is running
- Verify user ID is valid
- Check authentication token in localStorage

### Issue: "Send Message" doesn't work
**Solution:**
- Verify Messages page is implemented
- Check messaging service is available
- Ensure user is authenticated

### Issue: Styling looks broken
**Solution:**
- Clear browser cache
- Rebuild frontend: `npm run build`
- Check CSS files are loaded

## Success Criteria

✅ All test scenarios pass  
✅ No console errors  
✅ API calls successful  
✅ Responsive design works  
✅ Navigation flows smoothly  
✅ Error handling graceful  

## Test Status

- [ ] Scenario A: View Profile
- [ ] Scenario B: Send Message
- [ ] Scenario C: Back Button
- [ ] Scenario D: Error Handling
- [ ] Scenario E: Responsive Design

**Date Tested:** _____________  
**Tested By:** _____________  
**Result:** _____________  
**Notes:** _____________
