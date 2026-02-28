# Dashboard Analytics - Quick Start Guide

## 🚀 Getting Started

### 1. Run the Migration

```bash
cd backend
npm run migration:run
```

### 2. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd ..
npm run dev
```

### 3. Test It Out

1. Login to the platform
2. Visit Dashboard - matches will be tracked
3. Click on a match - click will be tracked
4. View a profile - view will be tracked
5. Check Analytics Widget - see real numbers!

---

## 📊 What Gets Tracked

### Profile Views
- **When**: User visits any profile
- **Data**: Who viewed, duration, source
- **Display**: "Profile Views" in Analytics Widget

### Match Impressions
- **When**: Matches displayed on dashboard
- **Data**: Which matches shown, scores, positions
- **Display**: "Match Impressions" in Analytics Widget

### Match Clicks
- **When**: User clicks to view match profile
- **Data**: Which match was clicked
- **Display**: Contributes to click-through rate

### Response Rate
- **Calculated**: From connections and messages
- **Formula**: (sent / received) * 100
- **Display**: "Response Rate" with trend indicator

---

## 🔍 Verify It's Working

### Check Database

```sql
-- Profile views
SELECT COUNT(*) FROM profile_views;

-- Match impressions
SELECT COUNT(*) FROM match_impressions;

-- User analytics
SELECT * FROM user_analytics LIMIT 5;
```

### Check API

```bash
# Get your analytics
curl http://localhost:3000/analytics/my-analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Frontend

1. Open browser console
2. Look for analytics tracking logs:
   - `[AnalyticsService] Recording profile view`
   - `[AnalyticsService] Recording match impressions`
   - `[AnalyticsService] Recording match click`

---

## 📈 Analytics Widget

The Dashboard now shows REAL data:

```
Your Analytics
├─ Profile Views: 47 (real count from database)
├─ Match Impressions: 156 (real count from database)
└─ Response Rate: 73.5% ↑ (calculated from actual data)
```

Before: Mock calculations (matches * 12)  
After: Real tracked interactions ✅

---

## 🐛 Troubleshooting

### No data showing?

1. Check migration ran: `SELECT * FROM profile_views LIMIT 1;`
2. Check backend logs for errors
3. Verify JWT token is valid
4. Check browser console for tracking errors

### Numbers seem wrong?

1. Fresh install = 0 views (expected)
2. Data accumulates over time
3. Check database directly to verify

### Migration fails?

```bash
# Rollback and retry
npm run migration:revert
npm run migration:run
```

---

## 📝 API Endpoints

```
POST /analytics/profile-view
POST /analytics/match-impressions  
POST /analytics/match-click
GET  /analytics/my-analytics
```

All require JWT authentication.

---

## ✅ Success Checklist

- [ ] Migration completed successfully
- [ ] Backend started without errors
- [ ] Frontend loads dashboard
- [ ] Analytics widget shows numbers
- [ ] Profile views tracked in database
- [ ] Match impressions tracked in database
- [ ] Numbers update as you interact

---

**Ready to use!** The analytics system is now tracking real user interactions.

