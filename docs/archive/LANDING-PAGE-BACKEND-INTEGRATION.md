# Landing Page - Backend Integration & Data Flow

**Date:** February 15, 2026  
**Status:** Integration Plan  
**Priority:** HIGH  

---

## 🔄 Data Flow Architecture

### Overview
The landing page is primarily a static marketing page but requires integration with the backend for:
1. User registration (CTA conversions)
2. Analytics tracking
3. Dynamic stats display
4. Email capture (optional)

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE                         │
│  (Static Content + Dynamic Elements)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ├─────────────────────────────────┐
                          │                                 │
                          ▼                                 ▼
              ┌──────────────────────┐        ┌──────────────────────┐
              │   Registration       │        │   Analytics API      │
              │   /api/auth/register │        │   /api/analytics/*   │
              └──────────────────────┘        └──────────────────────┘
                          │                                 │
                          ▼                                 ▼
              ┌──────────────────────┐        ┌──────────────────────┐
              │   User Entity        │        │   Landing Stats      │
              │   (PostgreSQL)       │        │   (Redis Cache)      │
              └──────────────────────┘        └──────────────────────┘
```

---

## 🎯 Backend Endpoints Required

### 1. Registration Endpoint (Existing)

**Endpoint:** `POST /api/auth/register`

**Purpose:** Handle user signups from landing page CTAs

**Request Body:**
```typescript
{
  email: string;
  password: string;
  fullName: string;
  role: 'INFLUENCER' | 'COMPANY';
  source?: 'landing_hero' | 'landing_influencer' | 'landing_company' | 'landing_final';
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    role: string;
    token: string;
  }
}
```

**Integration:** Already exists, no changes needed

---

### 2. Platform Stats Endpoint (NEW)

**Endpoint:** `GET /api/public/stats`

**Purpose:** Provide real-time platform statistics for landing page

**Response:**
```typescript
{
  totalUsers: number;
  totalMatches: number;
  successRate: number;
  totalPartnerships: number;
  averageMatchScore: number;
  activeUsers: number;
}
```

**Implementation Location:** `backend/src/modules/public/public.controller.ts`

**Caching:** Redis cache with 1-hour TTL

---

### 3. Landing Analytics Endpoint (NEW)

**Endpoint:** `POST /api/public/analytics/track`

**Purpose:** Track landing page interactions

**Request Body:**
```typescript
{
  event: string;
  properties: {
    section?: string;
    ctaType?: string;
    role?: string;
    timestamp: number;
  };
  sessionId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**Implementation Location:** `backend/src/modules/analytics/analytics.controller.ts`

---

### 4. Email Capture Endpoint (OPTIONAL)

**Endpoint:** `POST /api/public/waitlist`

**Purpose:** Capture emails for early access/newsletter

**Request Body:**
```typescript
{
  email: string;
  role?: 'INFLUENCER' | 'COMPANY';
  source: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 🗄️ Database Schema Updates

### New Table: landing_analytics

**Purpose:** Store landing page interaction data

```sql
CREATE TABLE landing_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_properties JSONB,
  user_agent TEXT,
  ip_address VARCHAR(45),
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_session_id (session_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);
```

### New Table: waitlist (OPTIONAL)

**Purpose:** Store email captures

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
```

---

## 🔌 Frontend-Backend Integration

### Registration Flow

**1. User clicks CTA on landing page**
```typescript
// Landing page component
const handleSignup = (role: 'INFLUENCER' | 'COMPANY') => {
  // Track analytics
  trackEvent('cta_click', {
    role,
    section: 'hero',
    timestamp: Date.now()
  });
  
  // Navigate to registration with pre-filled role
  navigate(`/register?role=${role}&source=landing_hero`);
};
```

**2. Registration page receives role parameter**
```typescript
// Register.tsx
const searchParams = new URLSearchParams(location.search);
const prefilledRole = searchParams.get('role');
const source = searchParams.get('source');

// Pre-fill form
useEffect(() => {
  if (prefilledRole) {
    setRole(prefilledRole);
  }
}, [prefilledRole]);
```

**3. Submit registration with source tracking**
```typescript
// auth.service.ts
const register = async (data: RegisterDto) => {
  const response = await apiClient.post('/auth/register', {
    ...data,
    source: data.source || 'direct'
  });
  
  return response.data;
};
```

---

### Stats Display Flow

**1. Fetch stats on landing page mount**
```typescript
// Landing.tsx
const [stats, setStats] = useState({
  totalUsers: 10000,
  totalMatches: 50000,
  successRate: 93,
  totalPartnerships: 5000000
});

useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/public/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      // Use default values on error
      console.error('Failed to fetch stats:', error);
    }
  };
  
  fetchStats();
}, []);
```

**2. Display stats with animation**
```typescript
// StatCard.tsx
const StatCard = ({ value, label, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    // Animate number counting up
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <div className="stat-card">
      <div className="stat-value">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};
```

---

### Analytics Tracking Flow

**1. Initialize analytics on page load**
```typescript
// Landing.tsx
useEffect(() => {
  // Generate or retrieve session ID
  const sessionId = sessionStorage.getItem('landing_session') || 
                    `session_${Date.now()}_${Math.random()}`;
  sessionStorage.setItem('landing_session', sessionId);
  
  // Track page view
  trackEvent('page_view', {
    referrer: document.referrer,
    timestamp: Date.now()
  }, sessionId);
}, []);
```

**2. Track user interactions**
```typescript
// utils/analytics.ts
export const trackEvent = async (
  event: string,
  properties: Record<string, any>,
  sessionId: string
) => {
  try {
    await fetch('/api/public/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties: {
          ...properties,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        },
        sessionId
      })
    });
  } catch (error) {
    // Fail silently - don't disrupt user experience
    console.error('Analytics tracking failed:', error);
  }
};
```

**3. Track scroll depth**
```typescript
// Landing.tsx
useEffect(() => {
  let maxScroll = 0;
  
  const handleScroll = () => {
    const scrollPercent = (window.scrollY / 
      (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      // Track milestones
      if (maxScroll >= 25 && maxScroll < 50) {
        trackEvent('scroll_depth', { depth: 25 });
      } else if (maxScroll >= 50 && maxScroll < 75) {
        trackEvent('scroll_depth', { depth: 50 });
      } else if (maxScroll >= 75) {
        trackEvent('scroll_depth', { depth: 75 });
      }
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## 🔐 Security Considerations

### Rate Limiting

**Protect public endpoints from abuse:**

```typescript
// backend/src/common/guards/public-rate-limit.guard.ts
@Injectable()
export class PublicRateLimitGuard implements CanActivate {
  private requests = new Map<string, number[]>();
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const now = Date.now();
    
    // Get request timestamps for this IP
    const timestamps = this.requests.get(ip) || [];
    
    // Remove timestamps older than 1 minute
    const recentTimestamps = timestamps.filter(t => now - t < 60000);
    
    // Allow max 100 requests per minute
    if (recentTimestamps.length >= 100) {
      throw new HttpException('Too many requests', 429);
    }
    
    // Add current timestamp
    recentTimestamps.push(now);
    this.requests.set(ip, recentTimestamps);
    
    return true;
  }
}
```

### CORS Configuration

**Allow landing page to access public APIs:**

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://yourdomain.com'
  ],
  methods: ['GET', 'POST'],
  credentials: true
});
```

### Input Validation

**Validate all public endpoint inputs:**

```typescript
// backend/src/modules/public/dto/track-event.dto.ts
export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  event: string;
  
  @IsObject()
  properties: Record<string, any>;
  
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
```

---

## 📊 Performance Optimization

### Caching Strategy

**1. Stats Endpoint Caching**
```typescript
// backend/src/modules/public/public.service.ts
@Injectable()
export class PublicService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis
  ) {}
  
  async getStats() {
    // Check cache first
    const cached = await this.redis.get('landing:stats');
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Calculate stats
    const stats = await this.calculateStats();
    
    // Cache for 1 hour
    await this.redis.setex('landing:stats', 3600, JSON.stringify(stats));
    
    return stats;
  }
}
```

**2. Frontend Caching**
```typescript
// Landing.tsx
const [stats, setStats] = useState(() => {
  // Try to load from localStorage
  const cached = localStorage.getItem('landing_stats');
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Use cache if less than 1 hour old
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }
  return null;
});

useEffect(() => {
  const fetchStats = async () => {
    const response = await fetch('/api/public/stats');
    const data = await response.json();
    
    // Update state
    setStats(data);
    
    // Cache in localStorage
    localStorage.setItem('landing_stats', JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };
  
  if (!stats) {
    fetchStats();
  }
}, []);
```

### Lazy Loading

**Load sections as user scrolls:**
```typescript
// Landing.tsx
const [visibleSections, setVisibleSections] = useState({
  hero: true,
  socialProof: false,
  features: false,
  // ... other sections
});

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setVisibleSections(prev => ({
          ...prev,
          [entry.target.id]: true
        }));
      }
    });
  }, { threshold: 0.1 });
  
  // Observe all sections
  document.querySelectorAll('[data-section]').forEach(section => {
    observer.observe(section);
  });
  
  return () => observer.disconnect();
}, []);
```

---

## 🧪 Testing Strategy

### Unit Tests

**Test stats fetching:**
```typescript
// Landing.test.tsx
describe('Landing Page', () => {
  it('should fetch and display stats', async () => {
    const mockStats = {
      totalUsers: 10000,
      totalMatches: 50000,
      successRate: 93
    };
    
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => mockStats
    } as Response);
    
    render(<Landing />);
    
    await waitFor(() => {
      expect(screen.getByText('10,000+')).toBeInTheDocument();
      expect(screen.getByText('50,000+')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

**Test registration flow:**
```typescript
// registration-flow.test.tsx
describe('Registration Flow', () => {
  it('should navigate to registration with role', () => {
    render(<Landing />);
    
    const influencerCTA = screen.getByText("I'm an Influencer");
    fireEvent.click(influencerCTA);
    
    expect(mockNavigate).toHaveBeenCalledWith(
      '/register?role=INFLUENCER&source=landing_hero'
    );
  });
});
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

**1. Conversion Funnel**
```
Landing Page View → CTA Click → Registration Start → Registration Complete
```

**2. Performance Metrics**
- Page load time
- Time to interactive
- First contentful paint
- Largest contentful paint

**3. User Behavior**
- Scroll depth
- Time on page
- Section engagement
- Exit points

### Implementation

**Backend logging:**
```typescript
// backend/src/modules/analytics/analytics.service.ts
async trackLandingEvent(dto: TrackEventDto) {
  await this.analyticsRepository.save({
    sessionId: dto.sessionId,
    eventType: dto.event,
    eventProperties: dto.properties,
    createdAt: new Date()
  });
  
  // Also send to external analytics (Google Analytics, Mixpanel, etc.)
  this.externalAnalytics.track(dto.event, dto.properties);
}
```

---

## 🚀 Deployment Checklist

### Backend Changes
- [ ] Create public module
- [ ] Implement stats endpoint
- [ ] Implement analytics endpoint
- [ ] Add rate limiting
- [ ] Configure CORS
- [ ] Set up Redis caching
- [ ] Create database migrations
- [ ] Deploy to staging
- [ ] Test all endpoints
- [ ] Deploy to production

### Frontend Changes
- [ ] Create landing page components
- [ ] Integrate with backend APIs
- [ ] Add analytics tracking
- [ ] Test registration flow
- [ ] Optimize performance
- [ ] Test on multiple devices
- [ ] Deploy to staging
- [ ] Final QA
- [ ] Deploy to production

---

## 📚 API Documentation

### Complete API Reference

**Base URL:** `https://api.yourdomain.com`

**Public Endpoints:**
- `GET /api/public/stats` - Get platform statistics
- `POST /api/public/analytics/track` - Track landing page events
- `POST /api/public/waitlist` - Add email to waitlist (optional)

**Authentication Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

---

**Status:** ✅ INTEGRATION PLAN COMPLETE  
**Next Step:** Implement backend endpoints  
**Estimated Time:** 2-3 days for backend, 1 week for frontend  

