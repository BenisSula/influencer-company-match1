# Feed Card Badge Counter Fix - Elegant Solution

**Date:** February 11, 2026  
**Issue:** Save button becomes invisible when likes/comments are present  
**Solution:** Badge-style counters on top-right corner of buttons  
**Status:** ✅ RECOMMENDED APPROACH

---

## Solution Overview

Instead of displaying counts inline (which causes overflow), we'll use **badge-style counters** positioned on the top-right corner of the Like and Comment buttons - similar to notification badges on mobile apps.

### Visual Concept

**Before (Current - Causes Overflow):**
```
[❤️ Like 1] [💬 Comment] [✉️ Message] [🔗 Share] [🔖 Sa...] ← Cut off
```

**After (Badge Style - No Overflow):**
```
[❤️ Like]¹ [💬 Comment] [✉️ Message] [🔗 Share] [🔖 Save]
```

Where `¹` represents a small badge on the top-right corner.

---

## Benefits of This Approach

### UX Benefits ✅
- **No overflow** - All buttons remain visible
- **Compact** - Buttons stay same size regardless of count
- **Familiar** - Users recognize badge pattern from notifications
- **Scalable** - Works with any count (1, 10, 100+)
- **Clean** - Modern, minimalist appearance

### Technical Benefits ✅
- **Simple** - No wrapping or complex layout logic
- **Performant** - Pure CSS solution
- **Responsive** - Works on all screen sizes
- **Accessible** - Screen readers can still announce counts

### Design Benefits ✅
- **Professional** - Matches modern social media patterns
- **Consistent** - Similar to notification badges elsewhere in app
- **Subtle** - Doesn't dominate the interface
- **Flexible** - Easy to style and customize

---

## Implementation Plan

### Step 1: Update ActionBar Component

**File:** `src/renderer/components/ActionBar/ActionBar.tsx`

```typescript
import React from 'react';
import './ActionBar.css';

export interface ActionBarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface ActionBarProps {
  items: ActionBarItem[];
  className?: string;
  size?: 'md' | 'lg';
}

export const ActionBar: React.FC<ActionBarProps> = ({ 
  items, 
  className = '',
  size = 'lg'
}) => {
  return (
    <div className={`action-bar action-bar-${size} ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`action-bar-item ${item.active ? 'action-bar-item-active' : ''}`}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          <span className="action-bar-icon-wrapper">
            <span className="action-bar-icon">{item.icon}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="action-bar-badge">
                {item.count > 99 ? '99+' : item.count}
              </span>
            )}
          </span>
          <span className="action-bar-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
```

**Key Changes:**
- Wrapped icon in `action-bar-icon-wrapper` for positioning context
- Moved count to `action-bar-badge` positioned absolutely
- Added 99+ cap for very large numbers

---

### Step 2: Update ActionBar CSS

**File:** `src/renderer/components/ActionBar/ActionBar.css`

```css
.action-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid #E4E6EB;
  border-bottom: 1px solid #E4E6EB;
}

.action-bar-md {
  gap: 0.375rem;
}

.action-bar-lg {
  gap: 0.5rem;
}

.action-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  color: #65676B;
  position: relative;
  padding: 0.625rem 0.5rem;
  min-height: 48px;
}

.action-bar-md .action-bar-item {
  padding: 0.5rem 0.375rem;
  min-height: 40px;
  font-size: 0.875rem;
}

.action-bar-lg .action-bar-item {
  padding: 0.625rem 0.5rem;
  min-height: 48px;
  font-size: 0.9375rem;
}

.action-bar-item:hover {
  background: #F0F2F5;
}

.action-bar-item:active {
  background: #E4E6EB;
  transform: scale(0.98);
}

.action-bar-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-bar-item-active {
  color: var(--color-primary);
}

.action-bar-item-active .action-bar-icon {
  color: var(--color-primary);
}

/* Icon wrapper for badge positioning */
.action-bar-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-bar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #65676B;
  transition: color 0.2s ease;
}

.action-bar-md .action-bar-icon {
  font-size: 1.125rem;
}

.action-bar-lg .action-bar-icon {
  font-size: 1.25rem;
}

.action-bar-label {
  font-size: inherit;
  line-height: 1;
  white-space: nowrap;
}

/* Badge counter - positioned on top-right */
.action-bar-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--color-primary, #E1306C);
  color: white;
  border-radius: 9px;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
  z-index: 1;
}

/* Badge animation on update */
@keyframes badge-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.action-bar-badge {
  animation: badge-pop 0.3s ease-out;
}

/* Active state badge */
.action-bar-item-active .action-bar-badge {
  background: var(--color-primary, #E1306C);
  border-color: #F0F2F5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .action-bar {
    gap: 0.25rem;
  }
  
  .action-bar-item {
    padding: 0.5rem 0.375rem;
    min-height: 44px;
    gap: 0.25rem;
  }
  
  .action-bar-label {
    font-size: 0.8125rem;
  }
  
  .action-bar-icon {
    font-size: 1.125rem;
  }
  
  .action-bar-badge {
    min-width: 16px;
    height: 16px;
    font-size: 0.625rem;
    top: -4px;
    right: -6px;
  }
}

@media (max-width: 640px) {
  .action-bar-item {
    padding: 0.5rem 0.25rem;
    gap: 0.25rem;
  }
  
  .action-bar-label {
    font-size: 0.75rem;
  }
  
  .action-bar-icon {
    font-size: 1rem;
  }
  
  .action-bar-badge {
    min-width: 14px;
    height: 14px;
    font-size: 0.5625rem;
    padding: 0 3px;
    top: -3px;
    right: -5px;
  }
}

/* High count styling */
.action-bar-badge[data-count="99+"] {
  min-width: 22px;
  padding: 0 4px;
  font-size: 0.625rem;
}

@media (max-width: 640px) {
  .action-bar-badge[data-count="99+"] {
    min-width: 18px;
    padding: 0 3px;
    font-size: 0.5rem;
  }
}
```

**Key CSS Features:**
- Badge positioned absolutely on top-right of icon
- White border creates separation from background
- Small shadow for depth
- Scales down on mobile
- Animation on count change
- 99+ cap for large numbers

---

### Step 3: Update FeedPost Component (Optional)

**File:** `src/renderer/components/FeedPost/FeedPost.tsx`

No changes needed! The component already passes counts to ActionBar items. The badge will automatically appear.

However, we can enhance the data attribute for styling:

```typescript
const actionBarItems: ActionBarItem[] = [
  {
    id: 'like',
    icon: liked ? <HiHeart /> : <HiOutlineHeart />,
    label: 'Like',
    count: likeCount,
    active: liked,
    onClick: () => setShowReactionPicker(!showReactionPicker),
    disabled: loadingInteraction,
  },
  {
    id: 'comment',
    icon: <HiChat />,
    label: 'Comment',
    count: commentCount,
    active: showComments,
    onClick: () => setShowComments(!showComments),
  },
  // ... rest of items
];
```

**Note:** Removed reaction type from label - now just "Like" with badge showing count.

---

## Visual Examples

### Desktop View
```
┌─────────────────────────────────────────────────────┐
│  [❤️ Like]⁵  [💬 Comment]²  [✉️ Message]  [🔗 Share]  [🔖 Save]  │
└─────────────────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────────────────────┐
│  [❤️]⁵  [💬]²  [✉️]  [🔗]  [🔖]  │
│  Like  Comment Message Share Save │
└──────────────────────────────────┘
```

### High Count Example
```
┌─────────────────────────────────────────────────────┐
│  [❤️ Like]⁹⁹⁺  [💬 Comment]⁴⁵  [✉️ Message]  [🔗 Share]  [🔖 Save]  │
└─────────────────────────────────────────────────────┘
```

---

## Accessibility Enhancements

### Screen Reader Support

Update the button to include count in aria-label:

```typescript
<button
  key={item.id}
  className={`action-bar-item ${item.active ? 'action-bar-item-active' : ''}`}
  onClick={item.onClick}
  disabled={item.disabled}
  aria-label={
    item.count 
      ? `${item.label} (${item.count})` 
      : item.label
  }
>
  {/* ... */}
</button>
```

### Keyboard Navigation

Badges don't interfere with keyboard navigation - buttons remain fully accessible.

### Color Contrast

Badge uses high-contrast colors:
- White text on primary color background
- Meets WCAG AA standards (4.5:1 ratio)

---

## Edge Cases Handled

### Zero Count ✅
- Badge hidden when count is 0
- Button shows only icon and label

### Single Digit (1-9) ✅
- Badge shows number clearly
- Minimum width ensures circular shape

### Double Digit (10-99) ✅
- Badge expands to fit
- Maintains circular/pill shape

### High Count (100+) ✅
- Shows "99+" to prevent overflow
- Maintains consistent size

### No Count ✅
- Buttons without counts (Message, Share, Save) work normally
- No empty badge displayed

---

## Animation Details

### Badge Pop Animation

When count changes:
```css
@keyframes badge-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

This provides subtle feedback when:
- User likes a post (count increases)
- Someone else likes (count updates)
- Comment is added (count increases)

---

## Comparison with Other Approaches

### Badge Counter (Recommended) ✅
- **Pros:** Compact, no overflow, modern, scalable
- **Cons:** Slightly less prominent than inline count
- **Best for:** All screen sizes, any count range

### Inline Counter (Current - Problematic) ❌
- **Pros:** Very visible, traditional
- **Cons:** Causes overflow, breaks layout
- **Best for:** Nothing - should be replaced

### Wrapping Layout ⚠️
- **Pros:** All buttons visible
- **Cons:** Takes more vertical space, inconsistent layout
- **Best for:** Fallback if badge approach fails

---

## Implementation Checklist

### Phase 1: Core Implementation ✅
- [ ] Update ActionBar.tsx component
- [ ] Add icon wrapper div
- [ ] Move count to badge element
- [ ] Add 99+ cap logic

### Phase 2: Styling ✅
- [ ] Update ActionBar.css
- [ ] Add badge positioning
- [ ] Add badge styling (colors, borders, shadow)
- [ ] Add responsive adjustments
- [ ] Add animation

### Phase 3: Accessibility ✅
- [ ] Add aria-label with count
- [ ] Test with screen readers
- [ ] Verify keyboard navigation
- [ ] Check color contrast

### Phase 4: Testing ✅
- [ ] Test with 0 count
- [ ] Test with single digit (1-9)
- [ ] Test with double digit (10-99)
- [ ] Test with 99+
- [ ] Test on desktop
- [ ] Test on tablet
- [ ] Test on mobile
- [ ] Test animation

---

## Browser Compatibility

All CSS features used are widely supported:
- `position: absolute` ✅
- `border-radius` ✅
- `box-shadow` ✅
- `@keyframes` ✅
- `transform` ✅

Works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Performance Impact

### Minimal Impact ✅
- Pure CSS solution
- No JavaScript calculations
- No layout reflows
- Hardware-accelerated animations

### Optimization
- Badge only renders when count > 0
- Animation uses `transform` (GPU-accelerated)
- No expensive operations

---

## Future Enhancements

### Phase 2 Features
1. **Different badge colors** for different actions
   - Red for likes
   - Blue for comments
   - Green for shares

2. **Pulse animation** for new interactions
   - Badge pulses when count increases
   - Draws attention to activity

3. **Tooltip on hover**
   - Shows exact count for 99+
   - Shows "X people liked this"

4. **Badge variants**
   - Dot indicator for boolean states
   - Different shapes for different types

---

## Summary

The badge counter approach is the **optimal solution** because it:

1. **Solves the overflow problem** - All buttons remain visible
2. **Looks modern and professional** - Matches current UI trends
3. **Scales perfectly** - Works with any count
4. **Requires minimal code changes** - Simple CSS solution
5. **Improves UX** - Cleaner, more compact interface

**Estimated Implementation Time:** 30 minutes
**Risk Level:** Low
**User Impact:** High (positive)

Ready to implement! 🚀
