# Landing Page Documentation

## Overview

The landing page is the public-facing entry point of the Influencer-Company Matching Platform. It serves as a conversion-optimized marketing page designed to attract both influencers and companies, showcase platform features, and drive user registrations.

**Route:** `/`  
**Component:** `src/renderer/pages/Landing/Landing.tsx`  
**Access:** Public (no authentication required)

---

## Page Structure

### 1. Hero Section
**Purpose:** Capture attention and communicate value proposition immediately

**Components:**
- **Sticky Header CTA** (`StickyHeaderCTA.tsx`) - Persistent call-to-action that appears on scroll
- **Role Selector** (`RoleSelector.tsx`) - Toggle between Influencer and Company views
- **Animated Dashboard Mockup** (`AnimatedDashboardMockup.tsx`) - Visual preview of the platform
- **Floating Action Button** (`FloatingActionButton.tsx`) - Quick access to registration

**Features:**
- Personalized content based on selected role (influencer vs company)
- Animated statistics counters showing platform metrics
- Primary CTA buttons for registration
- Mobile-responsive design with touch optimization

**Backend Integration:**
- `GET /api/landing/statistics` - Fetches real-time platform statistics
- Statistics include: total users, active matches, success rate, average ROI

---

### 2. Features Section
**Purpose:** Showcase platform capabilities and unique selling points

**Components:**
- **Feature Tabs** (`FeatureTabs.tsx`) - Interactive tabbed interface
- **Comparison Table** (`ComparisonTable.tsx`) - Platform vs competitors
- **Step Illustration** (`StepIllustration.tsx`) - Visual workflow guides
- **Step Video Modal** (`StepVideoModal.tsx`) - Video demonstrations

**Features:**
- Role-specific feature highlights
- Interactive feature exploration
- Animated progress indicators
- Video tutorials for key workflows

**Data Source:**
- `src/renderer/data/landing/features.ts` - Static feature definitions
- `GET /api/landing/features` - Dynamic feature availability based on tenant configuration

---

### 3. Social Proof Section
**Purpose:** Build trust through testimonials, ratings, and success stories

**Components:**
- **Dynamic Testimonials** (`DynamicTestimonials.tsx`) - Rotating customer reviews
- **Rating Widget** (`RatingWidget.tsx`) - Aggregate platform ratings
- **Live Activity Feed** (`LiveActivityFeed.tsx`) - Real-time user activities
- **Logo Carousel** (`LogoCarousel.tsx`) - Partner/client logos
- **Floating Profile Cards** (`FloatingProfileCard.tsx`) - Sample user profiles

**Features:**
- Real-time activity updates via WebSocket
- Platform ratings from multiple sources (G2, Trustpilot, Capterra)
- Success story carousel with metrics
- Animated statistics with micro-charts

**Backend Integration:**
- `GET /api/landing/testimonials` - Fetch featured testimonials
- `GET /api/landing/ratings` - Aggregate rating data
- `WebSocket /landing` - Real-time activity stream
- `GET /api/landing/success-stories` - Success case studies

**Database Tables:**
- `testimonials` - Customer testimonials
- `landing_activities` - Recent platform activities
- `landing_statistics` - Cached platform metrics

---

### 4. ROI Calculator
**Purpose:** Demonstrate value proposition with interactive calculations

**Component:** `ROICalculator.tsx`

**Features:**
- Interactive input fields for campaign parameters
- Real-time calculation of potential ROI
- Industry benchmark comparisons
- Personalized recommendations based on inputs

**Calculation Factors:**
- Campaign budget
- Influencer tier (nano, micro, macro, mega)
- Industry vertical
- Campaign duration
- Expected engagement rate

**Backend Integration:**
- `POST /api/landing/calculate-roi` - Server-side ROI calculations
- `GET /api/landing/market-rates` - Industry benchmark data

**Database Tables:**
- `market_rates` - Industry-specific pricing and engagement benchmarks

---

### 5. Live Engagement Elements
**Purpose:** Create urgency and demonstrate platform activity

**Components:**
- **Live User Counter** (`LiveUserCounter.tsx`) - Real-time active users
- **Urgency Timer** (`UrgencyTimer.tsx`) - Limited-time offers
- **Live Activity Feed** (`LiveActivityFeed.tsx`) - Recent platform actions

**Features:**
- WebSocket-powered real-time updates
- Animated counters and transitions
- Geolocation-based activity display
- Time-sensitive promotional messaging

**Backend Integration:**
- `WebSocket /landing` - Real-time user count and activities
- `GET /api/landing/active-users` - Current active user count
- `GET /api/landing/recent-activities` - Recent platform activities

---

### 6. Call-to-Action Sections
**Purpose:** Drive conversions at multiple touchpoints

**Components:**
- **Floating Action Button** (`FloatingActionButton.tsx`) - Persistent CTA
- **Sticky Header CTA** (`StickyHeaderCTA.tsx`) - Header-based CTA
- **Exit Intent Modal** - Triggered on exit attempt

**Features:**
- Multiple CTA placements throughout page
- A/B testing for CTA copy and design
- Exit intent detection
- Scroll-based CTA visibility

**Conversion Tracking:**
- `POST /api/analytics/track` - Track user interactions
- Events tracked: CTA clicks, scroll depth, time on page, exit intent triggers

---

## Authentication Integration

### Auth Modal
**Component:** `AuthModal.tsx` / `FloatingAuthModal.tsx`

**Features:**
- Modal overlay for login/registration
- Multi-step registration wizard
- Social authentication (planned)
- Password strength validation
- Email verification

**Registration Flow:**
1. **Step 1:** Account creation (email, password, full name)
2. **Step 2:** Role selection (influencer or company)
3. **Step 3:** Role-specific information
4. **Step 4:** Profile preferences

**Backend Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/verify-email` - Email verification

---

## Personalization & A/B Testing

### Role-Based Content
**Hook:** `usePersonalizedContent.ts`

**Features:**
- Dynamic content based on selected role
- Personalized messaging and CTAs
- Role-specific feature highlights
- Customized success stories

**Data Source:**
- `src/renderer/data/landing/personalizedContent.ts`

### A/B Testing Framework
**Utility:** `src/renderer/utils/abTesting.ts`

**Features:**
- Variant assignment and tracking
- Conversion goal tracking
- Statistical significance calculation
- Multi-variant testing support

**Backend Integration:**
- `GET /api/experiments/active` - Fetch active experiments
- `POST /api/experiments/track` - Track experiment events

**Database Tables:**
- `experiments` - A/B test configurations
- `experiment_events` - User interactions and conversions
- `rollouts` - Feature rollout configurations

---

## Analytics & Tracking

### Tracked Events
**Service:** `analytics-tracking.service.ts`

**Events:**
- Page views and session duration
- CTA clicks and conversions
- Scroll depth and engagement
- Feature interaction
- Exit intent triggers
- ROI calculator usage
- Video plays
- Form submissions

**Backend Integration:**
- `POST /api/analytics/track` - Track user events
- `POST /api/analytics/page-view` - Track page views

**Database Tables:**
- `user_analytics` - User behavior tracking
- `landing_activities` - Landing page specific events

---

## Performance Optimization

### Code Splitting
- Landing page components in separate chunk (~116 KB)
- Lazy loading for below-the-fold content
- Image lazy loading with intersection observer

### Caching Strategy
- Static assets cached via service worker
- API responses cached for 5 minutes
- Branding configuration cached in localStorage

### SEO Optimization
**Files:**
- `public/sitemap.xml` - Site structure
- `public/robots.txt` - Crawler directives
- `public/.htaccess` - Server configuration

**Utilities:**
- `src/renderer/utils/seo.ts` - Dynamic meta tags
- Server-side rendering support (planned)

---

## Mobile Responsiveness

### Mobile Navigation
**Components:**
- `MobileNavToggle.tsx` - Hamburger menu button
- `MobileNavMenu.tsx` - Mobile navigation drawer
- `MobileNavOverlay.tsx` - Backdrop overlay

**Features:**
- Touch-optimized interactions
- Swipe gestures
- Responsive breakpoints
- Mobile-first design approach

**Hook:** `useMobileNav.ts` - Mobile navigation state management

---

## Real-Time Features

### WebSocket Integration
**Gateway:** `backend/src/modules/landing/landing.gateway.ts`

**Events:**
- `landing:user-count` - Active user count updates
- `landing:activity` - New platform activities
- `landing:stats` - Statistics updates

**Frontend Hook:** `useLandingData.ts`

---

## Backend API Endpoints

### Statistics & Metrics
```
GET /api/landing/statistics
Response: {
  totalUsers: number
  activeMatches: number
  successRate: number
  averageROI: number
  totalCollaborations: number
}
```

### Testimonials
```
GET /api/landing/testimonials
Query: ?featured=true&limit=10
Response: Testimonial[]
```

### ROI Calculator
```
POST /api/landing/calculate-roi
Body: {
  budget: number
  influencerTier: string
  industry: string
  duration: number
}
Response: {
  estimatedReach: number
  estimatedEngagement: number
  estimatedROI: number
  benchmarks: object
}
```

### Newsletter Subscription
```
POST /api/landing/newsletter
Body: {
  email: string
  role: 'influencer' | 'company'
}
Response: { success: boolean }
```

---

## Configuration & Customization

### Tenant Branding
The landing page supports white-label customization:
- Custom logo and colors
- Branded messaging
- Custom domain support
- Tenant-specific features

**Service:** `admin-branding.service.ts`  
**Utility:** `applyBranding.ts`

### Feature Flags
Landing page features can be toggled via admin dashboard:
- ROI calculator visibility
- Live activity feed
- Chatbot widget
- Specific feature sections

---

## Testing

### Test Files
- `test-landing-phase1.js` - Core functionality tests
- `test-landing-features-fix.js` - Feature section tests
- `test-landing-stats-sync.js` - Statistics synchronization
- `test-roi-calculator-full-flow.js` - ROI calculator tests
- `test-live-user-counter-fix.js` - Live counter tests
- `test-success-stories-live-data.js` - Testimonials tests

---

## Future Enhancements

### Planned Features
- [ ] Server-side rendering for improved SEO
- [ ] Social authentication (Google, LinkedIn, Facebook)
- [ ] Multi-language support (i18n)
- [ ] Advanced personalization with ML
- [ ] Video backgrounds and animations
- [ ] Interactive product tours
- [ ] Live chat support integration
- [ ] Progressive web app (PWA) install prompt

---

## Related Documentation
- [Frontend Architecture](./03-FRONTEND-ARCHITECTURE.md)
- [Backend API](./04-BACKEND-API.md)
- [Admin Dashboard](./02-ADMIN-DASHBOARD.md)
- [User Manual](./06-USER-MANUAL.md)
