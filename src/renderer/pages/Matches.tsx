import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, MatchCard, MatchCardSkeleton, FilterPanel, Button } from '../components';
import { ComparisonBar } from '../components/ComparisonBar/ComparisonBar';
import { CollaborationFeedbackModal } from '../components/CollaborationFeedbackModal/CollaborationFeedbackModal';
import { useMatchFilters } from '../hooks/useMatchFilters';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCollaborationOutcomes } from '../hooks/useCollaborationOutcomes';
import { matchingService, Match } from '../services/matching.service';
import { isFeatureEnabled } from '../config/features';
import { HiUserGroup, HiChartBar } from 'react-icons/hi';
import './Matches.css';

export const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filters, debouncedFilters, updateFilters, clearFilters, hasActiveFilters } = useMatchFilters();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const { showToast } = useToast();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const { recordOutcome } = useCollaborationOutcomes();

  // Load matches when filters change
  useEffect(() => {
    loadMatches();
  }, [debouncedFilters]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchingService.getMatches(debouncedFilters);
      setMatches(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load matches. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateMatch = (match: Match) => {
    setSelectedMatch(match);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      await recordOutcome(feedbackData);
      setFeedbackModalOpen(false);
      showToast('Thank you for your feedback! This helps improve our matching algorithm.', 'success');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showToast('Failed to submit feedback. Please try again.', 'error');
    }
  };

  const userRole = user?.role === 'INFLUENCER' ? 'influencer' : 'company';

  return (
    <>
      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', margin: 0 }}>
              Discover Matches
            </h2>
            {isFeatureEnabled('MATCH_HISTORY_ENABLED') && (
              <Button
                variant="secondary"
                onClick={() => navigate('/matches/history')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <HiChartBar size={18} />
                View Analytics
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ fontSize: '0.9375rem', color: '#65676B' }}>
            {meta ? `Showing ${matches.length} of ${meta.total} matches` : 'Browse all your compatibility matches'}
          </p>
        </CardBody>
      </Card>

      <ComparisonBar />

      <FilterPanel
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        userRole={userRole}
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
              <Button variant="primary" onClick={loadMatches}>
                Retry
              </Button>
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
              <p>
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more matches' 
                  : 'Complete your profile to start getting matched with ' + (userRole === 'influencer' ? 'companies' : 'influencers')
                }
              </p>
              {hasActiveFilters && (
                <Button variant="primary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                  Clear Filters
                </Button>
              )}
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateFilters({ page: (filters.page || 1) - 1 })}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span style={{ color: '#65676B', padding: '0 1rem' }}>
                Page {filters.page || 1} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateFilters({ page: (filters.page || 1) + 1 })}
                disabled={filters.page === meta.totalPages}
              >
                Next
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Collaboration Feedback Modal */}
      {feedbackModalOpen && selectedMatch && (
        <CollaborationFeedbackModal
          connectionId={selectedMatch.id}
          partnerName={selectedMatch.profile?.name || 'Partner'}
          onClose={() => setFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
};
