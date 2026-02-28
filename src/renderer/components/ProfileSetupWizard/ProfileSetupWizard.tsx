import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/api-client';
import { ProgressIndicator } from './ProgressIndicator';
import { WizardStep } from './WizardStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { RoleSpecificStep } from './steps/RoleSpecificStep';
import { BioPortfolioStep } from './steps/BioPortfolioStep';
import { PreferencesStep } from './steps/PreferencesStep';
import './ProfileSetupWizard.css';

const STEPS = ['Basic Info', 'Your Details', 'About You', 'Preferences'];

interface ProfileData {
  // Basic
  name: string;
  location: string;
  // Role-specific
  niche?: string;
  audienceSize?: number;
  engagementRate?: number;
  platforms?: string[];
  industry?: string;
  budget?: number;
  companySize?: string;
  // Bio
  bio: string;
  website?: string;
  portfolioUrl?: string;
  // Preferences
  minBudget?: number;
  maxBudget?: number;
  collaborationPreference?: string;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  preferredNiches?: string[];
}

export const ProfileSetupWizard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    location: '',
    bio: '',
    platforms: [],
    preferredNiches: [],
  });

  const handleChange = (field: string, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!profileData.name.trim()) {
        newErrors.name = 'Name is required';
      }
    }

    if (step === 2 && user?.role === 'INFLUENCER') {
      if (!profileData.niche?.trim()) {
        newErrors.niche = 'Niche is required';
      }
    }

    if (step === 2 && user?.role === 'COMPANY') {
      if (!profileData.industry?.trim()) {
        newErrors.industry = 'Industry is required';
      }
    }

    if (step === 3) {
      if (!profileData.bio.trim()) {
        newErrors.bio = 'Bio is required';
      } else if (profileData.bio.length < 20) {
        newErrors.bio = 'Bio must be at least 20 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Prepare data based on role
      const updateData: any = {
        name: profileData.name,
        bio: profileData.bio,
      };

      if (user?.role === 'INFLUENCER') {
        updateData.niche = profileData.niche;
        updateData.audienceSize = profileData.audienceSize;
        updateData.engagementRate = profileData.engagementRate;
        updateData.platforms = profileData.platforms;
        updateData.location = profileData.location;
        updateData.minBudget = profileData.minBudget;
        updateData.maxBudget = profileData.maxBudget;
        updateData.collaborationPreference = profileData.collaborationPreference;
        updateData.portfolioUrl = profileData.portfolioUrl;
      } else if (user?.role === 'COMPANY') {
        updateData.industry = profileData.industry;
        updateData.budget = profileData.budget;
        updateData.companySize = profileData.companySize;
        updateData.location = profileData.location;
        updateData.minAudienceSize = profileData.minAudienceSize;
        updateData.maxAudienceSize = profileData.maxAudienceSize;
        updateData.preferredNiches = profileData.preferredNiches;
        updateData.website = profileData.website;
      }

      // Update profile
      await apiClient.put('/auth/profile', updateData);

      // Mark profile as completed
      await apiClient.post('/auth/complete-profile');

      // Refresh user profile
      await refreshProfile();

      showToast('Profile setup complete! Welcome aboard! 🎉', 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Profile setup failed:', error);
      showToast(
        error.response?.data?.message || 'Failed to save profile. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="wizard-container">
      <div className="wizard-box">
        <div className="wizard-header">
          <h1>Complete Your Profile</h1>
          <p>Let's set up your profile to get you started</p>
        </div>

        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={4}
          steps={STEPS}
        />

        {currentStep === 1 && (
          <WizardStep
            title="Basic Information"
            description="Tell us a bit about yourself"
          >
            <BasicInfoStep
              data={profileData}
              onChange={handleChange}
              errors={errors}
            />
          </WizardStep>
        )}

        {currentStep === 2 && (
          <WizardStep
            title={user.role === 'INFLUENCER' ? 'Your Influence' : 'Your Company'}
            description={
              user.role === 'INFLUENCER'
                ? 'Share details about your audience and content'
                : 'Tell us about your company and campaigns'
            }
          >
            <RoleSpecificStep
              role={user.role as 'INFLUENCER' | 'COMPANY'}
              data={profileData}
              onChange={handleChange}
              errors={errors}
            />
          </WizardStep>
        )}

        {currentStep === 3 && (
          <WizardStep
            title="About You"
            description="Share your story and showcase your work"
          >
            <BioPortfolioStep
              data={profileData}
              onChange={handleChange}
              errors={errors}
            />
          </WizardStep>
        )}

        {currentStep === 4 && (
          <WizardStep
            title="Matching Preferences"
            description="Help us find the perfect matches for you"
          >
            <PreferencesStep
              role={user.role as 'INFLUENCER' | 'COMPANY'}
              data={profileData}
              onChange={handleChange}
              errors={errors}
            />
          </WizardStep>
        )}

        <div className="wizard-actions">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            loading={loading}
            fullWidth={currentStep === 1}
          >
            {currentStep === 4 ? 'Complete Setup' : 'Continue'}
          </Button>
        </div>

        <div className="wizard-footer">
          <p>
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
};
