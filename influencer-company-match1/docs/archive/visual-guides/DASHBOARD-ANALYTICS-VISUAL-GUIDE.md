# Dashboard Analytics - Visual Guide

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   View Profile      View Dashboard     Click Match
        │                  │                  │
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ProfileView  │  │  Dashboard   │  │  MatchCard   │
│   .tsx       │  │    .tsx      │  │    .tsx      │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ↓
                ┌──────────────────┐
                │ Analytics Service│
                │   (Frontend)     │
                └──────────────────┘
                           ↓
                    REST API Calls
                           ↓
                ┌──────────────────┐
                │ Analytics        │
                │  Controller      │
                └──────────────────┘
                           ↓
                ┌──────────────────┐
                │ Analytics        │
                │ Tracking Service │
                └──────────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│profile_views │  │match_        │  │user_         │
│              │  │impressions   │  │analytics     │
└──────────────┘  └──────────────┘  └──────────────┘
                           ↓
                    DATABASE TABLES
```

---

## 📊 Data Flow Diagrams

### Profile View Tracking

```
User visits profile (e.g., /profile/123)
    ↓
ProfileView.tsx useEffect hook triggers
    ↓
analyticsService.recordProfileView(
    profileId: "123",
    source: "profile_page"
)
    ↓
POST /analytics/profile-view
    ↓
AnalyticsController.recordProfileView()
    ↓
AnalyticsTrackingService.recordProfileView()
    ↓
┌─────────────────────────────────────┐
│ INSERT INTO profile_views           │
│ (viewer_id, profile_id, source)     │
│ VALUES ('user-1', '123', 'profile') │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ UPDATE user_analytics               │
│ SET total_profile_views = +1        │
│ WHERE user_id = '123'               │
└─────────────────────────────────────┘
    ↓
User leaves profile
    ↓
ProfileView.tsx cleanup function
    ↓
analyticsService.recordProfileView(
    profileId: "123",
    source: "profile_page",
    viewDuration: 45  // seconds
)
    ↓
UPDATE profile_views SET view_duration = 45
```

---

### Match Impression Tracking

```
Dashboard loads
    ↓
loadMatches() fetches matches from API
    ↓
Receives 10 matches with scores
    ↓
Dashboard.tsx maps matches to impressions:
[
  { matchUserId: "user-1", matchScore: 95, position: 0 },
  { matchUserId: "user-2", matchScore: 88, position: 1 },
  { matchUserId: "user-3", matchScore: 82, position: 2 },
  ...
]
    ↓
analyticsService.recordMatchImpressions(
    impressions,
    source: "dashboard"
)
    ↓
POST /analytics/match-impressions
    ↓
AnalyticsController.recordMatchImpressions()
    ↓
AnalyticsTrackingService.recordMatchImpressions()
    ↓
┌─────────────────────────────────────────────┐
│ BATCH INSERT INTO match_impressions         │
│ (user_id, match_user_id, match_score, ...) │
│ VALUES                                      │
│   ('current', 'user-1', 95, 0, 'dashboard'),│
│   ('current', 'user-2', 88, 1, 'dashboard'),│
│   ('current', 'user-3', 82, 2, 'dashboard') │
└─────────────────────────────────────────────┘
    ↓
For each match:
┌─────────────────────────────────────┐
│ UPDATE user_analytics               │
│ SET total_match_impressions = +1    │
│ WHERE user_id = 'user-X'            │
└─────────────────────────────────────┘
```

---

### Match Click Tracking

```
User clicks "View Profile" on MatchCard
    ↓
MatchCard.handleViewProfile() triggered
    ↓
analyticsService.recordMatchClick(
    matchUserId: "user-123"
)
    ↓
POST /analytics/match-click
    ↓
AnalyticsController.recordMatchClick()
    ↓
AnalyticsTrackingService.recordMatchClick()
    ↓
┌─────────────────────────────────────┐
│ UPDATE match_impressions            │
│ SET clicked = true                  │
│ WHERE user_id = 'current'           │
│   AND match_user_id = 'user-123'    │
│   AND clicked = false               │
│ ORDER BY created_at DESC            │
│ LIMIT 1                             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ UPDATE user_analytics               │
│ SET total_profile_clicks = +1       │
│ WHERE user_id = 'user-123'          │
└─────────────────────────────────────┘
    ↓
navigate(`/profile/${matchUserId}`)
```

---

### Analytics Display

```
Dashboard loads
    ↓
AnalyticsWidget component mounts
    ↓
useAnalytics() hook fetches data
    ↓
analyticsService.getMetrics()
    ↓
GET /analytics/my-analytics
    ↓
AnalyticsController.getMyAnalytics()
    ↓
AnalyticsTrackingService.getUserAnalytics()
    ↓
┌─────────────────────────────────────┐
│ SELECT * FROM user_analytics        │
│ WHERE user_id = 'current-user'      │
└─────────────────────────────────────┘
    ↓
AnalyticsTrackingService.calculateResponseRate()
    ↓
┌─────────────────────────────────────┐
│ Calculate:                          │
│ responseRate =                      │
│   (sent / received) * 100           │
│                                     │
│ trend =                             │
│   rate >= 70 ? 'up' :               │
│   rate >= 50 ? 'stable' : 'down'    │
└─────────────────────────────────────┘
    ↓
Return JSON:
{
  profileViews: 47,
  matchImpressions: 156,
  responseRate: 73.5,
  trend: "up"
}
    ↓
AnalyticsWidget displays:
┌─────────────────────────────┐
│      Your Analytics         │
├─────────────────────────────┤
│ Profile Views        47     │
│ Match Impressions    156    │
│ Response Rate        73.5% ↑│
└─────────────────────────────┘
```

---

## 🗄️ Database Schema Visual

```
┌─────────────────────────────────────────────────────────┐
│                    profile_views                        │
├─────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                        │
│ viewer_id       UUID → users.id (nullable)              │
│ profile_id      UUID → users.id                         │
│ view_duration   INTEGER (seconds)                       │
│ source          VARCHAR(50) (dashboard, search, etc.)   │
│ created_at      TIMESTAMP                               │
├─────────────────────────────────────────────────────────┤
│ Indexes:                                                │
│   - (profile_id, created_at)                            │
│   - (viewer_id, created_at)                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  match_impressions                      │
├─────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                        │
│ user_id         UUID → users.id                         │
│ match_user_id   UUID → users.id                         │
│ match_score     INTEGER                                 │
│ position        INTEGER                                 │
│ clicked         BOOLEAN                                 │
│ source          VARCHAR(50)                             │
│ created_at      TIMESTAMP                               │
├─────────────────────────────────────────────────────────┤
│ Indexes:                                                │
│   - (user_id, created_at)                               │
│   - (match_user_id, created_at)                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   user_analytics                        │
├─────────────────────────────────────────────────────────┤
│ id                          UUID PRIMARY KEY            │
│ user_id                     UUID → users.id (UNIQUE)    │
│ total_profile_views         INTEGER                     │
│ total_match_impressions     INTEGER                     │
│ total_profile_clicks        INTEGER                     │
│ total_connections_sent      INTEGER                     │
│ total_connections_received  INTEGER                     │
│ total_messages_sent         INTEGER                     │
│ total_messages_received     INTEGER                     │
│ response_rate               DECIMAL(5,2)                │
│ last_updated                TIMESTAMP                   │
│ created_at                  TIMESTAMP                   │
├─────────────────────────────────────────────────────────┤
│ Indexes:                                                │
│   - (user_id)                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Update Flow

```
Event Occurs
    ↓
Frontend Tracking
    ↓
API Call (async, non-blocking)
    ↓
Backend Processing
    ↓
Database Write
    ↓
Summary Table Update
    ↓
Next Analytics Fetch
    ↓
Updated Numbers Display
```

**Key Points:**
- Tracking is asynchronous (doesn't block UI)
- Summary table updated immediately
- Next page load shows updated numbers
- No manual refresh needed

---

## 📈 Analytics Widget States

### Initial State (New User)
```
┌─────────────────────────────┐
│      Your Analytics         │
├─────────────────────────────┤
│ Profile Views        0      │
│ Match Impressions    0      │
│ Response Rate        0%  -  │
└─────────────────────────────┘
```

### After Some Activity
```
┌─────────────────────────────┐
│      Your Analytics         │
├─────────────────────────────┤
│ Profile Views        47     │
│ Match Impressions    156    │
│ Response Rate        73.5% ↑│
└─────────────────────────────┘
```

### High Engagement
```
┌─────────────────────────────┐
│      Your Analytics         │
├─────────────────────────────┤
│ Profile Views        342    │
│ Match Impressions    1,247  │
│ Response Rate        89.2% ↑│
└─────────────────────────────┘
```

---

## 🎨 Component Integration

```
Dashboard.tsx
├─ Loads matches
├─ Records impressions
└─ Displays AnalyticsWidget
    └─ Shows real metrics

MatchCard.tsx
├─ Displays match info
└─ Tracks clicks on profile view
    └─ Records to analytics

ProfileView.tsx
├─ Shows profile details
├─ Records view on mount
└─ Records duration on unmount
    └─ Updates analytics

AnalyticsWidget.tsx
├─ Fetches metrics via useAnalytics()
├─ Displays numbers
└─ Shows trend indicators
```

---

## 🔍 Query Performance

### Fast Queries (< 50ms)
```sql
-- Get user analytics (indexed)
SELECT * FROM user_analytics 
WHERE user_id = 'xxx';

-- Count recent views (indexed)
SELECT COUNT(*) FROM profile_views 
WHERE profile_id = 'xxx' 
  AND created_at >= NOW() - INTERVAL '7 days';
```

### Batch Operations
```sql
-- Insert multiple impressions at once
INSERT INTO match_impressions 
  (user_id, match_user_id, match_score, position, source)
VALUES 
  ('u1', 'm1', 95, 0, 'dashboard'),
  ('u1', 'm2', 88, 1, 'dashboard'),
  ('u1', 'm3', 82, 2, 'dashboard');
```

---

## ✅ Success Indicators

### Database
```
✓ Tables created
✓ Indexes added
✓ Foreign keys set
✓ Data inserting
```

### Backend
```
✓ Services running
✓ Endpoints responding
✓ Logs showing tracking
✓ No errors
```

### Frontend
```
✓ Tracking calls made
✓ Console logs visible
✓ Widget showing data
✓ Numbers updating
```

---

## 🎯 Testing Checklist

```
□ Visit dashboard
  → Check match_impressions table
  
□ Click on a match
  → Check clicked = true in match_impressions
  
□ View a profile
  → Check profile_views table
  
□ Stay on profile 30+ seconds
  → Check view_duration recorded
  
□ Check analytics widget
  → Verify numbers match database
  
□ Refresh page
  → Numbers should persist
```

---

**Visual guide complete!** Use this to understand how the analytics system works end-to-end.

