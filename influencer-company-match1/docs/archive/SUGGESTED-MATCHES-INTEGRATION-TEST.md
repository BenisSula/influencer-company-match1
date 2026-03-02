# Suggested Matches - Integration Test & Verification

## Test Plan

This document outlines the complete integration testing process for the Suggested Matches feature.

## Prerequisites

### 1. Database Setup
Ensure you have test data in the database:
- At least 2 influencer users with complete profiles
- At least 2 company users with complete profiles
- Users should have different niches/industries for variety

### 2. Backend Running
```bash
cd backend
npm run start:dev
```

Backend should be running on `http://localhost:3000`

### 3. Frontend Running
```bash
npm run dev
```

Frontend should be running on `http://localhost:5173` (or configured port)

## Integration Test Steps

### Step 1: Verify Backend Endpoint

Test the `/matches` endpoint directly:

```bash
# Get auth token first (login)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use the token to get matches
curl -X GET http://localhost:3000/matches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
[
  {
    "id": "user-id",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "role": "COMPANY",
      "name": "Company Name",
      "industry": "Fashion",
      "budget": 50000,
      "location": "New York, NY",
      "platforms": ["Instagram", "TikTok"]
    },
    "score": 85,
    "factors": {
      "nicheCompatibility": 90,
      "locationCompatibility": 80,
      "budgetAlignment": 85,
      "platformOverlap": 90,
      "audienceSizeMatch": 75,
      "engagementTierMatch": 80
    }
  }
]
```

### Step 2: Verify Frontend Service

Open browser DevTools Console and check for:

```
[useSuggestedMatches] Fetching suggestions for user: <userId>
[SuggestionsService] Fetching suggested matches with limit: 8
[SuggestionsService] Raw response: {...}
[SuggestionsService] Response data length: X
[SuggestionsService] Transformed suggestions: X [...]
[useSuggestedMatches] Received suggestions: X
[SuggestedMatchesList] Render state: { suggestionsCount: X, loading: false, error: null }
```

### Step 3: Visual Verification

Check the right sidebar for:
- ✅ "Suggested Matches" header with refresh icon
- ✅ Match cards displaying
- ✅ Professional icons (not emojis)
- ✅ Score badges with correct colors
- ✅ Tier badges (Perfect/Excellent/Good/Fair)
- ✅ Hover effects working
- ✅ Click navigation to profile

### Step 4: Data Accuracy Test

For each suggested match card, verify:
- ✅ Avatar displays correctly
- ✅ Name matches backend data
- ✅ Niche/Industry displays correctly
- ✅ Location shows (first part only)
- ✅ Stats show with icons:
  - Influencers: Audience size + Engagement rate
  - Companies: Budget + Company size
- ✅ Score badge color matches score range:
  - 90-100: Green
  - 75-89: Blue
  - 60-74: Orange
  - <60: Gray

### Step 5: Interaction Test

Test user interactions:
- ✅ Click match card → navigates to profile
- ✅ Keyboard navigation (Tab + Enter)
- ✅ Refresh button → reloads suggestions
- ✅ Refresh button shows spinning animation
- ✅ "View All Matches" button → navigates to /matches

### Step 6: Edge Cases

Test edge cases:
- ✅ No matches available → shows empty state
- ✅ API error → shows error with retry button
- ✅ Loading state → shows spinner
- ✅ Cached data → returns instantly on second load
- ✅ Cache expiry → refetches after 5 minutes

## Common Issues & Solutions

### Issue 1: No Suggestions Showing

**Symptoms:**
- Right sidebar shows "No suggestions available yet"
- Console shows: `[SuggestionsService] No matches returned from backend`

**Diagnosis:**
```javascript
// Check console for:
[SuggestionsService] Response data length: 0
```

**Solutions:**
1. **No opposite role users exist**
   - Create test users of both roles
   - Ensure users have `isActive: true`

2. **All scores below threshold**
   - Check console for actual scores
   - Lower minScore in `suggestions.service.ts`:
   ```typescript
   minScore: 40, // or lower
   ```

3. **Backend not returning data**
   - Check backend logs
   - Verify database has users
   - Test `/matches` endpoint directly

### Issue 2: Icons Not Displaying

**Symptoms:**
- Boxes or missing icons where stats should be

**Solutions:**
1. Verify react-icons installed:
   ```bash
   npm list react-icons
   ```

2. If not installed:
   ```bash
   npm install react-icons
   ```

3. Clear cache and rebuild:
   ```bash
   npm run dev -- --force
   ```

### Issue 3: Scores Not Matching

**Symptoms:**
- Frontend shows different scores than backend

**Diagnosis:**
- Check transformation in `matching.service.ts`
- Verify `calculateMatchScore` logic

**Solution:**
- Ensure frontend correctly reads `match.score`
- Check console logs for transformation

### Issue 4: Authentication Errors

**Symptoms:**
- Console shows 401 Unauthorized
- No matches load

**Solutions:**
1. Check JWT token in localStorage:
   ```javascript
   localStorage.getItem('token')
   ```

2. Re-login if token expired

3. Verify backend JWT configuration

### Issue 5: Profile Navigation Fails

**Symptoms:**
- Clicking match card doesn't navigate
- 404 error on profile page

**Solutions:**
1. Verify profile route exists:
   ```typescript
   <Route path="/profile/:id" element={<ProfileView />} />
   ```

2. Check match.id is correct user ID

3. Verify ProfileView component handles the ID parameter

## Performance Benchmarks

Expected performance metrics:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Initial Load (no cache) | <500ms | <1000ms | >1000ms |
| Cached Load | <100ms | <200ms | >200ms |
| Render Time | <50ms | <100ms | >100ms |
| API Response | <300ms | <600ms | >600ms |

## Browser Compatibility Test

Test in multiple browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Responsive Design Test

Test at different screen sizes:
- ✅ Desktop (>1024px) - Right sidebar visible
- ✅ Tablet (768-1024px) - Right sidebar hidden
- ✅ Mobile (<768px) - Right sidebar hidden

## Accessibility Test

Verify accessibility features:
- ✅ Keyboard navigation works
- ✅ Screen reader announces elements
- ✅ ARIA labels present
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA

## Load Testing

Test with varying data volumes:
- ✅ 0 matches - Empty state
- ✅ 1-5 matches - Normal display
- ✅ 6-8 matches - Full sidebar
- ✅ 8+ matches - "View All" button shows

## Integration Checklist

- [ ] Backend endpoint returns correct data structure
- [ ] Frontend service transforms data correctly
- [ ] Component renders without errors
- [ ] Professional icons display (no emojis)
- [ ] Scores and tiers calculate correctly
- [ ] Navigation works properly
- [ ] Caching functions as expected
- [ ] Error handling works
- [ ] Loading states display
- [ ] Empty states display
- [ ] Refresh functionality works
- [ ] Responsive design works
- [ ] Accessibility features work
- [ ] Performance meets targets
- [ ] Browser compatibility verified

## Success Criteria

The integration is successful when:

1. ✅ Backend returns matches with proper structure
2. ✅ Frontend displays matches in right sidebar
3. ✅ All icons are professional React icons
4. ✅ No console errors
5. ✅ Scores and tiers display correctly
6. ✅ Navigation works smoothly
7. ✅ Performance is acceptable
8. ✅ All edge cases handled
9. ✅ Accessibility standards met
10. ✅ Responsive design works

## Debugging Commands

### Check Backend Health
```bash
curl http://localhost:3000/health
```

### Check Database Connection
```bash
# In backend directory
npm run typeorm query "SELECT COUNT(*) FROM users"
```

### Check Frontend Build
```bash
npm run build
```

### Clear All Caches
```bash
# Clear browser cache
# Clear localStorage
localStorage.clear()

# Clear service cache
suggestionsService.clearCache()
```

## Next Steps After Integration

1. **Monitor Production**
   - Track API response times
   - Monitor error rates
   - Collect user feedback

2. **Optimize Performance**
   - Implement pagination if needed
   - Add more aggressive caching
   - Optimize database queries

3. **Enhance Features**
   - Add filtering options
   - Implement dismissal
   - Add favorites/bookmarks
   - Real-time updates via WebSocket

4. **A/B Testing**
   - Test different minScore thresholds
   - Test different UI layouts
   - Test different sorting algorithms

## Conclusion

This integration test ensures the Suggested Matches feature works correctly with live data, providing a seamless experience for users discovering potential collaboration partners.
