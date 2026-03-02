# Split-Screen Auth Visual Testing Guide

## Quick Visual Inspection Checklist

### 🎯 What to Look For

#### Email Input Field:
```
┌─────────────────────────────────────────┐
│ 📧  you@example.com                     │
│ ↑                                       │
│ Mail icon should be clearly visible     │
│ (medium gray color, not too light)      │
└─────────────────────────────────────────┘
```

#### Password Input Field:
```
┌─────────────────────────────────────────┐
│ 🔒  ••••••••••••••                  👁️  │
│ ↑                                   ↑   │
│ Lock icon visible                   Eye │
│ (medium gray)                       icon│
└─────────────────────────────────────────┘
```

#### When Focused:
```
┌─────────────────────────────────────────┐
│ 📧  you@example.com                     │ ← Pink border
│ ↑                                       │
│ Icon turns PINK (#E1306C)               │
└─────────────────────────────────────────┘
```

## Visual Test Steps

### Step 1: Check Icon Visibility
1. Open the login page
2. Look at the email input field
3. **✅ PASS**: You see a clear Mail icon (📧) on the left
4. **❌ FAIL**: Icon is missing or too faint to see

### Step 2: Check Text Appearance
1. Type or autofill an email address
2. Look at the text in the input field
3. **✅ PASS**: Text is clean, no lines through it
4. **❌ FAIL**: Text has strikethrough or underline

### Step 3: Check Focus State
1. Click on the email input field
2. Observe the icon color
3. **✅ PASS**: Icon turns pink (#E1306C)
4. **❌ FAIL**: Icon stays gray or disappears

### Step 4: Check Password Field
1. Look at the password input field
2. **✅ PASS**: Lock icon (🔒) visible on left, Eye icon (👁️) on right
3. **❌ FAIL**: Icons missing or overlapping text

### Step 5: Check Autofill
1. Use browser's saved credentials to autofill
2. Check the input fields
3. **✅ PASS**: Icons still visible, text is clean, no yellow background
4. **❌ FAIL**: Icons disappear, text has artifacts, yellow background

## Expected Visual States

### Default State (Empty):
- Border: Light gray (#d1d5db)
- Icons: Medium gray (#6b7280)
- Placeholder: Light gray (#9ca3af)
- Background: White

### Filled State:
- Border: Light gray (#d1d5db)
- Icons: Medium gray (#6b7280)
- Text: Dark (#1a1a1a)
- Background: White
- **NO text-decoration**

### Focus State:
- Border: Pink (#E1306C) with subtle shadow
- Icons: Pink (#E1306C)
- Text: Dark (#1a1a1a)
- Background: White

### Autofill State:
- Border: Light gray (#d1d5db)
- Icons: Medium gray (#6b7280)
- Text: Dark (#1a1a1a)
- Background: White (NOT yellow)
- **NO text-decoration**

## Common Issues & Solutions

### Issue 1: Icons Not Visible
**Symptoms**: Can't see Mail or Lock icons
**Check**: 
- Icon color should be #6b7280 (not #9ca3af)
- Icon z-index should be 10
- Icon opacity should be 1

### Issue 2: Text Has Lines Through It
**Symptoms**: Email text has strikethrough or underline
**Check**:
- `text-decoration: none !important` is applied
- Browser autofill override is working
- No inherited text-decoration from parent

### Issue 3: Icons Overlap Text
**Symptoms**: Icons cover the beginning of typed text
**Check**:
- Input has `padding-left: 3rem` when `.with-icon` class is applied
- Icon is positioned at `left: 1rem`
- Icon has `pointer-events: none`

### Issue 4: Yellow Autofill Background
**Symptoms**: Input has yellow background when autofilled
**Check**:
- Autofill override CSS is present
- `-webkit-box-shadow: 0 0 0 1000px white inset !important` is applied

## Browser-Specific Checks

### Chrome/Edge:
- [ ] Autofill doesn't add yellow background
- [ ] Icons remain visible with autofill
- [ ] Text has no decoration

### Firefox:
- [ ] Icons are visible
- [ ] Text is clean
- [ ] Focus state works

### Safari:
- [ ] Icons are visible
- [ ] Autofill handled correctly
- [ ] Text rendering is crisp

## Mobile Testing

### Portrait Mode:
- [ ] Icons visible on small screens
- [ ] Text doesn't overlap icons
- [ ] Touch targets are adequate

### Landscape Mode:
- [ ] Layout remains functional
- [ ] Icons still visible
- [ ] No horizontal scroll

## Screenshot Comparison

### Before Fix:
- ❌ Text with strikethrough/underline
- ❌ Icons barely visible or missing
- ❌ Yellow autofill background
- ❌ Poor contrast

### After Fix:
- ✅ Clean text, no decorations
- ✅ Clear, visible icons
- ✅ White background even with autofill
- ✅ Good contrast and readability

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Open in browser
# Navigate to: http://localhost:5173/auth

# Test autofill:
# 1. Save credentials in browser
# 2. Reload page
# 3. Use autofill
# 4. Check icons and text appearance
```

## Success Criteria

All of these should be TRUE:
- ✅ Mail icon visible in email field
- ✅ Lock icon visible in password field
- ✅ Eye icon visible in password field (right side)
- ✅ No text-decoration on input text
- ✅ Icons turn pink on focus
- ✅ Autofill doesn't break styling
- ✅ Text is crisp and readable
- ✅ Consistent across all auth forms

## If Issues Persist

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard reload**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Check browser console**: Look for CSS errors
4. **Verify CSS files**: Ensure changes were saved
5. **Check build**: Run `npm run build` to verify no errors

## Contact

If visual issues persist after applying fixes, check:
- [SPLIT-SCREEN-AUTH-INPUT-FIX-COMPLETE.md](./SPLIT-SCREEN-AUTH-INPUT-FIX-COMPLETE.md)
- [SPLIT-SCREEN-AUTH-INPUT-ICON-TEXT-FIX-PLAN.md](./SPLIT-SCREEN-AUTH-INPUT-ICON-TEXT-FIX-PLAN.md)
