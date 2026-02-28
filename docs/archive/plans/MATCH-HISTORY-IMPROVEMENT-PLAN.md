# Match History & Analytics - Improvement Plan

## Overview

Based on the comprehensive investigation, this document outlines specific improvements to enhance the Match History & Analytics feature.

---

## Phase 1: Critical Fixes (Immediate - 1-2 hours)

### 1.1 Fix Deprecated Event Handlers ⚠️ HIGH PRIORITY

**Issue**: Using deprecated `onKeyPress` event handler

**Files to Fix**:
- `src/renderer/pages/MatchHistory.tsx`
- `src/renderer/components/MatchAnalytics/MatchAnalytics.tsx`

**Current Code**:
```typescript
onKeyPress={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleMatchClick(match.matchUser.id);
  }
}}
```

**Fixed Code**:
```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleMatchClick(match.matchUser.id);
  }
}}
```

**Benefits**:
- ✅ Removes deprecation warnings
- ✅ Better keyboard event handling
- ✅ Prevents default browser behavior

---

### 1.2 Remove Unused Code ⚠️ MEDIUM PRIORITY

**Issue**: `handleRateMatch` function declared but never used

**File**: `src/renderer/pages/MatchHistory.tsx`

**Options**:

**Option A: Remove Unused Code**
```typescript
// Remove these lines:
const handleRateMatch = (match: any) => {
  setSelectedMatch(match);
  setFeedbackModalOpen(true);
};
```

**Option B: Implement Rating Feature**
```typescript
// Add rating button to history items
<button
  className="rate-match-btn"
  onClick={(e) => {
    e.stopPropagation();
    handleRateMatch(record);
  }}
>
  Rate Match
</button>
```

**Recommendation**: Option A (remove) - Rating is already available through collaboration feedback

---

### 1.3 Add Error Boundaries ⚠️ HIGH PRIORITY

**Issue**: No error boundaries around analytics components

**New File**: `src/renderer/components/MatchAnalytics/MatchAnalyticsErrorBoundary.tsx`

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MatchAnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Match Analytics Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="analytics-error-state">
          <h3>Unable to load analytics</h3>
          <p>We're having trouble loading your match analytics. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage in MatchHistory.tsx**:
```typescript
import { MatchAnalyticsErrorBoundary } from '../components/MatchAnalytics/MatchAnalyticsErrorBoundary';

// Wrap analytics tab
{activeTab === 'analytics' && (
  <MatchAnalyticsErrorBoundary>
    <MatchAnalytics />
  </MatchAnalyticsErrorBoundary>
)}
```

---

## Phase 2: UX Enhancements (Short-term - 1 week)

### 2.1 Add Loading Skeletons 🎨 MEDIUM PRIORITY

**Issue**: Generic "Loading..." text is not engaging

**New File**: `src/renderer/components/MatchAnalytics/AnalyticsSkeleton.tsx`

```typescript
import React from 'react';
import './AnalyticsSkeleton.css';

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="analytics-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-selector"></div>
      </div>
      <div className="skeleton-grid">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card large"></div>
        <div className="skeleton-card large"></div>
        <div className="skeleton-card large"></div>
      </div>
    </div>
  );
};
```

**CSS**: `src/renderer/components/MatchAnalytics/AnalyticsSkeleton.css`

```css
.analytics-skeleton {
  padding: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-title,
.skeleton-selector,
.skeleton-card {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-title {
  height: 32px;
  width: 200px;
  margin-bottom: 24px;
}

.skeleton-selector {
  height: 40px;
  width: 300px;
}

.skeleton-card {
  height: 150px;
}

.skeleton-card.large {
  height: 300px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Usage**:
```typescript
if (loading) {
  return <AnalyticsSkeleton />;
}
```

---

### 2.2 Implement Pagination 📄 HIGH PRIORITY

**Issue**: Loading all history at once can be slow for power users

**Backend Enhancement**: `backend/src/modules/matching/match-history.service.ts`

```typescript
interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

async getHistoryPaginated(
  userId: string,
  filters?: HistoryFilters,
  pagination?: PaginationOptions
): Promise<PaginatedResult<MatchHistory>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;

  const query = this.matchHistoryRepository
    .createQueryBuilder('history')
    .leftJoinAndSelect('history.matchUser', 'matchUser')
    .where('history.userId = :userId', { userId })
    .orderBy('history.createdAt', 'DESC');

  // Apply filters...
  if (filters?.dateFrom) {
    query.andWhere('history.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
  }
  // ... other filters

  const [data, total] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    data,
    total,
    page,
    totalPages,
    hasMore,
  };
}
```

**Controller Update**: `backend/src/modules/matching/matching.controller.ts`

```typescript
@Get('match-history/paginated')
async getMatchHistoryPaginated(
  @Request() req: any,
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
  @Query('minScore') minScore?: string,
  @Query('maxScore') maxScore?: string,
) {
  const filters: any = {};
  if (dateFrom) filters.dateFrom = new Date(dateFrom);
  if (dateTo) filters.dateTo = new Date(dateTo);
  if (minScore) filters.minScore = parseFloat(minScore);
  if (maxScore) filters.maxScore = parseFloat(maxScore);

  const pagination = {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
  };

  return this.matchHistoryService.getHistoryPaginated(req.user.sub, filters, pagination);
}
```

**Frontend Service**: `src/renderer/services/match-history.service.ts`

```typescript
async getHistoryPaginated(
  page: number = 1,
  limit: number = 20,
  filters?: MatchHistoryFilters
): Promise<PaginatedResult<any>> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
  if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
  if (filters?.minScore) params.append('minScore', filters.minScore.toString());
  if (filters?.maxScore) params.append('maxScore', filters.maxScore.toString());

  return apiClient.get<PaginatedResult<any>>(`/match-history/paginated?${params.toString()}`);
}
```

**Frontend Component**: `src/renderer/pages/MatchHistory.tsx`

```typescript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [hasMore, setHasMore] = useState(false);

const loadHistoryPage = async (page: number) => {
  try {
    setLoading(true);
    const result = await matchHistoryService.getHistoryPaginated(page, 20);
    setHistory(result.data);
    setTotalPages(result.totalPages);
    setHasMore(result.hasMore);
    setCurrentPage(page);
  } catch (error) {
    console.error('Failed to load history page:', error);
  } finally {
    setLoading(false);
  }
};

// Pagination controls
<div className="pagination-controls">
  <button
    disabled={currentPage === 1}
    onClick={() => loadHistoryPage(currentPage - 1)}
  >
    Previous
  </button>
  <span>Page {currentPage} of {totalPages}</span>
  <button
    disabled={!hasMore}
    onClick={() => loadHistoryPage(currentPage + 1)}
  >
    Next
  </button>
</div>
```

---

### 2.3 Add Export Functionality 📊 MEDIUM PRIORITY

**Backend Endpoint**: `backend/src/modules/matching/matching.controller.ts`

```typescript
@Get('match-history/export')
async exportMatchHistory(
  @Request() req: any,
  @Query('format') format: 'csv' | 'json' = 'csv',
  @Res() res: Response,
) {
  const history = await this.matchHistoryService.getHistory(req.user.sub);
  
  if (format === 'csv') {
    const csv = this.convertToCSV(history);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=match-history.csv');
    res.send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=match-history.json');
    res.json(history);
  }
}

private convertToCSV(history: MatchHistory[]): string {
  const headers = ['Date', 'Match User', 'Score', 'Niche Compatibility', 'Budget Alignment', 'Platform Overlap', 'Engagement Match', 'Audience Match', 'Location Match'];
  const rows = history.map(record => [
    record.createdAt.toISOString(),
    record.matchUser?.email || 'Unknown',
    record.score,
    record.factors.nicheCompatibility,
    record.factors.budgetAlignment,
    record.factors.platformOverlap,
    record.factors.engagementTierMatch,
    record.factors.audienceSizeMatch,
    record.factors.locationCompatibility,
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
```

**Frontend Component**: `src/renderer/pages/MatchHistory.tsx`

```typescript
const handleExport = async (format: 'csv' | 'json') => {
  try {
    const response = await fetch(`${API_BASE_URL}/match-history/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-history.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export data. Please try again.');
  }
};

// Add export button
<div className="export-controls">
  <button onClick={() => handleExport('csv')}>
    Export as CSV
  </button>
  <button onClick={() => handleExport('json')}>
    Export as JSON
  </button>
</div>
```

---

### 2.4 Enhanced Filtering UI 🔍 MEDIUM PRIORITY

**New Component**: `src/renderer/components/MatchHistory/HistoryFilters.tsx`

```typescript
import React, { useState } from 'react';
import './HistoryFilters.css';

interface HistoryFiltersProps {
  onFilterChange: (filters: any) => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({ onFilterChange }) => {
  const [datePreset, setDatePreset] = useState<string>('all');
  const [minScore, setMinScore] = useState<number | undefined>();
  const [maxScore, setMaxScore] = useState<number | undefined>();

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    
    const now = new Date();
    let dateFrom: Date | undefined;
    
    switch (preset) {
      case 'today':
        dateFrom = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = undefined;
    }
    
    onFilterChange({ dateFrom, minScore, maxScore });
  };

  const handleScoreChange = () => {
    const dateFrom = datePreset !== 'all' ? getDateFromPreset(datePreset) : undefined;
    onFilterChange({ dateFrom, minScore, maxScore });
  };

  return (
    <div className="history-filters">
      <div className="filter-group">
        <label>Time Period</label>
        <div className="filter-presets">
          <button
            className={datePreset === 'all' ? 'active' : ''}
            onClick={() => handlePresetChange('all')}
          >
            All Time
          </button>
          <button
            className={datePreset === 'today' ? 'active' : ''}
            onClick={() => handlePresetChange('today')}
          >
            Today
          </button>
          <button
            className={datePreset === 'week' ? 'active' : ''}
            onClick={() => handlePresetChange('week')}
          >
            Last 7 Days
          </button>
          <button
            className={datePreset === 'month' ? 'active' : ''}
            onClick={() => handlePresetChange('month')}
          >
            Last 30 Days
          </button>
          <button
            className={datePreset === 'quarter' ? 'active' : ''}
            onClick={() => handlePresetChange('quarter')}
          >
            Last 90 Days
          </button>
        </div>
      </div>
      
      <div className="filter-group">
        <label>Score Range</label>
        <div className="score-range">
          <input
            type="number"
            placeholder="Min"
            min="0"
            max="100"
            value={minScore || ''}
            onChange={(e) => {
              setMinScore(e.target.value ? parseInt(e.target.value) : undefined);
              handleScoreChange();
            }}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            max="100"
            value={maxScore || ''}
            onChange={(e) => {
              setMaxScore(e.target.value ? parseInt(e.target.value) : undefined);
              handleScoreChange();
            }}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## Phase 3: Advanced Features (Long-term - 1 month)

### 3.1 Real-time Analytics Updates 🔄 LOW PRIORITY

**Backend WebSocket**: `backend/src/modules/matching/match-history.gateway.ts`

```typescript
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/match-history' })
export class MatchHistoryGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe-analytics')
  handleSubscribe(client: Socket, userId: string) {
    client.join(`analytics-${userId}`);
  }

  @SubscribeMessage('unsubscribe-analytics')
  handleUnsubscribe(client: Socket, userId: string) {
    client.leave(`analytics-${userId}`);
  }

  notifyAnalyticsUpdate(userId: string, analytics: any) {
    this.server.to(`analytics-${userId}`).emit('analytics-updated', analytics);
  }
}
```

**Frontend Hook**: `src/renderer/hooks/useRealtimeAnalytics.ts`

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useRealtimeAnalytics = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000/match-history', {
      auth: {
        token: localStorage.getItem('auth_token'),
      },
    });

    newSocket.emit('subscribe-analytics', userId);

    newSocket.on('analytics-updated', (data) => {
      setAnalytics(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('unsubscribe-analytics', userId);
      newSocket.close();
    };
  }, [userId]);

  return { analytics, socket };
};
```

---

### 3.2 AI-Powered Insights 🤖 LOW PRIORITY

**Backend Service**: `backend/src/modules/matching/match-insights.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';

interface Insight {
  type: 'trend' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
}

@Injectable()
export class MatchInsightsService {
  constructor(private matchHistoryService: MatchHistoryService) {}

  async generateInsights(userId: string): Promise<Insight[]> {
    const history = await this.matchHistoryService.getHistory(userId);
    const analytics = await this.matchHistoryService.getAnalytics(userId, 'month');
    
    const insights: Insight[] = [];

    // Trend Analysis
    if (analytics.averageScore.change > 10) {
      insights.push({
        type: 'trend',
        title: '📈 Your match quality is improving!',
        description: `Your average match score increased by ${analytics.averageScore.change.toFixed(1)}% this month.`,
        actionable: false,
      });
    }

    // Factor Recommendations
    const weakestFactor = Object.entries(analytics.factorTrends)
      .sort(([, a], [, b]) => a.average - b.average)[0];
    
    if (weakestFactor && weakestFactor[1].average < 60) {
      insights.push({
        type: 'recommendation',
        title: '💡 Improve your profile',
        description: `Your ${weakestFactor[0]} score is low. Consider updating your profile to improve matches.`,
        actionable: true,
        action: 'Update Profile',
      });
    }

    // Achievements
    if (analytics.scoreDistribution.perfect >= 5) {
      insights.push({
        type: 'achievement',
        title: '🎉 Perfect Match Streak!',
        description: `You've had ${analytics.scoreDistribution.perfect} perfect matches (90+) this month!`,
        actionable: false,
      });
    }

    return insights;
  }
}
```

**Frontend Component**: `src/renderer/components/MatchInsights/MatchInsights.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api-client';
import './MatchInsights.css';

interface Insight {
  type: 'trend' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
}

export const MatchInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await apiClient.get<Insight[]>('/match-history/insights');
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading insights...</div>;
  if (insights.length === 0) return null;

  return (
    <div className="match-insights">
      <h3>💡 Insights & Recommendations</h3>
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type}`}>
            <h4>{insight.title}</h4>
            <p>{insight.description}</p>
            {insight.actionable && insight.action && (
              <button className="insight-action">
                {insight.action}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### 3.3 Advanced Visualizations 📊 LOW PRIORITY

**Install Chart Library**:
```bash
npm install recharts
```

**Enhanced Trends Chart**: `src/renderer/components/MatchAnalytics/TrendsChart.tsx`

```typescript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendsChartProps {
  data: Array<{
    date: string;
    averageScore: number;
    matchCount: number;
  }>;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          labelFormatter={(date) => new Date(date).toLocaleDateString()}
          formatter={(value: number, name: string) => [
            name === 'averageScore' ? value.toFixed(1) : value,
            name === 'averageScore' ? 'Avg Score' : 'Matches'
          ]}
        />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="averageScore" 
          stroke="#1a73e8" 
          strokeWidth={2}
          dot={{ fill: '#1a73e8', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="matchCount" 
          stroke="#34a853" 
          strokeWidth={2}
          dot={{ fill: '#34a853', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

---

## Implementation Timeline

### Week 1: Critical Fixes
- Day 1-2: Fix deprecated event handlers
- Day 2-3: Remove unused code
- Day 3-5: Add error boundaries and loading skeletons

### Week 2: Pagination & Export
- Day 1-3: Implement backend pagination
- Day 4-5: Implement frontend pagination UI
- Day 5-7: Add export functionality

### Week 3: Enhanced Filtering
- Day 1-3: Build filter UI component
- Day 4-5: Integrate with backend
- Day 5-7: Testing and refinement

### Week 4: Advanced Features (Optional)
- Day 1-3: Real-time updates (if needed)
- Day 4-5: AI insights (if needed)
- Day 5-7: Advanced visualizations (if needed)

---

## Testing Checklist

### Unit Tests
- [ ] MatchHistoryService methods
- [ ] MatchAnalyticsService calculations
- [ ] Frontend service API calls
- [ ] Component rendering

### Integration Tests
- [ ] API endpoint responses
- [ ] Database queries
- [ ] Pagination logic
- [ ] Export functionality

### E2E Tests
- [ ] Match viewing → history recording
- [ ] Analytics page navigation
- [ ] Filter application
- [ ] Export download
- [ ] Profile navigation from history

### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Focus management

### Performance Tests
- [ ] Large dataset handling
- [ ] Query optimization
- [ ] Frontend rendering speed
- [ ] Export generation time

---

## Success Metrics

### Performance
- Page load time < 2 seconds
- Analytics calculation < 500ms
- Export generation < 3 seconds
- Pagination response < 200ms

### User Experience
- Zero accessibility violations
- 100% keyboard navigable
- Mobile responsive (all breakpoints)
- Error recovery rate > 95%

### Code Quality
- Zero TypeScript errors
- Zero deprecation warnings
- Test coverage > 80%
- No console errors in production

---

## Conclusion

This improvement plan provides a clear roadmap for enhancing the Match History & Analytics feature. The phased approach ensures critical fixes are addressed first, followed by UX improvements, and finally advanced features.

**Priority Order**:
1. ✅ Phase 1: Critical Fixes (Immediate)
2. 🔄 Phase 2: UX Enhancements (Short-term)
3. 🚀 Phase 3: Advanced Features (Long-term)

**Next Steps**:
1. Review and approve this plan
2. Begin Phase 1 implementation
3. Test thoroughly after each phase
4. Gather user feedback
5. Iterate based on feedback

---

**Document Version**: 1.0
**Last Updated**: February 15, 2026
**Status**: Ready for Implementation
