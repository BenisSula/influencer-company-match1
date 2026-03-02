# 🧪 React Query Caching - Quick Test Guide

## 🎯 How to Verify Caching is Working

### Test 1: Basic Cache Behavior

1. **Open Browser DevTools** (F12)
2. Go to **Network tab**
3. Filter by **XHR** or **Fetch**
4. Navigate to `http://localhost:5173/admin/users`
   - ✅ Should see API call to `/admin/users`
5. Navigate to `http://localhost:5173/admin/dashboard`
   - ✅ Should see API call to `/admin/users/stats`
6. **Navigate back** to `/admin/users`
   - ✅ Should **NOT** see API call (cached!)
   - ✅ Page loads instantly

**Expected Result:** Second visit to Users page shows NO network request

---

### Test 2: Cache Invalidation on Mutation

1. Navigate to `/admin/reviews`
   - ✅ Should see API call to `/admin/reviews`
2. Click **"Feature"** button on any review
   - ✅ Should see API call to `/admin/reviews/{id}/feature`
   - ✅ Should see automatic refetch to `/admin/reviews`
   - ✅ List updates automatically
   - ✅ Stats update automatically
3. **No manual refresh needed!**

**Expected Result:** Mutation triggers automatic cache invalidation and refetch

---

### Test 3: Stale Time Behavior

1. Navigate to `/admin/users`
   - ✅ Data loads and is cached
2. Wait **4 minutes** (less than 5 min stale time)
3. Navigate away and back to `/admin/users`
   - ✅ Should **NOT** see API call (still fresh)
4. Wait **6 minutes** (more than 5 min stale time)
5. Navigate away and back to `/admin/users`
   - ✅ Should see API call (data is stale)
   - ✅ But shows cached data immediately while refetching

**Expected Result:** Data stays fresh for 5 minutes, then refetches in background

---

### Test 4: Multiple Page Navigation

1. Open `/admin/users` → API call
2. Open `/admin/reviews` → API call
3. Open `/admin/tenants` → API call
4. Go back to `/admin/users` → **NO API call** (cached)
5. Go back to `/admin/reviews` → **NO API call** (cached)
6. Go back to `/admin/tenants` → **NO API call** (cached)

**Expected Result:** All pages load instantly from cache

---

### Test 5: Error Handling

1. **Stop the backend server**
2. Navigate to `/admin/users`
3. ✅ Should show error message
4. **Start the backend server**
5. Click **"Retry"** button
6. ✅ Data loads successfully
7. ✅ Data is now cached

**Expected Result:** Graceful error handling with retry functionality

---

## 📊 Visual Indicators

### Cache Hit (Instant Load):
- ✅ No loading spinner
- ✅ Data appears immediately
- ✅ No network request in DevTools

### Cache Miss (API Call):
- ✅ Loading spinner shows briefly
- ✅ Network request visible in DevTools
- ✅ Data loads after API response

### Background Refetch:
- ✅ Cached data shows immediately
- ✅ Network request happens in background
- ✅ UI updates seamlessly when fresh data arrives

---

## 🔍 DevTools Inspection

### React Query DevTools (Optional):
To see cache state visually, install React Query DevTools:

```bash
npm install @tanstack/react-query-devtools
```

Add to App.tsx:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Inside QueryClientProvider
<ReactQueryDevtools initialIsOpen={false} />
```

This shows:
- All cached queries
- Query status (fresh, stale, fetching)
- Cache size
- Refetch triggers

---

## ✅ Success Criteria

You'll know caching is working when:

1. ✅ Second visit to a page shows NO network request
2. ✅ Page loads instantly on return visits
3. ✅ Mutations trigger automatic refetch
4. ✅ No manual refresh needed after updates
5. ✅ Data stays fresh for 5 minutes
6. ✅ Background refetching happens automatically

---

## 🎯 Quick Verification Commands

### Check Network Activity:
```javascript
// In browser console
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/admin/'))
  .forEach(r => console.log(r.name));
```

### Monitor Cache:
```javascript
// With React Query DevTools installed
// Open DevTools panel to see all cached queries
```

---

**Status:** Ready to Test  
**Expected Behavior:** 80% reduction in API calls  
**User Experience:** Instant page loads on cached data

