# Phase 6: Search & Discovery - Quick Reference

**Status:** 📋 Ready to Implement  
**Timeline:** 2 Weeks (10 days)  
**Priority:** MEDIUM

---

## What We're Building

### 1. Enhanced Global Search
- Multi-type search (Users, Posts, Campaigns)
- Autocomplete dropdown
- Search history
- Trending searches
- Keyboard navigation

### 2. Search Results Page
- Tabbed interface
- Grid/List view toggle
- Advanced filters
- Sorting options
- Infinite scroll

### 3. Discovery Page
- Suggested users
- Trending influencers/companies
- New users
- Category browsing
- Horizontal carousels

### 4. Backend Infrastructure
- PostgreSQL full-text search
- Search analytics
- Trending algorithms
- Performance optimization

---

## Component Reuse (DRY)

### Existing Components We'll Reuse
✅ Avatar  
✅ Card  
✅ MatchActionBar → UserCardActionBar  
✅ FilterPanel → SearchFilters  
✅ Skeleton  
✅ useDebounce hook  
✅ useClickOutside hook  

### New Components We'll Create
🆕 GlobalSearch  
🆕 UserCard (simplified MatchCard)  
🆕 SearchFilters  
🆕 ViewToggle  
🆕 DiscoverySection  
🆕 CategoryChip  
🆕 TrendingBadge  

---

## Implementation Order

### Week 1
**Days 1-3:** Enhanced Global Search  
- Backend: Search module, endpoints, indexes
- Frontend: GlobalSearch component, search service

**Days 4-5:** Search Results Page  
- Backend: Pagination, filters, sorting
- Frontend: SearchResults page, UserCard, filters

### Week 2
**Days 1-3:** Discovery Page  
- Backend: Discovery module, algorithms
- Frontend: Discover page, carousels, categories

**Days 4-5:** Backend Enhancements  
- Database: Optimize indexes
- Backend: Caching, analytics, monitoring
- Frontend: Performance optimization

---

## Key Files to Create

### Frontend (14 new files)
```
components/GlobalSearch/
components/UserCard/
components/SearchFilters/
components/ViewToggle/
components/DiscoverySection/
components/CategoryChip/
components/TrendingBadge/
pages/SearchResults.tsx
pages/Discover.tsx
hooks/useSearchHistory.ts
hooks/useSearchFilters.ts
hooks/useInfiniteScroll.ts
services/search.service.ts
services/discovery.service.ts
```

### Backend (8 new files)
```
modules/search/search.module.ts
modules/search/search.controller.ts
modules/search/search.service.ts
modules/search/entities/search-analytics.entity.ts
modules/discovery/discovery.module.ts
modules/discovery/discovery.controller.ts
modules/discovery/discovery.service.ts
migrations/1707586000000-CreateSearchIndexes.ts
```

---

## API Endpoints

### Search
```
GET /api/search/users
GET /api/search/posts
GET /api/search/campaigns
GET /api/search/all
GET /api/search/trending
GET /api/search/results
```

### Discovery
```
GET /api/discovery/suggested
GET /api/discovery/trending
GET /api/discovery/new-users
GET /api/discovery/categories
GET /api/discovery/category/:name
```

---

## Responsive Breakpoints

```css
Mobile:  < 768px  (1 column, list view)
Tablet:  768-1024px (2 columns)
Desktop: > 1024px (3 columns, grid view)
```

---

## Success Criteria

✅ Search response time < 200ms  
✅ Mobile-friendly interface  
✅ Keyboard navigation works  
✅ Search history persists  
✅ Filters work correctly  
✅ Infinite scroll smooth  
✅ No layout shifts  
✅ Lighthouse score > 90  

---

## Next Action

**Start with Phase 6A:**
1. Create Search module (backend)
2. Add search indexes migration
3. Create GlobalSearch component (frontend)
4. Test and iterate

**Full plan:** See `PHASE-6-SEARCH-DISCOVERY-PLAN.md`
