import { Card, CardHeader, CardBody } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { HiLocationMarker, HiUsers, HiTrendingUp, HiCurrencyDollar } from 'react-icons/hi';

export const Profile = () => {
  const { user } = useAuth();
  
  if (!user || !user.profile) {
    return (
      <Card>
        <CardBody>
          <p>Loading profile...</p>
        </CardBody>
      </Card>
    );
  }

  const { profile } = user;
  const type = profile.type;

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <>
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: '700'
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#050505', margin: '0 0 0.5rem 0' }}>
                {profile.name}
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#65676B', margin: 0 }}>
                {type === 'influencer' ? profile.niche : profile.industry}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
            Profile Information
          </h3>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {profile.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiLocationMarker size={24} style={{ color: '#65676B' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Location</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>{profile.location}</div>
                </div>
              </div>
            )}

            {profile.audienceSize && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiUsers size={24} style={{ color: '#65676B' }} />
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
                <HiTrendingUp size={24} style={{ color: '#65676B' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Engagement Rate</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                    {profile.engagementRate}%
                  </div>
                </div>
              </div>
            )}

            {(profile.budget || profile.budgetRange) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiCurrencyDollar size={24} style={{ color: '#65676B' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Budget</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                    {profile.budget 
                      ? `$${formatNumber(profile.budget)}`
                      : `$${formatNumber(profile.budgetRange?.min)} - $${formatNumber(profile.budgetRange?.max)}`
                    }
                  </div>
                </div>
              </div>
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

      {(profile.bio || profile.description) && (
        <Card>
          <CardHeader>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
              About
            </h3>
          </CardHeader>
          <CardBody>
            <p style={{ fontSize: '1rem', color: '#050505', lineHeight: '1.6', margin: 0 }}>
              {profile.bio || profile.description}
            </p>
          </CardBody>
        </Card>
      )}
    </>
  );
};
