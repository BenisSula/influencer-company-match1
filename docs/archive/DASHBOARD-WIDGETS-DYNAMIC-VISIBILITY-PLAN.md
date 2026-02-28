# Dashboard Widgets Dynamic Visibility Implementation Plan

## Executive Summary

This plan addresses making the **Collaboration Performance** and **Collaboration Requests** widgets on the Dashboard (and any other pages they appear) dynamically show/hide based on whether they have data to display.

## Current State Analysis

### 1. Collaboration Performance Widget

**Location:** Dashboard page
**Component:** `CollaborationStats` (wrapped in a Card)
**Data Source:** `useCollaborationOutcomes` hook → `collaboration-outcome.service.ts` → Backend `/ai-matching/outcomes/stats`

**Current Behavior:**
- Always renders the Card container
- Shows loading skeleton when `loading=true`
- Shows empty state message when `stats.totalCollaborations === 0`
- Shows stats grid when data exists

**Issue:** The Card wrapper is always visible even when there's no data, creating visual clutter.

**Data Flow:**
```
Dashboard.tsx
  ↓ useCollaborationOutcomes()
  ↓ collaboration-outcome.service.ts
  ↓ GET /ai-matching/outcomes/stats
  ↓ CollaborationOutcomeService.getCollaborationStats()
  ↓ Query collaboration_outcomes table
  ↓ Returns: { totalCollaborations, successfulCollaborations, successRate, averageRating, averageROI, wouldCollaborateAgainRate }
```

### 2. Collaboration Requests Widget

**Location:** Dashboard page (in dashboard-widgets-grid)
**Component:** `CollaborationRequestsWidget`
**Data Source:** `connections` state from `matchingService.getMyConnections()`

**Current Behavior:**
- Always renders within the DashboardWidget wrapper
- Shows loading state when `loading=true`
- Shows empty state when `requests.length === 0`
- Filters requests by `collaboration_status` (requested/active)
- Shows pending and active sections

**Issue:** The widget is always visible even when there are no collaboration requests, taking up space unnecessarily.

**Data Flow:**
```
Dashboard.tsx
  ↓ loadConnections()
  ↓ matchingService.getMyConnections()
  ↓ GET /matching/connections/my
  ↓ MatchingService.getMyConnections()
  ↓ Query connections table
  ↓ Filters by requesterId or recipientId = userId
  ↓ Returns connections with collaboration_status, collaboration_request_data
```

### 3. Database Schema

**collaboration_outcomes table:**
- `id` (uuid, primary key)
- `connection_id` (uuid, FK to connections)
- `success_rating` (integer, 1-5)
- `completion_status` (varchar, completed/cancelled/ongoing)
- `user_feedback` (text, nullable)
- `factors_at_match` (jsonb)
- `roi_achieved` (decimal, nullable)
- `would_collaborate_again` (boolean)
- `user_id` (uuid, FK to users)
- `created_at` (timestamp)

**connections table:**
- Has `collaboration_status` field (requested/active/cancelled/completed)
- Has `collaboration_request_data` (jsonb) field
- Has `status` field (pending/accepted/rejected)

## Implementation Plan

### Phase 1: Backend Verification ✅

**Status:** Backend is already properly implemented

The backend correctly:
1. Returns empty array `[]` when no connections exist
2. Returns stats with `totalCollaborations: 0` when no outcomes exist
3. Properly filters connections by collaboration_status
4. Handles null/undefined cases gracefully

### Phase 2: Frontend Widget Conditional Rendering

#### 2.1 Collaboration Performance Widget

**File:** `src/renderer/pages/Dashboard.tsx`

**Changes:**
1. Check if `stats` exists and has data before rendering the Card
2. Only render when `stats && stats.totalCollaborations > 0`
3. Keep loading state visible during initial load

**Implementation:**
```typescript
{/* Collaboration Performance Widget - Only show if user has collaboration data */}
{!statsLoading && stats && stats.totalCollaborations > 0 && (
  <Card style={{ marginBottom: '1rem' }}>
    <CardHeader>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HiUserGroup size={20} style={{ color: '#667eea' }} />
        Collaboration Performance
      </h3>
    </CardHeader>
    <CardBody>
      <CollaborationStats stats={stats} loading={statsLoading} />
    </CardBody>
  </Card>
)}
```

#### 2.2 Collaboration Requests Widget

**File:** `src/renderer/pages/Dashboard.tsx`

**Changes:**
1. Check if connections array has any collaboration requests before rendering
2. Filter connections to only those with collaboration_status
3. Only render when there are actual collaboration requests

**Implementation:**
```typescript
// In Dashboard.tsx, calculate if there are any collaboration requests
const hasCollaborationRequests = connections.some(conn => 
  conn.collaboration_status === 'requested' || 
  conn.collaboration_status === 'active' ||
  conn.collaborationStatus === 'requested' ||
  conn.collaborationStatus === 'active'
);

// Then in the render:
{hasCollaborationRequests && (
  <div className="dashboard-widget-column">
    <CollaborationRequestsWidget
      requests={connections}
      loading={loading}
      error={error || undefined}
    />
  </div>
)}
```

#### 2.3 Update Dashboard Grid Layout

**File:** `src/renderer/pages/Dashboard.tsx`

**Changes:**
1. Make the dashboard-widgets-grid responsive to missing widgets
2. Ensure CompatibilityMatchesWidget takes full width when CollaborationRequestsWidget is hidden
3. Use conditional CSS classes

**Implementation:**
```typescript
<div className={`dashboard-widgets-grid ${!hasCollaborationRequests ? 'single-column' : ''}`}>
  <div className="dashboard-widget-column">
    <CompatibilityMatchesWidget
      matches={matches}
      loading={loading}
      error={error || undefined}
      userRole={(user?.role === 'ADMIN' ? 'INFLUENCER' : user?.role) || 'INFLUENCER'}
    />
  </div>
  
  {hasCollaborationRequests && (
    <div className="dashboard-widget-column">
      <CollaborationRequestsWidget
        requests={connections}
        loading={loading}
        error={error || undefined}
      />
    </div>
  )}
</div>
```

#### 2.4 Update Dashboard CSS

**File:** `src/renderer/pages/Dashboard.css`

**Changes:**
Add CSS to handle single-column layout when one widget is hidden:

```css
.dashboard-widgets-grid.single-column {
  grid-template-columns: 1fr;
}

.dashboard-widgets-grid.single-column .dashboard-widget-column {
  max-width: 100%;
}
```

### Phase 3: Widget Component Improvements

#### 3.1 CollaborationRequestsWidget Enhancement

**File:** `src/renderer/components/CollaborationRequestsWidget/CollaborationRequestsWidget.tsx`

**Changes:**
1. Remove the empty state rendering (parent will handle visibility)
2. Add prop to indicate if widget should be hidden
3. Fix TypeScript error for `collaborationRequestData`

**Implementation:**
```typescript
// Remove this block since parent handles visibility:
// if (requests.length === 0) {
//   return <div className="collaboration-requests-empty">...</div>
// }

// Fix TypeScript error:
const data = request.collaboration_request_data || {};
// Remove reference to request.collaborationRequestData
```

#### 3.2 CollaborationStats Component

**File:** `src/renderer/components/CollaborationStats/CollaborationStats.tsx`

**Current Implementation:** Already handles empty state correctly ✅

The component already:
- Shows loading skeleton when `loading=true`
- Shows empty message when `!stats || stats.totalCollaborations === 0`
- Only shows stats grid when data exists

**No changes needed** - parent component will handle visibility.

### Phase 4: Other Pages Check

#### 4.1 Connections Page

**File:** `src/renderer/pages/Connections.tsx`

**Check:** Does this page use CollaborationRequestsWidget or CollaborationStats?

**Action:** Review and apply same conditional rendering logic if widgets are used.

#### 4.2 Profile Pages

**Check:** Do ProfileView or Profile pages show these widgets?

**Action:** Apply same conditional rendering if applicable.

### Phase 5: Testing Strategy

#### 5.1 Test Scenarios

**Scenario 1: New User (No Data)**
- Expected: Neither widget should appear
- Dashboard should show only matches and feed
- No empty state cards

**Scenario 2: User with Connections but No Collaboration Requests**
- Expected: Collaboration Requests widget hidden
- Collaboration Performance widget hidden
- Only matches and connections visible

**Scenario 3: User with Pending Collaboration Requests**
- Expected: Collaboration Requests widget visible
- Shows pending section
- Collaboration Performance widget still hidden (no completed collaborations)

**Scenario 4: User with Active Collaborations**
- Expected: Collaboration Requests widget visible
- Shows active section
- Collaboration Performance widget still hidden (no rated outcomes)

**Scenario 5: User with Completed & Rated Collaborations**
- Expected: Both widgets visible
- Collaboration Performance shows stats
- Collaboration Requests shows active/pending if any

**Scenario 6: Loading States**
- Expected: Widgets don't flash in/out during loading
- Smooth transition when data loads
- No layout shift

#### 5.2 Test Cases

```javascript
// Test file: test-dashboard-widgets-visibility.js

const testCases = [
  {
    name: 'New user with no data',
    userId: 'new-user-id',
    expectedCollaborationPerformance: false,
    expectedCollaborationRequests: false,
  },
  {
    name: 'User with connections but no collaboration requests',
    userId: 'user-with-connections',
    expectedCollaborationPerformance: false,
    expectedCollaborationRequests: false,
  },
  {
    name: 'User with pending collaboration requests',
    userId: 'user-with-pending-requests',
    expectedCollaborationPerformance: false,
    expectedCollaborationRequests: true,
  },
  {
    name: 'User with completed collaborations',
    userId: 'user-with-outcomes',
    expectedCollaborationPerformance: true,
    expectedCollaborationRequests: false,
  },
  {
    name: 'User with both requests and outcomes',
    userId: 'active-user',
    expectedCollaborationPerformance: true,
    expectedCollaborationRequests: true,
  },
];
```

### Phase 6: Edge Cases & Error Handling

#### 6.1 Edge Cases

1. **API Error:** Widget should hide, not show error state
2. **Partial Data:** If stats API fails but connections succeed, only show working widget
3. **Race Conditions:** Handle async data loading properly
4. **User Role:** Ensure widgets work for both influencers and companies
5. **Real-time Updates:** When collaboration is accepted, widget should appear

#### 6.2 Error Handling

```typescript
// In Dashboard.tsx
const [connectionsError, setConnectionsError] = useState<string | null>(null);
const [statsError, setStatsError] = useState<string | null>(null);

// Separate error handling for each widget
const loadConnections = async () => {
  try {
    // ... load connections
    setConnectionsError(null);
  } catch (err) {
    setConnectionsError(err.message);
    setConnections([]); // Hide widget on error
  }
};

// Don't show widget if there's an error
const hasCollaborationRequests = !connectionsError && connections.some(...);
const hasCollaborationPerformance = !statsError && stats && stats.totalCollaborations > 0;
```

### Phase 7: Performance Optimization

#### 7.1 Memoization

```typescript
// Memoize the calculation
const hasCollaborationRequests = useMemo(() => {
  return connections.some(conn => 
    conn.collaboration_status === 'requested' || 
    conn.collaboration_status === 'active' ||
    conn.collaborationStatus === 'requested' ||
    conn.collaborationStatus === 'active'
  );
}, [connections]);

const hasCollaborationPerformance = useMemo(() => {
  return stats && stats.totalCollaborations > 0;
}, [stats]);
```

#### 7.2 Avoid Layout Shift

```css
/* Add min-height to prevent layout shift during loading */
.dashboard-widgets-grid {
  min-height: 300px;
  transition: grid-template-columns 0.3s ease;
}
```

## Implementation Checklist

### Backend (Already Complete ✅)
- [x] Collaboration outcomes API returns proper empty state
- [x] Connections API returns proper empty array
- [x] Stats calculation handles zero collaborations
- [x] Error handling in place

### Frontend Components
- [ ] Update Dashboard.tsx with conditional rendering
- [ ] Add hasCollaborationRequests calculation
- [ ] Add hasCollaborationPerformance calculation
- [ ] Wrap Collaboration Performance Card in conditional
- [ ] Wrap Collaboration Requests Widget in conditional
- [ ] Update dashboard-widgets-grid CSS
- [ ] Add single-column CSS class
- [ ] Fix TypeScript error in CollaborationRequestsWidget
- [ ] Add useMemo for performance
- [ ] Add error state handling

### Testing
- [ ] Test new user scenario
- [ ] Test user with connections only
- [ ] Test user with pending requests
- [ ] Test user with active collaborations
- [ ] Test user with completed outcomes
- [ ] Test loading states
- [ ] Test error states
- [ ] Test layout responsiveness
- [ ] Test both user roles (influencer/company)

### Documentation
- [ ] Update component documentation
- [ ] Add comments explaining conditional logic
- [ ] Document expected behavior in README

## Files to Modify

1. **src/renderer/pages/Dashboard.tsx** - Main implementation
2. **src/renderer/pages/Dashboard.css** - Layout adjustments
3. **src/renderer/components/CollaborationRequestsWidget/CollaborationRequestsWidget.tsx** - Fix TypeScript error
4. **test-dashboard-widgets-visibility.js** - New test file (create)

## Rollback Plan

If issues arise:
1. Revert Dashboard.tsx changes
2. Widgets will return to always-visible state
3. No database or backend changes needed
4. No breaking changes to API

## Success Criteria

1. ✅ Widgets only appear when they have data to display
2. ✅ No empty state cards visible on dashboard
3. ✅ Smooth loading experience (no flashing)
4. ✅ No layout shift when widgets appear/disappear
5. ✅ Works for both influencers and companies
6. ✅ Handles errors gracefully
7. ✅ Performance is not degraded
8. ✅ All TypeScript errors resolved

## Timeline

- **Phase 1:** Backend verification - Complete ✅
- **Phase 2:** Frontend implementation - 2 hours
- **Phase 3:** Component improvements - 1 hour
- **Phase 4:** Other pages check - 30 minutes
- **Phase 5:** Testing - 1 hour
- **Phase 6:** Edge cases - 30 minutes
- **Phase 7:** Performance optimization - 30 minutes

**Total Estimated Time:** 5.5 hours

## Notes

- The backend is already properly implemented and returns correct data
- Main work is frontend conditional rendering
- No database migrations needed
- No API changes needed
- Focus on clean, maintainable code
- Ensure accessibility is maintained
- Keep user experience smooth during transitions
