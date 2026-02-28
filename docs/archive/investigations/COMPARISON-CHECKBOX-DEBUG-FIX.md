# Comparison Checkbox Debug & Fix

## Changes Made

### 1. Added Debug Logging

**ComparisonCheckbox.tsx:**
- Added console.log on render to show matchId
- Added console.log to show component state (isChecked, isDisabled, canAddMore)
- Added console.log on checkbox click
- Added temporary red border for visibility testing

**ComparisonContext.tsx:**
- Added console.log in addToComparison
- Added console.log in removeFromComparison  
- Added console.log in clearComparison
- Logs show current state and new state

**ComparisonBar.tsx:**
- Added console.log on render showing selectedMatches
- Added console.log when hiding bar (no matches)
- Added console.log when Compare button clicked

### 2. Visual Debug Aid
Added `style={{ border: '1px solid red' }}` to ComparisonCheckbox wrapper to make it visible during testing.

## How to Test

### Step 1: Open Browser Console
1. Open the app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Clear console (trash icon)

### Step 2: Navigate to Matches
1. Go to /matches page
2. Look for match cards
3. You should see red borders around checkboxes (if rendered)

### Step 3: Check Console Output
You should see logs like:
```
[ComparisonCheckbox] Rendering for matchId: abc123
[ComparisonCheckbox] State: { matchId: "abc123", isChecked: false, isDisabled: false, canAddMore: true }
[ComparisonBar] Rendering with selectedMatches: []
[ComparisonBar] No matches selected, hiding bar
```

### Step 4: Click a Checkbox
When you click, you should see:
```
[ComparisonCheckbox] Checkbox clicked: { matchId: "abc123", isChecked: false, canAddMore: true }
[ComparisonCheckbox] Adding to comparison
[ComparisonContext] addToComparison called: { matchId: "abc123", currentCount: 0, maxAllowed: 3 }
[ComparisonContext] Adding match, new selection: ["abc123"]
[ComparisonBar] Rendering with selectedMatches: ["abc123"]
```

### Step 5: Check if Bar Appears
After selecting a match, the ComparisonBar should appear at the bottom of the screen.

## Possible Issues & Solutions

### Issue 1: No Console Logs at All
**Problem:** Component not rendering
**Check:**
- Is MatchCard rendering ComparisonCheckbox?
- Open React DevTools and find MatchCard component
- Look for ComparisonCheckbox child

**Fix:** Verify MatchCard.tsx line ~245 has:
```tsx
<ComparisonCheckbox matchId={match.id} />
```

### Issue 2: "useComparison is not a function" Error
**Problem:** Context not available
**Check:**
- Is ComparisonProvider in AppComponent.tsx?
- Did you restart the dev server after adding it?

**Fix:** 
```bash
# Stop dev server (Ctrl+C)
# Restart
npm run dev
```

### Issue 3: matchId is undefined
**Problem:** Match object doesn't have id
**Check Console for:**
```
[ComparisonCheckbox] Rendering for matchId: undefined
```

**Fix:** Check matching.service.ts transformMatch function ensures id is set

### Issue 4: Checkbox Visible but Click Does Nothing
**Problem:** Event handler not firing
**Check:**
- Is there a z-index issue?
- Is another element overlaying it?
- Try clicking the "Compare" text instead of checkbox

**Fix:** Inspect element in DevTools, check computed styles

### Issue 5: Context Updates but Bar Doesn't Appear
**Problem:** ComparisonBar not rendering
**Check Console for:**
```
[ComparisonBar] Rendering with selectedMatches: ["abc123"]
```
But bar not visible on screen.

**Fix:** Check ComparisonBar.css - might be hidden or positioned off-screen

### Issue 6: Red Border Not Visible
**Problem:** Component not rendering at all
**Check:**
- View page source, search for "comparison-checkbox"
- If not found, component isn't rendering

**Fix:** Check MatchCard integration

## Expected Behavior

### When Working Correctly:

1. **Page Load:**
   - See red borders around checkboxes on each match card
   - Console shows render logs for each checkbox
   - ComparisonBar logs "No matches selected, hiding bar"

2. **Click First Checkbox:**
   - Checkbox becomes checked
   - Console shows click → add → context update → bar render
   - ComparisonBar appears at bottom with "1 match selected"

3. **Click Second Checkbox:**
   - Second checkbox becomes checked
   - Console shows same flow
   - ComparisonBar shows "2 matches selected" + "Ready to compare"
   - Compare button becomes enabled

4. **Click Third Checkbox:**
   - Third checkbox becomes checked
   - ComparisonBar shows "3 matches selected"
   - Fourth checkbox becomes disabled with "Max 3 matches" hint

5. **Click Compare Button:**
   - Console shows navigation log
   - Browser navigates to /matches/compare?ids=...

## Next Steps After Testing

### If Working:
1. Remove red border from ComparisonCheckbox.tsx
2. Remove or reduce console.log statements (keep minimal logging)
3. Test full comparison flow
4. Test on mobile

### If Not Working:
1. Share console output
2. Share React DevTools screenshot
3. Share Network tab (check for errors)
4. Check if there are any TypeScript errors

## Files Modified

1. `src/renderer/components/ComparisonCheckbox/ComparisonCheckbox.tsx`
   - Added debug logging
   - Added red border for visibility

2. `src/renderer/contexts/ComparisonContext.tsx`
   - Added debug logging to all functions

3. `src/renderer/components/ComparisonBar/ComparisonBar.tsx`
   - Added debug logging to render and click handler

## Cleanup After Debug

Once working, remove:
```tsx
// Remove this line:
style={{ border: '1px solid red' }}

// Optionally reduce logging to:
console.log('[ComparisonCheckbox] Click:', matchId);
// Instead of multiple detailed logs
```

---

**Status:** Debug version deployed
**Test:** Open browser console and click checkboxes
**Report:** Share console output if not working
