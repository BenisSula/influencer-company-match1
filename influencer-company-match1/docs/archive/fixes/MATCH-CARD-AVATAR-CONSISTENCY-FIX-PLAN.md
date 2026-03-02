# Match Card Avatar & Layout Consistency Fix Plan

## Investigation Summary

After investigating the codebase, I've identified the following issues and created a comprehensive fix plan:

### Current State Analysis

#### 1. **Top-Right User Avatar (Header)**
**Location:** `AppLayout.tsx` - Line 186-193
```tsx
<Avatar
  src={user?.avatarUrl}
  name={userName}
  email={user?.email}
  size="sm"  // 32px
  className="user-avatar-small"
/>
```
**CSS:** `.user-avatar-small` - 40px × 40px (overrides Avatar component's 32px)

#### 2. **Match Card Avatar**
**Location:** `MatchCard.tsx` - Line 207-213
```tsx
<Avatar
  src={profileData.avatarUrl}
  name={profileData.name}
  size="lg"  // 64px on desktop
  className="match-avatar"
  userId={profile.id}
  clickable={true}
  trackingContext="match_card"
/>
```
**CSS Mobile (480px):** `.match-avatar` - 40px × 40px
**CSS Mobile (375px):** `.match-avatar` - 36px × 36px

#### 3. **Compare Checkbox**
**Location:** `ComparisonCheckbox.tsx`
**CSS Mobile (480px):** 13px checkbox, 0.6875rem text
**CSS Mobile (375px):** 12px checkbox, 0.625rem text

#### 4. **Score Section**
**Location:** `MatchCard.css` - `.match-compatibility-section`
**Mobile (480px):** 60px min-width, 1.125rem score value
**Mobile (375px):** 55px min-width, 1rem score value

---

## Issues Identified

### Issue 1: Avatar Size Inconsistency
- **Problem:** Match card avatar uses different sizes than header avatar
- **Header:** 40px (consistent across all breakpoints)
- **Match Card:** 40px (480px), 36px (375px)
- **Solution:** Use 40px consistently across all breakpoints

### Issue 2: Compare Checkbox & Score Section in Same Container
- **Problem:** Both elements are in `.match-header-right` container, causing layout conflicts
- **Current Structure:**
```
.match-header-right
  ├── ComparisonCheckbox (grid row 3, col 2)
  └── .match-compatibility-section (grid row 1-2, col 3)
```
- **Solution:** Separate into distinct grid areas

### Issue 3: Label Font Sizes Need Reduction
- **Problem:** Text labels are too large on mobile
- **Name:** 0.875rem (480px), 0.8125rem (375px)
- **Category:** 0.75rem (480px), 0.6875rem (375px)
- **Solution:** Reduce by 10-15% for better mobile UX

### Issue 4: Score Section Needs Better Separation
- **Problem:** Score section visually blends with checkbox area
- **Solution:** Add visual separation (border, background, or spacing)

---

## Proposed Fixes

### Fix 1: Standardize Avatar Size to 40px
**File:** `src/renderer/components/MatchCard/MatchCard.css`

```css
/* Mobile (480px and below) */
@media (max-width: 480px) {
  .match-avatar {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }
}

/* Extra Small Mobile (375px and below) */
@media (max-width: 375px) {
  .match-avatar {
    width: 40px;  /* Keep consistent with header */
    height: 40px;
    font-size: 0.875rem;
  }
}
```

### Fix 2: Reduce Label Font Sizes
**File:** `src/renderer/components/MatchCard/MatchCard.css`

```css
/* Mobile (480px and below) */
@media (max-width: 480px) {
  .match-name {
    font-size: 0.8125rem;  /* Reduced from 0.875rem */
    line-height: 1.2;
    font-weight: 600;
  }
  
  .match-category {
    font-size: 0.6875rem;  /* Reduced from 0.75rem */
    line-height: 1.2;
  }
}

/* Extra Small Mobile (375px and below) */
@media (max-width: 375px) {
  .match-name {
    font-size: 0.75rem;  /* Reduced from 0.8125rem */
  }
  
  .match-category {
    font-size: 0.625rem;  /* Reduced from 0.6875rem */
  }
}
```

### Fix 3: Separate Compare Checkbox from Score Section
**File:** `src/renderer/components/MatchCard/MatchCard.css`

**Current Grid:**
```css
grid-template-columns: 40px 1fr auto;
grid-template-rows: auto auto auto;
```

**New Grid Structure:**
```css
/* Mobile (480px and below) */
@media (max-width: 480px) {
  .match-card-header {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    grid-template-rows: auto auto auto auto;  /* Add 4th row */
    gap: 0.375rem 0.5rem;
    align-items: start;
    margin-bottom: 1rem;
  }
  
  /* Avatar: Top-left, spans 2 rows */
  .match-avatar {
    grid-column: 1;
    grid-row: 1 / 3;
  }
  
  /* Name/Category: Row 1-2, Column 2 */
  .match-info {
    grid-column: 2;
    grid-row: 1 / 3;
  }
  
  /* Score Section: Row 1-2, Column 3 */
  .match-compatibility-section {
    grid-column: 3;
    grid-row: 1 / 3;
  }
  
  /* Compare Checkbox: Row 3, Column 2-3 (spans both) */
  .match-header-right {
    grid-column: 2 / 4;  /* Span columns 2-3 */
    grid-row: 3;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0.25rem;
  }
}
```

### Fix 4: Add Visual Separation to Score Section
**File:** `src/renderer/components/MatchCard/MatchCard.css`

```css
/* Mobile (480px and below) */
@media (max-width: 480px) {
  .match-compatibility-section {
    grid-column: 3;
    grid-row: 1 / 3;
    display: flex;
    flex-direction: column;
    padding: 0.375rem 0.5rem;
    gap: 0.25rem;
    min-width: 65px;  /* Slightly larger for better visibility */
    align-items: center;
    background: linear-gradient(135deg, #F8F9FA 0%, #F0F2F5 100%);
    border-radius: 8px;
    border: 1px solid #E4E6EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .compatibility-score-value {
    font-size: 1.25rem;  /* Slightly larger */
    font-weight: 700;
    line-height: 1;
    color: #1877F2;
  }
  
  .compatibility-score-label {
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1;
    margin-top: 0.125rem;
    color: #65676B;
  }
  
  .compatibility-breakdown-btn {
    padding: 0.25rem 0.4375rem;
    font-size: 0.625rem;
    gap: 0.1875rem;
    width: 100%;
    justify-content: center;
    border-width: 1px;
    margin-top: 0.125rem;
  }
}
```

### Fix 5: Reduce Compare Checkbox Size
**File:** `src/renderer/components/ComparisonCheckbox/ComparisonCheckbox.css`

```css
/* Mobile: Ultra-compact checkbox */
@media (max-width: 480px) {
  .comparison-checkbox {
    gap: 0;
  }
  
  .checkbox-label {
    padding: 2px 4px;
    font-size: 0.625rem;  /* Reduced from 0.6875rem */
    gap: 3px;
    border-radius: 4px;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 12px;  /* Reduced from 13px */
    height: 12px;
  }
  
  .checkbox-text {
    font-size: 0.625rem;  /* Reduced from 0.6875rem */
    font-weight: 500;
  }
}

/* Extra Small Mobile */
@media (max-width: 375px) {
  .checkbox-label {
    padding: 1px 3px;
    font-size: 0.5625rem;  /* Reduced from 0.625rem */
    gap: 2px;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 11px;  /* Reduced from 12px */
    height: 11px;
  }
  
  .checkbox-text {
    font-size: 0.5625rem;  /* Reduced from 0.625rem */
  }
}
```

---

## Implementation Steps

### Step 1: Update MatchCard Avatar Size
1. Open `src/renderer/components/MatchCard/MatchCard.css`
2. Update `.match-avatar` mobile breakpoints to use 40px consistently
3. Remove 36px size for 375px breakpoint

### Step 2: Reduce Label Font Sizes
1. Update `.match-name` font sizes in mobile breakpoints
2. Update `.match-category` font sizes in mobile breakpoints

### Step 3: Restructure Grid Layout
1. Add 4th row to grid template
2. Update grid positioning for all elements
3. Make compare checkbox span columns 2-3

### Step 4: Enhance Score Section Visual Design
1. Add gradient background
2. Add border and shadow
3. Increase min-width to 65px
4. Adjust internal spacing

### Step 5: Reduce Compare Checkbox Size
1. Open `src/renderer/components/ComparisonCheckbox/ComparisonCheckbox.css`
2. Reduce checkbox size to 12px (480px) and 11px (375px)
3. Reduce text size to 0.625rem (480px) and 0.5625rem (375px)

---

## Visual Comparison

### Before
```
┌─────────────────────────────────────┐
│ [Avatar]  Name              [Score] │
│   40px    Category           60px   │
│           [Compare ✓]               │
└─────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────┐
│ [Avatar]  Name              [Score] │
│   40px    Category           65px   │
│                                     │
│         [Compare ✓]                 │
└─────────────────────────────────────┘
```

**Key Changes:**
- Avatar: Consistent 40px across all breakpoints
- Name: 0.8125rem → 0.75rem (375px)
- Category: 0.6875rem → 0.625rem (375px)
- Score section: Enhanced with gradient background, 65px width
- Compare checkbox: Separated row, centered, smaller (12px/11px)

---

## Testing Checklist

### Visual Tests
- [ ] Avatar is 40px on all mobile breakpoints
- [ ] Name/category labels are readable but compact
- [ ] Score section has clear visual separation
- [ ] Compare checkbox is centered and appropriately sized
- [ ] No layout overflow or wrapping

### Breakpoint Tests
- [ ] 480px - Standard mobile
- [ ] 375px - iPhone SE, small phones
- [ ] 360px - Android small phones
- [ ] 320px - Very small devices

### Functional Tests
- [ ] Avatar click navigates to profile
- [ ] Compare checkbox toggles correctly
- [ ] Score section "Details" button works
- [ ] All touch targets are minimum 44x44px

---

## Files to Modify

1. `src/renderer/components/MatchCard/MatchCard.css`
   - Update avatar sizes
   - Reduce label font sizes
   - Restructure grid layout
   - Enhance score section styling

2. `src/renderer/components/ComparisonCheckbox/ComparisonCheckbox.css`
   - Reduce checkbox size
   - Reduce text size

---

## Expected Outcome

After implementing these fixes:

1. **Consistency:** Match card avatar matches header avatar size (40px)
2. **Readability:** Labels are compact but still readable
3. **Separation:** Score section and checkbox are visually distinct
4. **Usability:** All elements are properly sized for mobile interaction
5. **Polish:** Enhanced visual design with gradients and shadows

---

## Status: Ready for Implementation

All issues have been identified and solutions designed. Ready to proceed with implementation.
