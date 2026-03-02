import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MatchFilters } from '../services/matching.service';

export function useMatchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<MatchFilters>({
    page: 1,
    limit: 20,
    sortBy: 'score',
    sortOrder: 'desc',
  });

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: MatchFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: (searchParams.get('sortBy') as any) || 'score',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    // Parse array parameters
    const niches = searchParams.getAll('niches');
    if (niches.length) urlFilters.niches = niches;

    const locations = searchParams.getAll('locations');
    if (locations.length) urlFilters.locations = locations;

    const platforms = searchParams.getAll('platforms');
    if (platforms.length) urlFilters.platforms = platforms;

    const contentTypes = searchParams.getAll('contentTypes');
    if (contentTypes.length) urlFilters.contentTypes = contentTypes;

    const campaignTypes = searchParams.getAll('campaignTypes');
    if (campaignTypes.length) urlFilters.campaignTypes = campaignTypes;

    const companySizes = searchParams.getAll('companySizes');
    if (companySizes.length) urlFilters.companySizes = companySizes;

    // Parse numeric parameters
    const minBudget = searchParams.get('minBudget');
    if (minBudget) urlFilters.minBudget = parseInt(minBudget);

    const maxBudget = searchParams.get('maxBudget');
    if (maxBudget) urlFilters.maxBudget = parseInt(maxBudget);

    const minAudienceSize = searchParams.get('minAudienceSize');
    if (minAudienceSize) urlFilters.minAudienceSize = parseInt(minAudienceSize);

    const maxAudienceSize = searchParams.get('maxAudienceSize');
    if (maxAudienceSize) urlFilters.maxAudienceSize = parseInt(maxAudienceSize);

    const minEngagementRate = searchParams.get('minEngagementRate');
    if (minEngagementRate) urlFilters.minEngagementRate = parseFloat(minEngagementRate);

    // Parse boolean parameters
    const verifiedOnly = searchParams.get('verifiedOnly');
    if (verifiedOnly) urlFilters.verifiedOnly = verifiedOnly === 'true';

    setFilters(urlFilters);
  }, []);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<MatchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    const clearedFilters: MatchFilters = {
      page: 1,
      limit: 20,
      sortBy: 'score',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.niches?.length ||
      filters.locations?.length ||
      filters.platforms?.length ||
      filters.contentTypes?.length ||
      filters.campaignTypes?.length ||
      filters.companySizes?.length ||
      filters.minBudget ||
      filters.maxBudget ||
      filters.minAudienceSize ||
      filters.maxAudienceSize ||
      filters.minEngagementRate ||
      filters.verifiedOnly
    );
  }, [filters]);

  // Debounced filters for API calls (to avoid too many requests)
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  return {
    filters,
    debouncedFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
  };
}
