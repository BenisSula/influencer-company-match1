# Landing Stats Numbers Visibility - Investigation & Fix Plan

## Date: February 21, 2026

## 🔍 CRITICAL ISSUES FOUND

### Issue #1: DATA STRUCTURE MISMATCH ⚠️ CRITICAL

**Backend Returns:**
```typescript
{
  totalUsers: 12500,
  activeMatches: 5000,
  successfulCollaborations: 3500,
  averageMatchScore: 85,
  platformGrowth: 12,
  updatedAt: "2026-02-21T..."
}
```

**Frontend Expects (Landing.tsx lines 233-283):**
```typescript
{
  activeUsers: 12500,        // ❌ WRONG: Backend sends "totalUsers"
  successfulMatches: 68000,  // ❌ WRONG: Backend sends "successfulCollaborations"
  aiAccuracy: 94,            // ❌ WRONG: Backend sends "averageMatchScore"
  partnerships: 8            // ❌ WRONG: Backend sends "platformGrowth"
}
```

**RESULT:** Numbers are undefined, causing invisible stat values!

---

### Issue #2: CSS Z-INDEX ALREADY FIXED ✅

The previous fix correctly added z-index hierarchy:
- `.stat-value { z-index: 4; }` - Highest priority
- `.stat-icon { z-index: 3; }`
- `.stat-label { z-index: 3; }`
- `.stat-micro-chart { z-index: 2; }`
- `.stat-card::before { z-index: 1; }` - Shine overlay

---

### Issue #3: "UPDATED LIVE" NOT SYNCING WITH BACKEND

**Current Implementation:**
- Static text "Updated Live" with animated dot
- No actual connection to backend real-time updates
- No WebSocket connection for live statistics

**Missing:**
- Real-time statistics endpoint integration
- WebSocket connection for live updates
- Timestamp display showing last update time

---

## 📊 DATA FLOW ANALYSIS

### Current Flow (BROKEN):
```
Backend API (/api/landing/statistics)
  ↓ Returns: { totalUsers, activeMatches, successfulCollaborations, ... }
  ↓
useLandingData Hook
  ↓ Stores in: statistics object
  ↓
Landing.tsx Component
  ↓ Accesses: statistics?.activeUsers (UNDEFINED!)
  ↓
AnimatedStatCounter
  ↓ Receives: undefined
  ↓
Result: NO NUMBERS DISPLAYED
```

### Correct Flow (SHOULD BE):
```
Backend API (/api/landing/statistics)
  ↓ Returns: { totalUsers, activeMatches, successfulCollaborations, ... }
  ↓
useLandingData Hook
  ↓ Maps to correct field names
  ↓
Landing.tsx Component
  ↓ Accesses: statistics?.totalUsers (DEFINED!)
  ↓
AnimatedStatCounter
  ↓ Receives: 12500
  ↓
Result: NUMBERS DISPLAYED ✅
```

---

## 🔧 FIX PLAN

### Fix #1: Correct Data Structure Mapping in Landing.tsx

**File:** `src/renderer/pages/Landing/Landing.tsx`
**Lines:** 233-283

**Current (BROKEN):**
```tsx
{[
  {
    icon: Users,
    value: statistics?.activeUsers || 12500,  // ❌ WRONG FIELD
    label: 'Active Users',
    trend: [7500, 8200, 8800, 9200, 9600, statistics?.activeUsers || 12500],
    color: '#E1306C',
    suffix: '+'
  },
  {
    icon: Target,
    value: statistics?.successfulMatches || 68000,  // ❌ WRONG FIELD
    label: 'Successful Matches',
    trend: [35000, 38000, 42000, 45000, 48000, statistics?.successfulMatches || 68000],
    color: '#FD8D32',
    suffix: '+'
  },
  {
    icon: Bot,
    value: statistics?.aiAccuracy || 94,  // ❌ WRONG FIELD
    label: 'AI Accuracy',
    trend: [85, 87, 89, 90, 92, statistics?.aiAccuracy || 94],
    color: '#5B51D8',
    suffix: '%'
  },
  {
    icon: TrendingUp,
    value: statistics?.partnerships || 8,  // ❌ WRONG FIELD
    label: 'In Partnerships',
    trend: [2, 2.5, 3, 3.5, 4.2, statistics?.partnerships || 8],
    color: '#00D95F',
    prefix: '$',
    suffix: 'M+'
  }
]}
```

**Fixed (CORRECT):**
```tsx
{[
  {
    icon: Users,
    value: statistics?.totalUsers || 12500,  // ✅ CORRECT
    label: 'Active Users',
    trend: [7500, 8200, 8800, 9200, 9600, statistics?.totalUsers || 12500],
    color: '#E1306C',
    suffix: '+'
  },
  {
    icon: Target,
    value: statistics?.successfulCollaborations || 3500,  // ✅ CORRECT
    label: 'Successful Matches',
    trend: [1500, 2000, 2500, 3000, 3200, statistics?.successfulCollaborations || 3500],
    color: '#FD8D32',
    suffix: '+'
  },
  {
    icon: Bot,
    value: statistics?.averageMatchScore || 85,  // ✅ CORRECT
    label: 'AI Accuracy',
    trend: [75, 78, 80, 82, 84, statistics?.averageMatchScore || 85],
    color: '#5B51D8',
    suffix: '%'
  },
  {
    icon: TrendingUp,
    value: statistics?.platformGrowth || 12,  // ✅ CORRECT
    label: 'Platform Growth',
    trend: [5, 6, 7, 9, 10, statistics?.platformGrowth || 12],
    color: '#00D95F',
    suffix: '%'
  }
]}
```

---

### Fix #2: Add Real-Time Update Indicator

**File:** `src/renderer/pages/Landing/Landing.tsx`
**Add after line 30:**

```tsx
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

useEffect(() => {
  if (statistics) {
    setLastUpdate(new Date());
  }
}, [statistics]);
```

**Update stat card to show actual update time:**
```tsx
<div className="stat-live-indicator">
  <span className="live-dot"></span>
  <span className="live-text">
    Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
  </span>
</div>
```

---

### Fix #3: Implement Real-Time Statistics Updates

**Option A: Polling (Simple)**
Already implemented in `useLandingData.ts` - refreshes every 30 seconds

**Option B: WebSocket (Advanced)**
Backend already has WebSocket support via `landing.gateway.ts`

**Recommendation:** Keep polling for now (already working), add visual feedback

---

### Fix #4: Add Loading State for Statistics

**File:** `src/renderer/pages/Landing/Landing.tsx`
**Lines:** 233-240

**Current:**
```tsx
{loading ? (
  <div className="stats-loading">
    <div className="loading-spinner"></div>
    <p>Loading latest statistics...</p>
  </div>
) : (
  <div className="stats-grid">
```

**Issue:** Loading state works, but numbers still don't show after loading

**Fix:** Ensure data mapping is correct (Fix #1)

---

## 🧪 TESTING CHECKLIST

After applying fixes:

- [ ] Open landing page
- [ ] Check if stat numbers are visible
- [ ] Verify numbers match backend data
- [ ] Check "Updated Live" indicator shows timestamp
- [ ] Wait 30 seconds and verify numbers refresh
- [ ] Check browser console for errors
- [ ] Verify fallback values work if backend is down
- [ ] Test on mobile devices
- [ ] Check z-index stacking (numbers on top)
- [ ] Verify brand colors are correct

---

## 📝 IMPLEMENTATION ORDER

1. **CRITICAL:** Fix data structure mapping in Landing.tsx
2. Add real-time update timestamp display
3. Test with backend running
4. Test with backend stopped (fallback values)
5. Verify mobile responsiveness
6. Check browser console for errors

---

## 🎯 EXPECTED RESULTS

After fixes:
- ✅ Stat numbers visible and correct
- ✅ Numbers sync with backend database
- ✅ "Updated Live" shows actual update time
- ✅ Numbers refresh every 30 seconds
- ✅ Fallback values work if backend fails
- ✅ No CSS overlay issues
- ✅ Brand colors correct
- ✅ Mobile responsive

---

## 🚨 ROOT CAUSE SUMMARY

**Primary Issue:** Field name mismatch between backend API response and frontend component

**Backend sends:** `totalUsers`, `successfulCollaborations`, `averageMatchScore`, `platformGrowth`

**Frontend expects:** `activeUsers`, `successfulMatches`, `aiAccuracy`, `partnerships`

**Solution:** Update Landing.tsx to use correct field names from backend response

---

**Status:** Ready for implementation
**Priority:** CRITICAL - Numbers not visible
**Estimated Fix Time:** 5 minutes
