# Match Card Header Layout Fix Plan

## Current Issues (From User Feedback)

### 1. Compare Checkbox Size
- **Issue**: Checkbox is too large
- **Current**: Full padding with text label "Compare"
- **Needed**: Smaller, more compact design

### 2. Header Layout (Mobile)
- **Issue**: Elements not properly positioned
- **Current Layout**: 
  - Avatar (left) → Name/Category (center) → Compare + Score (right, stacked)
- **Desired Layout**:
  - Avatar (top-left corner)
  - Compare checkbox (middle/center of header)
  - Details button (right corner)

---

## Current Structure Analysis

### HTML Structure:
```tsx
<div className="match-card-header">
  <Avatar />                          // Column 1
  <div className="match-info">        // Column 2
    <h3>Name</h3>
    <p>Category</p>
  </div>
  <div className="match-header-right"> // Column 3
    <ComparisonCheckbox />
    <div className="match-compatibility-section">
      <div>50% Match</div>
      <button>Details</button>
    </div>
  </div>
</div>
```

### Current CSS (Mobile):
```css
.match-card-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.625rem;
  align-items: center;
}
```

---

## Proposed Solution

### Layout Strategy:
Use CSS Grid with 3 columns for precise positioning:
- **Column 1**: Avatar (top-left)
- **Column 2**: Name/Category + Compare checkbox (center)
- **Column 3**: Score + Details button (right)

### Visual Layout:
```
┌─────────────────────────────────────┐
│ [Avatar]  Name           [50%]      │
│           Category       [Match]    │
│           [☑ Compare]    [Details]  │
└─────────────────────────────────────┘
```

---

## Implementation Plan

### Step 1: Reduce Compare Checkbox Size

**File**: `ComparisonCheckbox.css`

```css
/* Mobile: Compact checkbox */
@media (max-width: 480px) {
  .comparison-checkbox {
    gap: 2px;
  }
  
  .checkbox-label {
    padding: 4px 6px;
    font-size: 12px;
    gap: 4px;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 14px;
    height: 14px;
  }
  
  .checkbox-text {
    font-size: 12px;
  }
  
  .checkbox-hint {
    font-size: 10px;
    margin-left: 18px;
  }
}
```

### Step 2: Restructure Header Layout (Mobile)

**File**: `MatchCard.css`

```css
@media (max-width: 480px) {
  .match-card-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto auto;
    gap: 0.5rem;
    align-items: start;
  }
  
  /* Avatar: Top-left, spans 3 rows */
  .match-avatar {
    grid-column: 1;
    grid-row: 1 / 4;
    align-self: start;
    width: 48px;
    height: 48px;
  }
  
  /* Name/Category: Row 1-2, Column 2 */
  .match-info {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: start;
  }
  
  /* Compare Checkbox: Row 3, Column 2 (center) */
  .match-header-right {
    grid-column: 2 / 4;
    grid-row: 3;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0;
  }
  
  /* Score Section: Row 1-2, Column 3 (right) */
  .match-compatibility-section {
    grid-column: 3;
    grid-row: 1 / 3;
    align-self: start;
  }
}
```

### Alternative Layout (If checkbox should be truly centered):

```css
@media (max-width: 480px) {
  .match-card-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.5rem;
  }
  
  /* Row 1: Avatar | Name | Score */
  .match-avatar {
    grid-column: 1;
    grid-row: 1 / 3;
  }
  
  .match-info {
    grid-column: 2;
    grid-row: 1;
  }
  
  .match-compatibility-section {
    grid-column: 3;
    grid-row: 1 / 3;
  }
  
  /* Row 2: Empty | Compare | Details */
  .match-header-right {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    justify-content: center;
  }
}
```

### Step 3: Adjust Score Section for Mobile

```css
@media (max-width: 480px) {
  .match-compatibility-section {
    flex-direction: column;
    padding: 0.375rem;
    gap: 0.375rem;
    min-width: 70px;
    align-items: center;
  }
  
  .compatibility-score-value {
    font-size: 1.25rem;
  }
  
  .compatibility-score-label {
    font-size: 0.625rem;
  }
  
  .compatibility-breakdown-btn {
    padding: 0.25rem 0.4375rem;
    font-size: 0.6875rem;
    gap: 0.1875rem;
    width: 100%;
  }
  
  .compatibility-breakdown-btn svg {
    width: 12px;
    height: 12px;
  }
}
```

---

## Recommended Layout Option

**Option A: Compare in Center, Details on Right**
```
┌─────────────────────────────────────┐
│ [Avatar]  Name              [50%]   │
│           Category          [Match] │
│           [☑ Compare]    [Details]  │
└─────────────────────────────────────┘
```

**Option B: Compare and Details Side-by-Side**
```
┌─────────────────────────────────────┐
│ [Avatar]  Name              [50%]   │
│           Category          [Match] │
│        [☑ Compare] [Details]        │
└─────────────────────────────────────┘
```

**Recommendation**: Option A provides better visual balance and clearer separation of actions.

---

## Files to Modify

1. **ComparisonCheckbox.css**
   - Add mobile responsive styles
   - Reduce checkbox size
   - Compact padding and font sizes

2. **MatchCard.css**
   - Restructure header grid layout
   - Position avatar at top-left
   - Center compare checkbox
   - Keep details button on right
   - Adjust score section sizing

---

## Testing Checklist

- [ ] Avatar positioned at top-left corner
- [ ] Compare checkbox smaller and more compact
- [ ] Compare checkbox centered in header
- [ ] Details button positioned on right
- [ ] Score section compact but readable
- [ ] Name/Category properly aligned
- [ ] No layout overflow on 320px-480px screens
- [ ] Touch targets remain 44px minimum
- [ ] All elements properly aligned vertically

---

## Visual Comparison

### Before:
```
[Avatar] Name          [Compare]
         Category      [50% Match]
                       [Details]
```

### After:
```
[Avatar] Name              [50%]
         Category          [Match]
         [☑ Compare]    [Details]
```

---

## Priority: HIGH
**Impact**: Mobile UX clarity and visual organization
**Effort**: Medium (CSS restructuring)
**Risk**: Low (layout-only changes)
