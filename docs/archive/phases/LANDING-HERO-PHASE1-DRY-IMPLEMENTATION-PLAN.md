# Landing Page Hero Section - Phase 1 DRY Implementation Plan

## Investigation Summary

After thorough codebase investigation, I've identified existing components and utilities that can be reused:

### ✅ Existing Resources Found
1. **Card Component** - `src/renderer/components/Card/Card.tsx` (reusable)
2. **Avatar Component** - `src/renderer/components/Avatar/Avatar.tsx` (reusable)
3. **MatchCard & SuggestedMatchCard** - Can extract profile card pattern
4. **Global CSS** - Animations, gradients, transitions already defined
5. **Utilities** - debounce, throttle in `utils/debounce.ts`
6. **Icons** - lucide-react already installed
7. **Recharts** - Already installed for charts

### ❌ Missing (Need to Create)
1. Intersection Observer hook for scroll animations
2. Count-up animation utility
3. Logo carousel component
4. Animated dashboard mockup
5. Particle background effect

---

## Phase 1: Hero Section Enhancement - DRY Implementation

### Step 1: Create Reusable Animation Utilities

**File**: `src/renderer/hooks/useIntersectionObserver.ts`

```typescript
// NEW FILE - Reusable across entire app
import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [RefObject<HTMLDivElement>, boolean] => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        if (isElementIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce && element) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
};
```

---

### Step 2: Create Count-Up Animation Utility

**File**: `src/renderer/utils/animations.ts`

```typescript
// NEW FILE - Reusable animation utilities
export const animateCountUp = (
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): (() => void) => {
  let startTime: number | null = null;
  let animationFrame: number;

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(start + (end - start) * easeOut);
    
    onUpdate(currentValue);
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  };

  animationFrame = requestAnimationFrame(step);

  // Return cancel function
  return () => cancelAnimationFrame(animationFrame);
};

export const formatStatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
};
```

---

### Step 3: Create Animated Stat Counter Component

**File**: `src/renderer/components/Landing/AnimatedStatCounter.tsx`

```typescript
// NEW FILE - Reuses useIntersectionObserver and animateCountUp
import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { animateCountUp, formatStatNumber } from '../../utils/animations';

interface AnimatedStatCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedStatCounter: React.FC<AnimatedStatCounterProps> = ({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      const cancel = animateCountUp(0, end, duration, setCount, () => {
        setHasAnimated(true);
      });
      return cancel;
    }
  }, [isVisible, hasAnimated, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatStatNumber(count)}{suffix}
    </span>
  );
};
```

---

### Step 4: Create Floating Profile Card Component

**File**: `src/renderer/components/Landing/FloatingProfileCard.tsx`

```typescript
// NEW FILE - Reuses existing Card and Avatar components
import { Card, CardBody } from '../Card/Card';
import { Avatar } from '../Avatar/Avatar';
import './FloatingProfileCard.css';

interface FloatingProfileCardProps {
  name: string;
  role: string;
  followers: string;
  matchScore: number;
  avatarUrl?: string;
  position: 'left' | 'right';
  delay?: number;
}

export const FloatingProfileCard: React.FC<FloatingProfileCardProps> = ({
  name,
  role,
  followers,
  matchScore,
  avatarUrl,
  position,
  delay = 0
}) => {
  return (
    <Card 
      className={`floating-profile-card floating-${position}`}
      style={{ animationDelay: `${delay}s` }}
      shadow="xl"
      hover
    >
      <CardBody>
        <div className="floating-card-content">
          <Avatar
            src={avatarUrl}
            name={name}
            size="md"
            className="floating-avatar"
          />
          <div className="floating-info">
            <h4 className="floating-name">{name}</h4>
            <p className="floating-role">{role}</p>
            <p className="floating-followers">{followers}</p>
          </div>
          <div className="floating-score">
            <div className="score-value">{matchScore}%</div>
            <div className="score-label">Match</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
```

**File**: `src/renderer/components/Landing/FloatingProfileCard.css`

```css
.floating-profile-card {
  position: absolute;
  width: 280px;
  animation: float 6s ease-in-out infinite;
  will-change: transform;
}

.floating-left {
  top: 20%;
  left: 5%;
}

.floating-right {
  bottom: 20%;
  right: 5%;
}

.floating-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.floating-info {
  flex: 1;
  min-width: 0;
}

.floating-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--color-text-primary);
}

.floating-role {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.125rem 0;
}

.floating-followers {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.floating-score {
  text-align: center;
  padding: 0.5rem;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: white;
  min-width: 60px;
}

.score-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 0.625rem;
  opacity: 0.9;
  margin-top: 0.125rem;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

@media (max-width: 1024px) {
  .floating-profile-card {
    display: none;
  }
}
```

---

### Step 5: Create Logo Carousel Component

**File**: `src/renderer/components/Landing/LogoCarousel.tsx`


```typescript
// NEW FILE - Reusable logo carousel
import './LogoCarousel.css';

interface Logo {
  name: string;
  src: string;
}

interface LogoCarouselProps {
  logos: Logo[];
  title?: string;
}

export const LogoCarousel: React.FC<LogoCarouselProps> = ({ 
  logos, 
  title = 'As seen on' 
}) => {
  return (
    <div className="logo-carousel">
      {title && <p className="logo-carousel-title">{title}</p>}
      <div className="logo-carousel-track">
        {/* Duplicate for seamless loop */}
        {[...logos, ...logos].map((logo, index) => (
          <div key={`${logo.name}-${index}`} className="logo-item">
            <img 
              src={logo.src} 
              alt={logo.name}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
```

**File**: `src/renderer/components/Landing/LogoCarousel.css`

```css
.logo-carousel {
  margin: 2rem 0;
  overflow: hidden;
}

.logo-carousel-title {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-weight: 500;
}

.logo-carousel-track {
  display: flex;
  gap: 3rem;
  animation: scroll 30s linear infinite;
  width: fit-content;
}

.logo-item {
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.logo-item:hover {
  opacity: 1;
}

.logo-item img {
  height: 100%;
  width: auto;
  object-fit: contain;
  filter: grayscale(100%);
  transition: filter var(--transition-fast);
}

.logo-item:hover img {
  filter: grayscale(0%);
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .logo-carousel-track {
    gap: 2rem;
    animation-duration: 20s;
  }
  
  .logo-item {
    height: 32px;
  }
}
```

---

### Step 6: Create Animated Dashboard Mockup

**File**: `src/renderer/components/Landing/AnimatedDashboardMockup.tsx`

```typescript
// NEW FILE - Combines FloatingProfileCard with connection animation
import { useState, useEffect } from 'react';
import { FloatingProfileCard } from './FloatingProfileCard';
import './AnimatedDashboardMockup.css';

export const AnimatedDashboardMockup: React.FC = () => {
  const [showConnection, setShowConnection] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowConnection(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animated-dashboard-mockup">
      {/* Influencer Card */}
      <FloatingProfileCard
        name="Sarah M."
        role="Lifestyle Influencer"
        followers="250K followers"
        matchScore={93}
        position="left"
        delay={0}
      />

      {/* Connection Line */}
      <svg className="connection-line" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E1306C" />
            <stop offset="100%" stopColor="#FD8D32" />
          </linearGradient>
        </defs>
        <path
          d="M 50 100 Q 200 50 350 100"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          fill="none"
          className={showConnection ? 'line-animate' : ''}
        />
        {showConnection && (
          <>
            <circle cx="50" cy="100" r="6" fill="#E1306C" className="pulse" />
            <circle cx="350" cy="100" r="6" fill="#FD8D32" className="pulse" />
          </>
        )}
      </svg>

      {/* Company Card */}
      <FloatingProfileCard
        name="TechCorp"
        role="Technology Company"
        followers="$50K budget"
        matchScore={93}
        position="right"
        delay={0.5}
      />

      {/* Background Gradient Circles */}
      <div className="gradient-circle circle-1"></div>
      <div className="gradient-circle circle-2"></div>
      <div className="gradient-circle circle-3"></div>
    </div>
  );
};
```

**File**: `src/renderer/components/Landing/AnimatedDashboardMockup.css`

```css
.animated-dashboard-mockup {
  position: relative;
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connection-line {
  position: absolute;
  width: 400px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
}

.line-animate {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    r: 6;
  }
  50% {
    opacity: 0.5;
    r: 10;
  }
}

.gradient-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: var(--gradient-primary);
  top: 10%;
  left: 10%;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: var(--gradient-secondary);
  bottom: 20%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: var(--gradient-accent);
  top: 50%;
  right: 30%;
  animation-delay: 4s;
}

@media (max-width: 1024px) {
  .animated-dashboard-mockup {
    height: 400px;
  }
  
  .connection-line {
    width: 300px;
    height: 150px;
  }
}

@media (max-width: 768px) {
  .animated-dashboard-mockup {
    height: 300px;
  }
  
  .gradient-circle {
    display: none;
  }
}
```

---

### Step 7: Update Landing Page Hero Section

**File**: `src/renderer/pages/Landing/Landing.tsx` (UPDATE EXISTING)

```typescript
// ADD THESE IMPORTS at the top
import { AnimatedStatCounter } from '../../components/Landing/AnimatedStatCounter';
import { AnimatedDashboardMockup } from '../../components/Landing/AnimatedDashboardMockup';
import { LogoCarousel } from '../../components/Landing/LogoCarousel';

// REPLACE the hero-trust section with:
<div className="hero-trust">
  <div className="trust-item">
    <Users size={16} />
    <AnimatedStatCounter end={10000} suffix="+" /> Active Users
  </div>
  <div className="trust-item">
    <Shield size={16} />
    <span>Verified Profiles</span>
  </div>
  <div className="trust-item">
    <TrendingUp size={16} />
    <AnimatedStatCounter end={93} suffix="%" /> Success Rate
  </div>
</div>

// ADD Logo Carousel after hero-trust:
<LogoCarousel 
  logos={[
    { name: 'TechCrunch', src: '/logos/techcrunch.svg' },
    { name: 'Forbes', src: '/logos/forbes.svg' },
    { name: 'Wired', src: '/logos/wired.svg' },
    { name: 'The Verge', src: '/logos/theverge.svg' },
    { name: 'Mashable', src: '/logos/mashable.svg' }
  ]}
  title="As seen on"
/>

// REPLACE hero-visual section with:
<div className="hero-visual">
  <AnimatedDashboardMockup />
</div>
```

---

### Step 8: Update Stats Section with Animation

**File**: `src/renderer/pages/Landing/Landing.tsx` (UPDATE EXISTING)

```typescript
// REPLACE stat-value divs in stats section:
<div className="stat-card">
  <div className="stat-icon">
    <Users size={24} strokeWidth={2.5} />
  </div>
  <div className="stat-value">
    <AnimatedStatCounter end={10000} suffix="+" />
  </div>
  <div className="stat-label">Active Users</div>
</div>

<div className="stat-card">
  <div className="stat-icon">
    <Target size={24} strokeWidth={2.5} />
  </div>
  <div className="stat-value">
    <AnimatedStatCounter end={50000} suffix="+" />
  </div>
  <div className="stat-label">Successful Matches</div>
</div>

<div className="stat-card">
  <div className="stat-icon">
    <Bot size={24} strokeWidth={2.5} />
  </div>
  <div className="stat-value">
    <AnimatedStatCounter end={93} suffix="%" />
  </div>
  <div className="stat-label">AI Accuracy</div>
</div>

<div className="stat-card">
  <div className="stat-icon">
    <TrendingUp size={24} strokeWidth={2.5} />
  </div>
  <div className="stat-value">
    <AnimatedStatCounter end={5} prefix="$" suffix="M+" />
  </div>
  <div className="stat-label">In Partnerships</div>
</div>
```

---

## Implementation Checklist

### ✅ Phase 1.1: Foundation (Day 1)
- [ ] Create `useIntersectionObserver.ts` hook
- [ ] Create `animations.ts` utility
- [ ] Test intersection observer with simple div
- [ ] Test count-up animation

### ✅ Phase 1.2: Components (Day 2)
- [ ] Create `AnimatedStatCounter.tsx`
- [ ] Create `FloatingProfileCard.tsx` + CSS
- [ ] Test both components independently
- [ ] Verify Card and Avatar reuse works

### ✅ Phase 1.3: Advanced Components (Day 3)
- [ ] Create `LogoCarousel.tsx` + CSS
- [ ] Create `AnimatedDashboardMockup.tsx` + CSS
- [ ] Test animations and performance
- [ ] Optimize for mobile

### ✅ Phase 1.4: Integration (Day 4)
- [ ] Update Landing.tsx hero section
- [ ] Update Landing.tsx stats section
- [ ] Add logo images to public/logos/
- [ ] Test entire hero section
- [ ] Cross-browser testing

### ✅ Phase 1.5: Polish (Day 5)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Mobile responsiveness check
- [ ] Animation timing refinement
- [ ] Final QA

---

## File Structure

```
src/renderer/
├── hooks/
│   └── useIntersectionObserver.ts (NEW)
├── utils/
│   └── animations.ts (NEW)
├── components/
│   ├── Landing/
│   │   ├── AnimatedStatCounter.tsx (NEW)
│   │   ├── FloatingProfileCard.tsx (NEW)
│   │   ├── FloatingProfileCard.css (NEW)
│   │   ├── LogoCarousel.tsx (NEW)
│   │   ├── LogoCarousel.css (NEW)
│   │   ├── AnimatedDashboardMockup.tsx (NEW)
│   │   └── AnimatedDashboardMockup.css (NEW)
│   ├── Card/ (REUSE EXISTING)
│   └── Avatar/ (REUSE EXISTING)
└── pages/
    └── Landing/
        ├── Landing.tsx (UPDATE)
        └── Landing.css (UPDATE)
```

---

## DRY Principles Applied

1. ✅ **Reused Card Component** - No new card implementation
2. ✅ **Reused Avatar Component** - Consistent avatar display
3. ✅ **Shared Animation Utilities** - Can be used across app
4. ✅ **Shared Intersection Observer** - Reusable for any scroll animation
5. ✅ **Consistent CSS Variables** - Using global.css variables
6. ✅ **Modular Components** - Each component has single responsibility
7. ✅ **No Duplicate Code** - FloatingProfileCard used twice with props

---

## Performance Considerations

1. **Lazy Loading** - Logo images use `loading="lazy"`
2. **Will-Change** - Applied to animated elements
3. **RequestAnimationFrame** - Used for smooth count-up
4. **Intersection Observer** - Animations only trigger when visible
5. **CSS Animations** - Hardware-accelerated transforms
6. **Mobile Optimization** - Reduced animations on small screens

---

## Accessibility

1. **Semantic HTML** - Proper heading hierarchy
2. **ARIA Labels** - Added where needed
3. **Keyboard Navigation** - All interactive elements accessible
4. **Reduced Motion** - Respects prefers-reduced-motion
5. **Color Contrast** - WCAG AA compliant
6. **Screen Reader** - Meaningful alt text and labels

---

## Testing Strategy

1. **Unit Tests** - Test animation utilities
2. **Component Tests** - Test each component in isolation
3. **Integration Tests** - Test hero section as whole
4. **Visual Regression** - Screenshot comparison
5. **Performance Tests** - Lighthouse audit
6. **Cross-Browser** - Chrome, Firefox, Safari, Edge

---

## Next Steps After Phase 1

Once Phase 1 is complete and tested:
- Phase 2: Interactive Features (Feature Tabs, Live Activity Feed)
- Phase 3: ROI Calculator
- Phase 4: Video Integration

---

## Estimated Timeline

- **Day 1**: Foundation utilities (4 hours)
- **Day 2**: Basic components (6 hours)
- **Day 3**: Advanced components (6 hours)
- **Day 4**: Integration (4 hours)
- **Day 5**: Polish & QA (4 hours)

**Total**: ~24 hours (3 working days)

---

## Success Metrics

- [ ] All animations smooth (60fps)
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Accessibility score 100%
- [ ] Cross-browser compatible
- [ ] Code coverage > 80%
