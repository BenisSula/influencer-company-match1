import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { HiX, HiCheckCircle, HiLightningBolt } from 'react-icons/hi';
import { getMissingFields } from '../../types/profile.types';
import './ProfileCompletionBanner.css';

interface ProfileCompletionBannerProps {
  completionPercentage: number;
  missingFields?: string[];
  user?: any; // For auto-detecting missing fields
}

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  completionPercentage,
  missingFields: providedMissingFields,
  user,
}) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('profile-banner-dismissed') === 'true';
  });

  // Auto-detect missing fields if not provided
  const missingFields = providedMissingFields || (user ? getMissingFields(user) : []);

  if (dismissed || completionPercentage >= 100) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('profile-banner-dismissed', 'true');
  };

  const handleComplete = () => {
    navigate('/profile/edit');
  };

  const getMotivationalMessage = () => {
    if (completionPercentage >= 75) {
      return "You're almost there! Complete your profile to unlock all features.";
    }
    if (completionPercentage >= 50) {
      return "Great progress! Add more details to get better matches.";
    }
    if (completionPercentage >= 25) {
      return "Good start! Complete your profile to stand out.";
    }
    return "Complete your profile to get personalized matches!";
  };

  const getNextStep = () => {
    if (missingFields.includes('niche') || missingFields.includes('industry')) {
      return 'Add your niche/industry';
    }
    if (missingFields.includes('bio')) {
      return 'Add a bio';
    }
    if (missingFields.includes('avatarUrl')) {
      return 'Upload profile picture';
    }
    if (missingFields.includes('platforms')) {
      return 'Add social platforms';
    }
    return 'Complete profile details';
  };

  return (
    <div className="profile-completion-banner">
      <div className="banner-content">
        <div className="banner-icon">
          <HiLightningBolt size={24} />
        </div>
        <div className="banner-text">
          <div className="banner-header">
            <div className="banner-title">Profile {completionPercentage}% Complete</div>
            <button
              className="banner-dismiss-inline"
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <HiX size={18} />
            </button>
          </div>
          <div className="banner-description">
            {getMotivationalMessage()}
          </div>
          <div className="banner-progress">
            <div className="banner-progress-bar">
              <div
                className="banner-progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="banner-progress-text">{completionPercentage}%</span>
          </div>
          {missingFields.length > 0 && (
            <div className="banner-next-step">
              <HiCheckCircle size={14} />
              <span>Next: {getNextStep()}</span>
            </div>
          )}
        </div>
        <div className="banner-actions">
          <Button variant="primary" size="sm" onClick={handleComplete}>
            Complete Profile
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Later
          </Button>
        </div>
      </div>
    </div>
  );
};
