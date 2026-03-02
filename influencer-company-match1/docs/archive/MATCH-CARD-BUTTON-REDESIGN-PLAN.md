# Match Card Button Redesign Plan - Feed Card Consistency

**Date:** February 11, 2026  
**Goal:** Make MatchCard buttons consistent with FeedPost ActionBar design  
**Status:** 🔍 ANALYSIS COMPLETE - IMPLEMENTATION PLAN READY

---

## Current State Analysis

### Feed Card Buttons (ActionBar) ✅ - NEW DESIGN

**Layout:**
- Vertical layout (icon above label)
- Equal width buttons (flex: 1)
- Transparent background with hover state
- Bordered container (top and bottom borders)
- Badge counters on icons
- Subtle, modern appearance

**Visual Style:**
```
┌─────────────────────────────────────────────────┐
│  [❤️]¹    [💬]     [✉️]     [🔗]     [🔖]      │
│  Like   Comment  Message  Share   Save        │
└─────────────────────────────────────────────────┘
```

**CSS Characteristics:**
- `flex-direction: column` - Icon above label
- `background: transparent` - No solid background
- `border-radius: 0.375rem` - Subtle rounding
- `padding: 0.625rem 0.5rem` - Compact padding
- `color: #65676B` - Muted gray text
- `font-weight: 600` - Semibold labels
- Hover: `background: #F0F2F5` - Light gray
- Active: `background: #E4E6EB` - Slightly darker

---

### Match Card Buttons ❌ - OLD DESIGN

**Layout:**
- Horizontal layout (using Button component)
- Solid colored backgrounds
- Different button variants (primary, secondary, ghost)
- Inconsistent with feed design

**Visual Style:**
```
┌──────────────────────────────────────────────┐
│ [Connect] [Message] [View Profile]          │
└──────────────────────────────────────────────┘
```

**CSS Characteristics:**
- Uses generic Button component
- Solid backgrounds (primary = blue, secondary = gray)
- Traditional button appearance
- Doesn't match feed card aesthetic

---

## Design Goals

### Consistency ✅
- Match the feed card ActionBar design
- Use same layout (vertical, icon above label)
- Use same colors and hover states
- Use same spacing and sizing

### Functionality ✅
- Maintain all current button actions
- Keep connection status indicators
- Preserve smart button logic
- Add icons for visual clarity

### Responsiveness ✅
- Work on all screen sizes
- Stack on mobile if needed
- Maintain touch targets (44px min)

---

## Proposed Design

### New Match Card Button Layout

```
┌─────────────────────────────────────────────────┐
│  [🤝]      [✉️]       [👤]                      │
│  Connect   Message   Profile                    │
└─────────────────────────────────────────────────┘
```

**When Connected:**
```
┌─────────────────────────────────────────────────┐
│  [✉️]       [👤]       [✓]                      │
│  Message   Profile   Connected                  │
└─────────────────────────────────────────────────┘
```

**When Pending:**
```
┌─────────────────────────────────────────────────┐
│  [⏳]       [✉️]       [👤]                      │
│  Pending   Message   Profile                    │
└─────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Step 1: Create MatchActionBar Component

**File:** `src/renderer/components/MatchActionBar/MatchActionBar.tsx`

```typescript
import React from 'react';
import './MatchActionBar.css';

export interface MatchActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'primary' | 'success';
  disabled?: boolean;
  onClick: () => void;
}

interface MatchActionBarProps {
  items: MatchActionItem[];
  className?: string;
}

export const MatchActionBar: React.FC<MatchActionBarProps> = ({ 
  items, 
  className = '' 
}) => {
  return (
    <div className={`match-action-bar ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`match-action-item ${item.variant ? `match-action-item-${item.variant}` : ''}`}
          onClick={item.onClick}
          disabled={item.disabled}
          aria-label={item.label}
        >
          <span className="match-action-icon">{item.icon}</span>
          <span className="match-action-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
```

---

### Step 2: Create MatchActionBar Styles

**File:** `src/renderer/components/MatchActionBar/MatchActionBar.css`

```css
.match-action-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid #E4E6EB;
  margin-top: 1rem;
}

.match-action-item {
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
  padding: 0.625rem 0.5rem;
  min-height: 48px;
  font-size: 0.9375rem;
}

.match-action-item:hover {
  background: #F0F2F5;
}

.match-action-item:active {
  background: #E4E6EB;
  transform: scale(0.98);
}

.match-action-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variant styles */
.match-action-item-primary {
  color: var(--color-primary, #E1306C);
}

.match-action-item-primary .match-action-icon {
  color: var(--color-primary, #E1306C);
}

.match-action-item-success {
  color: #10B981;
}

.match-action-item-success .match-action-icon {
  color: #10B981;
}

.match-action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #65676B;
  transition: color 0.2s ease;
}

.match-action-label {
  font-size: inherit;
  line-height: 1;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .match-action-bar {
    gap: 0.25rem;
  }
  
  .match-action-item {
    padding: 0.5rem 0.375rem;
    min-height: 44px;
    gap: 0.25rem;
    font-size: 0.8125rem;
  }
  
  .match-action-icon {
    font-size: 1.125rem;
  }
}

@media (max-width: 640px) {
  .match-action-item {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .match-action-icon {
    font-size: 1rem;
  }
}
```

---

### Step 3: Update MatchCard Component

**File:** `src/renderer/components/MatchCard/MatchCard.tsx`

**Add imports:**
```typescript
import { MatchActionBar, MatchActionItem } from '../MatchActionBar/MatchActionBar';
import { 
  HiUserAdd, 
  HiMail, 
  HiUser, 
  HiCheck, 
  HiClock 
} from 'react-icons/hi';
```

**Replace getActionButtons() with:**
```typescript
const getActionItems = (): MatchActionItem[] => {
  if (connectionStatus === 'connected') {
    return [
      {
        id: 'message',
        icon: <HiMail />,
        label: 'Message',
        variant: 'primary',
        onClick: handleMessage,
      },
      {
        id: 'profile',
        icon: <HiUser />,
        label: 'Profile',
        onClick: handleViewProfile,
      },
      {
        id: 'connected',
        icon: <HiCheck />,
        label: 'Connected',
        variant: 'success',
        onClick: handleConnect,
      },
    ];
  }

  if (connectionStatus === 'pending') {
    return [
      {
        id: 'pending',
        icon: <HiClock />,
        label: 'Pending',
        disabled: true,
        onClick: () => {},
      },
      {
        id: 'message',
        icon: <HiMail />,
        label: 'Message',
        onClick: handleMessage,
      },
      {
        id: 'profile',
        icon: <HiUser />,
        label: 'Profile',
        onClick: handleViewProfile,
      },
    ];
  }

  // Default: not connected
  return [
    {
      id: 'connect',
      icon: <HiUserAdd />,
      label: 'Connect',
      variant: 'primary',
      onClick: handleConnect,
    },
    {
      id: 'message',
      icon: <HiMail />,
      label: 'Message',
      onClick: handleMessage,
    },
    {
      id: 'profile',
      icon: <HiUser />,
      label: 'Profile',
      onClick: handleViewProfile,
    },
  ];
};
```

**Replace the actions section:**
```typescript
{/* Old */}
<div className="match-actions">
  {getActionButtons()}
</div>

{/* New */}
<MatchActionBar items={getActionItems()} />
```

---

### Step 4: Update MatchCard CSS

**File:** `src/renderer/components/MatchCard/MatchCard.css`

**Remove old styles:**
```css
/* DELETE THIS */
.match-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .match-actions {
    flex-direction: column;
  }
  
  .match-actions button {
    width: 100%;
  }
}
```

**No new styles needed** - MatchActionBar handles all styling

---

## Icon Mapping

### Button Icons

| Action | Icon | Component | Color |
|--------|------|-----------|-------|
| Connect | 🤝 | `HiUserAdd` | Primary (#E1306C) |
| Message | ✉️ | `HiMail` | Primary (#E1306C) when active |
| Profile | 👤 | `HiUser` | Gray (#65676B) |
| Connected | ✓ | `HiCheck` | Success (#10B981) |
| Pending | ⏳ | `HiClock` | Gray (#65676B) |

---

## Visual Comparison

### Before (Current)
```
┌────────────────────────────────────────────────┐
│ [Connect]  [Message]  [View Profile]          │
│  (Blue)     (Gray)      (Gray)                │
└────────────────────────────────────────────────┘
```

### After (New Design)
```
┌────────────────────────────────────────────────┐
│    [🤝]        [✉️]        [👤]                │
│   Connect     Message     Profile              │
│  (Hover: light gray background)               │
└────────────────────────────────────────────────┘
```

---

## Benefits

### Consistency ✅
- Matches feed card design exactly
- Same visual language throughout app
- Professional, cohesive appearance

### User Experience ✅
- Familiar pattern (users know how to interact)
- Clear visual hierarchy
- Better touch targets on mobile
- Smooth hover/active states

### Code Quality ✅
- Reusable component
- Consistent styling
- Easier to maintain
- Better separation of concerns

---

## Migration Strategy

### Phase 1: Create New Component ✅
1. Create MatchActionBar component
2. Create MatchActionBar styles
3. Test in isolation

### Phase 2: Update MatchCard ✅
1. Import new component
2. Replace getActionButtons with getActionItems
3. Update JSX to use MatchActionBar
4. Remove old CSS

### Phase 3: Testing ✅
1. Test all connection states (none, pending, connected)
2. Test all button actions
3. Test responsive behavior
4. Test accessibility

### Phase 4: Cleanup ✅
1. Remove unused Button imports
2. Remove old match-actions CSS
3. Update documentation

---

## Responsive Behavior

### Desktop (1920px+)
- 3 buttons side by side
- Full labels visible
- Large icons (1.25rem)
- Comfortable spacing

### Tablet (768px)
- 3 buttons side by side
- Full labels visible
- Medium icons (1.125rem)
- Reduced spacing

### Mobile (375px)
- 3 buttons side by side
- Shorter labels if needed
- Small icons (1rem)
- Minimal spacing

---

## Accessibility

### Keyboard Navigation ✅
- All buttons focusable
- Tab order logical
- Enter/Space activate

### Screen Readers ✅
- aria-label on each button
- Clear action descriptions
- State changes announced

### Visual ✅
- High contrast colors
- Clear focus states
- Adequate touch targets (48px min)

---

## Testing Checklist

### Visual Tests ✅
- [ ] Buttons match feed card design
- [ ] Icons display correctly
- [ ] Labels are readable
- [ ] Hover states work
- [ ] Active states work
- [ ] Disabled state works

### Functional Tests ✅
- [ ] Connect button works
- [ ] Message button works
- [ ] Profile button works
- [ ] Connection status updates
- [ ] Pending state displays
- [ ] Connected state displays

### Responsive Tests ✅
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] Touch targets adequate
- [ ] No overflow issues

### Accessibility Tests ✅
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA

---

## Files to Create/Modify

### New Files:
1. `src/renderer/components/MatchActionBar/MatchActionBar.tsx`
2. `src/renderer/components/MatchActionBar/MatchActionBar.css`
3. `src/renderer/components/MatchActionBar/index.ts` (export)

### Modified Files:
1. `src/renderer/components/MatchCard/MatchCard.tsx`
2. `src/renderer/components/MatchCard/MatchCard.css`

**Total:** 5 files (3 new, 2 modified)

---

## Estimated Time

- Component creation: 20 minutes
- MatchCard integration: 15 minutes
- Testing: 15 minutes
- **Total: 50 minutes**

---

## Summary

This redesign will make the MatchCard buttons consistent with the feed card ActionBar design, creating a cohesive user experience throughout the application. The new design is more modern, subtle, and professional, while maintaining all existing functionality.

**Key Changes:**
- Vertical button layout (icon above label)
- Transparent backgrounds with hover states
- Consistent spacing and sizing
- Reusable MatchActionBar component
- Better responsive behavior

Ready to implement! 🚀
