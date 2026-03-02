# Landing Page "As Seen On" Mobile Spacing Issue - Investigation & Fix Plan

## Issue Description
Large empty white space appears between the "As seen on" LogoCarousel section and the Statistics Cards section on mobile devices.

## Investigation Results

### Root Cause Analysis

After line-by-line investigation of the code, I identified **THREE misplaced functionalities** causing the mobile spacing issue:

#### 1. **LogoCarousel Placement Inside Hero Content** (PRIMARY ISSUE)
**Location:** `src/renderer/pages/Landing/Landing.tsx` (Lines 245-256)

```tsx
<div className="hero-content">
  {/* ... hero badge, title, subtitle, CTAs, trust items ... */}
  
  <LogoCarousel 
    logos={[...]}
    title="As seen on"
  />
</div>
```

**Problem:** The LogoCarousel is placed INSIDE `.hero-content` div, which is part of a CSS Grid layout (`.hero-container`). On mobile, this grid collapses to single column, but the hero-content maintains its own spacing/padding.

#### 2. **Missing Mobile-Specific Margin Adjustment for LogoCarousel**
**Location:** `src/renderer/components/Landing/LogoCarousel.css` (Lines 1-6)

```css
.logo-carousel {
  margin: 2rem 0;  /* Same margin on all devices */
  overflow: hidden;
}
```

**Problem:** The `2rem` top and bottom margin is applied uniformly across all screen sizes. On mobile, this creates excessive spacing when combined with hero-section padding.

#### 3. **Hero-Trust Section Margin Stacking**
**Location:** `src/renderer/pages/Landing/Landing.css` (Lines 327-332)

```css
.hero-trust {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;  /* Adds space above trust items */
  flex-wrap: wrap;
}
```

**Problem:** The `margin-top: 2rem` on `.hero-trust` + `margin: 2rem 0` on `.logo-carousel` creates **4rem total vertical spacing** between trust items and the logo carousel on mobile, which then adds to the hero-section's bottom padding.

### Visual Flow on Mobile

```
┌─────────────────────────┐
│   Hero Section          │
│   - Badge               │
│   - Title               │
│   - Subtitle            │
│   - CTAs                │
│   - Trust Items         │ ← margin-top: 2rem
│   [2rem space]          │
│   - Logo Carousel       │ ← margin: 2rem 0
│   [2rem space]          │
│   [hero padding-bottom] │ ← 3rem on mobile
└─────────────────────────┘
│   [LARGE GAP HERE]      │ ← PROBLEM AREA
┌─────────────────────────┐
│   Stats Section         │
│   - Stat Cards          │
└─────────────────────────┘
```

## Fix Plan

### Solution 1: Reduce Mobile Margins (RECOMMENDED - Quick Fix)

**File:** `src/renderer/components/Landing/LogoCarousel.css`

Add mobile-specific margin reduction:

```css
/* Mobile */
@media (max-width: 768px) {
  .logo-carousel {
    margin: 1rem 0;  /* Reduced from 2rem to 1rem */
  }
  
  /* ... existing mobile styles ... */
}
```

**File:** `src/renderer/pages/Landing/Landing.css`

Add mobile-specific hero-trust margin:

```css
@media (max-width: 768px) {
  /* ... existing mobile styles ... */
  
  .hero-trust {
    margin-top: 1rem;  /* Reduced from 2rem */
    margin-bottom: 0.5rem;  /* Add small bottom margin */
  }
  
  .hero-section {
    padding: 6rem 1rem 2rem;  /* Reduced bottom padding from 3rem to 2rem */
    min-height: auto;
  }
}
```

### Solution 2: Restructure LogoCarousel Placement (BETTER - Semantic Fix)

Move LogoCarousel outside of hero-content to its own section between hero and stats:

**File:** `src/renderer/pages/Landing/Landing.tsx`

```tsx
{/* Hero Section */}
<section className="hero-section">
  <div className="hero-container">
    <div className="hero-content">
      {/* ... existing content WITHOUT LogoCarousel ... */}
    </div>
    <div className="hero-visual">
      <AnimatedDashboardMockup />
    </div>
  </div>
</section>

{/* Logo Carousel Section - NEW */}
<section className="logo-carousel-section">
  <div className="section-container">
    <LogoCarousel 
      logos={[...]}
      title="As seen on"
    />
  </div>
</section>

{/* Stats Section */}
<section className="stats-section">
  {/* ... existing stats ... */}
</section>
```

Add new CSS:

```css
.logo-carousel-section {
  padding: 2rem;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  border-bottom: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .logo-carousel-section {
    padding: 1.5rem 1rem;
  }
}
```

## Recommended Approach

**Use Solution 1 (Quick Fix)** - It's minimal, non-invasive, and solves the immediate problem without restructuring the layout.

## Implementation Steps

1. Update `LogoCarousel.css` mobile styles
2. Update `Landing.css` hero-section mobile styles  
3. Test on mobile devices (375px, 414px, 768px widths)
4. Verify no layout breaks on tablet/desktop

## Expected Results

- Mobile spacing reduced from ~7rem to ~3.5rem between "As seen on" and stats
- Cleaner visual flow on mobile
- No impact on desktop/tablet layouts
- Maintains responsive behavior

## Testing Checklist

- [ ] iPhone SE (375px width)
- [ ] iPhone 12/13 (390px width)
- [ ] iPhone 12/13 Pro Max (428px width)
- [ ] iPad (768px width)
- [ ] Desktop (1024px+ width)
- [ ] Verify LogoCarousel animation still works
- [ ] Verify no text overflow
- [ ] Verify touch targets remain accessible
