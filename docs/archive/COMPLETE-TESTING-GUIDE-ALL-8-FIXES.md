# Complete Testing Guide - All 8 Critical Fixes

## 📋 Overview

This guide provides step-by-step testing procedures for all 8 critical fixes completed in Phase 1.

**Testing Priority**:
- 🔴 **HIGH**: Fixes #3, #4 (code changes made)
- 🟡 **MEDIUM**: Fixes #5, #7, #8 (verification recommended)
- 🟢 **LOW**: Fixes #1, #2, #6 (already verified)

---

## 🚀 Pre-Testing Setup

### 1. Start All Services

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd influencer-company-match1
npm run dev

# Terminal 3: Database (if needed)
# Ensure PostgreSQL is running
```

### 2. Verify Services Running

```bash
# Check backend
curl http://localhost:3000/api/health

# Check frontend
# Open browser to http://localhost:5173
```

### 3. Login Credentials

Use these test accounts:
- **Influencer**: `sarah@example.com` / `password123`
- **Company**: `mike@techcorp.com` / `password123`

---

## 🔴 HIGH PRIORITY TESTS

### Fix #3: Match Response Structure

#### Backend Test
```bash
# Get matches
curl http://localhost:3000/api/matching/matches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | json_pp
```

**Expected Response**:
```json
[
  {
    "id": "match-id",
    "profile": {
      "id": "user-id",
      "name": "John Doe",
      "type": "influencer",
      "niche": "Fashion",
      "avatarUrl": "..."
    },
    "score": 85,
    "tier": "Excellent",
    "breakdown": {
      "nicheCompatibility": 90,
      "locationCompatibility": 80,
      "budgetAlignment": 85,
      "platformOverlap": 88,
      "audienceSizeMatch": 82,
      "engagementTierMatch": 87
    }
  }
]
```

#### Frontend Test
1. Login as company user
2. Navigate to `/matches`
3. **Verify**:
   - ✅ Match cards display
   - ✅ Profile names show correctly
   - ✅ Match scores display
   - ✅ Tier badges show (Perfect/Excellent/Good/Fair)
   - ✅ Score breakdown visible
   - ✅ No console errors

#### Screenshots to Capture
- [ ] Matches page with cards
- [ ] Match card with tier badge
- [ ] Score breakdown modal
- [ ] Console (no errors)

---

### Fix #4: Message Sender Structure

#### Backend Test
```bash
# Get messages
curl http://localhost:3000/api/messaging/conversations/CONV_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | json_pp
```

**Expected Response**:
```json
[
  {
    "id": "message-id",
    "content": "Hello!",
    "sender": {
      "id": "user-id",
      "name": "John Doe",
      "avatar": "..."
    },
    "createdAt": "2026-02-16T10:00:00Z"
  }
]
```

#### Frontend Test
1. Login as any user
2. Navigate to `/messages`
3. Open a conversation
4. **Verify**:
   - ✅ Conversation list shows sender names
   - ✅ Message thread displays names
   - ✅ No "undefined" values
   - ✅ Sender avatars display
   - ✅ New messages show sender info
   - ✅ No console errors

#### Test Scenarios
- [ ] View existing conversation
- [ ] Send new message
- [ ] Receive message (use 2 browsers)
- [ ] Check sender name displays

---

## 🟡 MEDIUM PRIORITY TESTS

### Fix #5: Collaboration Request Structure

#### Backend Test
```bash
# Create collaboration request
curl -X POST http://localhost:3000/api/matching/collaboration-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user-id",
    "message": "Let'\''s collaborate!",
    "budgetMin": 1000,
    "budgetMax": 5000,
    "timeline": "2 weeks",
    "platforms": ["Instagram", "TikTok"],
    "deliverables": ["3 posts", "2 stories"]
  }'
```

#### Frontend Test
1. Login as company user
2. Navigate to a match profile
3. Click "Request Collaboration"
4. Fill in the form
5. Submit request
6. **Verify**:
   - ✅ Modal opens correctly
   - ✅ All fields available
   - ✅ Form submits successfully
   - ✅ Request appears in sent requests
   - ✅ Recipient receives notification
   - ✅ No console errors

---

### Fix #7: Feed Post Author Structure

#### Backend Test
```bash
# Get feed posts
curl http://localhost:3000/api/feed/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | json_pp
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "post-id",
      "author": {
        "id": "user-id",
        "email": "user@example.com",
        "role": "INFLUENCER",
        "avatarUrl": "..."
      },
      "content": "Post content",
      "likeCount": 5,
      "commentCount": 2
    }
  ]
}
```

#### Frontend Test
1. Login as any user
2. Navigate to `/feed`
3. **Verify**:
   - ✅ Posts display
   - ✅ Author names show
   - ✅ Author avatars display
   - ✅ No "undefined" values
   - ✅ Can click author to view profile
   - ✅ No console errors

---

### Fix #8: Analytics Data Structure

#### Backend Test
```bash
# Get analytics
curl http://localhost:3000/api/analytics/my-analytics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | json_pp
```

**Expected Response**:
```json
{
  "profileViews": 150,
  "matchImpressions": 45,
  "profileClicks": 32,
  "connectionsSent": 12,
  "connectionsReceived": 8,
  "messagesSent": 25,
  "messagesReceived": 18,
  "responseRate": 75,
  "trend": "up"
}
```

#### Frontend Test
1. Login as any user
2. Navigate to `/dashboard`
3. **Verify**:
   - ✅ Analytics widgets display
   - ✅ All metrics show numbers
   - ✅ Trend indicators work
   - ✅ No "NaN" or "undefined"
   - ✅ Charts render correctly
   - ✅ No console errors

---

## 🟢 LOW PRIORITY TESTS

### Fix #1: Connection Status Enum

#### Quick Test
1. Login as any user
2. Navigate to a profile
3. Click "Connect"
4. **Verify**: Status changes correctly (pending → connected)

### Fix #2: Profile Name Field

#### Quick Test
1. Login as company user
2. Navigate to profile edit
3. **Verify**: Company name field displays and saves correctly

### Fix #6: Notification Type Enum

#### Quick Test
1. Login as any user
2. Check bell icon for notifications
3. Check Messages icon for message notifications
4. **Verify**: Both notification systems work independently

---

## 🧪 Integration Tests

### Complete User Flow Test

#### Scenario 1: Company Finding Influencer
1. Login as company
2. Browse matches
3. View influencer profile
4. Send collaboration request
5. Send message
6. Check analytics

**Verify**: All data displays correctly at each step

#### Scenario 2: Influencer Responding
1. Login as influencer
2. Check notifications
3. View collaboration request
4. Accept request
5. Reply to message
6. Check analytics

**Verify**: All interactions work smoothly

---

## 📊 Test Results Template

### Fix #3: Match Response Structure
- [ ] Backend returns correct structure
- [ ] Frontend displays matches
- [ ] Tier badges show
- [ ] Score breakdown works
- [ ] No console errors
- **Status**: ⬜ Pass / ⬜ Fail
- **Notes**: _______________

### Fix #4: Message Sender Structure
- [ ] Backend returns sender.name
- [ ] Frontend displays names
- [ ] Conversation list works
- [ ] Message thread works
- [ ] No undefined values
- **Status**: ⬜ Pass / ⬜ Fail
- **Notes**: _______________

### Fix #5: Collaboration Request
- [ ] Modal opens
- [ ] Form submits
- [ ] Request created
- [ ] Notification sent
- [ ] No errors
- **Status**: ⬜ Pass / ⬜ Fail
- **Notes**: _______________

### Fix #6: Notification Types
- [ ] Bell notifications work
- [ ] Message notifications work
- [ ] Systems independent
- [ ] No conflicts
- **Status**: ⬜ Pass / ⬜ Fail
- **Notes**: _______________

### Fix #7: Feed Post Author
- [ ] Posts display
- [ ] Author names show
- [ ] Avatars display
- [ ] Profile links work
- [ ] No errors
- **Status**: ⬜ Pass / ⬜ Fail
- **Notes**: _______________

### Fix #8: Analytics Data
- [ ] Widgets display
- [ ] Metrics show
- [ ] Trends work
- [ ] Charts render
- [ ] No errors
- **Status**: ⬜ Pass / ⬜ Fail
- **Notes**: _______________

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property 'name' of undefined"
**Solution**: Check that backend is returning the correct field name

### Issue: Match cards not displaying
**Solution**: Verify backend returns `profile` instead of `user`

### Issue: Tier badges missing
**Solution**: Check that backend calculates `tier` field

### Issue: Message sender shows "undefined"
**Solution**: Verify backend returns flat `sender` object with `name`

### Issue: Analytics widgets show "NaN"
**Solution**: Check that backend returns numeric values

---

## ✅ Test Completion Checklist

### Pre-Testing
- [ ] All services running
- [ ] Test accounts ready
- [ ] Browser dev tools open
- [ ] Network tab monitoring

### High Priority
- [ ] Fix #3 tested
- [ ] Fix #4 tested
- [ ] Screenshots captured
- [ ] Issues documented

### Medium Priority
- [ ] Fix #5 tested
- [ ] Fix #7 tested
- [ ] Fix #8 tested
- [ ] Results recorded

### Low Priority
- [ ] Fix #1 verified
- [ ] Fix #2 verified
- [ ] Fix #6 verified

### Integration
- [ ] Complete user flows tested
- [ ] Cross-feature verification
- [ ] Performance checked
- [ ] Final report created

---

## 📝 Test Report Template

```markdown
# Test Report - Phase 1 Critical Fixes

**Date**: _______________
**Tester**: _______________
**Environment**: Development

## Summary
- Total Tests: 8
- Passed: ___
- Failed: ___
- Blocked: ___

## Detailed Results
[Use test results template above]

## Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Fix: [Proposed solution]

## Recommendations
[Any suggestions for improvements]

## Sign-Off
- [ ] All critical tests passed
- [ ] Ready for integration testing
- [ ] Ready for production deployment
```

---

## 🎯 Success Criteria

### All Tests Pass When:
- ✅ No console errors
- ✅ All data displays correctly
- ✅ No "undefined" or "NaN" values
- ✅ User flows work smoothly
- ✅ Performance is acceptable

### Ready for Production When:
- ✅ All high priority tests pass
- ✅ Integration tests pass
- ✅ No critical issues found
- ✅ Performance benchmarks met

---

**Testing Duration**: 2-3 hours  
**Priority**: Complete high priority tests first  
**Next Step**: Integration testing after all tests pass

---

*Testing Guide Version 1.0*  
*Last Updated: February 16, 2026*
