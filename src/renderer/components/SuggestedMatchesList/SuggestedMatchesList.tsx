import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SuggestedMatchCard } from '../SuggestedMatchCard/SuggestedMatchCard';
import { useSuggestedMatches } from '../../hooks/useSuggestedMatches';
import { useAuth } from '../../contexts/AuthContext';
import { HiRefresh } from 'react-icons/hi';
import './SuggestedMatchesList.css';

interface SuggestedMatchesListProps {
  limit?: number;
  compact?: boolean;
}

export const SuggestedMatchesList: React.FC<SuggestedMatchesListProps> = ({ 
  limit = 8,
  compact = false 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { suggestions, loading, error, refresh } = useSuggestedMatches(limit);

  // Role-specific content
  const isInfluencer = user?.role === 'INFLUENCER';
  const title = isInfluencer ? 'Suggested Companies' : 'Suggested Influencers';
  const subtitle = isInfluencer 
    ? 'Companies looking for influencers like you'
    : 'Influencers that match your needs';
  const emptyMessage = isInfluencer
    ? 'No companies found yet'
    : 'No influencers found yet';
  const emptyHint = isInfluencer
    ? 'Complete your profile to attract more brands'
    : 'Complete your profile to find the perfect creators';

  console.log('[SuggestedMatchesList] Render state:', { 
    suggestionsCount: suggestions.length, 
    loading, 
    error 
  });

  if (loading && suggestions.length === 0) {
    return (
      <div className="suggested-matches-loading">
        <div className="loading-spinner" />
        <p>Finding matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggested-matches-error">
        <p>{error}</p>
        <button onClick={refresh} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="suggested-matches-empty">
        <p>{emptyMessage}</p>
        <span>{emptyHint}</span>
      </div>
    );
  }

  return (
    <div className="suggested-matches-list">
      <div className="suggested-matches-header">
        <div className="suggested-matches-title-wrapper">
          <h3 className="suggested-matches-title">{title}</h3>
          <p className="suggested-matches-subtitle">{subtitle}</p>
        </div>
        <button 
          onClick={refresh}
          className="refresh-button"
          aria-label="Refresh suggestions"
          disabled={loading}
        >
          <HiRefresh className={loading ? 'spinning' : ''} />
        </button>
      </div>

      <div className="suggested-matches-items">
        {suggestions.map((match) => (
          <SuggestedMatchCard 
            key={match.id} 
            match={match}
            compact={compact}
          />
        ))}
      </div>

      {suggestions.length >= limit && (
        <button 
          className="view-all-button"
          onClick={() => navigate('/matches')}
        >
          View All Matches →
        </button>
      )}
    </div>
  );
};
