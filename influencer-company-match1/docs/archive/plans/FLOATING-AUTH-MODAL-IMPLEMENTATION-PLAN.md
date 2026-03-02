# Floating Auth Modal Implementation Plan

## Current Situation
- Login/Register buttons on landing page navigate to separate `/login` and `/register` routes
- Auth pages are full-page components with split-screen design
- No modal/overlay functionality exists

## Goal
- Clicking "Log In" or "Get Started" buttons should open a floating modal overlay
- Modal appears on top of the landing page (landing page remains visible in background)
- Clicking outside the modal (on the landing page background) closes the modal
- Modal should be responsive and work on mobile devices

## Implementation Strategy

### 1. Create Modal Wrapper Component
**File**: `src/renderer/components/AuthModal/AuthModal.tsx`
- Floating modal container with backdrop
- Click outside to close functionality
- Smooth animations (fade in/out)
- Responsive design (full screen on mobile, centered card on desktop)
- Escape key to close
- Prevent body scroll when modal is open

### 2. Update Landing Page
**File**: `src/renderer/pages/Landing/Landing.tsx`
- Add state to track modal visibility and mode (login/register)
- Update button handlers to open modal instead of navigating
- Pass modal state and handlers to AuthModal component
- Keep landing page content visible behind modal

### 3. Update Routing
**File**: `src/renderer/AppComponent.tsx`
- Keep `/login` and `/register` routes for direct access (bookmarks, etc.)
- Landing page route (`/`) should not redirect when modal is open
- Auth routes should still work independently

### 4. Create Modal-Friendly Auth Content
**File**: `src/renderer/components/AuthModal/AuthModalContent.tsx`
- Reuse existing AuthRightPanel component (the form part)
- Remove or simplify AuthLeftPanel for modal view
- Compact design suitable for modal
- Close button in top-right corner

### 5. Styling
**File**: `src/renderer/components/AuthModal/AuthModal.css`
- Backdrop overlay (semi-transparent dark background)
- Modal container (white card, centered, with shadow)
- Smooth transitions and animations
- Mobile-responsive (full screen on small devices)
- Z-index management to ensure modal appears above everything

## File Structure
```
src/renderer/
├── components/
│   └── AuthModal/
│       ├── AuthModal.tsx          (NEW - Modal wrapper)
│       ├── AuthModal.css          (NEW - Modal styles)
│       └── AuthModalContent.tsx   (NEW - Auth form content)
├── pages/
│   └── Landing/
│       └── Landing.tsx            (UPDATE - Add modal state)
└── AppComponent.tsx               (NO CHANGE - Routes stay same)
```

## Implementation Steps

### Phase 1: Create Modal Component
1. Create `AuthModal.tsx` with backdrop and modal container
2. Add click-outside-to-close functionality
3. Add escape key handler
4. Add body scroll lock when modal is open
5. Create smooth animations

### Phase 2: Create Modal Content
1. Create `AuthModalContent.tsx` 
2. Reuse existing form components (LoginForm, RegisterForm)
3. Add close button
4. Make it compact and modal-friendly

### Phase 3: Update Landing Page
1. Add modal state (isOpen, mode)
2. Update button click handlers
3. Integrate AuthModal component
4. Test all buttons (nav, hero, CTAs)

### Phase 4: Styling & Polish
1. Style backdrop and modal
2. Add animations
3. Ensure mobile responsiveness
4. Test accessibility (focus trap, keyboard navigation)

### Phase 5: Testing
1. Test modal open/close on all buttons
2. Test click outside to close
3. Test escape key
4. Test on mobile devices
5. Test direct URL access to /login and /register still works

## Key Features

### Modal Behavior
- ✅ Opens on button click (no navigation)
- ✅ Closes on backdrop click
- ✅ Closes on escape key
- ✅ Closes on successful login/register
- ✅ Prevents body scroll when open
- ✅ Smooth fade in/out animations
- ✅ Focus trap (tab stays within modal)

### Responsive Design
- Desktop: Centered modal card (max-width: 500px)
- Tablet: Centered modal card (max-width: 90%)
- Mobile: Full screen modal with padding

### Accessibility
- Focus management (focus first input on open)
- Keyboard navigation (tab, escape)
- ARIA labels and roles
- Screen reader friendly

## Benefits
1. Better UX - Users stay on landing page context
2. Faster interaction - No page navigation
3. Modern design pattern - Common in SaaS apps
4. Maintains existing routes - Direct links still work
5. Mobile-friendly - Adapts to screen size

## Backward Compatibility
- Direct navigation to `/login` and `/register` still works
- Existing auth logic unchanged
- Can be toggled with feature flag if needed

## Next Steps
1. Create modal components
2. Update landing page
3. Test thoroughly
4. Deploy

---

**Status**: Ready to implement
**Estimated Time**: 1-2 hours
**Priority**: High (UX improvement)
