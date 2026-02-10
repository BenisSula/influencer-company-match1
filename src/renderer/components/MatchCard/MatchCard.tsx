import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button } from '../';
import { HiLocationMarker, HiUsers, HiTrendingUp, HiCurrencyDollar, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useConnection } from '../../contexts/ConnectionContext';
import { useToast } from '../../contexts/ToastContext';
import { mockDataService } from '../../services/mock-data.service';
import './MatchCard.css';
import type { Match } from '../../services/matching.service';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();
  const { profile, score, tier, breakdown } = match;
  const currentUser = mockDataService.getCurrentUser();
  const { connect, disconnect, getStatus } = useConnection();
  const { showToast } = useToast();
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const connectionStatus = getStatus(currentUser.profile.id, profile.id);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Perfect':
        return '#10B981';
      case 'Excellent':
        return '#3B82F6';
      case 'Good':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handleConnect = () => {
    if (connectionStatus === 'none') {
      connect(currentUser.profile.id, profile.id);
      showToast(`Connection request sent to ${profile.name}`, 'success');
    } else if (connectionStatus === 'connected') {
      if (window.confirm(`Disconnect from ${profile.name}? You can reconnect anytime.`)) {
        disconnect(currentUser.profile.id, profile.id);
        showToast('Disconnected', 'info', {
          label: 'Undo',
          onClick: () => {
            connect(currentUser.profile.id, profile.id);
            showToast('Connection restored', 'success');
          }
        });
      }
    }
  };

  const getConnectButtonText = () => {
    switch (connectionStatus) {
      case 'pending':
        return 'Pending';
      case 'connected':
        return 'Disconnect';
      default:
        return 'Connect';
    }
  };

  const getActionButtons = () => {
    if (connectionStatus === 'connected') {
      return (
        <>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/messages')}
          >
            Message
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate(`/profile/${profile.id}`)}
          >
            View Profile
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleConnect}
          >
            Disconnect
          </Button>
        </>
      );
    }

    return (
      <>
        <Button 
          variant={connectionStatus === 'pending' ? 'secondary' : 'primary'} 
          size="sm"
          onClick={handleConnect}
          disabled={connectionStatus === 'pending'}
        >
          {getConnectButtonText()}
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => navigate(`/profile/${profile.id}`)}
        >
          View Profile
        </Button>
      </>
    );
  };

  return (
    <Card className="match-card">
      <CardBody>
        <div className="match-card-header">
          <div className="match-avatar" aria-hidden="true">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="match-info">
            <h3 className="match-name">{profile.name}</h3>
            <p className="match-category">
              {profile.type === 'influencer' ? profile.niche : profile.industry}
            </p>
          </div>
          <button
            className="match-score"
            style={{ borderColor: getTierColor(tier) }}
            onClick={() => setShowBreakdown(!showBreakdown)}
            aria-expanded={showBreakdown}
            aria-label={`Match score ${score}, ${tier} tier. Click to ${showBreakdown ? 'hide' : 'show'} breakdown`}
          >
            <div className="score-value" style={{ color: getTierColor(tier) }}>
              {score}
            </div>
            <div className="score-tier">{tier}</div>
            {showBreakdown ? (
              <HiChevronUp size={16} className="score-toggle" aria-hidden="true" />
            ) : (
              <HiChevronDown size={16} className="score-toggle" aria-hidden="true" />
            )}
          </button>
        </div>

        {showBreakdown && breakdown && (
          <div className="score-breakdown">
            <h4 className="breakdown-title">Score Breakdown</h4>
            {breakdown.nicheCompatibility !== undefined && (
              <div className="breakdown-item">
                <span className="breakdown-label">Niche Match</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${breakdown.nicheCompatibility}%`, backgroundColor: getTierColor(tier) }}
                    role="progressbar"
                    aria-valuenow={breakdown.nicheCompatibility}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="breakdown-value">{breakdown.nicheCompatibility}%</span>
              </div>
            )}
            {breakdown.locationCompatibility !== undefined && (
              <div className="breakdown-item">
                <span className="breakdown-label">Location</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${breakdown.locationCompatibility}%`, backgroundColor: getTierColor(tier) }}
                    role="progressbar"
                    aria-valuenow={breakdown.locationCompatibility}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="breakdown-value">{breakdown.locationCompatibility}%</span>
              </div>
            )}
            {breakdown.budgetAlignment !== undefined && (
              <div className="breakdown-item">
                <span className="breakdown-label">Budget</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${breakdown.budgetAlignment}%`, backgroundColor: getTierColor(tier) }}
                    role="progressbar"
                    aria-valuenow={breakdown.budgetAlignment}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="breakdown-value">{breakdown.budgetAlignment}%</span>
              </div>
            )}
            {breakdown.platformOverlap !== undefined && (
              <div className="breakdown-item">
                <span className="breakdown-label">Platform</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${breakdown.platformOverlap}%`, backgroundColor: getTierColor(tier) }}
                    role="progressbar"
                    aria-valuenow={breakdown.platformOverlap}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="breakdown-value">{breakdown.platformOverlap}%</span>
              </div>
            )}
            {breakdown.audienceSizeMatch !== undefined && (
              <div className="breakdown-item">
                <span className="breakdown-label">Audience</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${breakdown.audienceSizeMatch}%`, backgroundColor: getTierColor(tier) }}
                    role="progressbar"
                    aria-valuenow={breakdown.audienceSizeMatch}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="breakdown-value">{breakdown.audienceSizeMatch}%</span>
              </div>
            )}
            {breakdown.engagementTierMatch !== undefined && (
              <div className="breakdown-item">
                <span className="breakdown-label">Engagement</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${breakdown.engagementTierMatch}%`, backgroundColor: getTierColor(tier) }}
                    role="progressbar"
                    aria-valuenow={breakdown.engagementTierMatch}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="breakdown-value">{breakdown.engagementTierMatch}%</span>
              </div>
            )}
          </div>
        )}

        <div className="match-stats">
          {profile.location && (
            <div className="stat-item">
              <HiLocationMarker className="stat-icon" aria-hidden="true" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.audienceSize && (
            <div className="stat-item">
              <HiUsers className="stat-icon" aria-hidden="true" />
              <span>{formatNumber(profile.audienceSize)} followers</span>
            </div>
          )}
          {profile.engagementRate && (
            <div className="stat-item">
              <HiTrendingUp className="stat-icon" aria-hidden="true" />
              <span>{profile.engagementRate}% engagement</span>
            </div>
          )}
          {profile.budget && (
            <div className="stat-item">
              <HiCurrencyDollar className="stat-icon" aria-hidden="true" />
              <span>${formatNumber(profile.budget)} budget</span>
            </div>
          )}
          {profile.budgetRange && (
            <div className="stat-item">
              <HiCurrencyDollar className="stat-icon" aria-hidden="true" />
              <span>
                ${formatNumber(profile.budgetRange.min)} - ${formatNumber(profile.budgetRange.max)}
              </span>
            </div>
          )}
        </div>

        {profile.platforms && profile.platforms.length > 0 && (
          <div className="match-platforms">
            {profile.platforms.map((platform) => (
              <span key={platform} className="platform-tag">
                {platform}
              </span>
            ))}
          </div>
        )}

        {(profile.bio || profile.description) && (
          <p className="match-description">{profile.bio || profile.description}</p>
        )}

        <div className="match-actions">
          {getActionButtons()}
        </div>
      </CardBody>
    </Card>
  );
};
