import { useState } from 'react';
import { Card, CardHeader, CardBody, MatchCard, MatchCardSkeleton, FilterPanel } from '../components';
import { useMatchFilters } from '../hooks/useMatchFilters';
import { useToast } from '../contexts/ToastContext';
import { HiUserGroup } from 'react-icons/hi';

export const Matches = () => {
  const { filters, debouncedFilters, updateFilters, clearFilters, hasActiveFilters } = useMatchFilters();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const { showToast } = useToast();

  // TODO: Replace with actual API call using matchingService.getMatches(debouncedFilters)
  // For now, using mock data until backend is connected
  
  const userRole = 'influencer'; // TODO: Get from auth context

  return (
    <>
      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', margin: 0 }}>
            All Matches
          </h2>
        </CardHeader>
        <CardBody>
          <p style={{ fontSize: '0.9375rem', color: '#65676B' }}>
            Browse all your compatibility matches
          </p>
        </CardBody>
      </Card>

      <FilterPanel
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        userRole={userRole as 'influencer' | 'company'}
      />

      {loading && (
        <>
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </>
      )}

      {error && (
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Retry
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && !error && matches.length === 0 && (
        <Card>
          <CardBody>
            <div className="empty-state">
              <HiUserGroup size={64} className="empty-icon" aria-hidden="true" />
              <h3>No matches found</h3>
              <p>{hasActiveFilters ? 'Try adjusting your filters' : 'Check back later for new matches based on your profile'}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && !error && matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}

      {meta && meta.totalPages > 1 && (
        <Card style={{ marginTop: '1rem' }}>
          <CardBody>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => updateFilters({ page: (filters.page || 1) - 1 })}
                disabled={filters.page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: filters.page === 1 ? '#E5E7EB' : 'var(--color-primary)',
                  color: filters.page === 1 ? '#9CA3AF' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ color: '#65676B' }}>
                Page {filters.page || 1} of {meta.totalPages}
              </span>
              <button
                onClick={() => updateFilters({ page: (filters.page || 1) + 1 })}
                disabled={filters.page === meta.totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: filters.page === meta.totalPages ? '#E5E7EB' : 'var(--color-primary)',
                  color: filters.page === meta.totalPages ? '#9CA3AF' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: filters.page === meta.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
};
