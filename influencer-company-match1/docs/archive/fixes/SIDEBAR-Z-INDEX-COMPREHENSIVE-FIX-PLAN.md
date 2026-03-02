# 🔍 Sidebar Z-Index Issue - Investigation & Comprehensive Fix Plan

**Date**: February 23, 2026  
**Status**: ❌ **NOT IMPLEMENTED** - Previous claim was incorrect  
**Issue**: Dashboard label and right sidebar headings going under header during scrolling

---

## 🚨 Investigation Results

### What Was Claimed:
> "Done! I've implemented the sidebar content z-index fix. The changes ensure that sidebar content (like the "Dashboard" label and right sidebar headings) will never go under the header during scrolling."

### What Was Actually Found:
**❌ THE FIX WAS NEVER IMPLEMENTED!**

The previous implementation added z-index to:
- `.sidebar-nav` (z-index: 51) ✅ EXISTS
- `.sidebar-section` (z-index: 51) ✅ EXISTS

But **FAILED** to add z-index to the actual content elements:
- `.sidebar-item` ❌ **MISSING z-index**
- `.sidebar-title` ❌ **MISSING z-index**
- `.suggested-item` ❌ **MISSING z-index**
- `.suggested-name` ❌ **MISSING z-index**

### Root Cause Analysis:

1. **Wrong CSS Classes Targeted**: The previous fix mentioned `.nav-item` and `.section-title` which **DON'T EXIST** in the codebase
2. **Actual Classes Used**:
   - Left sidebar navigation: `.sidebar-item` (contains "Dashboard" label)
   - Right sidebar headings: `.sidebar-title` (contains section headings)
   - Right sidebar content: `.suggested-item`, `.suggested-name`, `.suggested-meta`

3. **Current Z-Index Hierarchy**:
   ```
   Header:          z-index: 100  ✅ (working)
   Sidebar Nav:     z-index: 51   ✅ (container only)
   Sidebar Section: z-index: 51   ✅ (container only)
   Sidebar Items:   NO Z-INDEX     ❌ (PROBLEM!)
   Sidebar Title:   NO Z-INDEX     ❌ (PROBLEM!)
   Sidebars:        z-index: 50   ✅ (working)
   ```

---

## 🎯 Comprehensive Fix Plan

### Phase 1: Add Z-Index to Left Sidebar Content

**Target**: `.sidebar-item` class (contains "Dashboard" and all navigation labels)

**Location**: `src/renderer/layouts/AppLayout/AppLayout.css` around line 200

**Current Code**:
```css
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: #050505;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}
```

**Fix Required**:
```css
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: #050505;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  position: relative; /* ✅ Enable z-index */
  z-index: 52; /* ✅ Above sidebar containers (51), below header (100) */
}
```

---

### Phase 2: Add Z-Index to Right Sidebar Headings

**Target**: `.sidebar-title` class (contains "Suggested Matches" and other section headings)

**Location**: `src/renderer/layouts/AppLayout/AppLayout.css` around line 350

**Current Code**:
```css
.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #65676B;
  margin-bottom: 1rem;
}
```

**Fix Required**:
```css
.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #65676B;
  margin-bottom: 1rem;
  position: relative; /* ✅ Enable z-index */
  z-index: 52; /* ✅ Above sidebar containers (51), below header (100) */
}
```

---

### Phase 3: Add Z-Index to Right Sidebar Content Items

**Target**: `.suggested-item` class (contains suggested match cards)

**Location**: `src/renderer/layouts/AppLayout/AppLayout.css` around line 370

**Current Code**:
```css
.suggested-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
```

**Fix Required**:
```css
.suggested-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative; /* ✅ Enable z-index */
  z-index: 52; /* ✅ Above sidebar containers (51), below header (100) */
}
```

---

### Phase 4: Add Z-Index to Suggested Names and Meta

**Target**: `.suggested-name` and `.suggested-meta` classes

**Location**: `src/renderer/layouts/AppLayout/AppLayout.css` around line 400

**Current Code**:
```css
.suggested-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #050505;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggested-meta {
  font-size: 0.8125rem;
  color: #65676B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**Fix Required**:
```css
.suggested-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #050505;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative; /* ✅ Enable z-index */
  z-index: 52; /* ✅ Above sidebar containers (51), below header (100) */
}

.suggested-meta {
  font-size: 0.8125rem;
  color: #65676B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative; /* ✅ Enable z-index */
  z-index: 52; /* ✅ Above sidebar containers (51), below header (100) */
}
```

---

### Phase 5: Add Z-Index to Sidebar Icons

**Target**: `.sidebar-icon` class (icons next to navigation labels)

**Location**: `src/renderer/layouts/AppLayout/AppLayout.css` around line 230

**Current Code**:
```css
.sidebar-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
```

**Fix Required**:
```css
.sidebar-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  position: relative; /* ✅ Enable z-index */
  z-index: 52; /* ✅ Above sidebar containers (51), below header (100) */
}
```

---

## 📊 Complete Z-Index Hierarchy (After Fix)

```
┌─────────────────────────────────────────┐
│ Mobile Overlay: z-index: 200            │ (Highest - mobile only)
├─────────────────────────────────────────┤
│ Header: z-index: 100                    │ (Always on top)
├─────────────────────────────────────────┤
│ Sidebar Content: z-index: 52            │ (Navigation items, titles, content)
│  - .sidebar-item                        │
│  - .sidebar-title                       │
│  - .suggested-item                      │
│  - .suggested-name                      │
│  - .suggested-meta                      │
│  - .sidebar-icon                        │
├─────────────────────────────────────────┤
│ Sidebar Containers: z-index: 51         │ (Container wrappers)
│  - .sidebar-nav                         │
│  - .sidebar-section                     │
├─────────────────────────────────────────┤
│ Sidebars: z-index: 50                   │ (Base sidebar layer)
│  - .left-sidebar                        │
│  - .right-sidebar                       │
├─────────────────────────────────────────┤
│ Main Content: No z-index                │ (Default stacking)
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

After implementing the fix, verify:

- [ ] Left sidebar "Dashboard" label stays visible during scrolling
- [ ] Left sidebar "Feed" label stays visible during scrolling
- [ ] Left sidebar "Matches" label stays visible during scrolling
- [ ] Left sidebar "Profile" label stays visible during scrolling
- [ ] Left sidebar "Messages" label stays visible during scrolling
- [ ] Left sidebar "Settings" label stays visible during scrolling
- [ ] Left sidebar icons stay visible during scrolling
- [ ] Right sidebar "Suggested Matches" heading stays visible
- [ ] Right sidebar suggested match names stay visible
- [ ] Right sidebar suggested match metadata stays visible
- [ ] No visual glitches or overlapping
- [ ] Works on desktop (>1024px)
- [ ] Works on tablet (768px-1024px)
- [ ] Works on mobile (<768px)
- [ ] Sidebar collapse functionality still works
- [ ] No performance degradation

---

## 🚀 Implementation Steps

1. **Open file**: `src/renderer/layouts/AppLayout/AppLayout.css`
2. **Find and update** each CSS class listed in Phases 1-5
3. **Add** `position: relative;` and `z-index: 52;` to each class
4. **Save** the file
5. **Test** in browser with hard refresh (Ctrl+Shift+R)
6. **Verify** all items in testing checklist

---

## 📝 Expected Behavior After Fix

### Before Fix (Current State):
- ❌ "Dashboard" label disappears under header when scrolling
- ❌ "Suggested Matches" heading goes under header
- ❌ Suggested match names disappear under header
- ❌ Poor visual hierarchy

### After Fix (Expected State):
- ✅ All sidebar navigation labels always visible
- ✅ All sidebar section headings always visible
- ✅ All sidebar content always visible
- ✅ Proper z-index layering maintained
- ✅ Smooth scrolling experience
- ✅ No visual glitches

---

## 🔧 Quick Fix Summary

**Total Changes Required**: 6 CSS classes need updates

**Files to Modify**: 1 file (`AppLayout.css`)

**Lines to Add**: 12 lines total (2 lines per class)

**Estimated Time**: 5 minutes

**Risk Level**: Low (CSS-only changes, no logic changes)

---

## ⚠️ Important Notes

1. **Browser Cache**: After implementing, do a hard refresh (Ctrl+Shift+R) to see changes
2. **Responsive Testing**: Test on all breakpoints (desktop, tablet, mobile)
3. **Collapse Testing**: Ensure sidebar collapse functionality still works
4. **Performance**: Z-index changes should have no performance impact
5. **Accessibility**: No accessibility impact (visual-only changes)

---

**Ready to implement!** 🚀

This fix will properly address the z-index issue by targeting the ACTUAL CSS classes used in the codebase, not the non-existent ones mentioned in the previous implementation.
