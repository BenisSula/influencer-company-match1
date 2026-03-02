# Feed Card Action Bar Overflow Fix

**Date:** February 11, 2026  
**Issue:** Save button becomes invisible when likes/comments are present  
**Status:** 🔍 INVESTIGATION COMPLETE - FIX PLAN READY

---

## Problem Analysis

### Root Cause ✅

The ActionBar component uses `flex: 1` on each button, causing them to grow equally. When reaction counts or comment counts are displayed, the buttons become wider and the 5 buttons (Like, Comment, Message, Share, Save) overflow the card container, pushing the "Save" button out of view.

### Visual Evidence

From the uploaded image:
- "1 reaction" is displayed above the action bar
- The action bar shows: Like (with count 1), Comment, Message, Share
- The "Save" button is cut off and invisible

### Technical Details

**Current CSS (ActionBar.css):**
```css
.action-bar-item {
  flex: 1;  /* ← This causes equal growth */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  min-height: 48px;
}
```

**Problem:**
- 5 buttons × flexible width = potential overflow
- When counts are added (e.g., "Like 1", "Comment 5"), buttons get wider
- Container has fixed width from card
- Last button (Save) gets pushed out

---

## Solution Strategy

### Option 1: Flexible Wrapping (Recommended) ✅

Allow the action bar to wrap to a second row if needed, ensuring all buttons remain visible.

**Pros:**
- All buttons always visible
- Maintains button size and readability
- Works on all screen sizes
- No content truncation

**Cons:**
- Takes more vertical space when wrapped
- Slightly different layout when counts are present

### Option 2: Shrink to Fit

Remove `flex: 1` and let buttons size naturally, with overflow handling.

**Pros:**
- Single row maintained
- Compact layout

**Cons:**
- Buttons may become too small
- Text may need truncation
- Poor UX on mobile

### Option 3: Hide Labels on Overflow

Show only icons when space is limited.

**Pros:**
- Compact
- Always fits

**Cons:**
- Reduced clarity
- Accessibility concerns

---

## Recommended Fix: Flexible Wrapping

### Changes Required

#### 1. Update ActionBar.css

**File:** `src/renderer/components/ActionBar/ActionBar.css`

```css
.action-bar {
  display: flex;
  flex-wrap: wrap; /* ← Allow wrapping */
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid #E4E6EB;
  border-bottom: 1px solid #E4E6EB;
}

.action-bar-item {
  flex: 1 1 auto; /* ← Changed from flex: 1 */
  min-width: 0; /* ← Prevent overflow */
  max-width: 150px; /* ← Limit maximum width */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  color: #65676B;
  position: relative;
  padding: 0.625rem 1rem;
  min-height: 48px;
}

/* Ensure minimum width for buttons */
@media (min-width: 769px) {
  .action-bar-item {
    min-width: 100px; /* ← Minimum width on desktop */
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .action-bar {
    gap: 0.25rem;
  }
  
  .action-bar-item {
    flex: 1 1 calc(33.333% - 0.25rem); /* ← 3 per row on tablet */
    min-width: 0;
    max-width: none;
    padding: 0.5rem 0.5rem;
    min-height: 44px;
  }
  
  .action-bar-label {
    font-size: 0.875rem;
  }
  
  .action-bar-icon {
    font-size: 1.125rem;
  }
}

@media (max-width: 640px) {
  .action-bar-item {
    flex: 1 1 calc(50% - 0.25rem); /* ← 2-3 per row on mobile */
    min-width: 80px;
  }
  
  /* Keep labels on mobile for clarity */
  .action-bar-label {
    display: inline;
    font-size: 0.8125rem;
  }
  
  .action-bar-icon {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .action-bar-item {
    flex: 1 1 calc(50% - 0.125rem); /* ← 2 per row on small mobile */
    padding: 0.5rem 0.375rem;
  }
}
```

#### 2. Update FeedPost.css (Optional Enhancement)

**File:** `src/renderer/components/FeedPost/FeedPost.css`

```css
.feed-post-action-bar-wrapper {
  position: relative;
  /* Ensure wrapper doesn't constrain the action bar */
  overflow: visible;
}

/* Add padding to accommodate wrapped buttons */
.feed-post-actions-container {
  padding: 0 1.5rem 1rem;
  /* Allow natural height expansion */
  min-height: auto;
}
```

---

## Alternative Fix: Compact Mode

If wrapping is not desired, implement a compact mode:

### Changes for Compact Mode

```css
.action-bar {
  display: flex;
  gap: 0.25rem; /* ← Reduced gap */
  padding: 0.75rem 0;
  border-top: 1px solid #E4E6EB;
  border-bottom: 1px solid #E4E6EB;
  overflow-x: auto; /* ← Allow horizontal scroll if needed */
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.action-bar-item {
  flex: 0 0 auto; /* ← Don't grow or shrink */
  min-width: fit-content; /* ← Size to content */
  max-width: 140px; /* ← Limit maximum */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem; /* ← Reduced gap */
  padding: 0.625rem 0.75rem; /* ← Reduced padding */
  /* ... rest of styles ... */
}

/* Hide scrollbar but keep functionality */
.action-bar::-webkit-scrollbar {
  display: none;
}

.action-bar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

---

## Testing Checklist

### Desktop (1920px+) ✅
- [ ] All 5 buttons visible without wrapping
- [ ] Buttons have adequate spacing
- [ ] Hover states work correctly
- [ ] Counts display properly

### Tablet (768px - 1024px) ✅
- [ ] Buttons wrap to 2 rows if needed
- [ ] All buttons remain visible
- [ ] Touch targets are 44px minimum
- [ ] Layout looks balanced

### Mobile (375px - 640px) ✅
- [ ] Buttons wrap appropriately
- [ ] Labels remain visible
- [ ] Icons are clear
- [ ] No horizontal overflow

### Edge Cases ✅
- [ ] Post with 0 reactions/comments
- [ ] Post with 1 reaction
- [ ] Post with 100+ reactions
- [ ] Post with 50+ comments
- [ ] Long share counts

---

## Implementation Priority

### Phase 1: Critical Fix (Immediate) ✅
1. Add `flex-wrap: wrap` to `.action-bar`
2. Change `flex: 1` to `flex: 1 1 auto` on `.action-bar-item`
3. Add `min-width: 0` to prevent overflow
4. Test on all screen sizes

### Phase 2: Polish (Next) ✅
1. Add `max-width` constraints
2. Optimize responsive breakpoints
3. Fine-tune spacing and gaps
4. Add smooth transitions

### Phase 3: Enhancement (Future) ✅
1. Consider icon-only mode for very small screens
2. Add tooltips for icon-only buttons
3. Implement smart hiding (hide Message button for own posts)
4. Add animation for wrap transitions

---

## Expected Results

### Before Fix ❌
```
[Like 1] [Comment] [Message] [Share] [Sa...] ← Save cut off
```

### After Fix ✅
```
[Like 1] [Comment] [Message] [Share] [Save]
```

Or if wrapping:
```
[Like 1] [Comment] [Message]
[Share]  [Save]
```

---

## Accessibility Considerations

### Touch Targets ✅
- Minimum 44px height maintained
- Adequate spacing between buttons
- Clear visual feedback on interaction

### Screen Readers ✅
- All buttons have clear labels
- Counts are announced properly
- Active states are indicated

### Keyboard Navigation ✅
- Tab order remains logical
- Focus states are visible
- Enter/Space activate buttons

---

## Browser Compatibility

### Supported ✅
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### CSS Features Used ✅
- Flexbox (widely supported)
- flex-wrap (widely supported)
- Media queries (widely supported)
- CSS custom properties (widely supported)

---

## Rollback Plan

If issues arise:

1. Revert ActionBar.css changes
2. Implement temporary fix:
   ```css
   .action-bar {
     overflow-x: auto;
   }
   ```
3. Hide labels on mobile as fallback:
   ```css
   @media (max-width: 640px) {
     .action-bar-label { display: none; }
   }
   ```

---

## Summary

The fix involves making the action bar flexible with wrapping capability, ensuring all buttons remain visible regardless of content width. This maintains usability while handling dynamic content (reaction counts, comment counts) gracefully.

**Primary Change:** Add `flex-wrap: wrap` and adjust flex properties to allow natural sizing with wrapping.

**Impact:** Low risk, high reward - fixes critical UX issue without breaking existing functionality.

**Estimated Time:** 15 minutes implementation + 15 minutes testing = 30 minutes total.
