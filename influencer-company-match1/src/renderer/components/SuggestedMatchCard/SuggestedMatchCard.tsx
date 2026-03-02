import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, DollarSign, Building2, Sparkles, Star, Award, Zap } from 'lucide-react';
import { Avatar } from '../Avatar/Avatar';
import { SuggestedMatch } from '../../services/suggestions.service';
import './SuggestedMatchCard.css';

interface SuggestedMatchCardProps {
  match: SuggestedMatch;
  compact?: boolean;
}

export const SuggestedMatchCard: React.FC<SuggestedMatchCardProps> = ({ 
  match, 
  compact = false 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/${match.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#3B82F6'; // Blue
    if (score >= 60) return '#F59E0B'; // Orange
    return '#6B7280'; // Gray
  };

  const getTierIcon = (tier: string) => {
    switch(tier) {
      case 'Perfect': return <Sparkles size={14} className="tier-icon-inline" />;
      case 'Excellent': return <Star size={14} className="tier-icon-inline" />;
      case 'Good': return <Award size={14} className="tier-icon-inline" />;
      default: return <Zap size={14} className="tier-icon-inline" />;
    }
  };

  return (
    <div 
      className={`suggested-match-card ${compact ? 'compact' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View ${match.name}'s profile`}
    >
      <div className="suggested-match-avatar-wrapper">
        <Avatar
          src={match.avatarUrl}
          name={match.name}
          size="md"
          className="suggested-match-avatar"
          userId={match.id}
          clickable={true}
          trackingContext="suggested_match_card"
        />
        <div 
          className="suggested-match-score-badge"
          style={{ backgroundColor: getMatchScoreColor(match.score) }}
          aria-label={`Match score: ${match.score}%`}
        >
          {match.score}
        </div>
      </div>

      <div className="suggested-match-info">
        <h4 className="suggested-match-name">{match.name}</h4>
        
        <p className="suggested-match-meta">
          {match.role === 'influencer' ? match.niche : match.industry}
          {match.location && ` • ${match.location.split(',')[0]}`}
        </p>

        {!compact && (
          <div className="suggested-match-stats">
            {match.role === 'influencer' ? (
              <>
                {match.audienceSize && (
                  <span className="stat">
                    <Users className="stat-icon" aria-hidden="true" size={14} />
                    {formatNumber(match.audienceSize)}
                  </span>
                )}
                {match.engagementRate && (
                  <span className="stat">
                    <TrendingUp className="stat-icon" aria-hidden="true" size={14} />
                    {match.engagementRate.toFixed(1)}%
                  </span>
                )}
              </>
            ) : (
              <>
                {match.budget && (
                  <span className="stat">
                    <DollarSign className="stat-icon" aria-hidden="true" size={14} />
                    ${formatNumber(match.budget)}
                  </span>
                )}
                {match.companySize && (
                  <span className="stat">
                    <Building2 className="stat-icon" aria-hidden="true" size={14} />
                    {match.companySize}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        <div className="suggested-match-tier">
          <span className={`tier-badge tier-${match.tier.toLowerCase()}`}>
            {getTierIcon(match.tier)}
            {match.tier} Match
          </span>
        </div>
      </div>
    </div>
  );
};
