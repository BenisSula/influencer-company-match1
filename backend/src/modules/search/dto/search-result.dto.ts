export interface SearchResultDto {
  id: string;
  type: 'user' | 'post' | 'campaign';
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponseDto {
  results: SearchResultDto[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface TrendingSearchDto {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}
