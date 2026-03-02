import { adminApiClient } from './admin-api-client';

export interface OverviewStats {
  users: {
    total: number;
    active: number;
    new: number;
    growth: string;
  };
  matches: {
    total: number;
    new: number;
    successful: number;
    successRate: string;
  };
  campaigns: {
    total: number;
    active: number;
  };
  messages: {
    total: number;
    new: number;
  };
  posts: {
    total: number;
    new: number;
  };
  connections: {
    total: number;
    new: number;
  };
  revenue: {
    totalRevenue: string;
    mrr: string;
    activeSubscriptions: number;
    revenueByDay: Array<{ date: string; revenue: string }>;
    revenueByPlan: Array<{ plan: string; count: string; revenue: string }>;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface UserAnalytics {
  userGrowth: Array<{ date: string; count: string }>;
  roleBreakdown: Array<{ role: string; count: string }>;
  activeUsersByDay: Array<{ date: string; count: string }>;
}

export interface EngagementMetrics {
  messagesByDay: Array<{ date: string; count: string }>;
  postsByDay: Array<{ date: string; count: string }>;
  matchesByDay: Array<{ date: string; count: string }>;
  connectionsByDay: Array<{ date: string; count: string }>;
}

export interface CampaignAnalytics {
  total: number;
  active: number;
  completed: number;
  byStatus: Array<{ status: string; count: string }>;
  byDay: Array<{ date: string; count: string }>;
}

export interface MatchAnalytics {
  total: number;
  new: number;
  byScore: Array<{ scoreRange: string; count: string }>;
  averageScore: string;
}

class AdminAnalyticsService {
  async getOverview(startDate?: string, endDate?: string): Promise<OverviewStats> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return await adminApiClient.get<OverviewStats>('/admin/analytics/overview', params);
  }

  async getUserAnalytics(startDate?: string, endDate?: string): Promise<UserAnalytics> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return await adminApiClient.get<UserAnalytics>('/admin/analytics/users', params);
  }

  async getRevenueStats(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return await adminApiClient.get('/admin/analytics/revenue', params);
  }

  async getEngagementMetrics(startDate?: string, endDate?: string): Promise<EngagementMetrics> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return await adminApiClient.get<EngagementMetrics>('/admin/analytics/engagement', params);
  }

  async getCampaignAnalytics(startDate?: string, endDate?: string): Promise<CampaignAnalytics> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return await adminApiClient.get<CampaignAnalytics>('/admin/analytics/campaigns', params);
  }

  async getMatchAnalytics(startDate?: string, endDate?: string): Promise<MatchAnalytics> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return await adminApiClient.get<MatchAnalytics>('/admin/analytics/matches', params);
  }

  async exportData(type: string, startDate?: string, endDate?: string) {
    return await adminApiClient.post('/admin/analytics/export', { type, startDate, endDate });
  }
}

export default new AdminAnalyticsService();
