import { useState, useEffect, useCallback } from 'react';
import collaborationOutcomeService, {
  CollaborationOutcome,
  CollaborationStats,
  RecordOutcomeData,
} from '../services/collaboration-outcome.service';

export const useCollaborationOutcomes = () => {
  const [outcomes, setOutcomes] = useState<CollaborationOutcome[]>([]);
  const [stats, setStats] = useState<CollaborationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOutcomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await collaborationOutcomeService.getMyOutcomes();
      setOutcomes(data);
    } catch (err: any) {
      // Don't set error for 401 (user will be logged out automatically)
      if (err.status !== 401) {
        setError(err.message || 'Failed to fetch outcomes');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await collaborationOutcomeService.getMyStats();
      setStats(data);
    } catch (err: any) {
      // Don't set error for 401 (user will be logged out automatically)
      if (err.status !== 401) {
        setError(err.message || 'Failed to fetch stats');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const recordOutcome = useCallback(async (data: RecordOutcomeData) => {
    setLoading(true);
    setError(null);
    try {
      const outcome = await collaborationOutcomeService.recordOutcome(data);
      setOutcomes(prev => [outcome, ...prev]);
      // Refresh stats after recording
      await fetchStats();
      return outcome;
    } catch (err: any) {
      setError(err.message || 'Failed to record outcome');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const checkExistingOutcome = useCallback(async (connectionId: string) => {
    try {
      const outcome = await collaborationOutcomeService.getOutcomeByConnection(connectionId);
      return outcome;
    } catch (err: any) {
      console.error('Failed to check existing outcome:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchOutcomes();
    fetchStats();
  }, [fetchOutcomes, fetchStats]);

  return {
    outcomes,
    stats,
    loading,
    error,
    recordOutcome,
    checkExistingOutcome,
    refreshOutcomes: fetchOutcomes,
    refreshStats: fetchStats,
  };
};
