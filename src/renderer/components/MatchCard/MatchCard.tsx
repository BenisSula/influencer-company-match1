import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Avatar, CollaborationRequestModal } from '../';
import { 
  MatchCardIcons,
  getTierIcon,
  getTierColor
} from '../../config/icons';
import { useConnection } from '../../contexts/ConnectionContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileUpdateListener } from '../../hooks/useProfileUpdates';
import { useMatchAnalytics } from '../../hooks/useMatchAnalytics';
import { analyticsService } from '../../services/analytics.service';
import { MatchActionBar, MatchActionItem } from '../MatchActionBar';
import { CompatibilityBreakdown } from '../CompatibilityBreakdown/CompatibilityBreakdown';
import { ComparisonCheckbox } from '../ComparisonCheckbox/ComparisonCheckbox';
import { FiChevronDown } from 'react-icons/fi';
import './MatchCard.css';
import type { Match } from '../../services/matching.service';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();
  const { profile, score, tier, breakdown, analytics, aiEnhanced } = match;
  const { user } = useAuth();
  const { getStatus, refreshConnectionStatus } = useConnection();
  const { showToast } = useToast();
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [profileData, setProfileData] = useState(profile);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showDescriptionToggle, setShowDescriptionToggle] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  
  // Use analytics hook to track views and interactions
  const { analytics: liveAnalytics, recordInteraction } = useMatchAnalytics(match.id);

  // Listen for profile updates
  useProfileUpdateListener(useCallback((event) => {
    if (event.userId === profile.id) {
      // Refresh this match's profile data - dev only
      if (process.env.NODE_ENV === 'development') {
        console.log('[MatchCard] Profile updated for:', profile.id, event);
      }
      setProfileData(prev => ({ 
        ...prev, 
        profileCompletionPercentage: event.profileCompletion 
      }));
      
      // Optionally trigger a full refresh if needed
      // This could fetch updated profile data from the server
    }
  }, [profile.id]));

  // Check if description needs "Read more" toggle
  useEffect(() => {
    if (!descriptionRef.current) return;
    
    const element = descriptionRef.current;
    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
    const maxHeight = lineHeight * 2; // 2 lines
    
    // Check if content overflows
    const needsToggle = element.scrollHeight > maxHeight + 5; // 5px tolerance
    setShowDescriptionToggle(needsToggle);
  }, [profileData.bio, profileData.description]);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
    recordInteraction('description_toggle');
  };
  
  // Debug logging - only runs in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MatchCard] Match data:', {
        id: match.id,
        score,
        tier,
        hasBreakdown: !!breakdown,
        breakdown
      });
      
      // ICON VISIBILITY DEBUG
      console.log('[MatchCard] Profile data for icons:', {
        location: profileData.location,
        audienceSize: profileData.audienceSize,
        engagementRate: profileData.engagementRate,
        budget: profileData.budget,
        budgetRange: profileData.budgetRange,
        platforms: profileData.platforms
      });
      
      // Test icon imports
      console.log('[MatchCard] Icon components:', {
        location: MatchCardIcons.location,
        followers: MatchCardIcons.followers,
        engagement: MatchCardIcons.engagement,
        budget: MatchCardIcons.budget,
        hasLocationIcon: !!MatchCardIcons.location,
        hasFollowersIcon: !!MatchCardIcons.followers,
        hasEngagementIcon: !!MatchCardIcons.engagement,
        hasBudgetIcon: !!MatchCardIcons.budget
      });
    }
  }, [match, profileData]);
  
  // Use real user ID from auth context
  const currentUserId = user?.id || '';
  const connectionStatus = currentUserId ? getStatus(currentUserId, profile.id) : 'none';

  // Refresh connection status when component mounts or when user returns from messages
  useEffect(() => {
    if (!currentUserId || !profile.id) return;
    
    let mounted = true;
    
    const checkConnectionStatus = async () => {
      try {
        if (mounted) {
          await refreshConnectionStatus(currentUserId, profile.id);
        }
      } catch (error) {
        // Silently fail - not critical
        if (process.env.NODE_ENV === 'development') {
          console.error('[MatchCard] Failed to refresh connection status:', error);
        }
      }
    };
    
    // Initial check
    checkConnectionStatus();
    
    // Listen for connection status changes from other components
    const handleConnectionChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { userId, otherUserId } = customEvent.detail;
      
      // If this event is about our connection, refresh
      if ((userId === currentUserId && otherUserId === profile.id) ||
          (userId === profile.id && otherUserId === currentUserId)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[MatchCard] Connection status changed, refreshing...');
        }
        checkConnectionStatus();
      }
    };
    
    // Listen for collaboration acceptance
    const handleCollaborationAccepted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { recipientId } = customEvent.detail;
      
      // If this is about our connection, refresh status
      if (recipientId === profile.id || recipientId === currentUserId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[MatchCard] Collaboration accepted, refreshing status...');
        }
        checkConnectionStatus();
      }
    };
    
    window.addEventListener('connectionStatusChanged', handleConnectionChange);
    window.addEventListener('collaborationAccepted', handleCollaborationAccepted);
    
    // Also refresh when window regains focus (user returns from messages)
    window.addEventListener('focus', checkConnectionStatus);
    
    return () => {
      mounted = false;
      window.removeEventListener('connectionStatusChanged', handleConnectionChange);
      window.removeEventListener('collaborationAccepted', handleCollaborationAccepted);
      window.removeEventListener('focus', checkConnectionStatus);
    };
  }, [currentUserId, profile.id]); // Removed refreshConnectionStatus from deps

  // Use live analytics if available, otherwise fall back to match analytics
  const displayAnalytics = liveAnalytics || analytics;

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handleRequestCollaboration = () => {
    recordInteraction('collaborate');
    setShowCollaborationModal(true);
  };

  const handleCollaborationSuccess = async () => {
    setShowCollaborationModal(false);
    showToast(`Collaboration request sent to ${profile.name}!`, 'success');
    
    // Force immediate refresh with retry
    try {
      await refreshConnectionStatus(currentUserId, profile.id);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('connectionStatusChanged', {
        detail: { 
          userId: currentUserId, 
          otherUserId: profile.id, 
          status: 'pending'
        }
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MatchCard] Failed to refresh connection status:', error);
      }
    }
  };

  const handleMessage = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token || !currentUserId) {
        showToast('Please log in to send messages', 'error');
        return;
      }
      
      recordInteraction('message');
      showToast('Opening conversation...', 'info');
      navigate('/messages', { 
        state: { 
          recipientId: profile.id, 
          recipientName: profile.name,
          context: 'match',
          contextData: {
            matchScore: score,
            matchTier: tier
          }
        } 
      });
    } catch (error) {
      console.error('Failed to open conversation:', error);
      showToast('Failed to open conversation', 'error');
    }
  };

  const handleViewProfile = () => {
    recordInteraction('profile_view');
    // Track match click for analytics
    analyticsService.recordMatchClick(profile.id);
    navigate(`/profile/${profile.id}`);
  };

  const getActionItems = (): MatchActionItem[] => {
    // Check if there's an existing connection (accepted or pending)
    const hasConnection = connectionStatus === 'accepted' || connectionStatus === 'pending';

    const MessageIcon = MatchCardIcons.message;
    const ProfileIcon = MatchCardIcons.profile;
    const CollaborateIcon = MatchCardIcons.collaborate;

    if (hasConnection) {
      // After connection: Show Message + Profile
      return [
        {
          id: 'message',
          icon: <MessageIcon />,
          label: 'Message',
          variant: 'primary',
          onClick: handleMessage,
        },
        {
          id: 'profile',
          icon: <ProfileIcon />,
          label: 'Profile',
          onClick: handleViewProfile,
        },
      ];
    }

    // Before connection: Show Request Collaboration + Profile
    return [
      {
        id: 'collaborate',
        icon: <CollaborateIcon />,
        label: 'Request Collaboration',
        variant: 'primary',
        onClick: handleRequestCollaboration,
      },
      {
        id: 'profile',
        icon: <ProfileIcon />,
        label: 'Profile',
        onClick: handleViewProfile,
      },
    ];
  };

  return (
    <>
    <Card className="match-card">
      <CardBody>
        <div className="match-card-header">
          {/* Left: Avatar with name label */}
          <div className="match-avatar-section">
            <Avatar
              src={profileData.avatarUrl}
              name={profileData.name}
              size="lg"
              className="match-avatar"
              userId={profile.id}
              clickable={true}
              trackingContext="match_card"
            />
            <span className="match-avatar-label">{profileData.name}</span>
          </div>
          
          {/* Center: Compare checkbox */}
          <div className="match-header-center">
            <ComparisonCheckbox matchId={match.id} />
          </div>
          
          {/* Right: Score section */}
          <div className="match-header-right">
            <div className="match-compatibility-section">
              <div className="match-compatibility-score-large">
                <div className="compatibility-score-value">
                  {score}%
                </div>
                <div className="compatibility-score-label">Match</div>
              </div>
              <button
                className="compatibility-breakdown-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBreakdown(!showBreakdown);
                }}
                title="View compatibility breakdown"
              >
                <MatchCardIcons.details />
                Details
              </button>
            </div>
          </div>
        </div>
        
        {/* Name and category - visible on larger screens */}
        <div className="match-info">
          <h3 className="match-name">{profileData.name}</h3>
          <p className="match-category">
            {profileData.type === 'influencer' ? profileData.niche : profileData.industry}
          </p>
        </div>

        {showBreakdown && breakdown && (
          <div className="compatibility-breakdown-section">
            <CompatibilityBreakdown
              factors={[
                { name: 'Niche Match', score: breakdown.nicheCompatibility || 0, weight: 30, description: 'Industry/niche alignment' },
                { name: 'Platform', score: breakdown.platformOverlap || 0, weight: 20, description: 'Social media platform overlap' },
                { name: 'Audience', score: breakdown.audienceSizeMatch || 0, weight: 20, description: 'Audience size compatibility' },
                { name: 'Location', score: breakdown.locationCompatibility || 0, weight: 10, description: 'Geographic proximity' },
                { name: 'Engagement', score: breakdown.engagementTierMatch || 0, weight: 10, description: 'Engagement quality match' },
                { name: 'Budget', score: breakdown.budgetAlignment || 0, weight: 10, description: 'Budget alignment' }
              ]}
              overallScore={score}
            />
          </div>
        )}

        {/* AI-Enhanced Section */}
        {aiEnhanced && (
          <div className="ai-enhanced-section">
            <div className="ai-score-header">
              <div className="ai-badge">
                <MatchCardIcons.aiIndicator /> AI-Enhanced
              </div>
              <div className="confidence-indicator">
                {aiEnhanced.confidence}% confidence
              </div>
            </div>
            
            <div className="success-probability">
              <MatchCardIcons.trend />
              <span>{aiEnhanced.successProbability}% success probability</span>
            </div>
            
            {aiEnhanced.reasoning && aiEnhanced.reasoning.length > 0 && (
              <div className="ai-reasoning">
                <h5>Why this match?</h5>
                <ul>
                  {aiEnhanced.reasoning.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Analytics Section */}
        {displayAnalytics && (
          <div className="match-analytics-section">
            <h4 className="analytics-title">Match Insights</h4>
            <div className="analytics-stats">
              <div className="analytics-stat">
                <MatchCardIcons.views className="analytics-icon" />
                <span className="analytics-value">{displayAnalytics.viewCount}</span>
                <span className="analytics-label">views</span>
              </div>
              <div className="analytics-stat">
                <MatchCardIcons.interactions className="analytics-icon" />
                <span className="analytics-value">{displayAnalytics.interactionCount}</span>
                <span className="analytics-label">interactions</span>
              </div>
              <div className="analytics-stat">
                <MatchCardIcons.success className="analytics-icon" />
                <span className="analytics-value">{displayAnalytics.similarMatchesSuccess}%</span>
                <span className="analytics-label">similar success</span>
              </div>
            </div>
          </div>
        )}

        <div className="match-stats">
          <div className="stat-item">
            <MatchCardIcons.location className="stat-icon" aria-hidden="true" />
            <span>{profileData.location || 'Location not set'}</span>
          </div>
          {profileData.audienceSize && (
            <div className="stat-item">
              <MatchCardIcons.followers className="stat-icon" aria-hidden="true" />
              <span>{formatNumber(profileData.audienceSize)} followers</span>
            </div>
          )}
          {profileData.engagementRate && (
            <div className="stat-item">
              <MatchCardIcons.engagement className="stat-icon" aria-hidden="true" />
              <span>{profileData.engagementRate}% engagement</span>
            </div>
          )}
          {(profileData.budget || profileData.budgetRange) && (
            <div className="stat-item">
              <MatchCardIcons.budget className="stat-icon" aria-hidden="true" />
              <span>
                {profileData.budgetRange 
                  ? `$${formatNumber(profileData.budgetRange.min)} - $${formatNumber(profileData.budgetRange.max)}`
                  : profileData.budget 
                  ? `$${formatNumber(profileData.budget)}`
                  : 'Budget not set'}
              </span>
            </div>
          )}
        </div>

        {profileData.platforms && profileData.platforms.length > 0 && (
          <div className="match-platforms">
            {profileData.platforms.map((platform) => (
              <span key={platform} className="platform-tag">
                {platform}
              </span>
            ))}
          </div>
        )}

        {(profileData.bio || profileData.description) && (
          <div className="match-description-container">
            <p 
              ref={descriptionRef}
              className={`match-description ${isDescriptionExpanded ? 'expanded' : 'collapsed'}`}
            >
              {profileData.bio || profileData.description}
            </p>
            {showDescriptionToggle && (
              <button
                className={`description-toggle ${isDescriptionExpanded ? 'expanded' : ''}`}
                onClick={toggleDescription}
                aria-expanded={isDescriptionExpanded}
                aria-label={isDescriptionExpanded ? 'Show less' : 'Read more'}
              >
                {isDescriptionExpanded ? 'Show less' : 'Read more'}
                <FiChevronDown />
              </button>
            )}
          </div>
        )}

        <MatchActionBar items={getActionItems()} />
      </CardBody>
    </Card>

    {showCollaborationModal && (
      <CollaborationRequestModal
        recipientId={profileData.id}
        recipientName={profileData.name}
        isOpen={showCollaborationModal}
        onClose={() => setShowCollaborationModal(false)}
        onSuccess={handleCollaborationSuccess}
      />
    )}
    </>
  );
};