import { apiClient } from './api-client';

export interface AnalyticsMetrics {
  profileViews: number;
  matchImpressions: number;
  responseRate: number;
  profileClicks: number;
  connectionsSent: number;
  connectionsReceived: number;
  messagesSent: number;
  messagesReceived: number;
  averageMatchScore: number;
  successRate: number;
  userSatisfaction: number;
  engagementRate: number;
  conversionRate: number;
  totalMatches: number;
  successfulMatches: number;
  trend: 'up' | 'down' | 'stable';
}

export interface QualityMetrics {
  averageMatchScore: number;
  successRate: number;
  userSatisfaction: number;
  engagementRate: number;
  conversionRate: number;
  totalMatches: number;
  successfulMatches: number;
}

export interface PerformanceTrend {
  date: string;
  successRate: number;
  totalMatches: number;
}

class AnalyticsService {
  async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      // Get real analytics data from new endpoint
      const realAnalytics = await apiClient.get<{
        profileViews: number;
        matchImpressions: number;
        responseRate: number;
        profileClicks: number;
        connectionsSent: number;
        connectionsReceived: number;
        messagesSent: number;
        messagesReceived: number;
        trend: 'up' | 'down' | 'stable';
      }>('/analytics/my-analytics');

      // Get AI matching quality metrics
      let qualityMetrics: QualityMetrics;
      try {
        qualityMetrics = await apiClient.get<QualityMetrics>('/ai-matching/analytics/metrics');
      } catch {
        qualityMetrics = {
          averageMatchScore: 0,
          successRate: 0,
          userSatisfaction: 0,
          engagementRate: 0,
          conversionRate: 0,
          totalMatches: 0,
          successfulMatches: 0,
        };
      }
      
      return {
        ...realAnalytics,
        ...qualityMetrics,
      };
    } catch (error) {
      console.error('[AnalyticsService] Failed to fetch metrics:', error);
      // Return default values on error
      return {
        profileViews: 0,
        matchImpressions: 0,
        responseRate: 0,
        profileClicks: 0,
        connectionsSent: 0,
        connectionsReceived: 0,
        messagesSent: 0,
        messagesReceived: 0,
        averageMatchScore: 0,
        successRate: 0,
        userSatisfaction: 0,
        engagementRate: 0,
        conversionRate: 0,
        totalMatches: 0,
        successfulMatches: 0,
        trend: 'stable',
      };
    }
  }

  async getTrends(days: number = 30): Promise<PerformanceTrend[]> {
    try {
      const response = await apiClient.get<PerformanceTrend[]>(`/ai-matching/analytics/trends?days=${days}`);
      return response;
    } catch (error) {
      console.error('[AnalyticsService] Failed to fetch trends:', error);
      return [];
    }
  }

  /**
   * Record profile view
   */
  async recordProfileView(profileId: string, source: string, viewDuration?: number): Promise<void> {
    try {
      await apiClient.post('/analytics/profile-view', {
        profileId,
        source,
        viewDuration,
      });
    } catch (error) {
      console.error('[AnalyticsService] Failed to record profile view:', error);
    }
  }

  /**
   * Record match impressions
   */
  async recordMatchImpressions(
    matches: Array<{ matchUserId: string; matchScore: number; position: number }>,
    source: string,
  ): Promise<void> {
    try {
      await apiClient.post('/analytics/match-impressions', {
        matches,
        source,
      });
    } catch (error) {
      console.error('[AnalyticsService] Failed to record match impressions:', error);
    }
  }

  /**
   * Record match click
   */
  async recordMatchClick(matchUserId: string): Promise<void> {
    try {
      await apiClient.post('/analytics/match-click', {
        matchUserId,
      });
    } catch (error) {
      console.error('[AnalyticsService] Failed to record match click:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
