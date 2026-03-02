import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button } from '../';
import { HiInformationCircle, HiArrowLeft } from 'react-icons/hi';
import './DisabledFeature.css';

export interface DisabledFeatureProps {
  /**
   * Feature name to display
   */
  featureName: string;
  
  /**
   * Explanation message
   */
  message: string;
  
  /**
   * Optional redirect path
   */
  redirectTo?: string;
  
  /**
   * Optional redirect button text
   */
  redirectText?: string;
  
  /**
   * Show back button
   */
  showBackButton?: boolean;
}

/**
 * DisabledFeature Component
 * 
 * Displays a consistent UI when a feature is disabled.
 * Follows platform design system and provides clear user guidance.
 */
export const DisabledFeature: React.FC<DisabledFeatureProps> = ({
  featureName,
  message,
  redirectTo = '/',
  redirectText = 'Go to Dashboard',
  showBackButton = true,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="disabled-feature-container">
      <Card className="disabled-feature-card">
        <CardBody>
          <div className="disabled-feature-content">
            {/* Icon */}
            <div className="disabled-feature-icon">
              <HiInformationCircle size={64} />
            </div>
            
            {/* Title */}
            <h2 className="disabled-feature-title">
              {featureName} Temporarily Unavailable
            </h2>
            
            {/* Message */}
            <p className="disabled-feature-message">
              {message}
            </p>
            
            {/* Info Box */}
            <div className="disabled-feature-info-box">
              <p>
                <strong>What's happening?</strong>
              </p>
              <p>
                We're transforming our platform into a social intelligence network 
                for better influencer-company connections. This feature will return 
                with improvements soon!
              </p>
            </div>
            
            {/* Actions */}
            <div className="disabled-feature-actions">
              {showBackButton && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate(-1)}
                >
                  <HiArrowLeft size={20} />
                  Go Back
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(redirectTo)}
              >
                {redirectText}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
