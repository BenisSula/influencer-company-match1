# How It Works Section - Visual Testing Guide

## Quick Test Checklist

### Desktop View (> 768px)

#### Step 1: Number Circles
- [ ] Circle 1 displays "1" in top-right corner
- [ ] Circle 2 displays "2" in top-right corner  
- [ ] Circle 3 displays "3" in top-right corner
- [ ] Circles have pink-to-orange gradient background
- [ ] Numbers are white and clearly visible
- [ ] Circles are 48px × 48px
- [ ] Numbers are 1.5rem font size

#### Step 2: Card Layout
- [ ] Three cards displayed in a row
- [ ] Cards have equal width
- [ ] Cards have consistent height (380px)
- [ ] Cards have white background
- [ ] Cards have subtle border

#### Step 3: Content Styling
- [ ] Titles are bold (700 weight) and 1.5rem
- [ ] Titles are centered
- [ ] Descriptions are gray and centered
- [ ] Descriptions are readable (1rem)

#### Step 4: Stats Line
- [ ] Stats have gray background box
- [ ] Time estimate displays (e.g., "2-3 min")
- [ ] Bullet separator displays (•)
- [ ] Success rate displays (e.g., "98% success")
- [ ] All text is centered in the box

#### Step 5: Button
- [ ] "Watch Video" button has gradient background
- [ ] Play icon displays before text
- [ ] Button spans full card width
- [ ] Button has proper padding

#### Step 6: Hover Effects
- [ ] Card lifts up on hover (translateY -8px)
- [ ] Border changes to pink on hover
- [ ] Shadow appears on hover
- [ ] Transition is smooth

### Mobile View (< 768px)

#### Step 1: Layout
- [ ] Cards stack vertically (one per row)
- [ ] Cards maintain proper spacing
- [ ] Cards have reduced height (320px)

#### Step 2: Number Circles
- [ ] Circles are smaller (40px × 40px)
- [ ] Numbers are smaller (1.25rem)
- [ ] Circles still in top-right corner
- [ ] Gradient still visible

#### Step 3: Text Sizing
- [ ] Titles are 1.25rem (reduced from 1.5rem)
- [ ] Descriptions are 0.9375rem
- [ ] Stats text is 0.8125rem
- [ ] All text remains readable

#### Step 4: Spacing
- [ ] Card padding is reduced but adequate
- [ ] Stats box has reduced padding
- [ ] Button maintains proper size
- [ ] No text overflow or clipping

## Visual Comparison

### Before Fix
```
┌─────────────────────────────────────┐
│                                     │
│                                     │  ← No number visible
│        Create Your Profile          │
│                                     │
│   Add your niche, platforms, and   │
│   audience details in minutes      │
│                                     │
│   2-3 min  •  98% success          │  ← No background box
│                                     │
│  [Watch Video]                     │
└─────────────────────────────────────┘
```

### After Fix
```
┌─────────────────────────────────────┐
│                              ┌───┐  │
│                              │ 1 │  │  ← ✅ Number with gradient
│                              └───┘  │
│                                     │
│        Create Your Profile          │
│                                     │
│   Add your niche, platforms, and   │
│   audience details in minutes      │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 2-3 min  •  98% success     │  │  ← ✅ Gray background box
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  ▶  Watch Video             │  │  ← ✅ Gradient button
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Color Reference

### Number Circle Gradient
- Start: `#E1306C` (Instagram Pink)
- End: `#FD8D32` (Instagram Orange)
- Text: `#FFFFFF` (White)

### Stats Box
- Background: `var(--color-bg-secondary)` (Light gray)
- Text: `var(--color-text-secondary)` (Medium gray)
- Separator: `var(--color-border)` (Light gray)

### Card
- Background: `var(--color-bg-primary)` (White)
- Border: `var(--color-border)` (Light gray)
- Hover Border: `var(--color-primary)` (Pink)

## Browser Testing

Test in the following browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Check

- [ ] Number circles have sufficient contrast (white on gradient)
- [ ] Text is readable (meets WCAG AA standards)
- [ ] Hover states are visible
- [ ] Focus states work for keyboard navigation
- [ ] Screen readers can access all content

## Performance Check

- [ ] No layout shift when page loads
- [ ] Smooth hover animations
- [ ] No console errors
- [ ] CSS loads quickly
- [ ] No render blocking

## Common Issues to Watch For

### Issue 1: Numbers Not Visible
**Symptom:** Number circles don't appear  
**Check:** Verify `.step-number-circle` class is in CSS  
**Fix:** Already applied in this fix

### Issue 2: Numbers Not Positioned Correctly
**Symptom:** Numbers appear in wrong location  
**Check:** Verify `position: absolute` and `top/right` values  
**Fix:** Already applied in this fix

### Issue 3: Stats Line Has No Background
**Symptom:** Stats text appears without gray box  
**Check:** Verify `.step-stats` class has background  
**Fix:** Already applied in this fix

### Issue 4: Mobile Layout Broken
**Symptom:** Cards don't stack or text is too large  
**Check:** Verify media query at `@media (max-width: 768px)`  
**Fix:** Already applied in this fix

## Screenshot Locations

Take screenshots of:
1. Desktop view - full section
2. Desktop view - single card hover state
3. Tablet view (768px)
4. Mobile view (375px)
5. Mobile view - single card

Save to: `docs/screenshots/how-it-works/`

## Sign-Off Checklist

Before marking as complete:
- [ ] All desktop tests pass
- [ ] All mobile tests pass
- [ ] All browsers tested
- [ ] Accessibility verified
- [ ] Performance verified
- [ ] Screenshots captured
- [ ] No console errors
- [ ] Code reviewed
- [ ] Documentation updated

## Status

✅ **CSS FIX APPLIED** - Ready for visual testing
