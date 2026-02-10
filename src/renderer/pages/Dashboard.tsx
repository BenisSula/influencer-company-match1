import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Button, MatchCard, MatchCardSkeleton } from '../components';
import { HiTrendingUp, HiUserGroup, HiLightningBolt } from 'react-icons/hi';
import { matchingService, Match } from '../services/matching.service';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../AppComponent.css';

export const Dashboard = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchingService.getMatches();
      setMatches(response.data);
    } catch (err) {
      const errorMessage = 'Failed to load matches. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const perfectMatches = matches.filter((m) => m.tier === 'Perfect').length;
  const excellentMatches = matches.filter((m) => m.tier === 'Excellent').length;

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

  return (
    <>
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

      {loading ? (
        <Card style={{ marginBottom: '1rem' }}>
          <CardBody>
            <div className="stats-grid">
              <div className="stat-box">
                <HiTrendingUp size={32} style={{ color: '#2563EB', marginBottom: '0.5rem' }} aria-hidden="true" />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                  --
                </div>
                <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Total Matches</div>
              </div>
              <div className="stat-box middle">
                <HiUserGroup size={32} style={{ color: '#14B8A6', marginBottom: '0.5rem' }} aria-hidden="true" />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                  --
                </div>
                <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Perfect Matches</div>
              </div>
              <div className="stat-box">
                <HiLightningBolt size={32} style={{ color: '#F59E0B', marginBottom: '0.5rem' }} aria-hidden="true" />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                  --
                </div>
                <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Excellent Matches</div>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card style={{ marginBottom: '1rem' }}>
          <CardBody>
            <div className="stats-grid">
              <div className="stat-box">
                <HiTrendingUp size={32} style={{ color: '#2563EB', marginBottom: '0.5rem' }} aria-hidden="true" />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                  {matches.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Total Matches</div>
              </div>
              <div className="stat-box middle">
                <HiUserGroup size={32} style={{ color: '#14B8A6', marginBottom: '0.5rem' }} aria-hidden="true" />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                  {perfectMatches}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Perfect Matches</div>
              </div>
              <div className="stat-box">
                <HiLightningBolt size={32} style={{ color: '#F59E0B', marginBottom: '0.5rem' }} aria-hidden="true" />
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                  {excellentMatches}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Excellent Matches</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {loading && (
        <>
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </>
      )}

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

      {!loading && !error && matches.length === 0 && (
        <Card>
          <CardBody>
            <div className="empty-state">
              <HiUserGroup size={64} className="empty-icon" aria-hidden="true" />
              <h3>No matches yet</h3>
              <p>Complete your profile to start getting matched with {user.role === 'INFLUENCER' ? 'companies' : 'influencers'}</p>
              <Button variant="primary" style={{ marginTop: '1rem' }}>Complete Profile</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && !error && matches.length > 0 && (
        <>
          <Card style={{ marginBottom: '1rem' }}>
            <CardHeader>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505', margin: 0 }}>
                🎯 Top Matches for You
              </h3>
            </CardHeader>
            <CardBody>
              <p style={{ fontSize: '0.9375rem', color: '#65676B', marginBottom: '1rem' }}>
                Based on your profile, here are your best compatibility matches
              </p>
            </CardBody>
          </Card>

          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
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
    </>
  );
};
