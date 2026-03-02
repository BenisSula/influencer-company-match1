import { useState, useEffect } from 'react';
import { suggestionsService, SuggestedMatch } from '../services/suggestions.service';
import { useAuth } from '../contexts/AuthContext';

export const useSuggestedMatches = (limit: number = 8) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('[useSuggestedMatches] No user, skipping fetch');
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        console.log('[useSuggestedMatches] Fetching suggestions for user:', user.id);
        setLoading(true);
        setError(null);
        const matches = await suggestionsService.getSuggestedMatches(limit);
        console.log('[useSuggestedMatches] Received suggestions:', matches.length);
        setSuggestions(matches);
      } catch (err) {
        console.error('[useSuggestedMatches] Error fetching suggestions:', err);
        setError('Failed to load suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSuggestions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, limit]);

  const refresh = async () => {
    console.log('[useSuggestedMatches] Manual refresh triggered');
    suggestionsService.clearCache();
    setLoading(true);
    try {
      const matches = await suggestionsService.getSuggestedMatches(limit);
      setSuggestions(matches);
      setError(null);
    } catch (err) {
      console.error('[useSuggestedMatches] Error refreshing:', err);
      setError('Failed to refresh suggestions');
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading, error, refresh };
};
