import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, MapPin, Globe, Users, Building2, DollarSign, ExternalLink, Instagram, Twitter, Youtube, Linkedin, TrendingUp, Briefcase, Clock, BadgeCheck } from 'lucide-react';
import { adminUserService } from '../../services/admin-user.service';
import { Avatar } from '../Avatar/Avatar';
import './UserDetailModal.css';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await adminUserService.getUserProfile(userId);
      setUser(response);
      setActiveTab('basic'); // Reset to basic tab
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const renderSocialPlatforms = (platforms: any) => {
    if (!platforms || typeof platforms !== 'object') return null;
    
    const platformIcons: any = {
      instagram: Instagram,
      twitter: Twitter,
      youtube: Youtube,
      linkedin: Linkedin,
    };

    const platformEntries: [string, any][] = Array.isArray(platforms) 
      ? platforms.map((p: string) => [p, {}] as [string, any])
      : Object.entries(platforms);

    return (
      <div className="social-platforms">
        {platformEntries.map(([platform, data]: [string, any]) => {
          const Icon = platformIcons[platform.toLowerCase()] || ExternalLink;
          return (
            <div key={platform} className="social-platform">
              <Icon size={20} />
              <div className="platform-info">
                <span className="platform-name">{platform}</span>
                {data.handle && <span className="platform-handle">@{data.handle}</span>}
                {data.followers && (
                  <span className="platform-followers">{data.followers.toLocaleString()} followers</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <User size={24} />
            User Profile Details
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading user profile...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchUserProfile} className="retry-btn">Retry</button>
            </div>
          )}

          {user && !loading && (
            <>
              {/* User Header */}
              <div className="user-header">
                <Avatar
                  src={user.avatarUrl}
                  alt={user.profileData?.fullName || user.profileData?.name || user.email}
                  name={user.profileData?.fullName || user.profileData?.name}
                  email={user.email}
                  size="2xl"
                  className="user-detail-avatar"
                  eager={true}
                  clickable={false}
                />
                <div className="user-basic-info">
                  <h3>{user.profileData?.fullName || user.profileData?.name || 'No Name'}</h3>
                  <p className="user-email">
                    <Mail size={16} />
                    {user.email}
                  </p>
                  <div className="user-badges">
                    <span className={`role-badge role-${user.role?.toLowerCase()}`}>{user.role}</span>
                    <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {user.emailVerified && <span className="verified-badge">Verified</span>}
                    {user.profileData?.verificationStatus && (
                      <span className="verified-badge">
                        <BadgeCheck size={14} /> Profile Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="profile-tabs">
                <button 
                  className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('basic')}
                >
                  Basic Info
                </button>
                <button 
                  className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile Details
                </button>
                {user.profileData?.type === 'influencer' && (
                  <button 
                    className={`tab ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveTab('social')}
                  >
                    Social & Portfolio
                  </button>
                )}
                {user.profileData?.type === 'company' && (
                  <button 
                    className={`tab ${activeTab === 'company' ? 'active' : ''}`}
                    onClick={() => setActiveTab('company')}
                  >
                    Company Info
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'basic' && (
                  <div className="basic-info">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>User ID</label>
                        <span>{user.id}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span>{user.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Role</label>
                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>{user.role}</span>
                      </div>
                      <div className="info-item">
                        <label>Status</label>
                        <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Profile Completed</label>
                        <span>{user.profileCompleted ? 'Yes' : 'No'} ({user.profileCompletionPercentage || 0}%)</span>
                      </div>
                      <div className="info-item">
                        <label>Email Verified</label>
                        <span>{user.emailVerified ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="info-item">
                        <label>Created At</label>
                        <span>
                          <Calendar size={16} />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Last Updated</label>
                        <span>
                          <Calendar size={16} />
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="profile-info">
                    {user.profileData ? (
                      <div className="info-grid">
                        {(user.profileData.bio || user.profileData.description) && (
                          <div className="info-item full-width">
                            <label>Bio/Description</label>
                            <p className="bio-text">{user.profileData.bio || user.profileData.description}</p>
                          </div>
                        )}
                        {user.profileData.location && (
                          <div className="info-item">
                            <label>Location</label>
                            <span>
                              <MapPin size={16} />
                              {user.profileData.location}
                            </span>
                          </div>
                        )}
                        {user.profileData.website && (
                          <div className="info-item">
                            <label>Website</label>
                            <a href={user.profileData.website} target="_blank" rel="noopener noreferrer">
                              <Globe size={16} />
                              {user.profileData.website}
                            </a>
                          </div>
                        )}
                        {user.profileData.type === 'influencer' && (
                          <>
                            {user.profileData.niche && (
                              <div className="info-item">
                                <label>Niche</label>
                                <span>{user.profileData.niche}</span>
                              </div>
                            )}
                            {user.profileData.audienceSize && (
                              <div className="info-item">
                                <label>Audience Size</label>
                                <span>
                                  <Users size={16} />
                                  {formatNumber(user.profileData.audienceSize)}
                                </span>
                              </div>
                            )}
                            {user.profileData.engagementRate && (
                              <div className="info-item">
                                <label>Engagement Rate</label>
                                <span>
                                  <TrendingUp size={16} />
                                  {(user.profileData.engagementRate * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                            {(user.profileData.minBudget || user.profileData.maxBudget) && (
                              <div className="info-item">
                                <label>Budget Range</label>
                                <span>
                                  <DollarSign size={16} />
                                  ${formatNumber(user.profileData.minBudget)} - ${formatNumber(user.profileData.maxBudget)}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {user.profileData.type === 'company' && (
                          <>
                            {user.profileData.industry && (
                              <div className="info-item">
                                <label>Industry</label>
                                <span>
                                  <Building2 size={16} />
                                  {user.profileData.industry}
                                </span>
                              </div>
                            )}
                            {user.profileData.companySize && (
                              <div className="info-item">
                                <label>Company Size</label>
                                <span>
                                  <Users size={16} />
                                  {user.profileData.companySize}
                                </span>
                              </div>
                            )}
                            {user.profileData.budget && (
                              <div className="info-item">
                                <label>Budget</label>
                                <span>
                                  <DollarSign size={16} />
                                  ${formatNumber(user.profileData.budget)}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="no-profile">No profile data available</p>
                    )}
                  </div>
                )}

                {activeTab === 'social' && user.profileData?.type === 'influencer' && (
                  <div className="social-info">
                    {user.profileData.platforms && (Array.isArray(user.profileData.platforms) ? user.profileData.platforms.length > 0 : Object.keys(user.profileData.platforms).length > 0) ? (
                      <>
                        <h4>Social Media Platforms</h4>
                        {renderSocialPlatforms(user.profileData.platforms)}
                      </>
                    ) : (
                      <p className="no-social">No social media platforms connected</p>
                    )}
                    
                    {user.profileData.portfolioUrl && (
                      <div className="portfolio-section">
                        <h4>Portfolio</h4>
                        <div className="info-item">
                          <label>Portfolio URL</label>
                          <a href={user.profileData.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            <Briefcase size={16} />
                            {user.profileData.portfolioUrl}
                          </a>
                        </div>
                      </div>
                    )}

                    {user.profileData.contentType && (
                      <div className="content-types-section">
                        <h4>Content Types</h4>
                        <div className="tags">
                          {(Array.isArray(user.profileData.contentType) 
                            ? user.profileData.contentType 
                            : user.profileData.contentType.split(',')
                          ).map((type: string, index: number) => (
                            <span key={index} className="tag">{type.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.profileData.collaborationPreference && (
                      <div className="info-item">
                        <label>Collaboration Preference</label>
                        <span>{user.profileData.collaborationPreference}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'company' && user.profileData?.type === 'company' && (
                  <div className="company-info">
                    <div className="info-grid">
                      {user.profileData.industry && (
                        <div className="info-item">
                          <label>Industry</label>
                          <span>
                            <Building2 size={16} />
                            {user.profileData.industry}
                          </span>
                        </div>
                      )}
                      {user.profileData.companySize && (
                        <div className="info-item">
                          <label>Company Size</label>
                          <span>
                            <Users size={16} />
                            {user.profileData.companySize}
                          </span>
                        </div>
                      )}
                      {user.profileData.budget && (
                        <div className="info-item">
                          <label>Budget Range</label>
                          <span>
                            <DollarSign size={16} />
                            ${formatNumber(user.profileData.budget)}
                          </span>
                        </div>
                      )}
                      {user.profileData.campaignType && (
                        <div className="info-item full-width">
                          <label>Campaign Types</label>
                          <div className="tags">
                            {(Array.isArray(user.profileData.campaignType) 
                              ? user.profileData.campaignType 
                              : user.profileData.campaignType.split(',')
                            ).map((type: string, index: number) => (
                              <span key={index} className="tag">{type.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.profileData.preferredInfluencerNiches && (
                        <div className="info-item full-width">
                          <label>Preferred Influencer Niches</label>
                          <p>{user.profileData.preferredInfluencerNiches}</p>
                        </div>
                      )}
                      {user.profileData.collaborationDuration && (
                        <div className="info-item">
                          <label>Collaboration Duration</label>
                          <span>
                            <Clock size={16} />
                            {user.profileData.collaborationDuration}
                          </span>
                        </div>
                      )}
                      {(user.profileData.minAudienceSize || user.profileData.maxAudienceSize) && (
                        <div className="info-item">
                          <label>Target Audience Size</label>
                          <span>
                            <Users size={16} />
                            {formatNumber(user.profileData.minAudienceSize)} - {formatNumber(user.profileData.maxAudienceSize)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="admin-btn admin-btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
