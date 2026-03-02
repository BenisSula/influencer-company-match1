# 📱 Mobile Layout Testing Guide

## Quick Testing Steps

### 1. Open Browser DevTools
- Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Click the device toolbar icon or press `Ctrl+Shift+M` / `Cmd+Shift+M`

### 2. Test Mobile Breakpoint (≤768px)
Set viewport to: **375px × 667px** (iPhone SE) or **360px × 740px** (Android)

---

## ✅ What to Test

### Navigation
- [ ] Logo visible on left
- [ ] Hamburger menu (☰) visible on right
- [ ] Both have 44px minimum touch target

### Hero Section
- [ ] Title and subtitle stacked
- [ ] Visual/mockup is hidden
- [ ] CTA buttons stacked vertically, full-width
- [ ] Each button is 48px height (easy to tap)
- [ ] Trust signals below buttons

### Stats Section ⭐
- [ ] Horizontal scroll carousel
- [ ] Smooth snap scrolling when swiping
- [ ] "→ Scroll for more" indicator visible at bottom right
- [ ] No visible scrollbar
- [ ] Cards are 230px wide

### How It Works
- [ ] Steps stacked vertically
- [ ] Number badges centered above content
- [ ] Readable font sizes (1.25rem titles, 0.875rem descriptions)
- [ ] Down arrows (↓) between steps

### Features
- [ ] Single column layout
- [ ] Cards stacked vertically
- [ ] Proper spacing between cards

### Testimonials ⭐ NEW
- [ ] Horizontal scroll carousel (like stats)
- [ ] Smooth snap scrolling
- [ ] Pagination dots at bottom center
- [ ] Active dot highlighted
- [ ] Dots have 44px touch targets
- [ ] Cards are 280px wide
- [ ] No visible scrollbar

### For Influencers / For Companies
- [ ] Content stacked vertically
- [ ] Visual above text content
- [ ] Alternating order (Companies section reversed)

### FAQ
- [ ] Questions have 48px height (easy to tap)
- [ ] Accordion expands/collapses smoothly
- [ ] Readable font sizes

### Final CTA
- [ ] Buttons stacked vertically
- [ ] Full-width buttons
- [ ] 48px height each

### Footer
- [ ] Single column layout
- [ ] Sections stacked
- [ ] Links have 44px height (easy to tap)
- [ ] Proper spacing between sections

---

## 🎯 Key Features to Verify

### Touch Accessibility
All interactive elements should be easy to tap:
- Minimum 44px touch targets
- Most buttons use 48px for extra comfort
- Adequate spacing between elements

### Carousels
Both Stats and Testimonials should:
- Scroll horizontally with finger swipe
- Snap to cards smoothly
- Hide scrollbars
- Show indicators (stats: text, testimonials: dots)

### Typography
Text should be readable without zooming:
- Section titles: 2rem
- Step titles: 1.25rem
- Body text: 0.875rem - 1rem
- Proper line-height for readability

---

## 🔍 Common Issues to Check

### Horizontal Overflow
- [ ] No horizontal scrolling on page (except carousels)
- [ ] All content fits within viewport width
- [ ] No elements extending beyond screen

### Touch Targets
- [ ] Can easily tap all buttons without precision
- [ ] No accidental taps on nearby elements
- [ ] Pagination dots are easy to tap

### Carousel Behavior
- [ ] Stats carousel scrolls smoothly
- [ ] Testimonials carousel scrolls smoothly
- [ ] Snap scrolling works (cards align after swipe)
- [ ] Can scroll back and forth easily

### Visual Spacing
- [ ] No cramped sections
- [ ] Adequate white space
- [ ] Sections clearly separated
- [ ] Content doesn't feel cluttered

---

## 📊 Test on Multiple Devices

### Small Mobile (≤480px)
- iPhone SE: 375 × 667
- Small Android: 360 × 640

### Standard Mobile (481px - 768px)
- iPhone 12/13: 390 × 844
- Pixel 5: 393 × 851
- Galaxy S21: 360 × 800

---

## 🐛 Troubleshooting

### Testimonials Not Scrolling?
Check that the HTML structure includes:
```html
<div class="testimonials-section">
  <div class="testimonials-container">
    <div class="testimonials-scroll">
      <!-- Cards here -->
    </div>
    <div class="testimonials-pagination">
      <!-- Dots here -->
    </div>
  </div>
</div>
```

### Stats Indicator Not Showing?
- Should only show on mobile (≤768px)
- Hidden on tablet (769px - 1023px)
- Check `.stats-container::after` CSS

### Buttons Too Small?
- All buttons should have `min-height: 48px`
- Check browser zoom level (should be 100%)

---

## ✅ Success Criteria

Mobile layout is successful when:
1. ✅ All content is readable without zooming
2. ✅ All buttons are easy to tap (48px height)
3. ✅ Stats carousel scrolls horizontally with snap
4. ✅ Testimonials carousel scrolls horizontally with snap
5. ✅ Pagination dots work and are easy to tap
6. ✅ No horizontal page scrolling (except carousels)
7. ✅ Sections are properly stacked
8. ✅ Visual hierarchy is clear
9. ✅ Touch targets meet accessibility standards
10. ✅ Smooth scrolling and animations

---

## 📝 Quick Reference

### Breakpoints
- Mobile: ≤768px
- Tablet: 769px - 1023px
- Desktop: ≥1024px

### Touch Targets
- Minimum: 44px × 44px
- Recommended: 48px × 48px
- Used throughout mobile layout

### Carousel Widths
- Stats cards: 230px
- Testimonial cards: 280px

### Key CSS Classes
- `.testimonials-scroll` - Horizontal scroll container
- `.testimonials-pagination` - Pagination dots container
- `.testimonials-dot` - Individual pagination dot
- `.stats-container::after` - Scroll indicator

---

## 🎉 Testing Complete!

Once all items are checked, the mobile layout is ready for production!
