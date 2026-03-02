# How It Works Section - Number Badge CSS Fix Plan

## Problem Identified

The "How It Works" section on the landing page has **CSS class name mismatches** between the TSX component and the CSS file, causing the number badges on the cards to not display properly.

## Root Cause Analysis

### 1. **Class Name Mismatch**
   - **TSX File** (`Landing.tsx`) uses: `.step-number-circle`
   - **CSS File** (`Landing.css`) defines: `.step-badge`
   - Result: The number circle styles are not being applied

### 2. **Missing CSS Definition**
   - The `.step-number-circle` class is referenced in the TSX but has **NO CSS definition** anywhere in the codebase
   - The `.step-badge` class exists in CSS but is **NOT used** in the TSX

### 3. **Additional Missing Classes**
   - `.step-title` (TSX) vs `.step-title-enhanced` (CSS)
   - `.step-description` (TSX) vs `.step-description-enhanced` (CSS)
   - `.step-stats` (TSX) - **NO CSS definition found**

## Code Locations

### TSX Component
**File:** `src/renderer/pages/Landing/Landing.tsx`
**Lines:** ~344-370

```tsx
<div className="step-card-enhanced">
  {/* Step Number Circle */}
  <div className="step-number-circle">  {/* ❌ NO CSS */}
    {step.number}
  </div>

  {/* Content */}
  <h3 className="step-title">{step.title}</h3>  {/* ❌ Should be step-title-enhanced */}
  <p className="step-description">{step.description}</p>  {/* ❌ Should be step-description-enhanced */}

  {/* Stats Line */}
  <div className="step-stats">  {/* ❌ NO CSS */}
    <span>{step.estimatedTime}</span>
    <span className="stat-separator">•</span>
    <span>{step.successRate}% success</span>
  </div>

  {/* Watch Video Button */}
  <button className="step-video-btn" onClick={() => handleWatchVideo(step.number)}>
    <Play size={16} />
    Watch Video
  </button>
</div>
```

### CSS File
**File:** `src/renderer/pages/Landing/Landing.css`
**Lines:** ~1680-1720

```css
.step-badge {  /* ✅ Defined but NOT used in TSX */
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(225, 48, 108, 0.3);
}

.step-title-enhanced {  /* ✅ Defined but TSX uses .step-title */
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
  text-align: center;
}

.step-description-enhanced {  /* ✅ Defined but TSX uses .step-description */
  color: var(--color-text-secondary);
  line-height: 1.6;
  text-align: center;
  margin-bottom: 1.5rem;
}
```

## Fix Strategy

We have **two options**:

### Option 1: Update CSS to Match TSX (Recommended)
- Rename `.step-badge` → `.step-number-circle`
- Rename `.step-title-enhanced` → `.step-title`
- Rename `.step-description-enhanced` → `.step-description`
- Add new `.step-stats` styles
- Add `.stat-separator` styles

**Pros:**
- Cleaner, more semantic class names
- Matches current TSX implementation
- Less code changes overall

**Cons:**
- Need to update CSS file

### Option 2: Update TSX to Match CSS
- Change `.step-number-circle` → `.step-badge`
- Change `.step-title` → `.step-title-enhanced`
- Change `.step-description` → `.step-description-enhanced`
- Change `.step-stats` → `.step-metrics` (already exists)

**Pros:**
- CSS already exists
- No CSS changes needed

**Cons:**
- More verbose class names
- Need to update TSX file

## Recommended Solution: Option 1

Update the CSS file to match the TSX implementation with cleaner class names.

## Implementation Steps

### Step 1: Update CSS Class Names
In `src/renderer/pages/Landing/Landing.css` (around line 1680):

```css
/* Change .step-badge to .step-number-circle */
.step-number-circle {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 48px;  /* Increased from 40px for better visibility */
  height: 48px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1.5rem;  /* Increased from 1.25rem */
  box-shadow: 0 4px 12px rgba(225, 48, 108, 0.3);
  z-index: 1;
}

/* Change .step-title-enhanced to .step-title */
.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
  text-align: center;
  margin-top: 0.5rem;  /* Add spacing below number circle */
}

/* Change .step-description-enhanced to .step-description */
.step-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

/* Add new .step-stats styles */
.step-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.step-stats span {
  white-space: nowrap;
}

.stat-separator {
  color: var(--color-border);
  font-weight: 400;
}
```

### Step 2: Adjust Card Padding
Update `.step-card-enhanced` to accommodate the absolutely positioned number circle:

```css
.step-card-enhanced {
  position: relative;
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem 2rem;  /* Increased top padding from 2.5rem to 3rem */
  transition: all var(--transition-base);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 380px;  /* Ensure consistent card height */
}
```

### Step 3: Add Mobile Responsive Styles
Add responsive adjustments for mobile devices:

```css
@media (max-width: 768px) {
  .step-number-circle {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
    top: 1rem;
    right: 1rem;
  }
  
  .step-card-enhanced {
    padding: 2.5rem 1.5rem 1.5rem;
    min-height: 320px;
  }
  
  .step-title {
    font-size: 1.25rem;
  }
  
  .step-description {
    font-size: 0.9375rem;
  }
  
  .step-stats {
    font-size: 0.8125rem;
    padding: 0.625rem 0.875rem;
    gap: 0.5rem;
  }
}
```

### Step 4: Remove Old Unused Classes
Remove or comment out the old classes that are no longer used:

```css
/* DEPRECATED - Replaced by .step-number-circle */
/* .step-badge { ... } */

/* DEPRECATED - Replaced by .step-title */
/* .step-title-enhanced { ... } */

/* DEPRECATED - Replaced by .step-description */
/* .step-description-enhanced { ... } */
```

## Testing Checklist

After implementing the fix, verify:

- [ ] Number circles display correctly on all three step cards
- [ ] Numbers are centered within the circles
- [ ] Circle background gradient is visible
- [ ] Circle is positioned in the top-right corner of each card
- [ ] Title text is properly styled and centered
- [ ] Description text is readable and centered
- [ ] Stats line displays correctly with separator
- [ ] Watch Video button is styled correctly
- [ ] Hover effects work on cards
- [ ] Responsive design works on mobile (< 768px)
- [ ] Responsive design works on tablet (768px - 1023px)
- [ ] No console errors related to missing styles

## Visual Reference

The expected result should show:
```
┌─────────────────────────────────────┐
│                              ┌───┐  │
│                              │ 1 │  │  ← Number circle (top-right)
│                              └───┘  │
│                                     │
│        Create Your Profile          │  ← Title (centered)
│                                     │
│   Add your niche, platforms, and   │  ← Description (centered)
│   audience details in minutes      │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 2-3 min  •  98% success     │  │  ← Stats (centered, gray bg)
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  ▶  Watch Video             │  │  ← Button (full width)
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Files to Modify

1. **`src/renderer/pages/Landing/Landing.css`** - Update CSS class names and add missing styles
2. **No TSX changes needed** - The component is already using the correct class names

## Estimated Time

- Implementation: 15 minutes
- Testing: 10 minutes
- Total: 25 minutes

## Priority

**HIGH** - This is a visible UI bug on the main landing page that affects user experience and brand perception.
