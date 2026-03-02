# Collaboration Request - Testing Guide 🧪

## Quick Test (2 minutes)

### Prerequisites
- Backend server running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- Database seeded with test data

### Test Steps

1. **Login as Mike Chen**
   ```
   Email: mike.tech@example.com
   Password: Password123!
   ```

2. **Check Dashboard**
   - Look for "Collaboration Requests" widget
   - Should show: "🕐 Pending (1)"
   - Should display: TechStartup Inc

3. **Verify Display**
   - ✅ Avatar shows "TS" or company logo
   - ✅ Name: "TechStartup Inc"
   - ✅ Type: "brand ambassador" (in blue)
   - ✅ Budget: "$300 - $850" (in green)
   - ✅ Date: "Feb 14, 2026"
   - ✅ Clock icon (🕐) on the right

4. **Test Interaction**
   - Click on the request card
   - Should navigate to `/connections`
   - Should see connections page

---

## Automated Test Script

### Run Test
```bash
cd influencer-company-match1
node test-collaboration-widget-fix.js
```

### Expected Output
```
🧪 Testing Collaboration Widget Fix

════════════════════════════════════════════════════════════

1️⃣  Logging in as Mike Chen...
✅ Logged in successfully
   User ID: 993f1674-3aa6-4512-bf85-80b73931d863
   Name: Mike Chen

2️⃣  Fetching connections...
✅ Found 1 connection(s)

3️⃣  Analyzing connections for collaboration requests...
────────────────────────────────────────────────────────────

📋 Connection 1:
   ID: e6151e7e-489c-4ae8-b456-e085822c1bf0
   Connection Status: accepted
   Collaboration Status: requested
   Partner: TechStartup Inc
   Partner Industry/Niche: Technology
   📝 Collaboration Request Data:
      Type: brand_ambassador
      Budget: $300 - $850
      Timeline: ASAP
      Message: Hi Mike, I'm reaching out from TechStartup Inc...

4️⃣  Filtering by collaboration status...
────────────────────────────────────────────────────────────

✅ Pending Collaboration Requests: 1
   1. TechStartup Inc
      Type: brand_ambassador
      Budget: $300 - $850

✅ Active Collaborations: 0

5️⃣  Testing OLD filtering logic (what was broken)...
────────────────────────────────────────────────────────────

❌ OLD Logic - Pending Requests: 0
   (This is why Mike couldn't see the request!)

📊 SUMMARY
════════════════════════════════════════════════════════════
Total Connections: 1

🔧 NEW Logic (FIXED):
   Pending Collaboration Requests: 1 ✅
   Active Collaborations: 0 ✅

❌ OLD Logic (BROKEN):
   Pending Requests: 0 ❌

✅ SUCCESS! Mike can now see collaboration requests!

════════════════════════════════════════════════════════════
```

---

## Manual Testing Checklist

### Dashboard Widget

#### Visual Tests
- [ ] Widget title shows "Collaboration Requests"
- [ ] Widget has briefcase icon (💼)
- [ ] "View All" button is visible
- [ ] Section header shows "🕐 Pending (1)"
- [ ] Request card displays correctly

#### Content Tests
- [ ] Avatar shows (either image or initials)
- [ ] Company name: "TechStartup Inc"
- [ ] Collaboration type: "brand ambassador"
- [ ] Budget range: "$300 - $850"
- [ ] Date: "Feb 14, 2026"
- [ ] Status icon: Clock (🕐)

#### Interaction Tests
- [ ] Hover over card changes background
- [ ] Click on card navigates to /connections
- [ ] Click "View All" navigates to /connections
- [ ] No console errors

#### Responsive Tests
- [ ] Desktop view (> 768px) looks good
- [ ] Mobile view (≤ 768px) looks good
- [ ] Text doesn't overflow
- [ ] Avatar scales appropriately

---

## Browser Testing

### Chrome
- [ ] Widget displays correctly
- [ ] Interactions work
- [ ] No console errors

### Firefox
- [ ] Widget displays correctly
- [ ] Interactions work
- [ ] No console errors

### Safari
- [ ] Widget displays correctly
- [ ] Interactions work
- [ ] No console errors

### Edge
- [ ] Widget displays correctly
- [ ] Interactions work
- [ ] No console errors

---

## Data Scenarios

### Scenario 1: One Pending Request (Current)
```
Database:
  collaboration_status: 'requested'

Expected:
  🕐 Pending (1)
  - TechStartup Inc
```

### Scenario 2: Multiple Pending Requests
```
Database:
  3 connections with collaboration_status: 'requested'

Expected:
  🕐 Pending (3)
  - TechStartup Inc
  - Another Company
  - Third Company
  (Shows first 3)
```

### Scenario 3: Active Collaboration
```
Database:
  collaboration_status: 'active'

Expected:
  ✅ Active (1)
  - TechStartup Inc
```

### Scenario 4: No Requests
```
Database:
  No connections with collaboration_status

Expected:
  📋 No collaboration requests yet
```

### Scenario 5: Mixed Status
```
Database:
  2 with collaboration_status: 'requested'
  1 with collaboration_status: 'active'

Expected:
  🕐 Pending (2)
  - Company A
  - Company B
  
  ✅ Active (1)
  - Company C
```

---

## Edge Cases

### Missing Data
- [ ] No avatar URL → Shows initials
- [ ] No collaboration type → Doesn't show type line
- [ ] No budget → Doesn't show budget line
- [ ] No name → Shows "Unknown"

### Long Text
- [ ] Long company name → Truncates with ellipsis
- [ ] Long collaboration type → Wraps or truncates
- [ ] Large budget numbers → Formats correctly

### Date Formatting
- [ ] Today's date → Shows correctly
- [ ] Past date → Shows correctly
- [ ] Future date → Shows correctly
- [ ] Invalid date → Handles gracefully

---

## Performance Tests

### Load Time
- [ ] Widget loads within 1 second
- [ ] No flickering during load
- [ ] Loading state shows if needed

### Data Fetching
- [ ] Connections API called once
- [ ] No duplicate requests
- [ ] Caching works (if implemented)

### Rendering
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] No jank or lag

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Can tab to widget
- [ ] Can tab to request cards
- [ ] Can activate with Enter/Space
- [ ] Focus visible

### Screen Reader
- [ ] Widget title announced
- [ ] Request count announced
- [ ] Company names announced
- [ ] Status announced

### Color Contrast
- [ ] Text readable on background
- [ ] Icons visible
- [ ] Status colors distinguishable

---

## Error Handling

### Network Errors
- [ ] API failure shows error message
- [ ] Retry mechanism works
- [ ] Doesn't crash app

### Invalid Data
- [ ] Handles null/undefined gracefully
- [ ] Handles empty arrays
- [ ] Handles malformed data

### Authentication
- [ ] Redirects if not logged in
- [ ] Handles expired token
- [ ] Shows appropriate message

---

## Regression Tests

### Existing Functionality
- [ ] Other dashboard widgets still work
- [ ] Navigation still works
- [ ] Profile still loads
- [ ] Messages still work
- [ ] Feed still works

### Data Integrity
- [ ] Doesn't modify connection data
- [ ] Doesn't affect other users
- [ ] Database queries correct

---

## Test Users

### Mike Chen (Influencer)
```
Email: mike.tech@example.com
Password: Password123!
Expected: See 1 pending request from TechStartup Inc
```

### TechStartup Inc (Company)
```
Email: contact@techstartup.com
Password: Password123!
Expected: See sent request in their connections
```

### Sarah Johnson (Influencer)
```
Email: sarah.fashion@example.com
Password: Password123!
Expected: No collaboration requests (if none sent)
```

---

## Debug Tools

### Browser DevTools

#### Console
```javascript
// Check connections data
console.log(connections);

// Check filtered requests
console.log(pendingRequests);

// Check collaboration status
connections.forEach(c => {
  console.log(c.collaboration_status, c.status);
});
```

#### Network Tab
```
Check API calls:
  GET /api/matching/connections
  
Response should include:
  - collaboration_status
  - collaboration_request_data
```

#### React DevTools
```
Find CollaborationRequestsWidget component
Check props:
  - requests (should have data)
  - loading (should be false)
  - error (should be null)
```

---

## Common Issues & Solutions

### Issue 1: Widget Shows "No requests"
**Cause**: Filtering by wrong field  
**Solution**: Check filtering logic uses `collaboration_status`

### Issue 2: Budget not showing
**Cause**: Missing `collaboration_request_data`  
**Solution**: Verify backend returns full data

### Issue 3: Type not formatted
**Cause**: Underscore not replaced  
**Solution**: Check `.replace(/_/g, ' ')` is applied

### Issue 4: Click doesn't navigate
**Cause**: onClick handler missing  
**Solution**: Verify `onClick={() => navigate('/connections')}`

### Issue 5: Avatar not showing
**Cause**: Missing avatarUrl or name  
**Solution**: Check Avatar component handles fallback

---

## Success Criteria

### Must Have ✅
- [x] Widget filters by `collaboration_status`
- [x] Shows pending requests count
- [x] Displays company name
- [x] Shows collaboration type
- [x] Shows budget range
- [x] Shows date
- [x] Shows status icon
- [x] Click navigates to connections

### Nice to Have ⏳
- [ ] Real-time updates
- [ ] Badge notification
- [ ] Accept/Reject buttons
- [ ] Full message preview
- [ ] Email notifications

---

## Test Report Template

```markdown
# Test Report: Collaboration Request Widget

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]

## Test Results

### Dashboard Widget
- Visual Display: ✅ / ❌
- Content Accuracy: ✅ / ❌
- Interactions: ✅ / ❌
- Responsive: ✅ / ❌

### Data Filtering
- Pending Requests: ✅ / ❌
- Active Collaborations: ✅ / ❌
- Empty State: ✅ / ❌

### Browser Compatibility
- Chrome: ✅ / ❌
- Firefox: ✅ / ❌
- Safari: ✅ / ❌
- Edge: ✅ / ❌

### Issues Found
1. [Issue description]
2. [Issue description]

### Screenshots
[Attach screenshots]

### Conclusion
✅ PASS / ❌ FAIL

### Notes
[Additional notes]
```

---

## Next Steps After Testing

### If Tests Pass ✅
1. Mark feature as complete
2. Update documentation
3. Deploy to staging
4. User acceptance testing
5. Deploy to production

### If Tests Fail ❌
1. Document issues
2. Create bug tickets
3. Fix issues
4. Re-test
5. Repeat until pass

---

**Testing Status**: Ready for testing  
**Estimated Time**: 15-30 minutes  
**Priority**: HIGH  
**Blocker**: None
