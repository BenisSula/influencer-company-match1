import { apiClient } from './api-client';

export interface MatchHistoryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
  limit?: number;
}

export interface MatchAnalytics {
  averageScore: {
    current: number;
    previous: number;
    change: number;
  };
  scoreDistribution: {
    perfect: number;
    excellent: number;
    good: number;
    fair: number;
  };
  factorTrends: {
    [factor: string]: {
      average: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
  };
  topMatches: any[];
  newMatchesCount: number;
}

export interface ScoreTrend {
  date: string;
  averageScore: number;
  matchCount: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

class MatchHistoryService {
  async getHistory(filters?: MatchHistoryFilters) {
    const params = new URLSearchParams();
    
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    if (filters?.minScore) params.append('minScore', filters.minScore.toString());
    if (filters?.maxScore) params.append('maxScore', filters.maxScore.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/match-history?${queryString}` : '/match-history';
    
    return apiClient.get<any[]>(endpoint);
  }

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

  async getAnalytics(timeRange: 'week' | 'month' | 'all' = 'month'): Promise<MatchAnalytics> {
    return apiClient.get<MatchAnalytics>(`/match-history/analytics?timeRange=${timeRange}`);
  }

  async getScoreTrends(days: number = 30): Promise<ScoreTrend[]> {
    return apiClient.get<ScoreTrend[]>(`/match-history/trends?days=${days}`);
  }
}

export default new MatchHistoryService();
