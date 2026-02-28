import React from 'react';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { DisabledFeature } from '../DisabledFeature/DisabledFeature';
import { FeatureFlags } from '../../config/features';

export interface FeatureGuardProps {
  /**
   * Feature to check
   */
  feature: keyof FeatureFlags;
  
  /**
   * Feature display name
   */
  featureName: string;
  
  /**
   * Children to render if feature is enabled
   */
  children: React.ReactNode;
  
  /**
   * Optional redirect path when disabled
   */
  redirectTo?: string;
  
  /**
   * Optional redirect button text
   */
  redirectText?: string;
}

/**
 * FeatureGuard Component
 * 
 * Wraps components that should only be accessible when a feature is enabled.
 * Shows DisabledFeature component when feature is disabled.
 * 
 * @example
 * <FeatureGuard feature="CAMPAIGNS_ENABLED" featureName="Campaigns">
 *   <CampaignsPage />
 * </FeatureGuard>
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  featureName,
  children,
  redirectTo,
  redirectText,
}) => {
  const { enabled, message } = useFeatureFlag(feature);
  
  if (!enabled) {
    return (
      <DisabledFeature
        featureName={featureName}
        message={message}
        redirectTo={redirectTo}
        redirectText={redirectText}
      />
    );
  }
  
  return <>{children}</>;
};
