# Phase 2: Quick Start Guide

## 🎯 What's Been Implemented

### ✅ Completed (Ready to Use)
1. **FeatureTabs Component** - Interactive tabbed feature showcase
2. **ComparisonTable Component** - Feature comparison matrix
3. **Feature Data Structure** - Centralized feature content
4. **Brand Color Integration** - All components use global.css colors
5. **Responsive Design** - Mobile-first approach
6. **Accessibility** - ARIA labels, keyboard navigation, focus states

---

## 🚀 How to Use

### 1. Import Components

```typescript
import { FeatureTabs, ComparisonTable } from '../../components/Landing';
import { featureCategories, featureComparison } from '../../data/landing/features';
```

### 2. Add to Landing Page

```typescript
{/* Interactive Features Section */}
<section id="interactive-features" className="interactive-features-section">
  <div className="section-container">
    <h2 className="section-title">Explore Our Features</h2>
    <p className="section-subtitle">
      See how ICMatch can transform your influencer marketing
    </p>
    <FeatureTabs 
      categories={featureCategories}
      autoRotate={true}
      rotateInterval={5000}
      onTabChange={(tabId) => console.log('Tab changed:', tabId)}
      onDemoClick={(featureId) => {
        // Handle demo video click
        console.log('Demo clicked:', featureId);
      }}
    />
  </div>
</section>

{/* Comparison Section */}
<section className="comparison-section">
  <div className="section-container">
    <h2 className="section-title">Why Choose ICMatch?</h2>
    <p className="section-subtitle">
      See how we compare to other platforms
    </p>
    <ComparisonTable 
      features={featureComparison}
      onSignupClick={() => {
        // Handle signup click
        handleSignup('INFLUENCER', 'comparison_table');
      }}
    />
  </div>
</section>
```

### 3. Add CSS Import

```typescript
// In Landing.tsx
import './LandingPhase2.css';
```

### 4. Create LandingPhase2.css

```css
/* src/renderer/pages/Landing/LandingPhase2.css */

.interactive-features-section {
  padding: 5rem 2rem;
  background: var(--color-bg-primary);
}

.comparison-section {
  padding: 5rem 2rem;
  background: var(--color-bg-secondary);
}

@media (max-width: 768px) {
  .interactive-features-section,
  .comparison-section {
    padding: 3rem 1rem;
  }
}
```

---

## 🎨 Customization Options

### FeatureTabs Props

```typescript
interface FeatureTabsProps {
  categories: FeatureCategory[];      // Required: Feature data
  defaultTab?: string;                // Optional: Initial tab ID
  autoRotate?: boolean;               // Optional: Enable auto-rotation (default: true)
  rotateInterval?: number;            // Optional: Rotation speed in ms (default: 5000)
  onTabChange?: (tabId: string) => void;     // Optional: Tab change callback
  onDemoClick?: (featureId: string) => void; // Optional: Demo click callback
}
```

### ComparisonTable Props

```typescript
interface ComparisonTableProps {
  features: ComparisonFeature[];      // Required: Comparison data
  onSignupClick?: () => void;         // Optional: Signup button callback
}
```

---

## 📊 Data Structure

### Adding New Features

Edit `src/renderer/data/landing/features.ts`:

```typescript
{
  id: 'new-category',
  label: 'New Category',
  icon: YourIcon,
  color: '#E1306C', // Use brand colors
  features: [
    {
      id: 'new-feature',
      title: 'New Feature',
      description: 'Feature description',
      screenshot: '/screenshots/new-feature.png',
      video: '/videos/new-feature-demo.mp4', // Optional
      benefits: [
        'Benefit 1',
        'Benefit 2',
        'Benefit 3'
      ],
      stats: [
        { label: 'Metric 1', value: '95%' },
        { label: 'Metric 2', value: '10K+' }
      ]
    }
  ]
}
```

### Adding Comparison Features

```typescript
{
  feature: 'New Feature',
  icmatch: true,              // or string like '95% accuracy'
  competitor1: false,         // or string
  competitor2: 'Basic',
  competitor3: true
}
```

---

## 🎯 Brand Colors Reference

All components use these colors from `global.css`:

```css
--color-primary: #E1306C;        /* Instagram Pink */
--color-secondary: #5B51D8;      /* Purple */
--color-accent: #FD8D32;         /* Orange */
--color-success: #00D95F;        /* Green */
--color-info: #0095F6;           /* Blue */
--gradient-primary: linear-gradient(135deg, #E1306C 0%, #FD8D32 100%);
```

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Tabs display in full row
- Features in 2-column grid
- Full comparison table visible

### Tablet (768px - 1023px)
- Tabs scroll horizontally
- Features in 1-column grid
- Comparison table scrolls horizontally

### Mobile (< 768px)
- Compact tab design
- Single column layout
- Touch-optimized interactions
- Minimum 44px tap targets

---

## ♿ Accessibility Features

### Keyboard Navigation
- Tab key to navigate between tabs
- Enter/Space to activate
- Arrow keys for tab navigation

### Screen Readers
- ARIA labels on all interactive elements
- Role attributes for semantic structure
- Live regions for dynamic content

### Visual
- Focus visible states
- High contrast mode support
- Reduced motion support

---

## 🧪 Testing

### Quick Test Checklist

```bash
# 1. Start development server
npm run dev

# 2. Navigate to landing page
http://localhost:5173

# 3. Test interactions:
- Click different tabs
- Watch auto-rotation
- Pause/resume rotation
- Hover over feature cards
- Click "Watch Demo" buttons
- Scroll comparison table on mobile
- Click "Get Started Free" button

# 4. Test responsive:
- Resize browser window
- Test on mobile device
- Check horizontal scroll

# 5. Test accessibility:
- Tab through all elements
- Use screen reader
- Check focus states
```

---

## 🐛 Troubleshooting

### Icons Not Showing
```typescript
// Make sure lucide-react is installed
npm install lucide-react

// Import icons correctly
import { Bot, MessageCircle, BarChart3 } from 'lucide-react';
```

### Styles Not Applied
```typescript
// Import CSS files in correct order
import './Landing.css';
import './LandingEnhanced.css';
import './LandingPhase2.css';
```

### Auto-Rotation Not Working
```typescript
// Check props
<FeatureTabs 
  categories={featureCategories}
  autoRotate={true}  // Make sure this is true
  rotateInterval={5000}
/>
```

### Comparison Table Overflow
```css
/* Make sure parent has proper width */
.comparison-section {
  width: 100%;
  overflow-x: hidden;
}
```

---

## 📈 Performance Tips

### 1. Lazy Load Images
```typescript
<img 
  src={feature.screenshot} 
  loading="lazy"
  alt={feature.title}
/>
```

### 2. Debounce Interactions
```typescript
// Already implemented in components
// Auto-rotation pauses for 10s after manual interaction
```

### 3. Optimize Assets
- Use WebP format for images
- Compress videos
- Lazy load video content

---

## 🔄 Next Steps

### Phase 2.2 - Social Proof (Coming Next)
- LiveActivityFeed
- CaseStudyCard
- VideoTestimonial
- RatingWidget
- LiveUserCounter

### Phase 2.3 - ROI Calculator (Coming Next)
- ROICalculator
- ResultsVisualization
- CalculatorInput

---

## 📞 Need Help?

### Resources:
- **Full Plan**: `LANDING-PHASE2-ENGAGEMENT-INTERACTIVITY-PLAN.md`
- **Implementation Status**: `LANDING-PHASE2-IMPLEMENTATION-STATUS.md`
- **Component Docs**: Check JSDoc comments in component files
- **Brand Colors**: `src/renderer/styles/global.css`

### Common Questions:

**Q: How do I add a new feature category?**
A: Edit `src/renderer/data/landing/features.ts` and add to `featureCategories` array.

**Q: Can I disable auto-rotation?**
A: Yes, set `autoRotate={false}` on FeatureTabs component.

**Q: How do I customize colors?**
A: Use CSS custom properties from global.css or override in component CSS.

**Q: Is it mobile-friendly?**
A: Yes, all components are mobile-first and responsive.

---

**Status**: ✅ Phase 2.1 Complete and Ready to Use!
**Next**: Implement Phase 2.2 (Social Proof) and Phase 2.3 (ROI Calculator)
