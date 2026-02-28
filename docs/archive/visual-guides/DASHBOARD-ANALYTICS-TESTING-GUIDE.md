# Dashboard Analytics - Testing Guide

## 🧪 Complete Testing Instructions

### Prerequisites

✅ Backend running on port 3000  
✅ Frontend running on port 5173  
✅ Database migration completed  
✅ User logged in with valid JWT token

---

## 📋 Test Plan

### Test 1: Profile View Tracking

**Objective**: Verify profile views are recorded

**Steps**:
1. Login to the platform
2. Navigate to any user profile (e.g., `/profile/user-id`)
3. Stay on the profile for 10+ seconds
4. Navigate away

**Expected Results**:
```sql
-- Check database
SELECT * FROM profile_views 
ORDER BY created_at DESC 
LIMIT 5;

-- Should show:
-- viewer_id: your user ID
-- profile_id: viewed user ID
-- source: 'profile_page'
-- view_duration: ~10 seconds
-- created_at: recent timestamp
```

**Browser Console**:
```
[AnalyticsService] Recording profile view
```

**Pass Criteria**: ✅ Record exists in database with correct data

---

### Test 2: Match Impression Tracking

**Objective**: Verify match displays are recorded

**Steps**:
1. Login to the platform
2. Navigate to Dashboard
3. Wait for matches to load
4. Check browser console

**Expected Results**:
```sql
-- Check database
SELECT * FROM match_impressions 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC 
LIMIT 10;

-- Should show:
-- 10 records (one per match displayed)
-- match_user_id: IDs of matched users
-- match_score: compatibility scores
-- position: 0-9
-- source: 'dashboard'
-- clicked: false (initially)
```

**Browser Console**:
```
[AnalyticsService] Recording match impressions
```

**Pass Criteria**: ✅ 10 records created with correct match data

---

### Test 3: Match Click Tracking

**Objective**: Verify match clicks are recorded

**Steps**:
1. On Dashboard, click "View Profile" on any match
2. Profile page should open
3. Check database

**Expected Results**:
```sql
-- Check database
SELECT * FROM match_impressions 
WHERE user_id = 'your-user-id'
  AND match_user_id = 'clicked-user-id'
ORDER BY created_at DESC 
LIMIT 1;

-- Should show:
-- clicked: true (updated from false)
```

```sql
-- Check analytics summary
SELECT * FROM user_analytics 
WHERE user_id = 'clicked-user-id';

-- Should show:
-- total_profile_clicks: incremented by 1
```

**Browser Console**:
```
[AnalyticsService] Recording match click
```

**Pass Criteria**: ✅ Impression marked as clicked, profile clicks incremented

---

### Test 4: Analytics Widget Display

**Objective**: Verify widget shows real data

**Steps**:
1. Navigate to Dashboard
2. Locate "Your Analytics" widget
3. Note the numbers displayed
4. Compare with database

**Expected Results**:
```sql
-- Get your analytics
SELECT * FROM user_analytics 
WHERE user_id = 'your-user-id';

-- Numbers should match widget display:
-- total_profile_views → Profile Views
-- total_match_impressions → Match Impressions
-- response_rate → Response Rate
```

**Widget Display**:
```
Your Analytics
├─ Profile Views: [number from DB]
├─ Match Impressions: [number from DB]
└─ Response Rate: [calculated %] [trend]
```

**Pass Criteria**: ✅ Widget numbers match database exactly

---

### Test 5: View Duration Tracking

**Objective**: Verify time spent on profile is recorded

**Steps**:
1. Visit a profile
2. Stay for exactly 30 seconds (use timer)
3. Navigate away
4. Check database

**Expected Results**:
```sql
-- Check view duration
SELECT view_duration FROM profile_views 
WHERE profile_id = 'viewed-user-id'
ORDER BY created_at DESC 
LIMIT 1;

-- Should show:
-- view_duration: ~30 (±2 seconds acceptable)
```

**Pass Criteria**: ✅ Duration recorded within 2 seconds of actual time

---

### Test 6: Multiple Impressions

**Objective**: Verify batch impression recording

**Steps**:
1. Navigate to Dashboard
2. Refresh page 3 times
3. Check database

**Expected Results**:
```sql
-- Count impressions for one match
SELECT COUNT(*) FROM match_impressions 
WHERE user_id = 'your-user-id'
  AND match_user_id = 'any-match-id';

-- Should show:
-- count: 3 (one per page load)
```

**Pass Criteria**: ✅ New impressions created on each page load

---

### Test 7: Analytics API Endpoint

**Objective**: Verify API returns correct data

**Steps**:
1. Get your JWT token from localStorage
2. Make API call:

```bash
curl http://localhost:3000/analytics/my-analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
{
  "profileViews": 47,
  "matchImpressions": 156,
  "profileClicks": 23,
  "connectionsSent": 5,
  "connectionsReceived": 8,
  "messagesSent": 12,
  "messagesReceived": 15,
  "responseRate": 73.5,
  "trend": "up"
}
```

**Pass Criteria**: ✅ API returns valid JSON with all fields

---

### Test 8: Response Rate Calculation

**Objective**: Verify response rate is calculated correctly

**Steps**:
1. Check your analytics in database:

```sql
SELECT 
  total_connections_sent,
  total_connections_received,
  total_messages_sent,
  total_messages_received
FROM user_analytics 
WHERE user_id = 'your-user-id';
```

2. Calculate manually:
```
sent = connections_sent + messages_sent
received = connections_received + messages_received
rate = (sent / received) * 100
```

3. Compare with API response

**Expected Results**:
- Manual calculation matches API response
- Trend indicator correct:
  - rate >= 70: "up"
  - rate >= 50: "stable"
  - rate < 50: "down"

**Pass Criteria**: ✅ Calculation matches, trend correct

---

### Test 9: Source Attribution

**Objective**: Verify source tracking works

**Steps**:
1. View profile from Dashboard → source: 'dashboard'
2. View profile from Matches page → source: 'matches_page'
3. View profile from Search → source: 'search'
4. Check database

**Expected Results**:
```sql
SELECT source, COUNT(*) 
FROM profile_views 
WHERE viewer_id = 'your-user-id'
GROUP BY source;

-- Should show different sources
```

**Pass Criteria**: ✅ Different sources recorded correctly

---

### Test 10: Performance Test

**Objective**: Verify tracking doesn't slow down UI

**Steps**:
1. Open browser DevTools → Network tab
2. Navigate to Dashboard
3. Measure page load time
4. Check analytics API calls

**Expected Results**:
- Page loads in < 2 seconds
- Analytics calls are async (don't block)
- No errors in console
- UI remains responsive

**Pass Criteria**: ✅ No performance degradation

---

## 🔍 Database Verification Queries

### Check All Analytics Data

```sql
-- Profile views summary
SELECT 
  COUNT(*) as total_views,
  COUNT(DISTINCT profile_id) as unique_profiles,
  COUNT(DISTINCT viewer_id) as unique_viewers,
  AVG(view_duration) as avg_duration
FROM profile_views;

-- Match impressions summary
SELECT 
  COUNT(*) as total_impressions,
  COUNT(DISTINCT match_user_id) as unique_matches,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as total_clicks,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as ctr
FROM match_impressions;

-- User analytics summary
SELECT 
  COUNT(*) as total_users,
  SUM(total_profile_views) as all_views,
  SUM(total_match_impressions) as all_impressions,
  AVG(response_rate) as avg_response_rate
FROM user_analytics;
```

### Check Specific User

```sql
-- Get all analytics for a user
SELECT 
  'Profile Views' as metric,
  COUNT(*) as count
FROM profile_views 
WHERE profile_id = 'USER_ID'

UNION ALL

SELECT 
  'Match Impressions' as metric,
  COUNT(*) as count
FROM match_impressions 
WHERE match_user_id = 'USER_ID'

UNION ALL

SELECT 
  'Profile Clicks' as metric,
  total_profile_clicks as count
FROM user_analytics 
WHERE user_id = 'USER_ID';
```

---

## 🐛 Troubleshooting

### Issue: No data in database

**Check**:
1. Migration ran successfully
2. Backend logs for errors
3. JWT token is valid
4. API calls are being made

**Fix**:
```bash
# Re-run migration
cd backend
npm run migration:run

# Check tables exist
npm run typeorm query "SELECT * FROM profile_views LIMIT 1"
```

---

### Issue: Widget shows 0 for everything

**Check**:
1. Database has data
2. API endpoint returns data
3. Frontend is making API call
4. No CORS errors

**Fix**:
```bash
# Test API directly
curl http://localhost:3000/analytics/my-analytics \
  -H "Authorization: Bearer TOKEN"
```

---

### Issue: Numbers don't update

**Check**:
1. Page is refreshed
2. API call succeeds
3. Database has new records
4. Cache is cleared

**Fix**:
- Hard refresh (Ctrl+Shift+R)
- Clear localStorage
- Check Network tab for 304 responses

---

### Issue: TypeScript errors

**Check**:
```bash
# Check for errors
npm run build

# Fix if needed
npm run lint --fix
```

---

## ✅ Test Results Template

```
Dashboard Analytics Testing - [Date]

Test 1: Profile View Tracking        [ ] Pass [ ] Fail
Test 2: Match Impression Tracking    [ ] Pass [ ] Fail
Test 3: Match Click Tracking         [ ] Pass [ ] Fail
Test 4: Analytics Widget Display     [ ] Pass [ ] Fail
Test 5: View Duration Tracking       [ ] Pass [ ] Fail
Test 6: Multiple Impressions         [ ] Pass [ ] Fail
Test 7: Analytics API Endpoint       [ ] Pass [ ] Fail
Test 8: Response Rate Calculation    [ ] Pass [ ] Fail
Test 9: Source Attribution           [ ] Pass [ ] Fail
Test 10: Performance Test            [ ] Pass [ ] Fail

Overall Status: [ ] All Pass [ ] Some Fail

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🎯 Success Criteria

All tests must pass:
- ✅ Data recorded in database
- ✅ API endpoints functional
- ✅ Widget displays correctly
- ✅ No console errors
- ✅ No performance issues
- ✅ Calculations accurate

---

## 📊 Expected Test Data

After running all tests, you should have:

```
profile_views:        ~10 records
match_impressions:    ~30 records (3 page loads × 10 matches)
user_analytics:       1 record per user
```

---

**Ready to test!** Follow each test in order and mark results.

