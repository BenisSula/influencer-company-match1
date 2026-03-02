import { useState, useEffect, useCallback } from 'react';

export interface MatchAnalytics {
  viewCount: number;
  interactionCount: number;
  lastInteraction?: Date;
  similarMatchesSuccess: number;
}

/**
 * Hook for tracking and managing match analytics
 * Automatically records views and provides methods for tracking interactions
 */
export const useMatchAnalytics = (matchId: string) => {
  const [analytics, setAnalytics] = useState<MatchAnalytics | null>(null);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Record a view for this match
   * Called automatically on mount
   */
  const recordView = useCallback(async () => {
    try {
      // View recording is handled by backend when fetching matches
      // This is a placeholder for explicit view tracking if needed
      console.log(`[useMatchAnalytics] View recorded for match: ${matchId}`);
    } catch (err) {
      console.error('[useMatchAnalytics] Error recording view:', err);
    }
  }, [matchId]);

  /**
   * Record an interaction with this match
   * @param type - Type of interaction: 'click', 'message', 'collaborate', 'profile_view', 'description_toggle'
   */
  const recordInteraction = useCallback(async (type: 'click' | 'message' | 'collaborate' | 'profile_view' | 'description_toggle') => {
    try {
      console.log(`[useMatchAnalytics] Interaction recorded: ${type} for match: ${matchId}`);
      
      // Update local analytics count
      if (analytics) {
        setAnalytics({
          ...analytics,
          interactionCount: analytics.interactionCount + 1,
          lastInteraction: new Date(),
        });
      }
    } catch (err) {
      console.error('[useMatchAnalytics] Error recording interaction:', err);
      setError('Failed to record interaction');
    }
  }, [matchId, analytics]);

  /**
   * Update analytics data from match object
   */
  const updateAnalytics = useCallback((newAnalytics: MatchAnalytics) => {
    setAnalytics(newAnalytics);
  }, []);

  /**
   * Auto-record view on mount
   */
  useEffect(() => {
    recordView();
  }, [recordView]);

  return {
    analytics,
    loading,
    error,
    recordView,
    recordInteraction,
    updateAnalytics,
  };
};

/**
 * Hook for managing analytics across multiple matches
 */
export const useMatchesAnalytics = () => {
  const [analyticsMap, setAnalyticsMap] = useState<Map<string, MatchAnalytics>>(new Map());

  const updateMatchAnalytics = useCallback((matchId: string, analytics: MatchAnalytics) => {
    setAnalyticsMap(prev => {
      const newMap = new Map(prev);
      newMap.set(matchId, analytics);
      return newMap;
    });
  }, []);

  const getMatchAnalytics = useCallback((matchId: string): MatchAnalytics | undefined => {
    return analyticsMap.get(matchId);
  }, [analyticsMap]);

  const recordInteraction = useCallback((matchId: string) => {
    const current = analyticsMap.get(matchId);
    if (current) {
      updateMatchAnalytics(matchId, {
        ...current,
        interactionCount: current.interactionCount + 1,
        lastInteraction: new Date(),
      });
    }
  }, [analyticsMap, updateMatchAnalytics]);

  return {
    analyticsMap,
    updateMatchAnalytics,
    getMatchAnalytics,
    recordInteraction,
  };
};
