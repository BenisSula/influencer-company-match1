import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminUserService } from '../../services/admin-user.service';
import './AdminUserProfileModal.css';

interface AdminUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string | null;
}

export const AdminUserProfileModal: React.FC<AdminUserProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>({
    // Basic fields
    fullName: '',
    email: '',
    role: 'INFLUENCER',
    isActive: true,
    emailVerified: false,
    
    // Profile fields
    bio: '',
    location: '',
    website: '',
    avatarUrl: '',
    
    // Influencer fields
    niche: '',
    audienceSize: 0,
    engagementRate: 0,
    platforms: [],
    minBudget: 0,
    maxBudget: 0,
    portfolioUrl: '',
    collaborationPreference: '',
    contentType: [],
    verificationStatus: false,
    
    // Company fields
    industry: '',
    budget: 0,
    companySize: '',
    minAudienceSize: 0,
    maxAudienceSize: 0,
    campaignType: [],
    preferredInfluencerNiches: '',
    collaborationDuration: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    }
  }, [isOpen, userId]);

  const loadUserProfile = async () => {
    if (!userId) return;
    
    try {
      setLoadingProfile(true);
      setError('');
      const profile: any = await adminUserService.getUserProfile(userId);
      
      // Map profile data to form
      setFormData({
        fullName: profile.profileData?.fullName || profile.profileData?.name || '',
        email: profile.email || '',
        role: profile.role || 'INFLUENCER',
        isActive: profile.isActive ?? true,
        emailVerified: profile.emailVerified ?? false,
        
        bio: profile.profileData?.bio || '',
        location: profile.profileData?.location || '',
        website: profile.profileData?.website || '',
        avatarUrl: profile.avatarUrl || '',
        
        // Influencer fields
        niche: profile.profileData?.niche || '',
        audienceSize: profile.profileData?.audienceSize || 0,
        engagementRate: profile.profileData?.engagementRate || 0,
        platforms: profile.profileData?.platforms || [],
        minBudget: profile.profileData?.minBudget || 0,
        maxBudget: profile.profileData?.maxBudget || 0,
        portfolioUrl: profile.profileData?.portfolioUrl || '',
        collaborationPreference: profile.profileData?.collaborationPreference || '',
        contentType: profile.profileData?.contentType || [],
        verificationStatus: profile.profileData?.verificationStatus || false,
        
        // Company fields
        industry: profile.profileData?.industry || '',
        budget: profile.profileData?.budget || 0,
        companySize: profile.profileData?.companySize || '',
        minAudienceSize: profile.profileData?.minAudienceSize || 0,
        maxAudienceSize: profile.profileData?.maxAudienceSize || 0,
        campaignType: profile.profileData?.campaignType || [],
        preferredInfluencerNiches: profile.profileData?.preferredInfluencerNiches || '',
        collaborationDuration: profile.profileData?.collaborationDuration || '',
        description: profile.profileData?.description || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setError('');
    
    try {
      setLoading(true);
      await adminUserService.updateUserProfile(userId, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit User Profile</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {loadingProfile ? (
          <div className="modal-body">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading profile...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="profile-tabs">
              <button
                type="button"
                className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </button>
              <button
                type="button"
                className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Details
              </button>
              <button
                type="button"
                className={`tab ${activeTab === 'roleSpecific' ? 'active' : ''}`}
                onClick={() => setActiveTab('roleSpecific')}
              >
                {formData.role === 'INFLUENCER' ? 'Influencer Info' : 'Company Info'}
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="admin-message admin-message-error">
                  {error}
                </div>
              )}

              {activeTab === 'basic' && (
                <div className="tab-content">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Full Name *</label>
                    <input
                      className="admin-form-input"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Email *</label>
                    <input
                      className="admin-form-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      disabled
                    />
                    <p className="admin-form-help">Email cannot be changed</p>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Role *</label>
                    <select
                      className="admin-form-select"
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                    >
                      <option value="INFLUENCER">Influencer</option>
                      <option value="COMPANY">Company</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleChange('isActive', e.target.checked)}
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="admin-form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.emailVerified}
                        onChange={(e) => handleChange('emailVerified', e.target.checked)}
                      />
                      <span>Email Verified</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="tab-content">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Avatar URL</label>
                    <input
                      className="admin-form-input"
                      type="text"
                      value={formData.avatarUrl}
                      onChange={(e) => handleChange('avatarUrl', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Bio</label>
                    <textarea
                      className="admin-form-textarea"
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Location</label>
                    <input
                      className="admin-form-input"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Website</label>
                    <input
                      className="admin-form-input"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'roleSpecific' && formData.role === 'INFLUENCER' && (
                <div className="tab-content">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Niche</label>
                    <input
                      className="admin-form-input"
                      type="text"
                      value={formData.niche}
                      onChange={(e) => handleChange('niche', e.target.value)}
                      placeholder="e.g., Fashion, Tech, Fitness"
                    />
                  </div>

                  <div className="form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Audience Size</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        value={formData.audienceSize}
                        onChange={(e) => handleChange('audienceSize', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Engagement Rate (%)</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        value={formData.engagementRate}
                        onChange={(e) => handleChange('engagementRate', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Min Budget ($)</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        value={formData.minBudget}
                        onChange={(e) => handleChange('minBudget', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Max Budget ($)</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        value={formData.maxBudget}
                        onChange={(e) => handleChange('maxBudget', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Portfolio URL</label>
                    <input
                      className="admin-form-input"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                      placeholder="https://portfolio.com"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Collaboration Preference</label>
                    <input
                      className="admin-form-input"
                      type="text"
                      value={formData.collaborationPreference}
                      onChange={(e) => handleChange('collaborationPreference', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.verificationStatus}
                        onChange={(e) => handleChange('verificationStatus', e.target.checked)}
                      />
                      <span>Verified Influencer</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'roleSpecific' && formData.role === 'COMPANY' && (
                <div className="tab-content">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Industry</label>
                    <input
                      className="admin-form-input"
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      placeholder="e.g., Technology, Fashion, Food"
                    />
                  </div>

                  <div className="form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Budget ($)</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleChange('budget', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Company Size</label>
                      <select
                        className="admin-form-select"
                        value={formData.companySize}
                        onChange={(e) => handleChange('companySize', e.target.value)}
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Min Audience Size</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        value={formData.minAudienceSize}
                        onChange={(e) => handleChange('minAudienceSize', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Max Audience Size</label>
                      <input
                        className="admin-form-input"
                        type="number"
                        value={formData.maxAudienceSize}
                        onChange={(e) => handleChange('maxAudienceSize', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Preferred Influencer Niches</label>
                    <textarea
                      className="admin-form-textarea"
                      value={formData.preferredInfluencerNiches}
                      onChange={(e) => handleChange('preferredInfluencerNiches', e.target.value)}
                      rows={3}
                      placeholder="e.g., Fashion, Beauty, Lifestyle"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Collaboration Duration</label>
                    <input
                      className="admin-form-input"
                      type="text"
                      value={formData.collaborationDuration}
                      onChange={(e) => handleChange('collaborationDuration', e.target.value)}
                      placeholder="e.g., 3 months, 6 months"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Description</label>
                    <textarea
                      className="admin-form-textarea"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={4}
                      placeholder="Company description..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.verificationStatus}
                        onChange={(e) => handleChange('verificationStatus', e.target.checked)}
                      />
                      <span>Verified Company</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
