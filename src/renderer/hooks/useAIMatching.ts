import { useState, useEffect } from 'react';
import aiMatchingService, { EnhancedMatch, Recommendation, QualityMetrics } from '../services/ai-matching.service';

export const useAIMatching = () => {
  const [enhancedMatches, setEnhancedMatches] = useState<EnhancedMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnhancedMatches = async (limit: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const matches = await aiMatchingService.getEnhancedMatches(limit);
      setEnhancedMatches(matches);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI matches');
    } finally {
      setLoading(false);
    }
  };

  const getEnhancedMatch = async (targetUserId: string): Promise<EnhancedMatch | null> => {
    try {
      return await aiMatchingService.getEnhancedMatch(targetUserId);
    } catch (err: any) {
      setError(err.message || 'Failed to load match');
      return null;
    }
  };

  const recordOutcome = async (targetUserId: string, outcome: boolean, successScore: number) => {
    try {
      await aiMatchingService.recordMatchOutcome(targetUserId, outcome, successScore);
    } catch (err: any) {
      setError(err.message || 'Failed to record outcome');
    }
  };

  return {
    enhancedMatches,
    loading,
    error,
    loadEnhancedMatches,
    getEnhancedMatch,
    recordOutcome,
  };
};

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const recs = await aiMatchingService.getRecommendations(limit);
      setRecommendations(recs);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  return {
    recommendations,
    loading,
    error,
    loadRecommendations,
  };
};

export const useMatchAnalytics = () => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiMatchingService.getQualityMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    loadMetrics,
  };
};
