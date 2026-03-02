import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Sparkles } from 'lucide-react';
import { DashboardWidget } from '../DashboardWidget/DashboardWidget';
import { Avatar } from '../Avatar/Avatar';
import './CompatibilityMatchesWidget.css';

interface Match {
  id: string;
  profile: {
    id: string;
    name: string;
    avatarUrl?: string;
    niche?: string;
    industry?: string;
    location?: string;
    audienceSize?: number;
    budget?: number;
  };
  compatibilityScore?: number;
  score?: number; // Fallback for backend compatibility
  tier: string;
}

interface CompatibilityMatchesWidgetProps {
  matches: Match[];
  loading?: boolean;
  error?: string;
  userRole: 'INFLUENCER' | 'COMPANY';
}

export const CompatibilityMatchesWidget: React.FC<CompatibilityMatchesWidgetProps> = ({
  matches,
  loading,
  error,
  userRole,
}) => {
  const navigate = useNavigate();

  const getTitle = () => {
    if (userRole === 'INFLUENCER') {
      return 'Companies That Fit Your Audience';
    }
    return 'Top Influencers This Week';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#2E7D32';
    if (score >= 75) return '#1976D2';
    if (score >= 60) return '#F57C00';
    return '#65676B';
  };

  return (
    <DashboardWidget
      title={getTitle()}
      icon={<Star size={20} />}
      action={{
        label: 'View All',
        onClick: () => navigate('/matches'),
      }}
      loading={loading}
      error={error}
    >
      {matches.length === 0 ? (
        <div className="compatibility-empty">
          <Star size={48} style={{ color: '#BDC1C6', marginBottom: '1rem' }} />
          <p>No compatible matches yet</p>
          <p className="compatibility-empty-subtitle">
            Complete your profile to get better matches
          </p>
        </div>
      ) : (
        <div className="compatibility-matches-list">
          {matches.slice(0, 5).map((match) => (
            <div
              key={match.id}
              className="compatibility-match-item"
              onClick={() => navigate(`/profile/${match.profile.id}`)}
            >
              <div className="match-avatar-wrapper">
                <Avatar
                  src={match.profile.avatarUrl}
                  name={match.profile.name}
                  size="md"
                />
                {(match.compatibilityScore || match.score || 0) >= 90 && (
                  <div className="perfect-match-indicator">
                    <Sparkles size={12} />
                  </div>
                )}
              </div>
              <div className="compatibility-match-info">
                <div className="compatibility-match-name">{match.profile.name}</div>
                <div className="compatibility-match-details">
                  {userRole === 'INFLUENCER' ? (
                    <>
                      {match.profile.industry && (
                        <span>{match.profile.industry}</span>
                      )}
                      {match.profile.budget && (
                        <span>${formatNumber(match.profile.budget)} budget</span>
                      )}
                    </>
                  ) : (
                    <>
                      {match.profile.niche && (
                        <span>{match.profile.niche}</span>
                      )}
                      {match.profile.audienceSize && (
                        <span>{formatNumber(match.profile.audienceSize)} followers</span>
                      )}
                    </>
                  )}
                  {match.profile.location && (
                    <span className="compatibility-match-location">
                      <MapPin size={14} />
                      {match.profile.location}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="compatibility-match-score"
                style={{ color: getScoreColor(match.compatibilityScore || match.score || 0) }}
              >
                {match.compatibilityScore || match.score || 0}%
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
};
