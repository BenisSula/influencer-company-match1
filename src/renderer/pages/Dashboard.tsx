import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, MatchCard } from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProfileCompletionBanner } from '../components/ProfileCompletionBanner';
import { CollaborationStats } from '../components/CollaborationStats/CollaborationStats';
import { FeedPost } from '../components/FeedPost/FeedPost';
import { CompatibilityMatchesWidget } from '../components/CompatibilityMatchesWidget/CompatibilityMatchesWidget';
import { CollaborationRequestsWidget } from '../components/CollaborationRequestsWidget/CollaborationRequestsWidget';
import { AnalyticsWidget } from '../components/AnalyticsWidget/AnalyticsWidget';
import { TrendingUp, Users, Zap, Newspaper, UserCircle } from 'lucide-react';
import { matchingService, Match } from '../services/matching.service';
import { feedService, FeedPost as FeedPostType } from '../services/feed.service';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useConnection } from '../contexts/ConnectionContext';
import { useCollaborationOutcomes } from '../hooks/useCollaborationOutcomes';
import { useAnalytics } from '../hooks/useAnalytics';
import { apiClient } from '../services/api-client';
import '../AppComponent.css';
import './Dashboard.css';

export const Dashboard = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<FeedPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { updateConnectionStatus } = useConnection();
  const { stats, loading: statsLoading } = useCollaborationOutcomes();
  const { metrics, loading: analyticsLoading, error: analyticsError } = useAnalytics();
  const navigate = useNavigate();

  // Use real analytics data from backend, fallback to calculated data
  const analyticsData = metrics ? {
    profileViews: metrics.profileViews,
    matchImpressions: metrics.matchImpressions,
    responseRate: metrics.responseRate,
    trend: metrics.trend
  } : {
    profileViews: matches.length * 15 + 42,
    matchImpressions: matches.length * 3 + 18,
    responseRate: 75,
    trend: 'up' as const
  };

  // Memoize widget visibility checks for performance
  const hasCollaborationRequests = useMemo(() => {
    return connections.some(conn => 
      conn.collaboration_status === 'requested' || 
      conn.collaboration_status === 'active' ||
      conn.collaborationStatus === 'requested' ||
      conn.collaborationStatus === 'active'
    );
  }, [connections]);

  const hasCollaborationPerformance = useMemo(() => {
    return stats && stats.totalCollaborations > 0;
  }, [stats]);

  useEffect(() => {
    loadMatches();
    loadConnections();
    loadRecentPosts();
    
    // Listen for connection status changes
    const handleConnectionChange = () => {
      console.log('[Dashboard] Connection status changed, reloading...');
      loadConnections();
      if (matches.length > 0) {
        loadConnectionStatuses(matches);
      }
    };
    
    const handleCollaborationAccepted = (event: any) => {
      console.log('[Dashboard] Collaboration accepted, reloading...');
      loadConnections();
      if (matches.length > 0) {
        loadConnectionStatuses(matches);
      }
      
      // If event contains payment info, redirect to payment checkout
      if (event?.detail?.collaborationId && event?.detail?.requiresPayment) {
        console.log('[Dashboard] Redirecting to payment checkout:', event.detail.collaborationId);
        navigate(`/payments/checkout/${event.detail.collaborationId}`);
      }
    };
    
    window.addEventListener('connectionStatusChanged', handleConnectionChange);
    window.addEventListener('collaborationAccepted', handleCollaborationAccepted);
    
    return () => {
      window.removeEventListener('connectionStatusChanged', handleConnectionChange);
      window.removeEventListener('collaborationAccepted', handleCollaborationAccepted);
    };
  }, []);

  const loadConnections = async () => {
    try {
      const response: any = await matchingService.getMyConnections();
      const connectionsData = Array.isArray(response) ? response : (response.data || []);
      setConnections(connectionsData);
    } catch (err) {
      console.warn('Could not fetch connections:', err);
      setConnections([]);
    }
  };

  const loadRecentPosts = async () => {
    try {
      setLoadingPosts(true);
      // Fetch 5 most recent posts ordered by createdAt DESC (newest first)
      const response = await feedService.getFeed({ page: 1, limit: 5 });
      setRecentPosts(response.data);
    } catch (err) {
      console.error('Error loading recent posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchingService.getMatches();
      // Handle both array response and object with data property
      const matchesData = Array.isArray(response) ? response : (response.data || []);
      setMatches(matchesData);
      
      // Load connection statuses for all matches
      if (user && matchesData.length > 0) {
        await loadConnectionStatuses(matchesData);
        
        // Track match impressions (non-critical, don't fail if this errors)
        try {
          const impressions = matchesData.slice(0, 10).map((match, index) => ({
            matchUserId: match.profile.id,
            matchScore: match.score,
            position: index,
          }));
          await analyticsService.recordMatchImpressions(impressions, 'dashboard');
        } catch (analyticsError) {
          console.warn('Failed to record match impressions:', analyticsError);
          // Don't show error to user for analytics tracking
        }
      }
    } catch (err: any) {
      // Only show error if it's not a 401 (which would have already logged out)
      if (err.status !== 401) {
        const errorMessage = 'Failed to load matches. Please try again.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionStatuses = async (matchesData: Match[]) => {
    if (!user) return;
    
    try {
      // Load connection status for each match
      for (const match of matchesData) {
        try {
          const response = await apiClient.get<{ status: string; connection: any }>(
            `/matching/connections/status/${match.profile.id}`
          );
          
          if (response.status && response.status !== 'none') {
            updateConnectionStatus(user.id, match.profile.id, response.status as any);
          }
        } catch (error) {
          // Ignore errors for individual status checks
          console.debug('Could not load connection status for', match.profile.id);
        }
      }
    } catch (error) {
      console.error('Error loading connection statuses:', error);
    }
  };

  // Early return for no user
  if (!user) {
    return (
      <Card>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Please log in to view your dashboard</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Early return if loading
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <>
      {user.profileCompletionPercentage !== undefined && user.profileCompletionPercentage < 100 && (
        <ProfileCompletionBanner 
          completionPercentage={user.profileCompletionPercentage} 
          user={user}
        />
      )}

      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <div className="user-header">
            <div className="user-details">
              <h2>{user.profile?.name || user.email}</h2>
              <p>
                {user.role === 'INFLUENCER' 
                  ? `${user.profile?.niche || 'Influencer'} • ${user.profile?.location || 'Location not set'}`
                  : `${user.profile?.industry || 'Company'} • ${user.profile?.location || 'Location not set'}`
                }
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Dashboard Widgets Grid */}
      <div className={`dashboard-widgets-grid ${!hasCollaborationRequests ? 'single-column' : ''}`}>
        <div className="dashboard-widget-column">
          <CompatibilityMatchesWidget
            matches={matches}
            loading={loading}
            error={error || undefined}
            userRole={(user?.role === 'ADMIN' ? 'INFLUENCER' : user?.role) || 'INFLUENCER'}
          />
        </div>
        
        {hasCollaborationRequests && (
          <div className="dashboard-widget-column">
            <CollaborationRequestsWidget
              requests={connections}
              loading={loading}
              error={error || undefined}
            />
          </div>
        )}
      </div>
      
      <AnalyticsWidget
        data={analyticsData}
        loading={analyticsLoading}
        error={analyticsError || undefined}
      />

      {/* Collaboration Performance Widget - Only show if user has collaboration data */}
      {!statsLoading && hasCollaborationPerformance && (
        <Card style={{ marginBottom: '1rem' }}>
          <CardHeader>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCircle size={20} style={{ color: '#667eea' }} />
              Collaboration Performance
            </h3>
          </CardHeader>
          <CardBody>
            <CollaborationStats stats={stats} loading={statsLoading} />
          </CardBody>
        </Card>
      )}

      {/* Stats Card - Match style with Analytics Widget above */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-box">
              <div className="stat-icon">
                <TrendingUp size={24} style={{ color: '#2563EB' }} aria-hidden="true" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{matches.length}</div>
                <div className="stat-label">Total Matches</div>
              </div>
            </div>
            <div className="dashboard-stat-box">
              <div className="stat-icon">
                <Users size={24} style={{ color: '#14B8A6' }} aria-hidden="true" />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {(matches || []).filter((m) => m.tier === 'Perfect').length}
                </div>
                <div className="stat-label">Perfect Matches</div>
              </div>
            </div>
            <div className="dashboard-stat-box">
              <div className="stat-icon">
                <Zap size={24} style={{ color: '#F59E0B' }} aria-hidden="true" />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {(matches || []).filter((m) => m.tier === 'Excellent').length}
                </div>
                <div className="stat-label">Excellent Matches</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {error && (
        <Card style={{ marginBottom: '1rem' }}>
          <CardBody>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>
              <Button variant="primary" onClick={loadMatches}>Retry</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!error && matches.length === 0 && (
        <Card>
          <CardBody>
            <div className="empty-state">
              <Users size={64} className="empty-icon" aria-hidden="true" />
              <h3>No matches yet</h3>
              <p>Complete your profile to start getting matched with {user.role === 'INFLUENCER' ? 'companies' : 'influencers'}</p>
              <Button variant="primary" style={{ marginTop: '1rem' }}>Complete Profile</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!error && matches.length > 0 && (
        <>
          <Card style={{ marginBottom: '1rem' }}>
            <CardHeader>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} style={{ color: '#F59E0B' }} />
                Top Matches for You
              </h3>
            </CardHeader>
            <CardBody>
              <p style={{ fontSize: '0.9375rem', color: '#65676B', marginBottom: '1rem' }}>
                Based on your profile, here are your best compatibility matches
              </p>
            </CardBody>
          </Card>

          {matches.map((match, index) => (
            <MatchCard key={match?.id || match?.profile?.id || index} match={match} />
          ))}

          {matches.length > 10 && (
            <Card>
              <CardBody>
                <div style={{ textAlign: 'center' }}>
                  <Button variant="secondary">Load More Matches</Button>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Recent Posts Section */}
      {!error && (
        <>
          <Card style={{ marginBottom: '1rem', marginTop: '2rem' }}>
            <CardHeader>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Newspaper size={20} style={{ color: '#667eea' }} />
                Recent Community Posts
              </h3>
            </CardHeader>
            <CardBody>
              <p style={{ fontSize: '0.9375rem', color: '#65676B', marginBottom: '1rem' }}>
                See what's happening in the community
              </p>
            </CardBody>
          </Card>

          {loadingPosts && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardBody>
                <div className="feed-skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text-group">
                      <div className="skeleton-text skeleton-text-short"></div>
                      <div className="skeleton-text skeleton-text-shorter"></div>
                    </div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {!loadingPosts && recentPosts.length === 0 && (
            <Card>
              <CardBody>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#65676B' }}>No posts yet. Be the first to share!</p>
                </div>
              </CardBody>
            </Card>
          )}

          {!loadingPosts && recentPosts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onDelete={() => loadRecentPosts()}
              onLikeChange={() => {}}
            />
          ))}

          {!loadingPosts && recentPosts.length > 0 && (
            <Card>
              <CardBody>
                <div style={{ textAlign: 'center' }}>
                  <button 
                    className="view-all-posts-btn"
                    onClick={() => navigate('/feed')}
                    aria-label="View all posts in feed"
                  >
                    View All Posts
                  </button>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </>
  );
};
