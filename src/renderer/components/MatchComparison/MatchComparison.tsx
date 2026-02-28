import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { matchingService, Match as ServiceMatch } from '../../services/matching.service';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonChart } from './ComparisonChart';
import './MatchComparison.css';

interface ComparisonMatch {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  matchScore: number;
  factors: {
    nicheCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    audienceMatch: number;
    engagementQuality: number;
  };
}

export const MatchComparison: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<ComparisonMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    loadMatches();
  }, [searchParams]);

  const transformMatch = (match: ServiceMatch): ComparisonMatch => {
    return {
      id: match.id,
      userId: match.profile.id,
      name: match.profile.name,
      role: match.profile.type,
      avatarUrl: match.profile.avatarUrl,
      matchScore: match.score,
      factors: {
        nicheCompatibility: match.breakdown.nicheCompatibility,
        budgetAlignment: match.breakdown.budgetAlignment,
        platformOverlap: match.breakdown.platformOverlap,
        audienceMatch: match.breakdown.audienceSizeMatch,
        engagementQuality: match.breakdown.engagementTierMatch,
      },
    };
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const ids = searchParams.get('ids')?.split(',') || [];
      
      console.log('[MatchComparison] Loading matches for IDs:', ids);
      
      if (ids.length < 2) {
        console.log('[MatchComparison] Less than 2 matches, redirecting');
        navigate('/matches');
        return;
      }

      // Fetch all matches first, then filter by IDs
      const allMatchesResponse = await matchingService.getMatches();
      const allMatches = allMatchesResponse.data;
      
      console.log('[MatchComparison] All matches:', allMatches.length);
      
      // Filter matches by the selected IDs
      const selectedMatches = allMatches.filter(match => ids.includes(match.id));
      
      console.log('[MatchComparison] Selected matches:', selectedMatches.length);
      
      if (selectedMatches.length < 2) {
        setError('Could not find all selected matches. Please try again.');
        return;
      }
      
      const transformedMatches = selectedMatches.map(transformMatch);
      setMatches(transformedMatches);
    } catch (error) {
      console.error('[MatchComparison] Failed to load matches:', error);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="match-comparison loading">
        <div className="loading-spinner">Loading comparison...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-comparison error">
        <p>{error}</p>
        <button className="btn-back" onClick={() => navigate('/matches')}>
          Back to Matches
        </button>
      </div>
    );
  }

  if (matches.length < 2) {
    return (
      <div className="match-comparison error">
        <p>Please select at least 2 matches to compare</p>
        <button className="btn-back" onClick={() => navigate('/matches')}>
          Back to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="match-comparison">
      <div className="comparison-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/matches')}>
            ← Back to Matches
          </button>
          <h1>Compare Matches</h1>
        </div>
        
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            Chart View
          </button>
        </div>
      </div>

      <div className="comparison-content">
        {viewMode === 'table' ? (
          <ComparisonTable matches={matches} />
        ) : (
          <ComparisonChart matches={matches} />
        )}
      </div>
    </div>
  );
};
