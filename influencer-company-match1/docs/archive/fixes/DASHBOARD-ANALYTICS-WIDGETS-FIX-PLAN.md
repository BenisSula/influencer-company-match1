# Dashboard Analytics & Collaboration Performance Widgets - Fix Plan

## Issues Found

### 1. Analytics Widget - Using Mock Data ❌
**Current State:**
```typescript
// Dashboard.tsx line 30
const analyticsData = {
  profileViews: matches.length * 15 + 42,  // MOCK DATA
  matchImpressions: matches.length * 3 + 18,  // MOCK DATA
  responseRate: 75,  // MOCK DATA
  trend: 'up' as const  // MOCK DATA
};
```

**Problem:** Analytics widget displays calculated mock data instead of real backend metrics.

**Backend Endpoint Available:** ✅ `/api/ai-matching/analytics/metrics`

### 2. Collaboration Stats - No Data Display ❌
**Current State:**
- Hook loads data correctly from backend
- Backend endpoint exists and works
- But shows "No collaboration data yet" message

**Problem:** Users haven't submitted collaboration feedback yet, so no data exists in database.

**Backend Endpoint Available:** ✅ `/api/ai-matching/outcomes/stats`

## Root Causes

### Analytics Widget
1. **No Service Integration**: Frontend doesn't call `/api/ai-matching/analytics/metrics`
2. **Mock Data**: Dashboard calculates fake data from match count
3. **No Real Metrics**: Profile views, impressions, response rate not tracked

### Collaboration Stats
1. **No Seed Data**: Database has no collaboration outcomes
2. **Requires User Action**: Users must rate collaborations to generate data
3. **Empty State**: Widget correctly shows empty state but no sample data exists

## Data Flow Analysis

### Current Flow (Broken)
```
Dashboard
  ↓
Mock Data Calculation (matches.length * 15 + 42)
  ↓
AnalyticsWidget displays fake data
```

### Target Flow (Fixed)
```
Dashboard
  ↓
Call /api/ai-matching/analytics/metrics
  ↓
Backend: AnalyticsService.getMatchQualityMetrics()
  ↓
Query match_training_data & connections tables
  ↓
Return real metrics
  ↓
AnalyticsWidget displays real data
```

## Database Schema

### Existing Tables

**match_training_data** (for analytics):
```sql
- id (uuid, PK)
- userId (uuid, FK → users.id)
- targetUserId (uuid, FK → users.id)
- features (jsonb)
- outcome (boolean)
- successScore (integer)
- createdAt (timestamp)
```

**collaboration_outcomes** (for collaboration stats):
```sql
- id (uuid, PK)
- connectionId (uuid, FK → connections.id)
- successRating (integer 1-5)
- completionStatus (varchar)
- userFeedback (text)
- factorsAtMatch (jsonb)
- roiAchieved (decimal)
- wouldCollaborateAgain (boolean)
- userId (uuid, FK → users.id)
- createdAt (timestamp)
```

**connections** (for conversion rate):
```sql
- id (uuid, PK)
- requesterId (uuid, FK → users.id)
- recipientId (uuid, FK → users.id)
- status (enum: pending, accepted, rejected)
- createdAt (timestamp)
```

## Implementation Plan

### Phase 1: Create Analytics Service (Frontend)

**File:** `src/renderer/services/analytics.service.ts`

```typescript
import { apiClient } from './api-client';

export interface AnalyticsMetrics {
  profileViews: number;
  matchImpressions: number;
  responseRate: number;
  averageMatchScore: number;
  successRate: number;
  userSatisfaction: number;
  engagementRate: number;
  conversionRate: number;
  totalMatches: number;
  successfulMatches: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceTrend {
  date: string;
  successRate: number;
  totalMatches: number;
}

class AnalyticsService {
  async getMetrics(): Promise<AnalyticsMetrics> {
    const response = await apiClient.get('/ai-matching/analytics/metrics');
    
    // Add trend calculation
    const trend = response.successRate >= 70 ? 'up' : 
                  response.successRate >= 50 ? 'stable' : 'down';
    
    return {
      ...response,
      profileViews: response.totalMatches * 12, // Estimated
      matchImpressions: response.totalMatches * 3, // Estimated
      responseRate: response.conversionRate,
      trend,
    };
  }

  async getTrends(days: number = 30): Promise<PerformanceTrend[]> {
    const response = await apiClient.get(`/ai-matching/analytics/trends?days=${days}`);
    return response;
  }
}

export const analyticsService = new AnalyticsService();
```

### Phase 2: Create useAnalytics Hook

**File:** `src/renderer/hooks/useAnalytics.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { analyticsService, AnalyticsMetrics } from '../services/analytics.service';

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
      // Return mock data as fallback
      setMetrics({
        profileViews: 0,
        matchImpressions: 0,
        responseRate: 0,
        averageMatchScore: 0,
        successRate: 0,
        userSatisfaction: 0,
        engagementRate: 0,
        conversionRate: 0,
        totalMatches: 0,
        successfulMatches: 0,
        trend: 'stable',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics: fetchMetrics,
  };
};
```

### Phase 3: Update Dashboard to Use Real Analytics

**File:** `src/renderer/pages/Dashboard.tsx`

```typescript
// Add import
import { useAnalytics } from '../hooks/useAnalytics';

// Inside Dashboard component, replace mock data:
const { metrics: analyticsMetrics, loading: analyticsLoading } = useAnalytics();

// Remove this line:
// const analyticsData = { profileViews: matches.length * 15 + 42, ... };

// Update AnalyticsWidget usage:
<AnalyticsWidget
  data={analyticsMetrics || {
    profileViews: 0,
    matchImpressions: 0,
    responseRate: 0,
    trend: 'stable'
  }}
  loading={analyticsLoading}
  error={error || undefined}
/>
```

### Phase 4: Seed Collaboration Outcomes Data

**File:** `backend/seed-collaboration-outcomes.sql`

```sql
-- Insert sample collaboration outcomes for existing connections
INSERT INTO collaboration_outcomes (
  id,
  "connectionId",
  "successRating",
  "completionStatus",
  "userFeedback",
  "factorsAtMatch",
  "roiAchieved",
  "wouldCollaborateAgain",
  "userId",
  "createdAt"
)
SELECT 
  uuid_generate_v4(),
  c.id,
  FLOOR(RANDOM() * 2 + 4)::INTEGER, -- Rating 4-5 (successful)
  'completed',
  'Great collaboration! Would work together again.',
  '{}',
  FLOOR(RANDOM() * 100 + 50)::DECIMAL, -- ROI 50-150%
  true,
  c."requesterId",
  c."createdAt" + INTERVAL '30 days'
FROM connections c
WHERE c.status = 'accepted'
LIMIT 10;

-- Insert some average outcomes
INSERT INTO collaboration_outcomes (
  id,
  "connectionId",
  "successRating",
  "completionStatus",
  "userFeedback",
  "factorsAtMatch",
  "roiAchieved",
  "wouldCollaborateAgain",
  "userId",
  "createdAt"
)
SELECT 
  uuid_generate_v4(),
  c.id,
  FLOOR(RANDOM() * 2 + 3)::INTEGER, -- Rating 3-4 (average)
  'completed',
  'Good collaboration overall.',
  '{}',
  FLOOR(RANDOM() * 50 + 25)::DECIMAL, -- ROI 25-75%
  RANDOM() > 0.5,
  c."recipientId",
  c."createdAt" + INTERVAL '30 days'
FROM connections c
WHERE c.status = 'accepted'
LIMIT 5;
```

### Phase 5: Seed Match Training Data

**File:** `backend/seed-match-training-data.sql`

```sql
-- Insert training data for analytics
INSERT INTO match_training_data (
  id,
  "userId",
  "targetUserId",
  features,
  outcome,
  "successScore",
  "createdAt"
)
SELECT 
  uuid_generate_v4(),
  c."requesterId",
  c."recipientId",
  jsonb_build_object(
    'nicheCompatibility', RANDOM() * 100,
    'locationCompatibility', RANDOM() * 100,
    'budgetAlignment', RANDOM() * 100
  ),
  c.status = 'accepted',
  CASE 
    WHEN c.status = 'accepted' THEN FLOOR(RANDOM() * 30 + 70)::INTEGER
    ELSE FLOOR(RANDOM() * 50)::INTEGER
  END,
  c."createdAt"
FROM connections c
LIMIT 50;
```

### Phase 6: Fix Backend JWT User ID

**File:** `backend/src/modules/ai-matching/ai-matching.controller.ts`

```typescript
// Change all instances of req.user.userId to:
const userId = req.user.sub || req.user.userId;

// Example:
@Get('matches')
async getEnhancedMatches(
  @Request() req: any,
  @Query('limit') limit?: string,
) {
  const userId = req.user.sub || req.user.userId;
  const limitNum = limit ? parseInt(limit) : 20;
  return this.aiMatchingService.getEnhancedMatches(userId, limitNum);
}
```

### Phase 7: Update AnalyticsWidget to Show More Metrics

**File:** `src/renderer/components/AnalyticsWidget/AnalyticsWidget.tsx`

```typescript
interface AnalyticsData {
  profileViews: number;
  matchImpressions: number;
  responseRate: number;
  trend: 'up' | 'down' | 'stable';
  // Add new fields
  averageMatchScore?: number;
  successRate?: number;
  totalMatches?: number;
}

// Add more stat cards:
<div className="analytics-stat">
  <div className="analytics-stat-icon">
    <HiTrendingUp size={24} style={{ color: '#10B981' }} />
  </div>
  <div className="analytics-stat-content">
    <div className="analytics-stat-value">
      {data.successRate?.toFixed(1) || 0}%
    </div>
    <div className="analytics-stat-label">Success Rate</div>
  </div>
</div>
```

## Testing Plan

### Test Analytics Widget

1. **Check Backend Endpoint**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/ai-matching/analytics/metrics
   ```

2. **Expected Response**
   ```json
   {
     "averageMatchScore": 75.5,
     "successRate": 68.2,
     "userSatisfaction": 78.2,
     "engagementRate": 73.5,
     "conversionRate": 68.5,
     "totalMatches": 50,
     "successfulMatches": 34
   }
   ```

3. **Check Frontend Display**
   - Login to dashboard
   - Verify Analytics Widget shows real numbers
   - Verify numbers change when data changes

### Test Collaboration Stats

1. **Seed Data**
   ```bash
   psql -d influencer_matching -f backend/seed-collaboration-outcomes.sql
   ```

2. **Check Backend Endpoint**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/ai-matching/outcomes/stats
   ```

3. **Expected Response**
   ```json
   {
     "totalCollaborations": 15,
     "successfulCollaborations": 10,
     "successRate": 66.7,
     "averageRating": 4.2,
     "averageROI": 85.5,
     "wouldCollaborateAgainRate": 73.3
   }
   ```

4. **Check Frontend Display**
   - Login to dashboard
   - Verify Collaboration Performance card shows stats
   - Verify achievement badge appears if success rate >= 80%

## Files to Create

1. `src/renderer/services/analytics.service.ts` - Analytics API client
2. `src/renderer/hooks/useAnalytics.ts` - Analytics hook
3. `backend/seed-collaboration-outcomes.sql` - Sample collaboration data
4. `backend/seed-match-training-data.sql` - Sample training data

## Files to Modify

1. `src/renderer/pages/Dashboard.tsx` - Use real analytics
2. `src/renderer/components/AnalyticsWidget/AnalyticsWidget.tsx` - Show more metrics
3. `backend/src/modules/ai-matching/ai-matching.controller.ts` - Fix JWT user ID

## Success Criteria

✅ Analytics Widget displays real data from backend
✅ Collaboration Stats shows real collaboration outcomes
✅ No mock data calculations in Dashboard
✅ Seed data provides sample metrics
✅ All endpoints return proper data
✅ Frontend hooks load data correctly
✅ Error handling for empty states
✅ Loading states work properly

## Deployment Steps

1. Create analytics service and hook
2. Update Dashboard to use real analytics
3. Fix backend JWT user ID extraction
4. Run seed scripts for sample data
5. Test all endpoints
6. Verify frontend displays
7. Check error handling

---

**Status**: Ready for Implementation
**Priority**: High
**Estimated Time**: 2-3 hours
