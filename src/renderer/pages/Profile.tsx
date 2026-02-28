import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Avatar } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { HiLocationMarker, HiUsers, HiTrendingUp, HiCurrencyDollar, HiPencil, HiUserGroup, HiBadgeCheck, HiClock, HiGlobe, HiExternalLink, HiBriefcase, HiOfficeBuilding } from 'react-icons/hi';
import { CollaborationStats } from '../components/CollaborationStats/CollaborationStats';
import { useCollaborationOutcomes } from '../hooks/useCollaborationOutcomes';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useCollaborationOutcomes();
  
  if (!user) {
    return (
      <Card>
        <CardBody>
          <p>Loading profile...</p>
        </CardBody>
      </Card>
    );
  }

  // Use user object directly - it has all the fields we need
  const type = user.role === 'INFLUENCER' ? 'influencer' : 'company';
  const name = user.name || user.email;

  // If no name is set, show a message to complete profile
  if (!name || name === user.email) {
    return (
      <Card>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', marginBottom: '1rem' }}>
              Complete Your Profile
            </h2>
            <p style={{ fontSize: '1rem', color: '#65676B', marginBottom: '1.5rem' }}>
              Set up your profile to get started with matching
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/profile/edit')}
            >
              Complete Profile
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Verification Badge Component
  const VerificationBadge = ({ verified }: { verified: boolean }) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: verified ? '#E8F5E9' : '#FFF3E0',
      borderRadius: '20px',
      border: `1px solid ${verified ? '#2E7D32' : '#F57C00'}`
    }}>
      {verified ? (
        <>
          <HiBadgeCheck size={20} style={{ color: '#2E7D32' }} />
          <span style={{ color: '#2E7D32', fontWeight: '600' }}>Verified</span>
        </>
      ) : (
        <>
          <HiClock size={20} style={{ color: '#F57C00' }} />
          <span style={{ color: '#F57C00', fontWeight: '600' }}>Pending Verification</span>
        </>
      )}
    </div>
  );

  return (
    <>
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Avatar
                src={user.avatarUrl}
                name={name}
                email={user.email}
                size="2xl"
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#050505', margin: 0 }}>
                    {name}
                  </h1>
                  {user.verificationStatus && (
                    <HiBadgeCheck size={28} style={{ color: '#1877F2' }} title="Verified Profile" />
                  )}
                </div>
                <p style={{ fontSize: '1.125rem', color: '#65676B', margin: 0 }}>
                  {type === 'influencer' ? user.niche : user.industry}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/profile/edit')}
            >
              <HiPencil size={18} style={{ marginRight: '0.5rem' }} />
              Edit Profile
            </Button>
          </div>

          {/* Verification Status Banner */}
          {user.verificationStatus !== undefined && (
            <div style={{ marginTop: '1rem' }}>
              <VerificationBadge verified={user.verificationStatus} />
            </div>
          )}
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
            {user.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiLocationMarker size={24} style={{ color: '#65676B' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Location</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>{user.location}</div>
                </div>
              </div>
            )}

            {user.audienceSize && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiUsers size={24} style={{ color: '#65676B' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Audience Size</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                    {formatNumber(user.audienceSize)} followers
                  </div>
                </div>
              </div>
            )}

            {user.engagementRate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiTrendingUp size={24} style={{ color: '#65676B' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Engagement Rate</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                    {user.engagementRate}%
                  </div>
                </div>
              </div>
            )}

            {user.budget && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiCurrencyDollar size={24} style={{ color: '#65676B' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#65676B' }}>Budget</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#050505' }}>
                    ${formatNumber(user.budget)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {user.platforms && user.platforms.length > 0 && (
        <Card style={{ marginBottom: '1rem' }}>
          <CardHeader>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
              Platforms
            </h3>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {user.platforms.map((platform) => (
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

      {/* Professional Details Section - NEW */}
      {type === 'influencer' && (
        <>
          {/* Content Types */}
          {user.contentType && user.contentType.length > 0 && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiBriefcase size={20} style={{ color: '#F57C00' }} />
                  Content Types
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(Array.isArray(user.contentType)
                    ? user.contentType
                    : typeof user.contentType === 'string'
                    ? user.contentType.split(',')
                    : []
                  ).map((type: string, index: number) => (
                    <span key={index} style={{
                      padding: '0.5rem 1rem',
                      background: '#FFF3E0',
                      color: '#F57C00',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {type.trim()}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Budget Range */}
          {(user.minBudget || user.maxBudget) && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiCurrencyDollar size={20} style={{ color: '#2E7D32' }} />
                  Budget Range
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HiCurrencyDollar size={32} style={{ color: '#2E7D32' }} />
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                      ${formatNumber(user.minBudget)} - ${formatNumber(user.maxBudget)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#65676B' }}>
                      Per collaboration
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Portfolio Link */}
          {user.portfolioUrl && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiGlobe size={20} style={{ color: '#1877F2' }} />
                  Portfolio
                </h3>
              </CardHeader>
              <CardBody>
                <a 
                  href={user.portfolioUrl.startsWith('http') ? user.portfolioUrl : `https://${user.portfolioUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#1877F2',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '500',
                    padding: '0.75rem 1.25rem',
                    background: '#E3F2FD',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#BBDEFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#E3F2FD'}
                >
                  <HiGlobe size={20} />
                  View Portfolio
                  <HiExternalLink size={16} />
                </a>
              </CardBody>
            </Card>
          )}

          {/* Collaboration Preference */}
          {user.collaborationPreference && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiBriefcase size={20} style={{ color: '#1976D2' }} />
                  Collaboration Preference
                </h3>
              </CardHeader>
              <CardBody>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: '#E3F2FD',
                  color: '#1976D2',
                  borderRadius: '16px',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {user.collaborationPreference}
                </span>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Company-specific Professional Details */}
      {type === 'company' && (
        <>
          {/* Company Size */}
          {user.companySize && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiOfficeBuilding size={20} style={{ color: '#1976D2' }} />
                  Company Size
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HiUsers size={24} style={{ color: '#1976D2' }} />
                  <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#050505' }}>
                    {user.companySize}
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Website */}
          {user.website && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiGlobe size={20} style={{ color: '#1877F2' }} />
                  Website
                </h3>
              </CardHeader>
              <CardBody>
                <a 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#1877F2',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '500',
                    padding: '0.75rem 1.25rem',
                    background: '#E3F2FD',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#BBDEFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#E3F2FD'}
                >
                  <HiGlobe size={20} />
                  Visit Website
                  <HiExternalLink size={16} />
                </a>
              </CardBody>
            </Card>
          )}

          {/* Campaign Types */}
          {user.campaignType && user.campaignType.length > 0 && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiBriefcase size={20} style={{ color: '#1976D2' }} />
                  Campaign Types
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(Array.isArray(user.campaignType) 
                    ? user.campaignType 
                    : typeof user.campaignType === 'string'
                    ? (user.campaignType as string).split(',')
                    : []
                  ).map((type: string, index: number) => (
                    <span key={index} style={{
                      padding: '0.5rem 1rem',
                      background: '#E3F2FD',
                      color: '#1976D2',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {type.trim()}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Preferred Influencer Niches */}
          {user.preferredInfluencerNiches && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiUsers size={20} style={{ color: '#7B1FA2' }} />
                  Looking for Influencers in
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {user.preferredInfluencerNiches && user.preferredInfluencerNiches.split(',').map((niche: string, index: number) => (
                    <span key={index} style={{
                      padding: '0.5rem 1rem',
                      background: '#F3E5F5',
                      color: '#7B1FA2',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {niche.trim()}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Collaboration Duration */}
          {user.collaborationDuration && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiClock size={20} style={{ color: '#2E7D32' }} />
                  Collaboration Duration
                </h3>
              </CardHeader>
              <CardBody>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: '#E8F5E9',
                  color: '#2E7D32',
                  borderRadius: '16px',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {user.collaborationDuration}
                </span>
              </CardBody>
            </Card>
          )}

          {/* Audience Size Range */}
          {(user.minAudienceSize || user.maxAudienceSize) && (
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiTrendingUp size={20} style={{ color: '#1976D2' }} />
                  Target Audience Size
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HiUsers size={32} style={{ color: '#1976D2' }} />
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505' }}>
                      {formatNumber(user.minAudienceSize)} - {formatNumber(user.maxAudienceSize)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#65676B' }}>
                      Followers
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {(user.bio || user.description) && (
        <Card style={{ marginBottom: '1rem' }}>
          <CardHeader>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0 }}>
              About
            </h3>
          </CardHeader>
          <CardBody>
            <p style={{ fontSize: '1rem', color: '#050505', lineHeight: '1.6', margin: 0 }}>
              {user.bio || user.description}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Collaboration Performance Section */}
      <Card style={{ marginTop: '1rem' }}>
        <CardHeader>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#050505', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HiUserGroup size={20} style={{ color: '#667eea' }} />
            Collaboration Performance
          </h3>
        </CardHeader>
        <CardBody>
          <CollaborationStats stats={stats} loading={statsLoading} />
        </CardBody>
      </Card>
    </>
  );
};
