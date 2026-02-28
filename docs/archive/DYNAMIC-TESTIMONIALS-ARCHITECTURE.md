# Dynamic Testimonials - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Landing Page                              │
│                  (src/renderer/pages/Landing)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         <DynamicTestimonials />                            │ │
│  │  (src/renderer/components/Landing/DynamicTestimonials)    │ │
│  │                                                            │ │
│  │  State:                                                    │ │
│  │  • testimonials: Testimonial[]                            │ │
│  │  • currentIndex: number                                   │ │
│  │  • loading: boolean                                       │ │
│  │  • error: string | null                                   │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │  useEffect(() => fetchTestimonials())           │    │ │
│  │  └──────────────────┬───────────────────────────────┘    │ │
│  │                     │                                     │ │
│  │                     ▼                                     │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │  fetch(API_URL/profiles/testimonials?limit=10)  │    │ │
│  │  └──────────────────┬───────────────────────────────┘    │ │
│  └────────────────────┼────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTP GET
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Server                            │
│                  (NestJS on port 3000)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ProfilesController                                        │ │
│  │  (backend/src/modules/profiles/profiles.controller.ts)    │ │
│  │                                                            │ │
│  │  @Public()                                                │ │
│  │  @Get('testimonials')                                     │ │
│  │  async getTestimonials(@Query('limit') limit?: string)   │ │
│  │                                                            │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                     │
│                           ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ProfilesService                                           │ │
│  │  (backend/src/modules/profiles/profiles.service.ts)       │ │
│  │                                                            │ │
│  │  async getTestimonials(limit: number = 5) {              │ │
│  │    const reviews = await this.reviewRepo.find({          │ │
│  │      where: { isFeatured: true },                        │ │
│  │      order: { createdAt: 'DESC' },                       │ │
│  │      take: limit,                                         │ │
│  │      relations: ['reviewer']                             │ │
│  │    });                                                    │ │
│  │    return reviews.map(review => ({ ... }));             │ │
│  │  }                                                        │ │
│  │                                                            │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ TypeORM Query
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  profile_reviews Table                                     │ │
│  │                                                            │ │
│  │  Columns:                                                  │ │
│  │  • id (uuid)                                              │ │
│  │  • profile_id (uuid)                                      │ │
│  │  • reviewer_id (uuid)                                     │ │
│  │  • reviewer_name (varchar)                                │ │
│  │  • rating (integer)                                       │ │
│  │  • comment (text)                                         │ │
│  │  • is_featured (boolean) ← KEY FILTER                    │ │
│  │  • created_at (timestamp)                                 │ │
│  │                                                            │ │
│  │  Query:                                                    │ │
│  │  SELECT * FROM profile_reviews                            │ │
│  │  WHERE is_featured = true                                 │ │
│  │  ORDER BY created_at DESC                                 │ │
│  │  LIMIT 10;                                                │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
1. User visits Landing Page
   │
   ├─→ DynamicTestimonials component mounts
   │   │
   │   ├─→ Shows loading spinner
   │   │
   │   └─→ useEffect triggers fetchTestimonials()
   │
2. API Request
   │
   ├─→ GET http://localhost:3000/profiles/testimonials?limit=10
   │   │
   │   └─→ No authentication required (@Public decorator)
   │
3. Backend Processing
   │
   ├─→ ProfilesController receives request
   │   │
   │   ├─→ Calls ProfilesService.getTestimonials(10)
   │   │   │
   │   │   ├─→ Queries database with TypeORM
   │   │   │   │
   │   │   │   └─→ WHERE is_featured = true
   │   │   │       ORDER BY created_at DESC
   │   │   │       LIMIT 10
   │   │   │
   │   │   └─→ Maps results to testimonial format
   │   │
   │   └─→ Returns JSON response
   │
4. Frontend Receives Data
   │
   ├─→ setTestimonials(data)
   │   │
   │   ├─→ setLoading(false)
   │   │
   │   └─→ Component re-renders with data
   │
5. User Interaction
   │
   ├─→ Click next/prev button
   │   │
   │   └─→ setCurrentIndex((prev) => (prev + 1) % testimonials.length)
   │       │
   │       └─→ Smooth transition animation
   │
   └─→ Click indicator dot
       │
       └─→ setCurrentIndex(index)
           │
           └─→ Jump to specific testimonial
```

## Component Structure

```
<section className="testimonials-section">
  <div className="container">
    
    <!-- Header -->
    <h2>What Our Users Say</h2>
    <p>Join thousands of satisfied influencers and brands</p>
    
    <!-- Carousel -->
    <div className="testimonial-carousel">
      
      <!-- Previous Button -->
      <button className="carousel-btn prev">
        <FiChevronLeft />
      </button>
      
      <!-- Testimonial Card -->
      <div className="testimonial-card">
        <div className="testimonial-header">
          <img className="testimonial-avatar" />
          <div className="testimonial-info">
            <h4>Name</h4>
            <p>Role</p>
            <p>Company</p>
          </div>
        </div>
        
        <RatingDisplay rating={5} />
        
        <p className="testimonial-text">"Review text..."</p>
        
        <div className="testimonial-date">January 2024</div>
      </div>
      
      <!-- Next Button -->
      <button className="carousel-btn next">
        <FiChevronRight />
      </button>
    </div>
    
    <!-- Indicators -->
    <div className="carousel-indicators">
      <button className="indicator active" />
      <button className="indicator" />
      <button className="indicator" />
    </div>
    
    <!-- Stats Footer -->
    <div className="testimonials-stats">
      <div className="stat-item">
        <span>4.9/5</span>
        <span>Average Rating</span>
      </div>
      <div className="stat-item">
        <span>10+</span>
        <span>Featured Reviews</span>
      </div>
      <div className="stat-item">
        <span>10,000+</span>
        <span>Happy Users</span>
      </div>
    </div>
    
  </div>
</section>
```

## State Management

```typescript
// Component State
┌─────────────────────────────────────────┐
│ testimonials: Testimonial[]             │
│ ├─ id: string                           │
│ ├─ name: string                         │
│ ├─ role: string                         │
│ ├─ company: string                      │
│ ├─ avatar: string                       │
│ ├─ rating: number                       │
│ ├─ text: string                         │
│ └─ createdAt: string                    │
├─────────────────────────────────────────┤
│ currentIndex: number                    │
│ └─ Tracks which testimonial to display │
├─────────────────────────────────────────┤
│ loading: boolean                        │
│ └─ Shows/hides loading spinner         │
├─────────────────────────────────────────┤
│ error: string | null                    │
│ └─ Displays error message if API fails │
└─────────────────────────────────────────┘
```

## CSS Architecture

```
DynamicTestimonials.css
│
├─ .testimonials-section (Container)
│  ├─ .section-title
│  ├─ .section-subtitle
│  │
│  ├─ .testimonial-carousel (Flex container)
│  │  ├─ .carousel-btn.prev
│  │  ├─ .testimonial-card
│  │  │  ├─ .testimonial-header
│  │  │  │  ├─ .testimonial-avatar
│  │  │  │  └─ .testimonial-info
│  │  │  ├─ .testimonial-rating
│  │  │  ├─ .testimonial-text
│  │  │  └─ .testimonial-date
│  │  └─ .carousel-btn.next
│  │
│  ├─ .carousel-indicators
│  │  └─ .indicator (.active)
│  │
│  └─ .testimonials-stats
│     └─ .stat-item
│        ├─ .stat-number
│        └─ .stat-label
│
├─ Loading States
│  ├─ .testimonial-loading
│  │  ├─ .loading-spinner
│  │  └─ <p>
│  └─ .testimonial-empty
│
└─ Media Queries
   └─ @media (max-width: 768px)
      └─ Mobile-specific styles
```

## Integration Points

```
Landing.tsx
│
├─ Import: DynamicTestimonials from '../../components/Landing'
│
├─ Render Position:
│  │
│  ├─ Hero Section
│  ├─ Stats Section
│  ├─ How It Works
│  ├─ Features
│  ├─ <DynamicTestimonials /> ← HERE
│  ├─ Social Proof
│  ├─ ROI Calculator
│  ├─ FAQ
│  └─ Final CTA
│
└─ No props required (self-contained)
```

## Error Handling Flow

```
fetchTestimonials()
│
├─ try {
│  │
│  ├─ setLoading(true)
│  │
│  ├─ fetch(API_URL)
│  │  │
│  │  ├─ response.ok? ✓
│  │  │  │
│  │  │  ├─ const data = await response.json()
│  │  │  ├─ setTestimonials(data)
│  │  │  ├─ setError(null)
│  │  │  └─ setLoading(false)
│  │  │
│  │  └─ response.ok? ✗
│  │     │
│  │     └─ throw new Error('Failed to fetch')
│  │
│  └─ } catch (err) {
│     │
│     ├─ console.error(err)
│     ├─ setError('Unable to load testimonials')
│     ├─ setTestimonials([])
│     └─ setLoading(false)
│
└─ finally {
   └─ setLoading(false)
}
```

## Responsive Behavior

```
Desktop (> 768px)
┌─────────────────────────────────────────────────────────┐
│                  What Our Users Say                      │
│         Join thousands of satisfied users                │
│                                                           │
│  ┌───┐  ┌──────────────────────────────────┐  ┌───┐   │
│  │ ← │  │  [Avatar] Name                   │  │ → │   │
│  │   │  │           Role                   │  │   │   │
│  │   │  │           Company                │  │   │   │
│  │   │  │  ★★★★★                          │  │   │   │
│  │   │  │  "Review text here..."          │  │   │   │
│  │   │  │                    January 2024  │  │   │   │
│  └───┘  └──────────────────────────────────┘  └───┘   │
│                                                           │
│              ● ━━━━━━ ○ ○                              │
│                                                           │
│    4.9/5          10+           10,000+                 │
│  Avg Rating   Featured Reviews  Happy Users             │
└─────────────────────────────────────────────────────────┘

Mobile (< 768px)
┌──────────────────────────────┐
│    What Our Users Say        │
│  Join thousands of users     │
│                              │
│  ┌────────────────────────┐ │
│  │  [Avatar]              │ │
│  │   Name                 │ │
│  │   Role                 │ │
│  │   Company              │ │
│  │  ★★★★★               │ │
│  │  "Review text..."      │ │
│  │         January 2024   │ │
│  └────────────────────────┘ │
│                              │
│         ┌───┐  ┌───┐        │
│         │ ← │  │ → │        │
│         └───┘  └───┘        │
│                              │
│      ● ━━━━━━ ○ ○          │
│                              │
│        4.9/5                 │
│     Avg Rating               │
│                              │
│         10+                  │
│   Featured Reviews           │
│                              │
│       10,000+                │
│     Happy Users              │
└──────────────────────────────┘
```

---

**Architecture Status:** ✅ Complete and Production Ready
