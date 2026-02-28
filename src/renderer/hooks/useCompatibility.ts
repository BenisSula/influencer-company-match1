import { useState, useEffect } from 'react';
import aiMatchingService from '../services/ai-matching.service';
import { CompatibilityFactor } from '../components/CompatibilityBreakdown/CompatibilityBreakdown';

interface UseCompatibilityResult {
  score: number;
  factors: CompatibilityFactor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCompatibility = (targetUserId: string | undefined): UseCompatibilityResult => {
  const [score, setScore] = useState<number>(0);
  const [factors, setFactors] = useState<CompatibilityFactor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompatibility = async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await aiMatchingService.getCompatibilityScore(targetUserId);
      
      setScore(result.overallScore);
      setFactors(result.factors || []);
    } catch (err: any) {
      console.error('Failed to fetch compatibility:', err);
      setError(err.message || 'Failed to load compatibility data');
      
      // Set default mock data on error
      setScore(0);
      setFactors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompatibility();
  }, [targetUserId]);

  return {
    score,
    factors,
    loading,
    error,
    refetch: fetchCompatibility
  };
};
