import { useState, useEffect, useCallback } from 'react';
import { analyticsService, AnalyticsMetrics } from '../services/analytics.service';

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('[useAnalytics] Failed to fetch metrics:', err);
      // Don't set error for 401 (user will be logged out automatically)
      if (err.status !== 401) {
        setError(err.message || 'Failed to fetch analytics');
      }
      // Set default metrics on error
      setMetrics({
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
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics: fetchMetrics,
  };
};
