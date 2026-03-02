# Phase 6: Search & Discovery - Implementation Plan

**Date:** February 11, 2026  
**Priority:** MEDIUM - User Experience Enhancement  
**Estimated Time:** Week 6-7  
**Status:** 📋 PLANNING

---

## Executive Summary

This plan implements a comprehensive Search & Discovery system following DRY principles, maintaining consistency with existing components, and ensuring full responsiveness. We'll leverage existing components (Avatar, Card, MatchActionBar) and patterns established in the codebase.

---

## Current State Analysis

### ✅ What Already Exists

1. **Basic Search in Header** (AppLayout.tsx)
   - Search input in header
   - Debounced search (300ms)
   - Basic filtering of matches
   - Dropdown with results
   - Navigation to profiles

2. **Backend Search Endpoint**
   - `GET /users/search?q=query` (matching.controller.ts)
   - Basic user search functionality

3. **Reusable Components**
   - Avatar component
   - Card component
   - MatchCard component
   - MatchActionBar component
   - FilterPanel component
   - Skeleton component

### ❌ What's Missing

1. **Enhanced Global Search**
   - No search for posts
   - No search for campaigns
   - No search filters
   - No search history
   - No trending searches

2. **Dedicated Search Results Page**
   - No full search results view
   - No tabbed interface
   - No advanced filters
   - No sorting options

3. **Discovery Page**
   - No user discovery page
   - No trending users
   - No suggested connections
   - No category browsing

4. **Backend Enhancements**
   - No full-text search
   - No search for posts/campaigns
   - No trending algorithm
   - No search analytics

---

## Implementation Strategy

### Phase 6A: Enhanced Global Search (Week 6, Days 1-3)
### Phase 6B: Search Results Page (Week 6, Days 4-5)
### Phase 6C: Discovery Page (Week 7, Days 1-3)
### Phase 6D: Backend Enhancements (Week 7, Days 4-5)

---

## Detailed Implementation Plan


## PHASE 6A: Enhanced Global Search

### Goal
Upgrade the existing header search to support multiple content types with better UX.

### Components to Create/Update

#### 1. GlobalSearch Component (NEW)
**Location:** `src/renderer/components/GlobalSearch/`

**Purpose:** Replace basic search in AppLayout with enhanced version

**Features:**
- Multi-type search (Users, Posts, Campaigns)
- Search history (localStorage)
- Trending searches
- Keyboard navigation (↑↓ arrows, Enter, Esc)
- Loading states
- Empty states
- Recent searches

**Files:**
```
GlobalSearch/
├── GlobalSearch.tsx
├── GlobalSearch.css
├── SearchDropdown.tsx
├── SearchDropdown.css
├── SearchResultItem.tsx
├── SearchResultItem.css
└── index.ts
```

**Component Structure:**
```typescript
interface GlobalSearchProps {
  placeholder?: string;
  autoFocus?: boolean;
  onResultClick?: (result: SearchResult) => void;
}

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'campaign';
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}
```

**Key Features:**
- Debounced search (300ms) - reuse existing hook
- Tab to switch between types
- Show recent searches when empty
- Show trending when no query
- Keyboard shortcuts (Cmd/Ctrl + K to focus)

---

#### 2. SearchHistory Hook (NEW)
**Location:** `src/renderer/hooks/useSearchHistory.ts`

**Purpose:** Manage search history in localStorage (DRY principle)

```typescript
export const useSearchHistory = (maxItems = 10) => {
  const [history, setHistory] = useState<SearchResult[]>([]);
  
  const addToHistory = (result: SearchResult) => {
    // Add to history, remove duplicates, limit to maxItems
  };
  
  const removeFromHistory = (id: string) => {
    // Remove specific item
  };
  
  const clearHistory = () => {
    // Clear all history
  };
  
  return { history, addToHistory, removeFromHistory, clearHistory };
};
```

---

#### 3. Update AppLayout
**Location:** `src/renderer/layouts/AppLayout/AppLayout.tsx`

**Changes:**
- Replace basic search with GlobalSearch component
- Remove inline search logic
- Keep existing layout structure

---

### Backend Updates

#### 1. Enhanced Search Controller
**Location:** `backend/src/modules/search/search.controller.ts` (NEW)

**Endpoints:**
```typescript
GET /api/search/users?q=query&limit=10
GET /api/search/posts?q=query&limit=10
GET /api/search/campaigns?q=query&limit=10
GET /api/search/all?q=query&limit=30
GET /api/search/trending
```

#### 2. Search Service
**Location:** `backend/src/modules/search/search.service.ts` (NEW)

**Methods:**
```typescript
async searchUsers(query: string, userId: string, limit: number)
async searchPosts(query: string, userId: string, limit: number)
async searchCampaigns(query: string, userId: string, limit: number)
async searchAll(query: string, userId: string, limit: number)
async getTrending(userId: string)
```

**Search Strategy:**
- Use PostgreSQL ILIKE for simple text search
- Search across: name, bio, niche, industry, location
- Order by relevance (exact match > starts with > contains)
- Filter by user role (show opposite role for matches)

---


## PHASE 6B: Search Results Page

### Goal
Create a dedicated page for comprehensive search results with filters and sorting.

### Components to Create

#### 1. SearchResults Page (NEW)
**Location:** `src/renderer/pages/SearchResults.tsx`

**Purpose:** Full-page search results with advanced features

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Search: "fashion influencer"          [Filters ▼] │
├─────────────────────────────────────────────────────┤
│  [Users] [Posts] [Campaigns]                        │
├─────────────────────────────────────────────────────┤
│  Sort: [Relevance ▼]  View: [Grid] [List]          │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  User Card   │  │  User Card   │  │  User    │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  User Card   │  │  User Card   │  │  User    │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Tabbed interface (Users, Posts, Campaigns)
- Grid/List view toggle
- Sort options (Relevance, Recent, Popular)
- Filters panel (location, niche, budget, etc.)
- Infinite scroll or pagination
- Empty states
- Loading skeletons

**Files:**
```
pages/
├── SearchResults.tsx
└── SearchResults.css
```

---

#### 2. UserCard Component (NEW)
**Location:** `src/renderer/components/UserCard/`

**Purpose:** Compact user card for search results (reuse MatchCard pattern)

**Features:**
- Avatar
- Name
- Role badge (Influencer/Company)
- Key stats (followers, engagement, budget)
- Quick actions (Connect, Message, View Profile)
- Responsive (grid/list view)

**Differences from MatchCard:**
- No match score
- Smaller size
- Simplified stats
- Quick connect button

**Files:**
```
UserCard/
├── UserCard.tsx
├── UserCard.css
└── index.ts
```

**Component Structure:**
```typescript
interface UserCardProps {
  user: {
    id: string;
    name: string;
    role: 'influencer' | 'company';
    avatarUrl?: string;
    bio?: string;
    location?: string;
    // Role-specific fields
    niche?: string;
    audienceSize?: number;
    engagementRate?: number;
    industry?: string;
    budget?: number;
  };
  view?: 'grid' | 'list';
  showActions?: boolean;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}
```

---

#### 3. SearchFilters Component (NEW)
**Location:** `src/renderer/components/SearchFilters/`

**Purpose:** Advanced filters for search results (reuse FilterPanel pattern)

**Features:**
- Location filter
- Niche/Industry filter
- Audience size range
- Budget range
- Engagement rate range
- Platform filter
- Clear all filters

**Files:**
```
SearchFilters/
├── SearchFilters.tsx
├── SearchFilters.css
└── index.ts
```

**Reuse Existing:**
- FilterPanel component structure
- useMatchFilters hook pattern

---

#### 4. ViewToggle Component (NEW)
**Location:** `src/renderer/components/ViewToggle/`

**Purpose:** Toggle between grid and list view (DRY - reusable)

**Files:**
```
ViewToggle/
├── ViewToggle.tsx
├── ViewToggle.css
└── index.ts
```

```typescript
interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}
```

---

### Backend Updates

#### 1. Search Results Endpoint
**Location:** `backend/src/modules/search/search.controller.ts`

**New Endpoint:**
```typescript
GET /api/search/results?q=query&type=users&page=1&limit=20&sort=relevance&filters={}
```

**Query Parameters:**
- `q`: Search query
- `type`: users | posts | campaigns
- `page`: Page number
- `limit`: Results per page
- `sort`: relevance | recent | popular
- `filters`: JSON string with filters

**Response:**
```typescript
{
  results: SearchResult[],
  total: number,
  page: number,
  limit: number,
  hasMore: boolean
}
```

---


## PHASE 6C: Discovery Page

### Goal
Create a dedicated discovery page for users to find new connections and trending content.

### Components to Create

#### 1. Discover Page (NEW)
**Location:** `src/renderer/pages/Discover.tsx`

**Purpose:** Help users discover new connections and content

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Discover                                           │
├─────────────────────────────────────────────────────┤
│  [For You] [Trending] [New Users] [Categories]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Suggested For You                    [See All →]  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  User    │  │  User    │  │  User    │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  Trending Influencers                 [See All →]  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  User    │  │  User    │  │  User    │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  New Companies                        [See All →]  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  User    │  │  User    │  │  User    │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  Browse by Category                                │
│  [Fashion] [Tech] [Food] [Travel] [Beauty]        │
│  [Fitness] [Gaming] [Music] [Art] [Business]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Tabbed sections (For You, Trending, New Users, Categories)
- Horizontal scrollable carousels
- Category chips
- Personalized recommendations
- Trending algorithm
- New user highlights

**Files:**
```
pages/
├── Discover.tsx
└── Discover.css
```

---

#### 2. DiscoverySection Component (NEW)
**Location:** `src/renderer/components/DiscoverySection/`

**Purpose:** Reusable section for discovery page (DRY principle)

**Features:**
- Title with "See All" link
- Horizontal scrollable carousel
- Responsive grid on mobile
- Loading skeletons
- Empty states

**Files:**
```
DiscoverySection/
├── DiscoverySection.tsx
├── DiscoverySection.css
└── index.ts
```

```typescript
interface DiscoverySectionProps {
  title: string;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  onSeeAll?: () => void;
  loading?: boolean;
  emptyMessage?: string;
}
```

---

#### 3. CategoryChip Component (NEW)
**Location:** `src/renderer/components/CategoryChip/`

**Purpose:** Clickable category chips (reusable)

**Files:**
```
CategoryChip/
├── CategoryChip.tsx
├── CategoryChip.css
└── index.ts
```

```typescript
interface CategoryChipProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}
```

---

#### 4. TrendingBadge Component (NEW)
**Location:** `src/renderer/components/TrendingBadge/`

**Purpose:** Badge to show trending status (reusable)

**Files:**
```
TrendingBadge/
├── TrendingBadge.tsx
├── TrendingBadge.css
└── index.ts
```

---

### Backend Updates

#### 1. Discovery Controller (NEW)
**Location:** `backend/src/modules/discovery/discovery.controller.ts`

**Endpoints:**
```typescript
GET /api/discovery/suggested        // Personalized suggestions
GET /api/discovery/trending         // Trending users
GET /api/discovery/new-users        // Recently joined users
GET /api/discovery/categories       // Browse by category
GET /api/discovery/category/:name   // Users in specific category
```

#### 2. Discovery Service (NEW)
**Location:** `backend/src/modules/discovery/discovery.service.ts`

**Methods:**
```typescript
async getSuggestedUsers(userId: string, limit: number)
async getTrendingUsers(userId: string, limit: number)
async getNewUsers(userId: string, limit: number)
async getCategories()
async getUsersByCategory(category: string, userId: string, limit: number)
```

**Algorithms:**

**Suggested Users:**
- Based on match score
- Exclude already connected
- Prioritize similar niche/industry
- Consider location proximity

**Trending Users:**
- Recent activity (posts, engagement)
- Connection growth rate
- Profile completeness
- Engagement rate

**New Users:**
- Recently registered (last 30 days)
- Profile completed
- Opposite role
- Order by registration date

---


## PHASE 6D: Backend Enhancements

### Goal
Implement robust search infrastructure with PostgreSQL full-text search.

### Database Updates

#### 1. Search Indexes Migration
**Location:** `backend/src/database/migrations/1707586000000-CreateSearchIndexes.ts`

**Purpose:** Add full-text search indexes for better performance

```typescript
// Add GIN indexes for full-text search
CREATE INDEX idx_influencer_profile_search 
ON influencer_profiles 
USING GIN (to_tsvector('english', 
  COALESCE(name, '') || ' ' || 
  COALESCE(bio, '') || ' ' || 
  COALESCE(niche, '') || ' ' || 
  COALESCE(location, '')
));

CREATE INDEX idx_company_profile_search 
ON company_profiles 
USING GIN (to_tsvector('english', 
  COALESCE(company_name, '') || ' ' || 
  COALESCE(bio, '') || ' ' || 
  COALESCE(industry, '') || ' ' || 
  COALESCE(location, '')
));

CREATE INDEX idx_feed_posts_search 
ON feed_posts 
USING GIN (to_tsvector('english', 
  COALESCE(content, '')
));

CREATE INDEX idx_campaigns_search 
ON campaigns 
USING GIN (to_tsvector('english', 
  COALESCE(title, '') || ' ' || 
  COALESCE(description, '')
));
```

---

#### 2. Search Analytics Table (NEW)
**Location:** `backend/src/database/migrations/1707586100000-CreateSearchAnalytics.ts`

**Purpose:** Track search queries for trending and analytics

```typescript
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_type VARCHAR(50), -- 'user', 'post', 'campaign'
  result_count INTEGER,
  clicked_result_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_analytics_query ON search_analytics(query);
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at);
```

---

### Backend Modules

#### 1. Search Module (NEW)
**Location:** `backend/src/modules/search/`

**Structure:**
```
search/
├── search.module.ts
├── search.controller.ts
├── search.service.ts
├── entities/
│   └── search-analytics.entity.ts
└── dto/
    ├── search-query.dto.ts
    └── search-result.dto.ts
```

**search.service.ts:**
```typescript
@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(InfluencerProfile) private influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile) private companyRepo: Repository<CompanyProfile>,
    @InjectRepository(FeedPost) private postRepo: Repository<FeedPost>,
    @InjectRepository(Campaign) private campaignRepo: Repository<Campaign>,
    @InjectRepository(SearchAnalytics) private analyticsRepo: Repository<SearchAnalytics>,
  ) {}

  async searchUsers(query: string, userId: string, options: SearchOptions) {
    // Use PostgreSQL full-text search
    // Track analytics
    // Return formatted results
  }

  async searchPosts(query: string, userId: string, options: SearchOptions) {
    // Search posts with full-text
    // Filter by visibility
    // Return formatted results
  }

  async searchCampaigns(query: string, userId: string, options: SearchOptions) {
    // Search campaigns
    // Filter by status
    // Return formatted results
  }

  async getTrendingSearches(limit: number) {
    // Get most popular searches from last 7 days
    // Group by query
    // Order by count
  }

  async trackSearch(userId: string, query: string, resultType: string, resultCount: number) {
    // Save to analytics table
  }

  async trackSearchClick(userId: string, query: string, resultId: string) {
    // Update analytics with clicked result
  }
}
```

---

#### 2. Discovery Module (NEW)
**Location:** `backend/src/modules/discovery/`

**Structure:**
```
discovery/
├── discovery.module.ts
├── discovery.controller.ts
├── discovery.service.ts
└── dto/
    └── discovery-options.dto.ts
```

**discovery.service.ts:**
```typescript
@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Connection) private connectionRepo: Repository<Connection>,
    private matchingService: MatchingService,
  ) {}

  async getSuggestedUsers(userId: string, limit: number) {
    // Get top matches
    // Exclude connected users
    // Return formatted results
  }

  async getTrendingUsers(userId: string, limit: number) {
    // Calculate trending score
    // Based on recent activity
    // Return formatted results
  }

  async getNewUsers(userId: string, limit: number) {
    // Get recently registered users
    // Filter by opposite role
    // Return formatted results
  }

  async getCategories() {
    // Return list of categories
    // With user counts
  }

  async getUsersByCategory(category: string, userId: string, limit: number) {
    // Filter users by niche/industry
    // Return formatted results
  }
}
```

---


## DRY Principles & Code Reuse

### Reusable Components

#### 1. Card Components
**Reuse Pattern:**
- MatchCard → UserCard (simplified version)
- CampaignCard → SearchResultCard (adapt for search)
- Card component → Base for all cards

**Shared Props:**
```typescript
interface BaseCardProps {
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}
```

---

#### 2. Action Bars
**Reuse Pattern:**
- MatchActionBar → UserCardActionBar
- ActionBar → PostCardActionBar

**Shared Structure:**
```typescript
interface ActionBarProps {
  items: ActionItem[];
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}
```

---

#### 3. Filters
**Reuse Pattern:**
- FilterPanel → SearchFilters
- useMatchFilters → useSearchFilters

**Shared Hook:**
```typescript
export const useFilters = <T extends Record<string, any>>(
  initialFilters: T,
  onFilterChange?: (filters: T) => void
) => {
  const [filters, setFilters] = useState<T>(initialFilters);
  
  const updateFilter = (key: keyof T, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };
  
  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
  };
  
  return { filters, updateFilter, clearFilters };
};
```

---

#### 4. Loading States
**Reuse Pattern:**
- Skeleton component → All loading states
- MatchCardSkeleton → UserCardSkeleton

**Shared Component:**
```typescript
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={200} />
      ))}
    </>
  );
};
```

---

### Shared Hooks

#### 1. useDebounce (Already Exists)
**Location:** `src/renderer/hooks/useDebounce.ts`
**Usage:** Search input, filters

#### 2. useClickOutside (Already Exists)
**Location:** `src/renderer/hooks/useClickOutside.ts`
**Usage:** Dropdowns, modals

#### 3. useInfiniteScroll (NEW)
**Location:** `src/renderer/hooks/useInfiniteScroll.ts`

```typescript
export const useInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasMore: boolean,
  loading: boolean
) => {
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, loadMore]);

  return loadMoreRef;
};
```

---

### Shared Services

#### 1. Search Service (NEW)
**Location:** `src/renderer/services/search.service.ts`

```typescript
class SearchService {
  async searchUsers(query: string, options?: SearchOptions) {
    return apiClient.get('/search/users', { params: { q: query, ...options } });
  }

  async searchPosts(query: string, options?: SearchOptions) {
    return apiClient.get('/search/posts', { params: { q: query, ...options } });
  }

  async searchCampaigns(query: string, options?: SearchOptions) {
    return apiClient.get('/search/campaigns', { params: { q: query, ...options } });
  }

  async searchAll(query: string, options?: SearchOptions) {
    return apiClient.get('/search/all', { params: { q: query, ...options } });
  }

  async getTrending() {
    return apiClient.get('/search/trending');
  }
}

export const searchService = new SearchService();
```

#### 2. Discovery Service (NEW)
**Location:** `src/renderer/services/discovery.service.ts`

```typescript
class DiscoveryService {
  async getSuggested(limit?: number) {
    return apiClient.get('/discovery/suggested', { params: { limit } });
  }

  async getTrending(limit?: number) {
    return apiClient.get('/discovery/trending', { params: { limit } });
  }

  async getNewUsers(limit?: number) {
    return apiClient.get('/discovery/new-users', { params: { limit } });
  }

  async getCategories() {
    return apiClient.get('/discovery/categories');
  }

  async getUsersByCategory(category: string, limit?: number) {
    return apiClient.get(`/discovery/category/${category}`, { params: { limit } });
  }
}

export const discoveryService = new DiscoveryService();
```

---


## Responsive Design Strategy

### Breakpoints (Consistent with Existing)
```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
}
```

### Component Responsiveness

#### 1. GlobalSearch
```css
/* Mobile: Full width, simplified */
@media (max-width: 768px) {
  .global-search {
    width: 100%;
    max-width: none;
  }
  
  .search-dropdown {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    max-height: calc(100vh - 60px);
  }
}

/* Desktop: Fixed width, positioned */
@media (min-width: 769px) {
  .global-search {
    width: 400px;
  }
  
  .search-dropdown {
    position: absolute;
    max-height: 500px;
  }
}
```

---

#### 2. SearchResults Page
```css
/* Mobile: Single column */
@media (max-width: 768px) {
  .search-results-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .search-filters {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(100%);
    transition: transform 0.3s;
  }
  
  .search-filters.open {
    transform: translateY(0);
  }
}

/* Tablet: 2 columns */
@media (min-width: 769px) and (max-width: 1024px) {
  .search-results-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Desktop: 3 columns */
@media (min-width: 1025px) {
  .search-results-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}
```

---

#### 3. UserCard
```css
/* Grid View */
.user-card.grid {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

/* List View */
.user-card.list {
  display: flex;
  flex-direction: row;
  padding: 12px;
  gap: 16px;
}

/* Mobile: Always list view */
@media (max-width: 768px) {
  .user-card {
    flex-direction: row;
    padding: 12px;
  }
}
```

---

#### 4. Discover Page
```css
/* Mobile: Vertical scroll */
@media (max-width: 768px) {
  .discovery-section {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  
  .discovery-section-items {
    display: flex;
    gap: 12px;
    padding: 0 16px;
  }
  
  .discovery-section-item {
    flex: 0 0 280px;
    scroll-snap-align: start;
  }
}

/* Desktop: Grid with horizontal scroll */
@media (min-width: 769px) {
  .discovery-section-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}
```

---

### Touch Interactions (Mobile)

#### 1. Swipe Gestures
```typescript
// For discovery carousels
const useSwipeGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150) {
      onSwipeLeft?.();
    }
    if (touchStart - touchEnd < -150) {
      onSwipeRight?.();
    }
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};
```

---

#### 2. Pull to Refresh
```typescript
// For search results and discovery
const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Implementation for pull-to-refresh gesture
  // Trigger onRefresh when pulled down enough
};
```

---

### Performance Optimizations

#### 1. Lazy Loading
```typescript
// Lazy load search results page
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Discover = lazy(() => import('./pages/Discover'));

// In routes
<Route path="/search" element={
  <Suspense fallback={<PageSkeleton />}>
    <SearchResults />
  </Suspense>
} />
```

---

#### 2. Virtual Scrolling (For Large Lists)
```typescript
// Use react-window for large search results
import { FixedSizeList } from 'react-window';

const SearchResultsList = ({ results }) => (
  <FixedSizeList
    height={600}
    itemCount={results.length}
    itemSize={100}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <UserCard user={results[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

---

#### 3. Image Optimization
```typescript
// Lazy load images in cards
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={loaded ? src : '/placeholder.png'}
      alt={alt}
      loading="lazy"
    />
  );
};
```

---


## Implementation Checklist

### Phase 6A: Enhanced Global Search (Days 1-3)

#### Backend
- [ ] Create Search module
- [ ] Create SearchController with endpoints
- [ ] Create SearchService with methods
- [ ] Add search analytics table migration
- [ ] Add full-text search indexes migration
- [ ] Implement user search with PostgreSQL
- [ ] Implement post search
- [ ] Implement campaign search
- [ ] Implement trending searches
- [ ] Add search analytics tracking
- [ ] Test all endpoints

#### Frontend
- [ ] Create GlobalSearch component
- [ ] Create SearchDropdown component
- [ ] Create SearchResultItem component
- [ ] Create useSearchHistory hook
- [ ] Create search.service.ts
- [ ] Update AppLayout to use GlobalSearch
- [ ] Add keyboard navigation
- [ ] Add search history
- [ ] Add trending searches
- [ ] Style components (responsive)
- [ ] Test on mobile/tablet/desktop

---

### Phase 6B: Search Results Page (Days 4-5)

#### Backend
- [ ] Add paginated search endpoint
- [ ] Add filter support to search
- [ ] Add sorting options
- [ ] Test pagination
- [ ] Test filters
- [ ] Test sorting

#### Frontend
- [ ] Create SearchResults page
- [ ] Create UserCard component
- [ ] Create SearchFilters component
- [ ] Create ViewToggle component
- [ ] Create useSearchFilters hook
- [ ] Add tabbed interface
- [ ] Add grid/list view toggle
- [ ] Add sort dropdown
- [ ] Add filters panel
- [ ] Add infinite scroll
- [ ] Add loading skeletons
- [ ] Add empty states
- [ ] Style components (responsive)
- [ ] Test on mobile/tablet/desktop
- [ ] Add to routes

---

### Phase 6C: Discovery Page (Days 1-3)

#### Backend
- [ ] Create Discovery module
- [ ] Create DiscoveryController
- [ ] Create DiscoveryService
- [ ] Implement suggested users algorithm
- [ ] Implement trending users algorithm
- [ ] Implement new users query
- [ ] Implement categories
- [ ] Implement category filtering
- [ ] Test all endpoints

#### Frontend
- [ ] Create Discover page
- [ ] Create DiscoverySection component
- [ ] Create CategoryChip component
- [ ] Create TrendingBadge component
- [ ] Create discovery.service.ts
- [ ] Add tabbed sections
- [ ] Add horizontal carousels
- [ ] Add category browsing
- [ ] Add loading states
- [ ] Add empty states
- [ ] Style components (responsive)
- [ ] Test on mobile/tablet/desktop
- [ ] Add to routes
- [ ] Add to navigation

---

### Phase 6D: Backend Enhancements (Days 4-5)

#### Database
- [ ] Run search indexes migration
- [ ] Run analytics table migration
- [ ] Verify indexes created
- [ ] Test query performance

#### Backend
- [ ] Optimize search queries
- [ ] Add caching for trending
- [ ] Add rate limiting
- [ ] Add search analytics
- [ ] Add monitoring
- [ ] Performance testing
- [ ] Load testing

#### Frontend
- [ ] Add error handling
- [ ] Add retry logic
- [ ] Add offline support
- [ ] Add analytics tracking
- [ ] Performance optimization
- [ ] Bundle size optimization

---

## Testing Strategy

### Unit Tests

#### Backend
```typescript
// search.service.spec.ts
describe('SearchService', () => {
  it('should search users by name', async () => {
    const results = await service.searchUsers('john', userId);
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
  });

  it('should filter by location', async () => {
    const results = await service.searchUsers('john', userId, {
      filters: { location: 'New York' }
    });
    expect(results.every(r => r.location === 'New York')).toBe(true);
  });

  it('should track search analytics', async () => {
    await service.trackSearch(userId, 'test query', 'user', 5);
    const analytics = await analyticsRepo.findOne({ where: { query: 'test query' } });
    expect(analytics).toBeDefined();
  });
});
```

#### Frontend
```typescript
// GlobalSearch.test.tsx
describe('GlobalSearch', () => {
  it('should render search input', () => {
    render(<GlobalSearch />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    const mockSearch = jest.fn();
    render(<GlobalSearch onSearch={mockSearch} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(mockSearch).not.toHaveBeenCalled();
    
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('test');
    }, { timeout: 400 });
  });

  it('should show search results', async () => {
    const mockResults = [{ id: '1', name: 'John Doe', type: 'user' }];
    jest.spyOn(searchService, 'searchAll').mockResolvedValue({ data: mockResults });
    
    render(<GlobalSearch />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'john' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

---

### Integration Tests

```typescript
// search.e2e.spec.ts
describe('Search Flow (e2e)', () => {
  it('should complete full search flow', async () => {
    // 1. User types in search
    await page.type('[data-testid="global-search"]', 'fashion');
    
    // 2. Dropdown appears with results
    await page.waitForSelector('[data-testid="search-dropdown"]');
    
    // 3. User clicks "See all results"
    await page.click('[data-testid="see-all-results"]');
    
    // 4. Navigate to search results page
    await page.waitForNavigation();
    expect(page.url()).toContain('/search?q=fashion');
    
    // 5. Results are displayed
    const results = await page.$$('[data-testid="user-card"]');
    expect(results.length).toBeGreaterThan(0);
    
    // 6. User applies filter
    await page.click('[data-testid="filter-location"]');
    await page.click('[data-testid="location-new-york"]');
    
    // 7. Results update
    await page.waitForSelector('[data-testid="user-card"]');
    
    // 8. User clicks on a result
    await page.click('[data-testid="user-card"]:first-child');
    
    // 9. Navigate to profile
    await page.waitForNavigation();
    expect(page.url()).toContain('/profile/');
  });
});
```

---


## File Structure Summary

### New Files to Create

```
Frontend:
├── src/renderer/
│   ├── components/
│   │   ├── GlobalSearch/
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── GlobalSearch.css
│   │   │   ├── SearchDropdown.tsx
│   │   │   ├── SearchDropdown.css
│   │   │   ├── SearchResultItem.tsx
│   │   │   ├── SearchResultItem.css
│   │   │   └── index.ts
│   │   ├── UserCard/
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserCard.css
│   │   │   └── index.ts
│   │   ├── SearchFilters/
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── SearchFilters.css
│   │   │   └── index.ts
│   │   ├── ViewToggle/
│   │   │   ├── ViewToggle.tsx
│   │   │   ├── ViewToggle.css
│   │   │   └── index.ts
│   │   ├── DiscoverySection/
│   │   │   ├── DiscoverySection.tsx
│   │   │   ├── DiscoverySection.css
│   │   │   └── index.ts
│   │   ├── CategoryChip/
│   │   │   ├── CategoryChip.tsx
│   │   │   ├── CategoryChip.css
│   │   │   └── index.ts
│   │   └── TrendingBadge/
│   │       ├── TrendingBadge.tsx
│   │       ├── TrendingBadge.css
│   │       └── index.ts
│   ├── pages/
│   │   ├── SearchResults.tsx
│   │   ├── SearchResults.css
│   │   ├── Discover.tsx
│   │   └── Discover.css
│   ├── hooks/
│   │   ├── useSearchHistory.ts
│   │   ├── useSearchFilters.ts
│   │   └── useInfiniteScroll.ts
│   └── services/
│       ├── search.service.ts
│       └── discovery.service.ts

Backend:
├── src/
│   ├── modules/
│   │   ├── search/
│   │   │   ├── search.module.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   ├── entities/
│   │   │   │   └── search-analytics.entity.ts
│   │   │   └── dto/
│   │   │       ├── search-query.dto.ts
│   │   │       └── search-result.dto.ts
│   │   └── discovery/
│   │       ├── discovery.module.ts
│   │       ├── discovery.controller.ts
│   │       ├── discovery.service.ts
│   │       └── dto/
│   │           └── discovery-options.dto.ts
│   └── database/
│       └── migrations/
│           ├── 1707586000000-CreateSearchIndexes.ts
│           └── 1707586100000-CreateSearchAnalytics.ts
```

---

## API Endpoints Summary

### Search Endpoints
```
GET  /api/search/users?q=query&limit=10
GET  /api/search/posts?q=query&limit=10
GET  /api/search/campaigns?q=query&limit=10
GET  /api/search/all?q=query&limit=30
GET  /api/search/trending
GET  /api/search/results?q=query&type=users&page=1&limit=20&sort=relevance&filters={}
POST /api/search/track (analytics)
```

### Discovery Endpoints
```
GET  /api/discovery/suggested?limit=10
GET  /api/discovery/trending?limit=10
GET  /api/discovery/new-users?limit=10
GET  /api/discovery/categories
GET  /api/discovery/category/:name?limit=20
```

---

## Routes to Add

```typescript
// src/renderer/AppComponent.tsx
<Route path="/search" element={<SearchResults />} />
<Route path="/discover" element={<Discover />} />
```

---

## Navigation Updates

```typescript
// Add to sidebar navigation
{
  path: '/discover',
  icon: <HiSearch />,
  label: 'Discover',
}
```

---

## Success Metrics

### User Engagement
- Search usage rate (% of users who search)
- Average searches per user per session
- Search-to-click rate
- Discovery page visits
- Connections from discovery

### Performance
- Search response time < 200ms
- Page load time < 1s
- Time to interactive < 2s
- Lighthouse score > 90

### Business
- Increased user connections
- Increased platform engagement
- Reduced bounce rate
- Increased session duration

---

## Risk Assessment

### Technical Risks
- **PostgreSQL full-text search performance**
  - Mitigation: Add proper indexes, use caching
  
- **Large result sets**
  - Mitigation: Pagination, virtual scrolling
  
- **Mobile performance**
  - Mitigation: Lazy loading, code splitting

### UX Risks
- **Search relevance**
  - Mitigation: Tune search algorithm, collect feedback
  
- **Information overload**
  - Mitigation: Clear categorization, filters

---

## Future Enhancements

### Phase 6+
1. **Advanced Search**
   - Boolean operators (AND, OR, NOT)
   - Exact phrase matching
   - Wildcard search

2. **AI-Powered Search**
   - Semantic search
   - Natural language queries
   - Smart suggestions

3. **Search Analytics Dashboard**
   - Popular searches
   - Search trends
   - User behavior insights

4. **Saved Searches**
   - Save search queries
   - Get notifications for new results
   - Search alerts

5. **Voice Search**
   - Speech-to-text
   - Voice commands

---

## Conclusion

This comprehensive plan implements Phase 6: Search & Discovery with:

✅ **DRY Principles** - Reusable components and hooks  
✅ **Consistency** - Follows existing patterns  
✅ **Responsiveness** - Mobile-first design  
✅ **Performance** - Optimized queries and lazy loading  
✅ **Scalability** - PostgreSQL full-text search  
✅ **Analytics** - Track search behavior  
✅ **User Experience** - Intuitive interface  

**Ready to implement!** 🚀

---

**Next Steps:**
1. Review and approve plan
2. Start with Phase 6A (Enhanced Global Search)
3. Iterate based on feedback
4. Monitor metrics and optimize

**Estimated Timeline:**
- Phase 6A: 3 days
- Phase 6B: 2 days
- Phase 6C: 3 days
- Phase 6D: 2 days
- **Total: 10 days (2 weeks)**
