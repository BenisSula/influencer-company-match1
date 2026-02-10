import { useState, useEffect, useCallback } from 'react';

interface MatchFilters {
  niches?: string[];
  locations?: string[];
  minBudget?: number;
  maxBudget?: number;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  platforms?: string[];
  minEngagementRate?: number;
  verifiedOnly?: boolean;
  contentTypes?: string[];
  collaborationPreferences?: string[];
  campaignTypes?: string[];
  companySizes?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const DEFAULT_FILTERS: MatchFilters = {
  sortBy: 'score',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};

export function useMatchFilters() {
  const [filters, setFilters] = useState<MatchFilters>(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<MatchFilters>(DEFAULT_FILTERS);

  // Debounce filter changes to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<MatchFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when explicitly changing page)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(
      (key) =>
        key !== 'sortBy' &&
        key !== 'sortOrder' &&
        key !== 'page' &&
        key !== 'limit' &&
        filters[key as keyof MatchFilters] !== undefined,
    );
  }, [filters]);

  return {
    filters,
    debouncedFilters,
    updateFilters,
    clearFilters,
    setPage,
    hasActiveFilters: hasActiveFilters(),
  };
}
