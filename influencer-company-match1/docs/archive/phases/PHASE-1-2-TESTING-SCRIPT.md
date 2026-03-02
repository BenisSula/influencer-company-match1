# Phase 1 & 2 Testing Script

## 🧪 Comprehensive Testing Guide

This document provides step-by-step testing instructions for both Phase 1 (Campaign Disable) and Phase 2 (Collaboration Requests).

---

## 📋 Pre-Testing Checklist

### 1. Database Migration

```bash
cd backend
npm run migration:run
```

**Expected Output**:
- Migration `1707587000000-AddCollaborationDataToConnections` should run successfully
- New columns added to `connections` table

### 2. Start Backend

```bash
cd backend
npm run start:dev
```

**Expected Output**:
- Server starts on port 3000
- No compilation errors
- All modules loaded successfully

### 3. Start Frontend

```bash
# In root directory
npm run dev
```

**Expected Output**:
- Frontend starts on port 5173 (or configured port)
- No compilation errors
- Application loads in browser

---

## 🧪 Phase 1 Testing: Campaign System Disabled

### Test 1.1: Navigation - Campaigns Link Hidden ✅

**Steps**:
1. Log into the application
2. Look at the left sidebar navigation

**Expected Result**:
- ✅ "Campaigns" link should NOT be visible
- ✅ Other links visible: Dashboard, Feed, Matches, Profile, Messages, Settings

**Status**: [ ] Pass [ ] Fail

---

### Test 1.2: Direct URL Access - Disabled Page ✅

**Steps**:
1. Navigate to: `http://localhost:5173/#/campaigns`
2. Observe the page

**Expected Result**:
- ✅ Shows "Campaigns Temporarily Unavailable" page
- ✅ Blue animated info icon visible
- ✅ Clear explanation message
- ✅ Info box about platform transformation
- ✅ "Go Back" button present
- ✅ "Discover Matches" button present

**Actions to Test**:
- Click "Go Back" → Should navigate to previous page
- Click "Discover Matches" → Should navigate to `/matches`

**Status**: [ ] Pass [ ] Fail

---

### Test 1.3: Campaign Routes Protected ✅

**Test all campaign routes**:

1. `http://localhost:5173/#/campaigns`
2. `http://localhost:5173/#/campaigns/create`
3. `http://localhost:5173/#/campaigns/123`

**Expected Result**:
- ✅ All show disabled feature page
- ✅ No errors in console
- ✅ Consistent UI across all routes

**Status**: [ ] Pass [ ] Fail

---

### Test 1.4: Search Integration ✅

**Steps**:
1. Click on search bar in header
2. Observe placeholder text

**Expected Result**:
- ✅ Placeholder says "Search users, posts..." (no "campaigns")
- ✅ Search functionality works normally

**Status**: [ ] Pass [ ] Fail

---

### Test 1.5: Backend API Protection ✅

**Using Browser Console or Postman**:

```javascript
// In browser console
fetch('http://localhost:3000/campaigns', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Result**:
- ✅ Returns 503 Service Unavailable
- ✅ Error message: "This feature is temporarily unavailable"

**Status**: [ ] Pass [ ] Fail

---

### Test 1.6: Responsive Design ✅

**Test disabled page on different screen sizes**:

1. **Desktop** (> 1024px):
   - ✅ Centered layout
   - ✅ Buttons side-by-side
   - ✅ Icon appropriate size

2. **Tablet** (768px):
   - ✅ Layout adjusts
   - ✅ Still readable

3. **Mobile** (< 480px):
   - ✅ Buttons stack vertically
   - ✅ Full-width buttons
   - ✅ Icon scales down
   - ✅ Text readable

**Status**: [ ] Pass [ ] Fail

---

## 🤝 Phase 2 Testing: Collaboration Requests

### Test 2.1: MatchCard Button Update ✅

**Steps**:
1. Navigate to Matches page (`/matches`)
2. Look at match cards

**Expected Result**:
- ✅ Button says "Request Collaboration" (not "Connect")
- ✅ Button has primary styling
- ✅ Profile button still present

**Status**: [ ] Pass [ ] Fail

---

### Test 2.2: Collaboration Request Modal Opens ✅

**Steps**:
1. On Matches page
2. Click "Request Collaboration" button on any match

**Expected Result**:
- ✅ Modal opens with smooth animation
- ✅ Title: "Request Collaboration"
- ✅ Subtitle: "with [Name]"
- ✅ Close button (X) visible
- ✅ Form fields visible

**Status**: [ ] Pass [ ] Fail

---

### Test 2.3: Modal Form Fields ✅

**Verify all form fields are present**:

1. ✅ Message textarea (required) - with icon
2. ✅ Budget Min input (optional)
3. ✅ Budget Max input (optional)
4. ✅ Timeline dropdown
5. ✅ Collaboration Type dropdown
6. ✅ Platform checkboxes (Instagram, TikTok, YouTube, Twitter, Facebook)
7. ✅ Deliverables input (optional)
8. ✅ Start Date picker (optional)
9. ✅ Additional Notes textarea (optional)
10. ✅ Cancel button
11. ✅ Send Request button

**Status**: [ ] Pass [ ] Fail

---

### Test 2.4: Form Validation ✅

**Test 1: Submit without message**:
1. Click "Send Request" without filling message
2. **Expected**: Error toast "Please add a message"

**Test 2: Submit with message only**:
1. Fill only message field
2. Click "Send Request"
3. **Expected**: Request sends successfully

**Status**: [ ] Pass [ ] Fail

---

### Test 2.5: Form Submission Success ✅

**Steps**:
1. Fill out form:
   - Message: "I'd love to collaborate with you!"
   - Budget: 500 - 1000
   - Timeline: 1-3 months
   - Type: One-Time Project
   - Platforms: Check Instagram, TikTok
   - Deliverables: "3 Instagram posts, 2 TikTok videos"
2. Click "Send Request"

**Expected Result**:
- ✅ Loading state shows ("Sending...")
- ✅ Success toast appears
- ✅ Modal closes
- ✅ No console errors

**Status**: [ ] Pass [ ] Fail

---

### Test 2.6: Backend API - Create Request ✅

**Check in browser console or network tab**:

**Expected API Call**:
```
POST http://localhost:3000/collaboration-requests
```

**Expected Payload**:
```json
{
  "recipientId": "user-id",
  "message": "I'd love to collaborate with you!",
  "budgetMin": 500,
  "budgetMax": 1000,
  "timeline": "1-3 months",
  "collaborationType": "one-time",
  "platforms": ["Instagram", "TikTok"],
  "deliverables": ["3 Instagram posts", "2 TikTok videos"]
}
```

**Expected Response**:
- ✅ Status 201 Created
- ✅ Returns connection object with collaboration data

**Status**: [ ] Pass [ ] Fail

---

### Test 2.7: Database Verification ✅

**Check database directly**:

```sql
SELECT 
  id, 
  requester_id, 
  recipient_id, 
  collaboration_status,
  collaboration_type,
  collaboration_request_data
FROM connections
WHERE collaboration_status = 'requested'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result**:
- ✅ New row exists
- ✅ `collaboration_status` = 'requested'
- ✅ `collaboration_type` = 'one-time'
- ✅ `collaboration_request_data` contains JSON with all fields

**Status**: [ ] Pass [ ] Fail

---

### Test 2.8: Modal Responsive Design ✅

**Test on different screen sizes**:

1. **Desktop** (> 768px):
   - ✅ Modal centered
   - ✅ Max-width 600px
   - ✅ Budget inputs side-by-side
   - ✅ Buttons side-by-side

2. **Mobile** (< 768px):
   - ✅ Modal 95% width
   - ✅ Budget inputs stack
   - ✅ Buttons stack (full width)
   - ✅ Platform checkboxes stack

**Status**: [ ] Pass [ ] Fail

---

### Test 2.9: Modal Close Behaviors ✅

**Test all ways to close modal**:

1. Click X button → ✅ Modal closes
2. Click Cancel button → ✅ Modal closes
3. Click outside modal (overlay) → ✅ Modal closes
4. Press Escape key → ✅ Modal closes (if implemented)

**Status**: [ ] Pass [ ] Fail

---

### Test 2.10: Multiple Requests ✅

**Steps**:
1. Send collaboration request to User A
2. Navigate to another match (User B)
3. Send collaboration request to User B

**Expected Result**:
- ✅ Both requests send successfully
- ✅ No conflicts
- ✅ Each request has unique data

**Status**: [ ] Pass [ ] Fail

---

## 🔄 Integration Tests

### Test 3.1: Phase 1 + Phase 2 Together ✅

**Verify both phases work together**:

1. ✅ Campaigns are disabled
2. ✅ Collaboration requests work
3. ✅ No conflicts between features
4. ✅ No console errors
5. ✅ All other features work normally

**Status**: [ ] Pass [ ] Fail

---

### Test 3.2: Existing Features Unaffected ✅

**Test that existing features still work**:

1. ✅ Dashboard loads
2. ✅ Feed works
3. ✅ Matches page works
4. ✅ Messaging works
5. ✅ Profile pages work
6. ✅ Settings work

**Status**: [ ] Pass [ ] Fail

---

## 🐛 Error Handling Tests

### Test 4.1: Network Error ✅

**Steps**:
1. Stop backend server
2. Try to send collaboration request

**Expected Result**:
- ✅ Error toast appears
- ✅ Modal stays open
- ✅ User can retry

**Status**: [ ] Pass [ ] Fail

---

### Test 4.2: Invalid Data ✅

**Steps**:
1. Fill form with invalid data (e.g., budget min > budget max)
2. Submit

**Expected Result**:
- ✅ Validation error shown
- ✅ Form doesn't submit

**Status**: [ ] Pass [ ] Fail

---

## 📊 Test Results Summary

### Phase 1: Campaign Disable
- [ ] All navigation tests passed
- [ ] All route protection tests passed
- [ ] Backend API protection works
- [ ] Responsive design works
- [ ] No breaking changes

### Phase 2: Collaboration Requests
- [ ] Modal opens correctly
- [ ] Form fields work
- [ ] Validation works
- [ ] Submission succeeds
- [ ] Backend API works
- [ ] Database updates correctly
- [ ] Responsive design works

### Integration
- [ ] Both phases work together
- [ ] No conflicts
- [ ] Existing features unaffected

---

## 🚨 Issues Found

### Critical Issues:
- [ ] None

### Minor Issues:
- [ ] None

### Notes:
```
[Add any notes here]
```

---

## ✅ Sign-off

**Tested By**: _________________  
**Date**: _________________  
**Overall Result**: [ ] ✅ Pass [ ] ❌ Fail  

**Ready for Production**: [ ] Yes [ ] No

---

## 📝 Next Steps

If all tests pass:
1. ✅ Phase 1 & 2 are production-ready
2. ✅ Can proceed to Phase 3 (Profile Enhancements)
3. ✅ Can deploy to staging/production

If tests fail:
1. Document issues in "Issues Found" section
2. Fix issues
3. Re-run tests
4. Update this document

---

**Document Version**: 1.0  
**Last Updated**: Current Session  
**Status**: Ready for Testing
