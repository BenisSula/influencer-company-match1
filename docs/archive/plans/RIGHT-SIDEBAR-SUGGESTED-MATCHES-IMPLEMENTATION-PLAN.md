# Right Sidebar - Suggested Matches Implementation Plan

## Overview

Implement a dynamic suggested matches feature in the right sidebar that displays highly-rated potential matches (influencers or companies) based on the logged-in user's role. The sidebar will show personalized recommendations with avatars, names, brief info, and clickable cards for detailed views.

---

## Current State Analysis

### Existing Backend Capabilities ✅

**Matching Service** (`backend/src/modules/matching/matching.service.ts`):
- ✅ `getMatches()` - Returns all potential matches with scores
- ✅ Calculates match scores based on multiple factors
- ✅ Supports role-based matching (influencer ↔ company)

**AI Recommendation Service** (`backend/src/modules/ai-matching/recommendation.service.ts`):
- ✅ `getPersonalizedRecommendations()` - ML-based recommendations
- ✅ `getTrendingMatches()` - Popular/active users
- ✅ `getSimilarProfiles()` - Based on successful connections
- ✅ `getCollaborativeRecommendations()` - Community-based suggestions

### Current Frontend State

**Right Sidebar** (`src/renderer/layouts/AppLayout/AppLayout.tsx`):
```tsx
<aside className="right-sidebar">
  <div className="sidebar-content">
    <div className="sidebar-section">
      <h3 className="sidebar-title">Suggested Matches</h3>
      <div className="suggested-list">
        <p>Suggested matches will appear here</p>
      </div>
    </div>
  </div>
</aside>
```

**Status**: Placeholder only - no functionality

---

## Requirements

### Functional Requirements

1. **Role-Based Display**:
   - Influencers see suggested companies
   - Companies see suggested influencers

2. **Match Quality**:
   - Show top 5-10 highest-rated matches
   - Display match score/rating
   - Show relevant user information

3. **User Information Display**:
   - Avatar (with fallback)
   - Name (influencer name or company name)
   - Brief description (niche/industry, location)
   - Match score indicator
   - Key stats (followers, engagement, budget)

4. **Interactivity**:
   - Clickable cards navigate to profile view
   - Hover effects for better UX
   - Loading states
   - Empty states

5. **Real-time Updates**:
   - Refresh when user profile changes
   - Update when new matches available

### Non-Functional Requirements

1. **Performance**:
   - Load suggestions asynchronously
   - Cache results for 5-10 minutes
   - Lazy load avatars

2. **Responsive Design**:
   - Hide on mobile/tablet (< 1024px)
   - Adapt to sidebar collapse state

3. **Accessibility**:
   - Keyboard navigation
   - Screen reader support
   - ARIA labels

---

## Implementation Plan

### Phase 1: Backend API Enhancement ✅

**Status**: Backend already has all necessary endpoints!

**Available Endpoints**:
- `GET /matches` - Get all matches (already implemented)
- `GET /ai-matching/recommendations/personalized` - Personalized recommendations
- `GET /ai-matching/recommendations/trending` - Trending matches
- `GET /ai-matching/recommendations/similar` - Similar profiles

**Recommendation**: Use existing `/matches` endpoint with filters for top matches.

---

### Phase 2: Frontend Service Layer

**File**: `src/renderer/services/suggestions.service.ts` (NEW)

```typescript
import { apiClient } from './api-client';
import { matchingService, Match } from './matching.service';

export interface SuggestedMatch {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'influencer' | 'company';
  niche?: string;
  industry?: string;
  location?: string;
  score: number;
  tier: string;
  // Influencer-specific
  audienceSize?: number;
  engagementRate?: number;
  platforms?: string[];
  // Company-specific
  budget?: number;
  companySize?: string;
}

export class SuggestionsService {
  private cache: SuggestedMatch[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getSuggestedMatches(limit: number = 8): Promise<SuggestedMatch[]> {
    // Check cache
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cache.slice(0, limit);
    }

    try {
      // Get top matches sorted by score
      const response = await matchingService.getMatches({
        sortBy: 'score',
        sortOrder: 'desc',
        minScore: 60, // Only show good matches
        limit: limit * 2, // Get more to filter
      });

      const suggestions: SuggestedMatch[] = response.data.map(match => ({
        id: match.profile.id,
        name: match.profile.name,
        avatarUrl: match.profile.avatarUrl,
        role: match.profile.type,
        niche: match.profile.niche,
        industry: match.profile.industry,
        location: match.profile.location,
        score: match.score,
        tier: match.tier,
        audienceSize: match.profile.audienceSize,
        engagementRate: match.profile.engagementRate,
        platforms: match.profile.platforms,
        budget: match.profile.budget,
        companySize: match.profile.companySize,
      }));

      // Update cache
      this.cache = suggestions;
      this.cacheTimestamp = Date.now();

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch suggested matches:', error);
      return [];
    }
  }

  clearCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const suggestionsService = new SuggestionsService();
```

---

### Phase 3: Custom Hook

**File**: `src/renderer/hooks/useSuggestedMatches.ts` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { suggestionsService, SuggestedMatch } from '../services/suggestions.service';
import { useAuth } from '../contexts/AuthContext';

export const useSuggestedMatches = (limit: number = 8) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const matches = await suggestionsService.getSuggestedMatches(limit);
        setSuggestions(matches);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to load suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSuggestions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, limit]);

  const refresh = async () => {
    suggestionsService.clearCache();
    setLoading(true);
    try {
      const matches = await suggestionsService.getSuggestedMatches(limit);
      setSuggestions(matches);
    } catch (err) {
      setError('Failed to refresh suggestions');
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading, error, refresh };
};
```

---

### Phase 4: Suggested Match Card Component

**File**: `src/renderer/components/SuggestedMatchCard/SuggestedMatchCard.tsx` (NEW)

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../Avatar/Avatar';
import { SuggestedMatch } from '../../services/suggestions.service';
import './SuggestedMatchCard.css';

interface SuggestedMatchCardProps {
  match: SuggestedMatch;
  compact?: boolean;
}

export const SuggestedMatchCard: React.FC<SuggestedMatchCardProps> = ({ 
  match, 
  compact = false 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/${match.id}`);
  };

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#3B82F6'; // Blue
    if (score >= 60) return '#F59E0B'; // Orange
    return '#6B7280'; // Gray
  };

  return (
    <div 
      className={`suggested-match-card ${compact ? 'compact' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View ${match.name}'s profile`}
    >
      <div className="suggested-match-avatar-wrapper">
        <Avatar
          src={match.avatarUrl}
          name={match.name}
          size="md"
          className="suggested-match-avatar"
        />
        <div 
          className="suggested-match-score-badge"
          style={{ backgroundColor: getMatchScoreColor(match.score) }}
          aria-label={`Match score: ${match.score}%`}
        >
          {match.score}
        </div>
      </div>

      <div className="suggested-match-info">
        <h4 className="suggested-match-name">{match.name}</h4>
        
        <p className="suggested-match-meta">
          {match.role === 'influencer' ? match.niche : match.industry}
          {match.location && ` • ${match.location.split(',')[0]}`}
        </p>

        {!compact && (
          <div className="suggested-match-stats">
            {match.role === 'influencer' ? (
              <>
                {match.audienceSize && (
                  <span className="stat">
                    👥 {formatNumber(match.audienceSize)}
                  </span>
                )}
                {match.engagementRate && (
                  <span className="stat">
                    📊 {match.engagementRate.toFixed(1)}%
                  </span>
                )}
              </>
            ) : (
              <>
                {match.budget && (
                  <span className="stat">
                    💰 ${formatNumber(match.budget)}
                  </span>
                )}
                {match.companySize && (
                  <span className="stat">
                    🏢 {match.companySize}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        <div className="suggested-match-tier">
          <span className={`tier-badge tier-${match.tier.toLowerCase()}`}>
            {match.tier} Match
          </span>
        </div>
      </div>
    </div>
  );
};
```

**File**: `src/renderer/components/SuggestedMatchCard/SuggestedMatchCard.css` (NEW)

```css
.suggested-match-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: white;
  border: 1px solid #E4E6EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggested-match-card:hover {
  background: #F7F8FA;
  border-color: var(--color-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.suggested-match-card:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}

.suggested-match-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.suggested-match-score-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  min-width: 28px;
  height: 20px;
  padding: 0 6px;
  background: #10B981;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggested-match-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggested-match-name {
  font-size: 14px;
  font-weight: 600;
  color: #050505;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggested-match-meta {
  font-size: 12px;
  color: #65676B;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggested-match-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.suggested-match-stats .stat {
  font-size: 11px;
  color: #65676B;
  background: #F0F2F5;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.suggested-match-tier {
  margin-top: 4px;
}

.tier-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tier-badge.tier-perfect {
  background: #D1FAE5;
  color: #065F46;
}

.tier-badge.tier-excellent {
  background: #DBEAFE;
  color: #1E40AF;
}

.tier-badge.tier-good {
  background: #FEF3C7;
  color: #92400E;
}

.tier-badge.tier-fair {
  background: #F3F4F6;
  color: #374151;
}

/* Compact variant */
.suggested-match-card.compact {
  padding: 8px;
  gap: 8px;
}

.suggested-match-card.compact .suggested-match-name {
  font-size: 13px;
}

.suggested-match-card.compact .suggested-match-meta {
  font-size: 11px;
}

/* Responsive */
@media (max-width: 1440px) {
  .suggested-match-card {
    padding: 10px;
  }
  
  .suggested-match-name {
    font-size: 13px;
  }
}
```

---

### Phase 5: Suggested Matches List Component

**File**: `src/renderer/components/SuggestedMatchesList/SuggestedMatchesList.tsx` (NEW)

```typescript
import React from 'react';
import { SuggestedMatchCard } from '../SuggestedMatchCard/SuggestedMatchCard';
import { useSuggestedMatches } from '../../hooks/useSuggestedMatches';
import { HiRefresh } from 'react-icons/hi';
import './SuggestedMatchesList.css';

interface SuggestedMatchesListProps {
  limit?: number;
  compact?: boolean;
}

export const SuggestedMatchesList: React.FC<SuggestedMatchesListProps> = ({ 
  limit = 8,
  compact = false 
}) => {
  const { suggestions, loading, error, refresh } = useSuggestedMatches(limit);

  if (loading && suggestions.length === 0) {
    return (
      <div className="suggested-matches-loading">
        <div className="loading-spinner" />
        <p>Finding matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggested-matches-error">
        <p>{error}</p>
        <button onClick={refresh} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="suggested-matches-empty">
        <p>No suggestions available yet</p>
        <span>Complete your profile to get better matches</span>
      </div>
    );
  }

  return (
    <div className="suggested-matches-list">
      <div className="suggested-matches-header">
        <h3 className="suggested-matches-title">Suggested Matches</h3>
        <button 
          onClick={refresh}
          className="refresh-button"
          aria-label="Refresh suggestions"
          disabled={loading}
        >
          <HiRefresh className={loading ? 'spinning' : ''} />
        </button>
      </div>

      <div className="suggested-matches-items">
        {suggestions.map((match) => (
          <SuggestedMatchCard 
            key={match.id} 
            match={match}
            compact={compact}
          />
        ))}
      </div>

      {suggestions.length >= limit && (
        <button className="view-all-button">
          View All Matches →
        </button>
      )}
    </div>
  );
};
```

**File**: `src/renderer/components/SuggestedMatchesList/SuggestedMatchesList.css` (NEW)

```css
.suggested-matches-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggested-matches-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.suggested-matches-title {
  font-size: 16px;
  font-weight: 600;
  color: #050505;
  margin: 0;
}

.refresh-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #F0F2F5;
  color: #65676B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #E4E6EB;
  color: var(--color-secondary);
  transform: scale(1.05);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-button svg {
  font-size: 18px;
}

.refresh-button svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.suggested-matches-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggested-matches-loading,
.suggested-matches-error,
.suggested-matches-empty {
  padding: 24px;
  text-align: center;
  color: #65676B;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E4E6EB;
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

.suggested-matches-error p,
.suggested-matches-empty p {
  font-size: 14px;
  font-weight: 500;
  color: #050505;
  margin: 0 0 8px 0;
}

.suggested-matches-empty span {
  font-size: 12px;
  color: #65676B;
}

.retry-button {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
}

.view-all-button {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid #E4E6EB;
  border-radius: 6px;
  color: var(--color-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.view-all-button:hover {
  background: #F7F8FA;
  border-color: var(--color-secondary);
}
```

---

### Phase 6: Update AppLayout

**File**: `src/renderer/layouts/AppLayout/AppLayout.tsx`

**Changes**:
```tsx
import { SuggestedMatchesList } from '../../components/SuggestedMatchesList/SuggestedMatchesList';

// In the right sidebar section:
<aside className={`right-sidebar ${rightSidebar.isCollapsed ? 'collapsed' : ''}`}>
  <button className="sidebar-collapse-btn right-collapse-btn" ...>
    ...
  </button>
  
  <div className="sidebar-content">
    <div className="sidebar-section">
      <SuggestedMatchesList limit={8} />
    </div>
  </div>
</aside>
```

---

## Visual Design

### Card Layout

```
┌─────────────────────────────────────┐
│  ┌────┐                             │
│  │ 👤 │  John Doe                   │
│  │ 92 │  Fashion • New York         │
│  └────┘  👥 250K  📊 4.5%           │
│          [Excellent Match]          │
└─────────────────────────────────────┘
```

### Color Scheme

- **Perfect Match (90-100)**: Green (#10B981)
- **Excellent Match (75-89)**: Blue (#3B82F6)
- **Good Match (60-74)**: Orange (#F59E0B)
- **Fair Match (< 60)**: Gray (#6B7280)

---

## Implementation Steps

### Step 1: Create Service Layer ✅
1. Create `suggestions.service.ts`
2. Implement caching logic
3. Add error handling

### Step 2: Create Custom Hook ✅
1. Create `useSuggestedMatches.ts`
2. Implement auto-refresh
3. Add loading/error states

### Step 3: Create Components ✅
1. Create `SuggestedMatchCard` component
2. Create `SuggestedMatchesList` component
3. Add CSS styling

### Step 4: Integrate into AppLayout ✅
1. Import components
2. Replace placeholder
3. Test functionality

### Step 5: Testing & Polish ✅
1. Test with different user roles
2. Test loading states
3. Test error handling
4. Test responsive behavior
5. Test accessibility

---

## Testing Checklist

### Functional Tests:
- [ ] Influencers see company suggestions
- [ ] Companies see influencer suggestions
- [ ] Match scores display correctly
- [ ] Cards are clickable and navigate to profiles
- [ ] Refresh button works
- [ ] Auto-refresh works (5 min interval)
- [ ] Cache works correctly

### Visual Tests:
- [ ] Avatars load correctly
- [ ] Fallback avatars work
- [ ] Match score badges show correct colors
- [ ] Tier badges display correctly
- [ ] Stats format correctly (K, M notation)
- [ ] Hover effects work
- [ ] Loading spinner displays

### Responsive Tests:
- [ ] Sidebar hidden on mobile (< 768px)
- [ ] Sidebar hidden on tablet (< 1024px)
- [ ] Cards adapt to sidebar width
- [ ] Collapsed sidebar hides content

### Accessibility Tests:
- [ ] Keyboard navigation works
- [ ] Screen readers announce content
- [ ] ARIA labels present
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA

---

## Performance Optimizations

1. **Caching**: 5-minute cache to reduce API calls
2. **Lazy Loading**: Avatars load on demand
3. **Debouncing**: Refresh button debounced
4. **Memoization**: Components memoized where appropriate
5. **Pagination**: Limit results to 8 matches

---

## Future Enhancements

1. **Filters**: Allow users to filter suggestions by niche/industry
2. **Sorting**: Sort by score, recent activity, location
3. **Favorites**: Save favorite suggestions
4. **Dismiss**: Hide specific suggestions
5. **AI Insights**: Show why match is suggested
6. **Real-time Updates**: WebSocket for live suggestions
7. **A/B Testing**: Test different recommendation algorithms

---

## Success Metrics

1. **Engagement**: % of users clicking on suggestions
2. **Conversion**: % of suggestions leading to connections
3. **Satisfaction**: User feedback on match quality
4. **Performance**: Page load time impact
5. **Accuracy**: Match score correlation with actual connections

---

**Status**: Ready for Implementation
**Priority**: High (Core Feature)
**Estimated Time**: 4-6 hours
**Impact**: High (Improves Discovery & Engagement)
