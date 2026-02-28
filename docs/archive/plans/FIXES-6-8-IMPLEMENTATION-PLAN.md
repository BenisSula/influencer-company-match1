# Fixes #6-8: Implementation Plan

## Overview
Implementing the remaining 3 critical fixes to complete Phase 1 of the integration fix project.

---

## Fix #6: Notification Type Enum

### Issue
Frontend and backend may have mismatched notification type enums.

### Investigation Needed
1. Check backend notification entity enum values
2. Check frontend notification type definitions
3. Verify all notification types are supported
4. Ensure consistent naming

### Files to Check
- `backend/src/modules/notifications/entities/notification.entity.ts`
- `src/renderer/types/notification.types.ts`
- `src/renderer/services/notification.service.ts`

### Expected Fix
Align enum values between frontend and backend:
```typescript
// Backend & Frontend should match
enum NotificationType {
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  COLLABORATION_REQUEST = 'COLLABORATION_REQUEST',
  COLLABORATION_ACCEPTED = 'COLLABORATION_ACCEPTED',
  MESSAGE = 'MESSAGE',
  MATCH = 'MATCH',
  SYSTEM = 'SYSTEM'
}
```

---

## Fix #7: Feed Post Author Structure

### Issue
Frontend expects `post.author` but backend may return `post.user`.

### Investigation Needed
1. Check backend feed post entity
2. Check backend feed service response
3. Check frontend feed service transformation
4. Verify author data includes all needed fields

### Files to Check
- `backend/src/modules/feed/entities/feed-post.entity.ts`
- `backend/src/modules/feed/feed.service.ts`
- `src/renderer/services/feed.service.ts`
- `src/renderer/components/FeedPost/FeedPost.tsx`

### Expected Fix
Backend should return:
```typescript
{
  id: 'post-id',
  content: 'Post content',
  author: {  // Not 'user'
    id: 'user-id',
    name: 'John Doe',
    avatar: 'url',
    role: 'INFLUENCER'
  },
  createdAt: '2026-02-16T10:00:00Z'
}
```

---

## Fix #8: Analytics Data Structure

### Issue
Frontend analytics widgets expect specific data structure from backend.

### Investigation Needed
1. Check backend analytics service response
2. Check frontend analytics service transformation
3. Verify dashboard widgets data consumption
4. Ensure all metrics are included

### Files to Check
- `backend/src/modules/analytics/analytics.controller.ts`
- `backend/src/modules/analytics/analytics-tracking.service.ts`
- `src/renderer/services/analytics.service.ts`
- `src/renderer/hooks/useAnalytics.ts`
- `src/renderer/components/AnalyticsWidget/AnalyticsWidget.tsx`

### Expected Fix
Backend should return:
```typescript
{
  overview: {
    totalMatches: number,
    totalConnections: number,
    totalMessages: number,
    profileViews: number
  },
  engagement: {
    matchRate: number,
    responseRate: number,
    averageResponseTime: number
  },
  trends: {
    matchesThisWeek: number,
    matchesLastWeek: number,
    connectionsThisWeek: number,
    connectionsLastWeek: number
  }
}
```

---

## Implementation Order

### Step 1: Fix #6 - Notification Type Enum (15 min)
1. Read backend notification entity
2. Read frontend notification types
3. Identify mismatches
4. Update enum definitions
5. Test notification display

### Step 2: Fix #7 - Feed Post Author (20 min)
1. Read backend feed post entity
2. Read backend feed service
3. Update to return `author` instead of `user`
4. Update frontend if needed
5. Test feed post display

### Step 3: Fix #8 - Analytics Data (25 min)
1. Read backend analytics service
2. Read frontend analytics service
3. Align data structures
4. Update transformations
5. Test dashboard widgets

---

## Testing Strategy

### After Each Fix
1. Check diagnostics for errors
2. Verify no TypeScript errors
3. Test affected components
4. Check console for warnings

### Integration Testing
1. Test complete user flow
2. Verify all data displays correctly
3. Check network requests
4. Validate response structures

---

## Success Criteria

### Fix #6 Success
- ✅ Enum values match between frontend/backend
- ✅ All notification types supported
- ✅ Notifications display correctly
- ✅ No type errors

### Fix #7 Success
- ✅ Backend returns `author` field
- ✅ Frontend receives author data
- ✅ Feed posts display correctly
- ✅ Author info shows properly

### Fix #8 Success
- ✅ Analytics data structure aligned
- ✅ Dashboard widgets display data
- ✅ All metrics show correctly
- ✅ No data transformation errors

---

## Timeline

**Total Estimated Time**: 60 minutes

- Fix #6: 15 minutes
- Fix #7: 20 minutes
- Fix #8: 25 minutes

**Target Completion**: Within 1 hour

---

## Next Steps After Completion

1. ✅ Update tracker document
2. ✅ Create completion summary
3. ✅ Document all changes
4. ✅ Prepare for Phase 2 (Medium Priority Fixes)
5. ✅ Create testing guide for all 8 fixes

---

## Notes
- All fixes are backward compatible
- No database migrations required
- Can be deployed incrementally
- Frontend handles both old and new structures where possible
