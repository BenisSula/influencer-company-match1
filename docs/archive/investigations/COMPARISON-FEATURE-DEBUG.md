# Comparison Feature Debug Guide

## Issue
Checkboxes on match cards are not working - nothing happens when clicked.

## Debug Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for:
- Any error messages
- Debug logs from ComparisonCheckbox, ComparisonContext, and ComparisonBar
- Look for messages starting with `[ComparisonCheckbox]`, `[ComparisonContext]`, `[ComparisonBar]`

### 2. Verify Component Rendering
In the browser console, run:
```javascript
// Check if ComparisonContext is available
console.log('Testing comparison context...');

// Check if checkboxes are rendered
document.querySelectorAll('.comparison-checkbox').length
```

### 3. Check React DevTools
1. Install React DevTools extension
2. Open Components tab
3. Find a MatchCard component
4. Look for ComparisonCheckbox child
5. Check if useComparison hook returns valid functions

### 4. Manual Test in Console
```javascript
// Test if context is working
const testCheckbox = document.querySelector('.comparison-checkbox input');
if (testCheckbox) {
  console.log('Checkbox found:', testCheckbox);
  console.log('Checkbox checked:', testCheckbox.checked);
  testCheckbox.click();
} else {
  console.log('No checkbox found!');
}
```

## Expected Console Output

When clicking a checkbox, you should see:
```
[ComparisonCheckbox] Checkbox clicked: { matchId: "...", isChecked: false, canAddMore: true }
[ComparisonCheckbox] Adding to comparison
[ComparisonContext] addToComparison called: { matchId: "...", currentCount: 0, maxAllowed: 3 }
[ComparisonContext] Adding match, new selection: ["..."]
[ComparisonBar] Rendering with selectedMatches: ["..."]
```

## Common Issues & Fixes

### Issue 1: "useComparison must be used within ComparisonProvider"
**Fix:** ComparisonProvider is already in AppComponent.tsx - check if app restarted after adding it

### Issue 2: Checkbox not visible
**Check:**
- Is ComparisonCheckbox.css loaded?
- Is the checkbox hidden by CSS?
- Inspect element to see if it's rendered

### Issue 3: Click not registering
**Check:**
- Is there a z-index issue?
- Is another element overlaying the checkbox?
- Try clicking the label text instead

### Issue 4: Context not updating
**Check:**
- Are there multiple instances of React running?
- Is hot reload causing issues? (Try full page refresh)

## Files to Check

1. **src/renderer/AppComponent.tsx**
   - Verify ComparisonProvider wraps BrowserRouter
   - Line 36: `<ComparisonProvider>`

2. **src/renderer/pages/Matches.tsx**
   - Verify ComparisonBar is rendered
   - Line 56: `<ComparisonBar />`

3. **src/renderer/components/MatchCard/MatchCard.tsx**
   - Verify ComparisonCheckbox is imported (line 10)
   - Verify it's rendered in JSX (around line 245)

4. **src/renderer/contexts/ComparisonContext.tsx**
   - Check if context is properly exported
   - Check if provider wraps children

## Quick Fix Attempts

### Attempt 1: Hard Refresh
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Try again

### Attempt 2: Restart Dev Server
```bash
# Stop frontend (Ctrl+C)
# Restart
npm run dev
```

### Attempt 3: Check for TypeScript Errors
```bash
npm run type-check
```

### Attempt 4: Verify Dependencies
```bash
npm list react react-dom
# Should show same version for both
```

## Test Checklist

- [ ] Browser console shows no errors
- [ ] ComparisonCheckbox component renders
- [ ] Checkbox is visible and clickable
- [ ] Console logs appear when clicking
- [ ] ComparisonBar appears after selection
- [ ] Can select up to 3 matches
- [ ] 4th checkbox is disabled
- [ ] Clear button works
- [ ] Compare button navigates correctly

## If Still Not Working

### Check CSS Specificity
The checkbox might be rendered but hidden. Check:
```css
/* In ComparisonCheckbox.css */
.comparison-checkbox {
  display: flex; /* Should be visible */
  z-index: 10; /* Should be on top */
}
```

### Check Match ID
The matchId prop might be undefined:
```typescript
// In MatchCard.tsx
console.log('Match ID:', match.id);
// Should log a valid ID, not undefined
```

### Verify Context Export
```typescript
// In ComparisonContext.tsx
// Make sure these are exported:
export const ComparisonProvider = ...
export const useComparison = ...
```

## Nuclear Option: Rebuild

If nothing works:
```bash
# Stop all servers
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev
```

## Report Issue

If still not working, provide:
1. Browser console screenshot
2. React DevTools screenshot
3. Network tab (any failed requests?)
4. Browser and version
5. Operating system

---

**Status:** Debugging in progress
**Added:** Debug logging to ComparisonCheckbox, ComparisonContext, and ComparisonBar
**Next:** Check browser console for debug output
