# Landing Page - Testing Guide

**Date:** February 15, 2026  
**Status:** Ready for Testing  
**Priority:** HIGH  

---

## 🚀 Quick Start

### 1. Start Development Server

```bash
npm run dev
```

### 2. Open Browser

Visit: `http://localhost:5173/`

You should see the landing page with:
- Navigation bar at top
- Hero section with dual CTAs
- Stats section
- All other sections below

---

## ✅ TESTING CHECKLIST

### Desktop Testing (1024px+)

#### Navigation
- [ ] Logo displays with gradient
- [ ] Navigation links visible (Features, How It Works, Pricing)
- [ ] "Log In" button visible
- [ ] "Sign Up" button visible with gradient
- [ ] Hover effects work on all buttons

#### Hero Section
- [ ] Title displays correctly
- [ ] Subtitle is readable
- [ ] "I'm an Influencer" button has gradient
- [ ] "I'm a Company" button has purple border
- [ ] Buttons are side-by-side
- [ ] Illustration circles animate
- [ ] Content and visual are 60/40 split

#### Stats Section
- [ ] 4 stats in a row
- [ ] Numbers have gradient effect
- [ ] Labels are readable
- [ ] Hover effect works

#### How It Works
- [ ] 3 steps in a row
- [ ] Step numbers have gradient circles
- [ ] Arrows connect steps
- [ ] Cards have hover effect

#### Features
- [ ] 6 cards in 3 columns (2 rows)
- [ ] Icons display correctly
- [ ] Hover effect shows gradient border
- [ ] Cards lift on hover

#### For Influencers
- [ ] Image on left, content on right
- [ ] Checkmarks are green
- [ ] Button has gradient
- [ ] Button hover effect works

#### For Companies
- [ ] Content on left, image on right (reversed)
- [ ] Checkmarks are green
- [ ] Button has gradient
- [ ] Button hover effect works

#### FAQ
- [ ] Questions are clickable
- [ ] Answers expand/collapse smoothly
- [ ] Chevron icon rotates
- [ ] Only one answer open at a time

#### Final CTA
- [ ] Gradient background (pink to orange)
- [ ] White text is readable
- [ ] Two buttons side-by-side
- [ ] Buttons have hover effects

#### Footer
- [ ] 4 columns
- [ ] Links are white
- [ ] Hover effect changes color to pink
- [ ] Copyright text visible

---

### Tablet Testing (768px - 1023px)

#### General
- [ ] Open DevTools
- [ ] Set viewport to 768px width
- [ ] Refresh page

#### Layout Changes
- [ ] Hero section stacks (content then visual)
- [ ] Stats become 2x2 grid
- [ ] Steps become vertical
- [ ] Features become 2 columns
- [ ] Content sections stack
- [ ] Footer becomes 2 columns

#### Functionality
- [ ] All buttons still work
- [ ] Hover effects still work
- [ ] FAQ still expands/collapses
- [ ] No horizontal scroll

---

### Mobile Testing (< 768px)

#### General
- [ ] Set viewport to 375px width (iPhone)
- [ ] Refresh page

#### Navigation
- [ ] Logo visible
- [ ] Hamburger menu icon visible
- [ ] Click hamburger - menu opens
- [ ] Menu shows all links
- [ ] Menu shows buttons (full width)
- [ ] Click link - menu closes
- [ ] Click hamburger again - menu closes

#### Hero Section
- [ ] Title is readable (smaller)
- [ ] Subtitle is readable
- [ ] Buttons are stacked (full width)
- [ ] Buttons are at least 44px tall
- [ ] Visual is below content

#### Stats
- [ ] 2x2 grid
- [ ] Numbers are readable
- [ ] No horizontal scroll

#### How It Works
- [ ] Steps are vertical
- [ ] Arrows point down
- [ ] Cards are full width

#### Features
- [ ] 1 column
- [ ] Cards are full width
- [ ] Spacing looks good

#### Content Sections
- [ ] All sections stack
- [ ] Images are full width
- [ ] Text is readable
- [ ] Buttons are full width

#### FAQ
- [ ] Questions are full width
- [ ] Tap to expand works
- [ ] Text is readable

#### Final CTA
- [ ] Buttons are stacked
- [ ] Buttons are full width
- [ ] Text is readable

#### Footer
- [ ] 1 column
- [ ] All links visible
- [ ] Links are tappable

---

### Small Mobile Testing (< 480px)

#### General
- [ ] Set viewport to 320px width (iPhone SE)
- [ ] Refresh page

#### Check
- [ ] All text is readable
- [ ] No horizontal scroll
- [ ] Buttons are tappable
- [ ] Spacing looks good
- [ ] Nothing is cut off

---

## 🎯 FUNCTIONALITY TESTING

### CTA Tracking

#### Test Influencer Signup
1. Click "I'm an Influencer" in hero
2. Check URL: Should be `/register?role=INFLUENCER&source=landing_hero`
3. Verify role is pre-selected

#### Test Company Signup
1. Click "I'm a Company" in hero
2. Check URL: Should be `/register?role=COMPANY&source=landing_hero`
3. Verify role is pre-selected

#### Test Different Sources
- Hero CTAs: `source=landing_hero`
- Influencer section: `source=landing_influencers`
- Company section: `source=landing_companies`
- Final CTA: `source=landing_final`

### Navigation

#### Test Login
1. Click "Log In" button
2. Should navigate to `/login`
3. Login form should display

#### Test Sign Up
1. Click "Sign Up" button
2. Should navigate to `/register`
3. Registration form should display

#### Test Anchor Links
1. Click "Features" in nav
2. Should scroll to features section
3. Repeat for other links

### Mobile Menu

#### Test Open/Close
1. On mobile, click hamburger icon
2. Menu should slide open
3. Click hamburger again
4. Menu should close

#### Test Navigation
1. Open mobile menu
2. Click a link
3. Menu should close
4. Page should scroll to section

### FAQ Accordion

#### Test Expand
1. Click first question
2. Answer should expand smoothly
3. Chevron should rotate

#### Test Collapse
1. Click same question again
2. Answer should collapse
3. Chevron should rotate back

#### Test Multiple
1. Expand first question
2. Expand second question
3. First should close automatically

---

## 🎨 VISUAL TESTING

### Brand Colors

#### Check Primary Color (#E1306C)
- [ ] Logo gradient starts with pink
- [ ] Primary buttons have pink gradient
- [ ] Hover states use pink
- [ ] Links are pink
- [ ] Active states are pink

#### Check Secondary Color (#5B51D8)
- [ ] Secondary buttons use purple
- [ ] Some icons use purple

#### Check Accent Color (#FD8D32)
- [ ] Logo gradient ends with orange
- [ ] Button gradients end with orange

#### Check Gradients
- [ ] Logo: Pink to Orange
- [ ] Primary buttons: Pink to Orange
- [ ] Final CTA background: Pink to Orange
- [ ] Stat numbers: Pink to Orange

### Typography

#### Check Hierarchy
- [ ] H1 is largest
- [ ] H2 is second largest
- [ ] H3 is third largest
- [ ] Body text is readable
- [ ] All text has proper line height

#### Check Responsiveness
- [ ] Desktop: Large text
- [ ] Tablet: Medium text
- [ ] Mobile: Smaller but readable text

### Spacing

#### Check Consistency
- [ ] Sections have consistent padding
- [ ] Cards have consistent padding
- [ ] Buttons have consistent padding
- [ ] Grid gaps are consistent

### Animations

#### Check Smoothness
- [ ] Hero fade-in is smooth
- [ ] Hover effects are smooth
- [ ] FAQ expand is smooth
- [ ] Transitions are smooth
- [ ] No janky animations

---

## ♿ ACCESSIBILITY TESTING

### Keyboard Navigation

#### Test Tab Order
1. Press Tab repeatedly
2. Focus should move logically
3. All interactive elements should be reachable
4. Focus should be visible (outline)

#### Test Enter/Space
1. Tab to a button
2. Press Enter or Space
3. Button should activate

### Screen Reader

#### Test with Screen Reader (Optional)
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate through page
3. All content should be announced
4. Interactive elements should be labeled

### Color Contrast

#### Check Readability
- [ ] Dark text on light background is readable
- [ ] Light text on dark background is readable
- [ ] Light text on gradient is readable
- [ ] All text meets WCAG AA (4.5:1)

### Reduced Motion

#### Test Reduced Motion
1. Enable reduced motion in OS settings
2. Refresh page
3. Animations should be minimal or disabled

---

## 🐛 COMMON ISSUES TO CHECK

### Layout Issues
- [ ] No horizontal scroll on any device
- [ ] No overlapping elements
- [ ] No cut-off text
- [ ] Images don't overflow
- [ ] Buttons don't wrap awkwardly

### Interaction Issues
- [ ] All buttons are clickable
- [ ] All links work
- [ ] Mobile menu toggles properly
- [ ] FAQ accordion works
- [ ] No console errors

### Visual Issues
- [ ] Colors match brand palette
- [ ] Gradients display correctly
- [ ] Hover effects work
- [ ] Animations are smooth
- [ ] Text is readable

### Performance Issues
- [ ] Page loads quickly
- [ ] No layout shift
- [ ] Smooth scrolling
- [ ] Animations don't lag
- [ ] No memory leaks

---

## 📊 BROWSER TESTING

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Samsung Internet (Android)

---

## ✅ SIGN-OFF CHECKLIST

### Before Deployment
- [ ] All desktop tests pass
- [ ] All tablet tests pass
- [ ] All mobile tests pass
- [ ] All functionality works
- [ ] All visual checks pass
- [ ] All accessibility checks pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Performance is good
- [ ] All browsers tested

### Ready for Production
- [ ] Stakeholder approval
- [ ] QA sign-off
- [ ] Performance verified
- [ ] Accessibility verified
- [ ] Cross-browser verified
- [ ] Mobile verified

---

## 🚀 DEPLOYMENT

Once all tests pass:

```bash
# Build for production
npm run build

# Test production build
npm run preview

# Deploy
# (Follow your deployment process)
```

---

## 📞 SUPPORT

### Issues Found?
1. Document the issue
2. Include screenshots
3. Note device/browser
4. Note steps to reproduce

### Questions?
- Refer to `LANDING-PAGE-IMPLEMENTATION-COMPLETE.md`
- Check `LANDING-PAGE-ADJUSTED-IMPLEMENTATION-PLAN.md`
- Review code comments

---

**Status:** ✅ TESTING GUIDE COMPLETE  
**Ready:** YES  
**Next:** Start Testing  

**Happy testing! 🧪**

