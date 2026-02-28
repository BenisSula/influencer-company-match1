import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardBody, Button, Avatar } from '../components';
import { CollaborationFeedbackModal } from '../components/CollaborationFeedbackModal/CollaborationFeedbackModal';
import { CollaborationRequestModal } from '../components/CollaborationRequestModal/CollaborationRequestModal';
import { CollaborationStats } from '../components/CollaborationStats/CollaborationStats';
import { CompatibilityIndicator } from '../components/CompatibilityIndicator/CompatibilityIndicator';
import { CompatibilityModal } from '../components/CompatibilityModal/CompatibilityModal';
import { BudgetTierBadge } from '../components/BudgetTierBadge/BudgetTierBadge';
import { ProfileTabs, ProfileTab } from '../components/ProfileTabs/ProfileTabs';
import { ReviewList } from '../components/ReviewList/ReviewList';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCollaborationOutcomes } from '../hooks/useCollaborationOutcomes';
import { useCompatibility } from '../hooks/useCompatibility';
import { useSavedProfile } from '../hooks/useSavedProfile';
import { useProfileUpdateListener } from '../hooks/useProfileUpdates';
import { profileService, ProfileData } from '../services/profile.service';
import { matchingService } from '../services/matching.service';
import { analyticsService } from '../services/analytics.service';
import { reviewsService, Review } from '../services/reviews.service';
import { 
  HiLocationMarker, 
  HiUsers, 
  HiTrendingUp, 
  HiCurrencyDollar, 
  HiArrowLeft, 
  HiMail, 
  HiStar, 
  HiBookmark, 
  HiOutlineBookmark,
  HiBadgeCheck,
  HiClock,
  HiCheckCircle,
  HiChartBar,
  HiOfficeBuilding,
  HiGlobe,
  HiUser,
  HiBriefcase
} from 'react-icons/hi';
import './ProfileView.css';

export const ProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [compatibilityModalOpen, setCompatibilityModalOpen] = useState(false);
  const [collaborationModalOpen, setCollaborationModalOpen] = useState(false);
  const [connection, setConnection] = useState<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [hasCollaborated, setHasCollaborated] = useState(false);
  const [collaborationStats, setCollaborationStats] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const { recordOutcome, checkExistingOutcome, stats: userStats } = useCollaborationOutcomes();
  const { score: compatibilityScore, factors: compatibilityFactors, loading: compatibilityLoading } = useCompatibility(id);
  const { isSaved, loading: saveLoading, toggleSave } = useSavedProfile(id);

  const isOwnProfile = !id || (user?.profile && id === user.profile.id);

  // Listen for profile updates
  useProfileUpdateListener(useCallback((event) => {
    if (id && event.userId === id) {
      // Refresh the viewed profile
      console.log('[ProfileView] Profile updated for:', id, event);
      profileService.getProfile(id)
        .then(updatedProfile => {
          setProfile(updatedProfile);
        })
        .catch(err => {
          console.error('[ProfileView] Failed to refresh profile:', err);
        });
    }
  }, [id]));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id || isOwnProfile) {
          // Show current user's profile
          if (user?.profile) {
            setProfile(user.profile);
          }
        } else {
          // Fetch other user's profile by ID
          const fetchedProfile = await profileService.getProfile(id);
          setProfile(fetchedProfile);
          
          // Track profile view
          analyticsService.recordProfileView(id, 'profile_page');
        }
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Record view duration on unmount
    return () => {
      if (id && !isOwnProfile) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (duration > 0) {
          analyticsService.recordProfileView(id, 'profile_page', duration);
        }
      }
    };
  }, [id, user, isOwnProfile]);

  useEffect(() => {
    const checkCollaborationHistory = async () => {
      if (!id || isOwnProfile || !user) return;

      try {
        // Check connection status with this user
        const status = await matchingService.getConnectionStatus(id);
        setConnectionStatus((status as any).status || 'none');
        
        // Check if there's a connection with this user
        const connections = await matchingService.getMyConnections();
        const userConnection = Array.isArray(connections) 
          ? connections.find((c: any) => c.partner?.id === id)
          : null;

        if (userConnection) {
          setConnection(userConnection);
          // Check if already rated
          const outcome = await checkExistingOutcome(userConnection.id);
          setHasCollaborated(!!outcome);
        }
      } catch (error) {
        console.error('Error checking collaboration history:', error);
      }
    };

    checkCollaborationHistory();
  }, [id, isOwnProfile, user, checkExistingOutcome]);

  // Fetch collaboration stats for the profile
  useEffect(() => {
    if (!id || isOwnProfile) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const fetchedReviews = await reviewsService.getProfileReviews(id, 10);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id, isOwnProfile]);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewsService.markReviewHelpful(reviewId);
      // Refresh reviews to show updated helpful count
      const updatedReviews = await reviewsService.getProfileReviews(id!, 10);
      setReviews(updatedReviews);
      showToast('Thank you for your feedback!', 'success');
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      showToast('Failed to mark review as helpful', 'error');
    }
  };

  // Set collaboration stats from user stats
  useEffect(() => {
    // For now, use the current user's stats as a placeholder
    // In production, you'd fetch stats for the specific profile ID
    if (userStats) {
      setCollaborationStats(userStats);
    }
  }, [userStats]);

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      await recordOutcome(feedbackData);
      setFeedbackModalOpen(false);
      setHasCollaborated(true);
      alert('Thank you for your feedback! This helps improve our matching algorithm.');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleToggleSave = async () => {
    try {
      await toggleSave();
      showToast(isSaved ? 'Profile unsaved' : 'Profile saved!', 'success');
    } catch (error) {
      showToast('Failed to save profile', 'error');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <p>Loading profile...</p>
        </CardBody>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardBody>
          <p style={{ color: '#E53E3E' }}>{error || 'Profile not found'}</p>
          <Button onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
            Go Back
          </Button>
        </CardBody>
      </Card>
    );
  }

  const type = profile.type;

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handleSendMessage = async () => {
    if (!id) return;
    
    try {
      // Navigate to messages page with recipient info
      // The Messages page will handle creating the conversation
      navigate('/messages', { 
        state: { 
          recipientId: id, 
          recipientName: profile.name 
        } 
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const getProfileTabs = (): ProfileTab[] => {
    if (!profile) return [];

    const tabs: ProfileTab[] = [
      {
        id: 'about',
        label: 'About',
        icon: <HiUser />,
        content: (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', marginBottom: '1rem' }}>Bio</h3>
              <p style={{ color: '#65676B', lineHeight: '1.5', margin: 0 }}>
                {profile.bio || profile.description || 'No bio available.'}
              </p>
            </div>
            
            {type === 'company' && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', marginBottom: '1rem' }}>Company Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {profile.industry && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Industry:</strong>
                      <div style={{ color: '#65676B', marginTop: '0.25rem' }}>{profile.industry}</div>
                    </div>
                  )}
                  {profile.companySize && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Company Size:</strong>
                      <div style={{ color: '#65676B', marginTop: '0.25rem' }}>{profile.companySize}</div>
                    </div>
                  )}
                  {profile.location && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Location:</strong>
                      <div style={{ color: '#65676B', marginTop: '0.25rem' }}>{profile.location}</div>
                    </div>
                  )}
                  {profile.website && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Website:</strong>
                      <div style={{ marginTop: '0.25rem' }}>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', textDecoration: 'none' }}>
                          {profile.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {type === 'influencer' && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', marginBottom: '1rem' }}>Creator Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {profile.niche && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Niche:</strong>
                      <div style={{ color: '#65676B', marginTop: '0.25rem' }}>{profile.niche}</div>
                    </div>
                  )}
                  {profile.audienceSize && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Audience Size:</strong>
                      <div style={{ color: '#65676B', marginTop: '0.25rem' }}>{formatNumber(profile.audienceSize)}</div>
                    </div>
                  )}
                  {profile.engagementRate && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Engagement Rate:</strong>
                      <div style={{ color: '#65676B', marginTop: '0.25rem' }}>{(profile.engagementRate * 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {profile.platforms && profile.platforms.length > 0 && (
                    <div>
                      <strong style={{ fontWeight: '600', color: '#050505', fontSize: '0.875rem' }}>Platforms:</strong>
                      <div style={{ color: '#65676B', marginTop: '0.25rem' }}>{profile.platforms.join(', ')}</div>
                    </div>
                  )}
                </div>

                {/* Budget Range for Influencers */}
                {(profile.minBudget || profile.maxBudget) && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#050505', marginBottom: '0.75rem' }}>Budget Range</h4>
                    <div style={{ 
                      background: '#E8F5E9',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #2E7D32'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2E7D32' }}>
                        ${formatNumber(profile.minBudget)} - ${formatNumber(profile.maxBudget)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#1B5E20', marginTop: '0.25rem' }}>
                        Per collaboration
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Types for Influencers */}
                {profile.contentType && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#050505', marginBottom: '0.75rem' }}>Content Types</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(typeof profile.contentType === 'string'
                        ? profile.contentType.split(',')
                        : profile.contentType
                      ).map((type: string, index: number) => (
                        <span
                          key={index}
                          style={{
                            background: '#FFF3E0',
                            color: '#F57C00',
                            padding: '0.5rem 1rem',
                            borderRadius: '16px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                          }}
                        >
                          {type.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collaboration Preference */}
                {profile.collaborationPreference && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#050505', marginBottom: '0.75rem' }}>Collaboration Preference</h4>
                    <span style={{
                      background: '#E3F2FD',
                      color: '#1976D2',
                      padding: '0.5rem 1rem',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}>
                      {profile.collaborationPreference}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <HiChartBar />,
        content: (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', marginBottom: '1rem' }}>Performance Metrics</h3>
            {type === 'influencer' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center', border: '1px solid #E4E6EB' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '0.5rem' }}>
                    {profile.audienceSize ? formatNumber(profile.audienceSize) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B', fontWeight: '500' }}>Total Followers</div>
                </div>
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center', border: '1px solid #E4E6EB' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '0.5rem' }}>
                    {profile.engagementRate ? `${(profile.engagementRate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B', fontWeight: '500' }}>Engagement Rate</div>
                </div>
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center', border: '1px solid #E4E6EB' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '0.5rem' }}>
                    {profile.platforms?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B', fontWeight: '500' }}>Active Platforms</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center', border: '1px solid #E4E6EB' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '0.5rem' }}>
                    {profile.budget ? `$${formatNumber(profile.budget)}` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B', fontWeight: '500' }}>Budget Range</div>
                </div>
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center', border: '1px solid #E4E6EB' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '0.5rem' }}>
                    {profile.companySize || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B', fontWeight: '500' }}>Company Size</div>
                </div>
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center', border: '1px solid #E4E6EB' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '0.5rem' }}>
                    {profile.industry || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B', fontWeight: '500' }}>Industry</div>
                </div>
              </div>
            )}
          </div>
        )
      },
      {
        id: 'portfolio',
        label: 'Portfolio',
        icon: <HiBriefcase />,
        content: (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', marginBottom: '1rem' }}>Portfolio & Work Samples</h3>
            
            {type === 'influencer' && profile.portfolioUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiGlobe size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Portfolio Website</strong>
                </div>
                <a 
                  href={profile.portfolioUrl.startsWith('http') ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#1877F2', 
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {profile.portfolioUrl}
                  <HiGlobe size={16} />
                </a>
              </div>
            )}

            {type === 'influencer' && profile.contentType && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiBriefcase size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Content Types</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(typeof profile.contentType === 'string'
                    ? profile.contentType.split(',')
                    : profile.contentType
                  ).map((type: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        background: '#FFF3E0',
                        color: '#F57C00',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      {type.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {type === 'company' && profile.campaignType && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiBriefcase size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Campaign Types</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(typeof profile.campaignType === 'string' 
                    ? profile.campaignType.split(',') 
                    : profile.campaignType
                  ).map((type: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        background: '#E3F2FD',
                        color: '#1976D2',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      {type.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {type === 'company' && profile.preferredInfluencerNiches && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiUsers size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Looking for Influencers in</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.preferredInfluencerNiches.split(',').map((niche: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        background: '#F3E5F5',
                        color: '#7B1FA2',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      {niche.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {type === 'company' && profile.collaborationDuration && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiClock size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Collaboration Duration</strong>
                </div>
                <span style={{
                  background: '#E8F5E9',
                  color: '#2E7D32',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '16px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {profile.collaborationDuration}
                </span>
              </div>
            )}

            {!profile.portfolioUrl && !profile.contentType && !profile.campaignType && !profile.preferredInfluencerNiches && !profile.collaborationDuration && (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                background: '#F8F9FA', 
                borderRadius: '8px',
                border: '1px solid #E4E6EB'
              }}>
                <HiBriefcase size={48} style={{ color: '#BDC1C6', marginBottom: '1rem' }} />
                <p style={{ color: '#65676B', margin: 0 }}>
                  No portfolio information available yet.
                </p>
              </div>
            )}
          </div>
        )
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: <HiClock />,
        content: (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', marginBottom: '1rem' }}>Recent Activity</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <HiCheckCircle size={20} style={{ color: '#2E7D32' }} />
                <strong style={{ fontWeight: '600', color: '#050505' }}>Profile Status</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {profile.verificationStatus ? (
                  <>
                    <HiBadgeCheck size={20} style={{ color: '#2E7D32' }} />
                    <span style={{ color: '#2E7D32', fontWeight: '500' }}>Verified Profile</span>
                  </>
                ) : (
                  <>
                    <HiClock size={20} style={{ color: '#F57C00' }} />
                    <span style={{ color: '#65676B' }}>Profile Active</span>
                  </>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <HiClock size={20} style={{ color: '#1877F2' }} />
                <strong style={{ fontWeight: '600', color: '#050505' }}>Member Since</strong>
              </div>
              <p style={{ color: '#65676B', margin: 0 }}>
                {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <HiTrendingUp size={20} style={{ color: '#1877F2' }} />
                <strong style={{ fontWeight: '600', color: '#050505' }}>Last Updated</strong>
              </div>
              <p style={{ color: '#65676B', margin: 0 }}>
                {new Date(profile.updatedAt || Date.now()).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {type === 'influencer' && profile.collaborationPreference && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiBriefcase size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Collaboration Preference</strong>
                </div>
                <span style={{
                  background: '#E3F2FD',
                  color: '#1976D2',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '16px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {profile.collaborationPreference}
                </span>
              </div>
            )}
          </div>
        )
      }
    ];

    // Add connections tab for non-own profiles
    if (!isOwnProfile) {
      tabs.push({
        id: 'connections',
        label: 'Network',
        icon: <HiUsers />,
        content: (
          <div style={{ padding: '1rem 0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', marginBottom: '1rem' }}>Connection Information</h3>
            
            {connectionStatus === 'connected' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  background: '#E8F5E9', 
                  border: '1px solid #2E7D32',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <HiCheckCircle size={24} style={{ color: '#2E7D32', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#2E7D32', marginBottom: '0.25rem' }}>
                      Connected
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1B5E20' }}>
                      You are connected with this {type === 'company' ? 'company' : 'creator'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {connectionStatus === 'pending' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  background: '#FFF3E0', 
                  border: '1px solid #F57C00',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <HiClock size={24} style={{ color: '#F57C00', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#F57C00', marginBottom: '0.25rem' }}>
                      Connection Pending
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#E65100' }}>
                      Waiting for response to your collaboration request
                    </div>
                  </div>
                </div>
              </div>
            )}

            {connection && connection.collaborationStatus && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiBriefcase size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Collaboration Status</strong>
                </div>
                <span style={{
                  background: connection.collaborationStatus === 'active' ? '#E8F5E9' : 
                             connection.collaborationStatus === 'completed' ? '#E3F2FD' : '#FFF3E0',
                  color: connection.collaborationStatus === 'active' ? '#2E7D32' : 
                         connection.collaborationStatus === 'completed' ? '#1976D2' : '#F57C00',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '16px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'inline-block',
                  textTransform: 'capitalize'
                }}>
                  {connection.collaborationStatus}
                </span>
              </div>
            )}

            {connection && connection.collaborationType && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiOfficeBuilding size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Collaboration Type</strong>
                </div>
                <span style={{
                  background: '#F3E5F5',
                  color: '#7B1FA2',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '16px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'inline-block',
                  textTransform: 'capitalize'
                }}>
                  {connection.collaborationType.replace('-', ' ')}
                </span>
              </div>
            )}

            {connection && connection.createdAt && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <HiClock size={20} style={{ color: '#1877F2' }} />
                  <strong style={{ fontWeight: '600', color: '#050505' }}>Connected Since</strong>
                </div>
                <p style={{ color: '#65676B', margin: 0 }}>
                  {new Date(connection.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}

            {connectionStatus === 'none' && (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                background: '#F8F9FA', 
                borderRadius: '8px',
                border: '1px solid #E4E6EB'
              }}>
                <HiUsers size={48} style={{ color: '#BDC1C6', marginBottom: '1rem' }} />
                <p style={{ color: '#65676B', margin: '0 0 1rem 0' }}>
                  Not connected yet
                </p>
                <p style={{ color: '#65676B', fontSize: '0.875rem', margin: 0 }}>
                  Send a collaboration request to connect with this {type === 'company' ? 'company' : 'creator'}
                </p>
              </div>
            )}
          </div>
        )
      });
    }

    return tabs;
  };

  return (
    <>
      {/* Back Button - Always visible */}
      <div className="profile-view-header-buttons">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <HiArrowLeft />
          <span className="button-text">Back</span>
        </Button>
        
        {/* Action buttons - Only for other users' profiles */}
        {!isOwnProfile && (
          <>
            {connectionStatus === 'none' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCollaborationModalOpen(true)}
                className="button-primary"
              >
                <HiStar />
                <span className="button-text">Request Collaboration</span>
              </Button>
            )}
            {connectionStatus === 'pending' && (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="button-secondary"
              >
                <HiClock />
                <span className="button-text">Request Pending</span>
              </Button>
            )}
            {connectionStatus === 'connected' && connection?.collaborationStatus === 'requested' && (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="button-secondary"
              >
                <HiClock />
                <span className="button-text">Collaboration Pending</span>
              </Button>
            )}
            {connectionStatus === 'connected' && connection?.collaborationStatus !== 'requested' && (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="button-secondary"
              >
                <HiCheckCircle />
                <span className="button-text">Connected</span>
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleSave}
              disabled={saveLoading}
              className="button-secondary"
            >
              {isSaved ? <HiBookmark /> : <HiOutlineBookmark />}
              <span className="button-text">{isSaved ? 'Saved' : 'Save Profile'}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSendMessage}
              className="button-secondary"
            >
              <HiMail />
              <span className="button-text">Message</span>
            </Button>
            {connection && !hasCollaborated && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFeedbackModalOpen(true)}
                className="button-secondary"
              >
                <HiStar />
                <span className="button-text">Rate Collaboration</span>
              </Button>
            )}
          </>
        )}
      </div>

      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Avatar
              src={profile.avatarUrl}
              name={profile.name}
              size="2xl"
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#050505', margin: 0 }}>
                  {profile.name}
                </h1>
                {type === 'company' && profile.budget && (
                  <BudgetTierBadge budget={profile.budget} />
                )}
              </div>
              <p style={{ fontSize: '1.125rem', color: '#65676B', margin: 0 }}>
                {type === 'influencer' ? profile.niche : profile.industry}
              </p>
            </div>
          </div>

          {/* Compatibility Score - Only show for other users' profiles */}
          {!isOwnProfile && !compatibilityLoading && compatibilityScore > 0 && (
            <CompatibilityIndicator
              score={compatibilityScore}
              onViewDetails={() => setCompatibilityModalOpen(true)}
            />
          )}

          {/* Trust Indicators - Show for own company profile or other profiles */}
          {(isOwnProfile && user?.role === 'COMPANY') || !isOwnProfile ? (
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#F0F2F5', 
              borderRadius: '8px',
              flexWrap: 'wrap'
            }}>
              {profile.verificationStatus && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiBadgeCheck size={20} style={{ color: '#1877F2' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#050505' }}>Verified</span>
                </div>
              )}
              {collaborationStats && collaborationStats.totalCollaborations > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiCheckCircle size={20} style={{ color: '#4CAF50' }} />
                    <span style={{ fontSize: '0.9rem', color: '#050505' }}>
                      {collaborationStats.successfulCollaborations} Successful Collaborations
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiStar size={20} style={{ color: '#FFA500' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#050505' }}>
                      {collaborationStats.averageRating.toFixed(1)} Rating
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiChartBar size={20} style={{ color: '#2196F3' }} />
                    <span style={{ fontSize: '0.9rem', color: '#050505' }}>
                      {collaborationStats.successRate.toFixed(0)}% Success Rate
                    </span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiClock size={20} style={{ color: '#65676B' }} />
                <span style={{ fontSize: '0.9rem', color: '#65676B' }}>
                  {isOwnProfile ? 'Your average response time: 2 hours' : 'Usually responds in 2 hours'}
                </span>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Collaboration Performance Stats - Show for own company profile or other profiles */}
      {((isOwnProfile && user?.role === 'COMPANY') || !isOwnProfile) && collaborationStats && collaborationStats.totalCollaborations > 0 && (
        <Card style={{ marginBottom: '1rem' }}>
          <CardHeader>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
              {isOwnProfile ? 'Your Collaboration Performance' : 'Collaboration Performance'}
            </h3>
          </CardHeader>
          <CardBody>
            <CollaborationStats stats={collaborationStats} loading={false} />
          </CardBody>
        </Card>
      )}

      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
            {type === 'company' ? 'Company Information' : 'Profile Information'}
          </h3>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {profile.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiLocationMarker size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Location</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>{profile.location}</div>
                </div>
              </div>
            )}

            {type === 'company' && (
              <>
                {profile.industry && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiOfficeBuilding size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Industry</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>{profile.industry}</div>
                    </div>
                  </div>
                )}

                {profile.companySize && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiUsers size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Company Size</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>{profile.companySize}</div>
                    </div>
                  </div>
                )}

                {profile.budget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiCurrencyDollar size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Campaign Budget</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                        ${formatNumber(profile.budget)}
                      </div>
                    </div>
                  </div>
                )}

                {(profile.budgetRange?.min || profile.budgetRange?.max) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiTrendingUp size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Target Audience Size</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                        {formatNumber(profile.budgetRange.min)} - {formatNumber(profile.budgetRange.max)} followers
                      </div>
                    </div>
                  </div>
                )}

                {profile.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiGlobe size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Website</div>
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ fontSize: '1rem', fontWeight: '600', color: '#1877F2', textDecoration: 'none' }}
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {type === 'influencer' && (
              <>
                {profile.audienceSize && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiUsers size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Audience Size</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                        {formatNumber(profile.audienceSize)} followers
                      </div>
                    </div>
                  </div>
                )}

                {profile.engagementRate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiTrendingUp size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Engagement Rate</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                        {profile.engagementRate}%
                      </div>
                    </div>
                  </div>
                )}

                {(profile.budgetRange?.min || profile.budgetRange?.max) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiCurrencyDollar size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Budget Range</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                        ${formatNumber(profile.budgetRange.min)} - ${formatNumber(profile.budgetRange.max)}
                      </div>
                    </div>
                  </div>
                )}

                {profile.portfolioUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HiGlobe size={24} style={{ color: '#65676B' }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Portfolio</div>
                      <a 
                        href={profile.portfolioUrl.startsWith('http') ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ fontSize: '1rem', fontWeight: '600', color: '#1877F2', textDecoration: 'none' }}
                      >
                        View Portfolio
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {profile.platforms && profile.platforms.length > 0 && (
        <Card style={{ marginBottom: '1rem' }}>
          <CardHeader>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
              Platforms
            </h3>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.platforms.map((platform) => (
                <span key={platform} style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#E4E6EB',
                  color: '#050505',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  borderRadius: '1.5rem'
                }}>
                  {platform}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
            {type === 'company' ? 'About Our Company' : 'About'}
          </h3>
        </CardHeader>
        <CardBody>
          <p style={{ fontSize: '1rem', color: '#050505', lineHeight: '1.6', margin: 0 }}>
            {profile.bio || profile.description || 'No description available.'}
          </p>

          {type === 'company' && (
            <div style={{ marginTop: '1.5rem' }}>
              {profile.campaignType && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#050505', margin: '0 0 0.5rem 0' }}>
                    Campaign Types
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(typeof profile.campaignType === 'string' 
                      ? profile.campaignType.split(',') 
                      : profile.campaignType
                    ).map((type: string, index: number) => (
                      <span
                        key={index}
                        style={{
                          background: '#E3F2FD',
                          color: '#1976D2',
                          padding: '0.375rem 0.875rem',
                          borderRadius: '16px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                        }}
                      >
                        {type.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.preferredInfluencerNiches && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#050505', margin: '0 0 0.5rem 0' }}>
                    Looking for Influencers in
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {profile.preferredInfluencerNiches.split(',').map((niche: string, index: number) => (
                      <span
                        key={index}
                        style={{
                          background: '#F3E5F5',
                          color: '#7B1FA2',
                          padding: '0.375rem 0.875rem',
                          borderRadius: '16px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                        }}
                      >
                        {niche.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.collaborationDuration && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#050505', margin: '0 0 0.5rem 0' }}>
                    Collaboration Duration
                  </h4>
                  <span style={{
                    background: '#E8F5E9',
                    color: '#2E7D32',
                    padding: '0.375rem 0.875rem',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    {profile.collaborationDuration}
                  </span>
                </div>
              )}
            </div>
          )}

          {type === 'influencer' && profile.contentType && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#050505', margin: '0 0 0.5rem 0' }}>
                Content Types
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(typeof profile.contentType === 'string'
                  ? profile.contentType.split(',')
                  : profile.contentType
                ).map((type: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      background: '#FFF3E0',
                      color: '#F57C00',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {type.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Profile Tabs */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <ProfileTabs tabs={getProfileTabs()} />
        </CardBody>
      </Card>

      {/* Collaboration Request Modal */}
      {!isOwnProfile && profile && (
        <CollaborationRequestModal
          recipientId={id!}
          recipientName={profile.name}
          isOpen={collaborationModalOpen}
          onClose={() => setCollaborationModalOpen(false)}
          onSuccess={async () => {
            showToast('Collaboration request sent!', 'success');
            // Refresh connection status
            try {
              const status = await matchingService.getConnectionStatus(id!);
              setConnectionStatus((status as any).status || 'none');
              const connections = await matchingService.getMyConnections();
              const userConnection = Array.isArray(connections) 
                ? connections.find((c: any) => c.partner?.id === id)
                : null;
              if (userConnection) {
                setConnection(userConnection);
              }
            } catch (error) {
              console.error('Error refreshing connection status:', error);
            }
          }}
        />
      )}

      {/* Collaboration Feedback Modal */}
      {feedbackModalOpen && connection && profile && (
        <CollaborationFeedbackModal
          connectionId={connection.id}
          partnerName={profile.name}
          onClose={() => setFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {/* Compatibility Modal */}
      {!isOwnProfile && (
        <CompatibilityModal
          isOpen={compatibilityModalOpen}
          onClose={() => setCompatibilityModalOpen(false)}
          partnerName={profile?.name || ''}
          overallScore={compatibilityScore}
          factors={compatibilityFactors}
        />
      )}

      {/* Reviews Section - Only show for other users' profiles */}
      {!isOwnProfile && (
        <Card style={{ marginBottom: '1rem' }}>
          <CardHeader>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HiStar style={{ color: '#FBBF24' }} />
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h3>
          </CardHeader>
          <CardBody>
            {reviewsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#65676B' }}>
                Loading reviews...
              </div>
            ) : (
              <ReviewList reviews={reviews} onMarkHelpful={handleMarkHelpful} />
            )}
          </CardBody>
        </Card>
      )}
    </>
  );
};
