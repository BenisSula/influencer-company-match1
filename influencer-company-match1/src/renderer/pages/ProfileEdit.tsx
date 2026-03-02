import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, AvatarUpload } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiClient } from '../services/api-client';
import { BasicInfoStep } from '../components/ProfileSetupWizard/steps/BasicInfoStep';
import { RoleSpecificStep } from '../components/ProfileSetupWizard/steps/RoleSpecificStep';
import { BioPortfolioStep } from '../components/ProfileSetupWizard/steps/BioPortfolioStep';
import { PreferencesStep } from '../components/ProfileSetupWizard/steps/PreferencesStep';
import type { MediaFile } from '../services/media.service';
import './ProfileEdit.css';

interface ProfileData {
    name: string;
    location: string;
    niche?: string;
    audienceSize?: number;
    engagementRate?: number;
    platforms?: string[];
    industry?: string;
    budget?: number;
    companySize?: string;
    bio: string;
    website?: string;
    portfolioUrl?: string;
    minBudget?: number;
    maxBudget?: number;
    collaborationPreference?: string;
    minAudienceSize?: number;
    maxAudienceSize?: number;
    avatarUrl?: string;
    campaignType?: string[];
    preferredInfluencerNiches?: string;
    collaborationDuration?: string;
}

export const ProfileEdit = () => {
    const { user, refreshProfile } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        location: '',
        bio: '',
        platforms: [],
        avatarUrl: '',
    });

    const handleAvatarUpload = async (mediaFile: MediaFile) => {
        setProfileData((prev) => ({ ...prev, avatarUrl: mediaFile.fileUrl }));
        
        // Auto-save avatar immediately without validation
        try {
            await apiClient.put('/auth/profile', { avatarUrl: mediaFile.fileUrl });
            await refreshProfile();
            showToast('Avatar updated successfully!', 'success');
        } catch (error: any) {
            console.error('Avatar update failed:', error);
            showToast('Avatar uploaded but failed to save. Please click Save Changes.', 'warning');
        }
    };

    const handleAvatarUploadError = (error: string) => {
        showToast(error, 'error');
    };

    // Load current profile data - SIMPLIFIED with unified backend structure
    useEffect(() => {
        if (user) {
            console.log('[ProfileEdit] Loading user data:', user);
            
            // Backend now returns unified structure, check both locations for bio
            const bioValue = user.bio || user.profile?.bio || user.description || '';
            
            setProfileData({
                name: user.name || '',
                location: user.location || '',
                niche: user.niche || '',
                audienceSize: user.audienceSize || 0,
                engagementRate: user.engagementRate || 0,
                platforms: user.platforms || [],
                industry: user.industry || '',
                budget: user.budget || 0,
                companySize: user.profile?.companySize || '',
                bio: bioValue,
                website: user.profile?.website || '',
                portfolioUrl: user.portfolioUrl || '',
                minBudget: user.minBudget || 0,
                maxBudget: user.maxBudget || 0,
                collaborationPreference: user.collaborationPreference || '',
                minAudienceSize: user.profile?.minAudienceSize || 0,
                maxAudienceSize: user.profile?.maxAudienceSize || 0,
                avatarUrl: user.avatarUrl || '',
                campaignType: user.profile?.campaignType || [],
                preferredInfluencerNiches: user.profile?.preferredInfluencerNiches || '',
                collaborationDuration: user.profile?.collaborationDuration || '',
            });
            
            console.log('[ProfileEdit] Loaded bio:', bioValue);
        }
    }, [user]);

    const handleChange = (field: string, value: any) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        console.log('[ProfileEdit] Validating form with data:', profileData);

        if (!profileData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!profileData.bio.trim()) {
            newErrors.bio = 'Bio is required';
            console.log('[ProfileEdit] Bio validation failed - bio is empty');
        } else if (profileData.bio.length < 20) {
            newErrors.bio = 'Bio must be at least 20 characters';
            console.log('[ProfileEdit] Bio validation failed - bio length:', profileData.bio.length);
        }

        if (user?.role === 'INFLUENCER' && !profileData.niche?.trim()) {
            newErrors.niche = 'Niche is required';
        }

        if (user?.role === 'COMPANY' && !profileData.industry?.trim()) {
            newErrors.industry = 'Industry is required';
        }

        console.log('[ProfileEdit] Validation errors:', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getTabWithError = (): number => {
        // Tab 0: Basic Info (name)
        if (errors.name) return 0;
        
        // Tab 1: Details (niche, industry)
        if (errors.niche || errors.industry) return 1;
        
        // Tab 2: Bio & Links (bio)
        if (errors.bio) return 2;
        
        return -1;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            // Show specific error messages
            const errorMessages = Object.values(errors).join(', ');
            showToast(`Please fix the following errors: ${errorMessages}`, 'error');
            
            // Scroll to first error
            const firstErrorTab = getTabWithError();
            if (firstErrorTab !== -1) {
                setActiveTab(firstErrorTab);
            }
            return;
        }

        try {
            setLoading(true);

            const updateData: any = {
                name: profileData.name,
                bio: profileData.bio,
                location: profileData.location,
                avatarUrl: profileData.avatarUrl,
            };

            if (user?.role === 'INFLUENCER') {
                updateData.niche = profileData.niche;
                updateData.audienceSize = profileData.audienceSize;
                updateData.engagementRate = profileData.engagementRate;
                updateData.platforms = profileData.platforms;
                updateData.minBudget = profileData.minBudget;
                updateData.maxBudget = profileData.maxBudget;
                updateData.collaborationPreference = profileData.collaborationPreference;
                updateData.portfolioUrl = profileData.portfolioUrl;
            } else if (user?.role === 'COMPANY') {
                updateData.industry = profileData.industry;
                updateData.budget = profileData.budget;
                updateData.companySize = profileData.companySize;
                updateData.minAudienceSize = profileData.minAudienceSize;
                updateData.maxAudienceSize = profileData.maxAudienceSize;
                updateData.website = profileData.website;
                updateData.campaignType = profileData.campaignType;
                updateData.preferredInfluencerNiches = profileData.preferredInfluencerNiches;
                updateData.collaborationDuration = profileData.collaborationDuration;
            }

            console.log('Sending update data:', updateData);
            const response = await apiClient.put('/auth/profile', updateData);
            console.log('Update response:', response);
            
            await refreshProfile();

            showToast('Profile updated successfully! 🎉', 'success');
            navigate('/profile');
        } catch (error: any) {
            console.error('Profile update failed:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            showToast(
                error.response?.data?.message || 'Failed to update profile. Please try again.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    if (!user) {
        return null;
    }

    const tabs = ['Basic Info', 'Details', 'Bio & Links', 'Preferences'];

    return (
        <div className="profile-edit-container">
            <Card style={{ marginBottom: '1.5rem' }}>
                <CardHeader>
                    <div className="profile-edit-header">
                        <h1>Edit Profile</h1>
                        <p>Update your profile information</p>
                    </div>
                </CardHeader>
            </Card>

            <div className="profile-edit-tabs">
                {tabs.map((tab, index) => {
                    const hasError = getTabWithError() === index;
                    return (
                        <button
                            key={index}
                            className={`profile-edit-tab ${activeTab === index ? 'active' : ''} ${hasError ? 'has-error' : ''}`}
                            onClick={() => setActiveTab(index)}
                        >
                            {tab}
                            {hasError && <span className="error-indicator">!</span>}
                        </button>
                    );
                })}
            </div>

            <Card>
                <CardBody>
                    <div className="profile-edit-content">
                        {activeTab === 0 && (
                            <>
                                <div className="avatar-upload-section">
                                    <h3>Profile Picture</h3>
                                    <AvatarUpload
                                        currentAvatar={profileData.avatarUrl}
                                        size="xl"
                                        onUploadComplete={handleAvatarUpload}
                                        onUploadError={handleAvatarUploadError}
                                        disabled={loading}
                                    />
                                </div>
                                <BasicInfoStep
                                    data={profileData}
                                    onChange={handleChange}
                                    errors={errors}
                                />
                            </>
                        )}

                        {activeTab === 1 && (
                            <RoleSpecificStep
                                role={user.role as 'INFLUENCER' | 'COMPANY'}
                                data={profileData}
                                onChange={handleChange}
                                errors={errors}
                            />
                        )}

                        {activeTab === 2 && (
                            <BioPortfolioStep
                                data={profileData}
                                onChange={handleChange}
                                errors={errors}
                            />
                        )}

                        {activeTab === 3 && (
                            <PreferencesStep
                                role={user.role as 'INFLUENCER' | 'COMPANY'}
                                data={profileData}
                                onChange={handleChange}
                                errors={errors}
                            />
                        )}
                    </div>

                    <div className="profile-edit-actions">
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            loading={loading}
                        >
                            Save Changes
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
