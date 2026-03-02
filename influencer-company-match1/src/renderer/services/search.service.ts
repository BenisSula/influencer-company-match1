import { apiClient } from './api-client';

export interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'campaign';
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface TrendingSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchOptions {
  limit?: number;
  location?: string;
  niche?: string;
  industry?: string;
}

class SearchService {
  private buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    return query.toString();
  }

  async searchUsers(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const params = this.buildQueryString({ q: query, ...options });
    const response = await apiClient.get<SearchResponse>(`/search/users?${params}`);
    return response;
  }

  async searchPosts(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const params = this.buildQueryString({ q: query, ...options });
    const response = await apiClient.get<SearchResponse>(`/search/posts?${params}`);
    return response;
  }

  async searchCampaigns(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const params = this.buildQueryString({ q: query, ...options });
    const response = await apiClient.get<SearchResponse>(`/search/campaigns?${params}`);
    return response;
  }

  async searchAll(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const params = this.buildQueryString({ q: query, ...options });
    const response = await apiClient.get<SearchResponse>(`/search/all?${params}`);
    return response;
  }

  async getTrending(limit?: number): Promise<TrendingSearch[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<TrendingSearch[]>(`/search/trending${params}`);
    return response;
  }

  async trackSearch(query: string, resultType: string, resultCount: number): Promise<void> {
    await apiClient.post('/search/track', {
      query,
      resultType,
      resultCount,
    });
  }

  async trackSearchClick(query: string, resultId: string): Promise<void> {
    await apiClient.post('/search/track-click', {
      query,
      resultId,
    });
  }
}

export const searchService = new SearchService();
