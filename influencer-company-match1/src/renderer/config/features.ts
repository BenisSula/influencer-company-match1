/**
 * Feature Flags Configuration
 * 
 * Central configuration for enabling/disabling platform features.
 * Change these values to toggle features without code changes.
 */

export interface FeatureFlags {
  CAMPAIGNS_ENABLED: boolean;
  COLLABORATION_REQUESTS_ENABLED: boolean;
  ADVANCED_ANALYTICS_ENABLED: boolean;
  VIDEO_POSTS_ENABLED: boolean;
  MATCH_HISTORY_ENABLED: boolean;
  SAVED_ITEMS_ENABLED: boolean;
}

export const FEATURES: FeatureFlags = {
  // Campaign System - Temporarily disabled for platform transformation
  CAMPAIGNS_ENABLED: false,
  
  // New Collaboration Request System - Coming soon
  COLLABORATION_REQUESTS_ENABLED: false,
  
  // Advanced Analytics - Future feature
  ADVANCED_ANALYTICS_ENABLED: false,
  
  // Video Posts - Future feature
  VIDEO_POSTS_ENABLED: false,
  
  // Match History & Analytics - NEW Feature
  MATCH_HISTORY_ENABLED: true,
  
  // Saved Items/Collections - Enabled
  SAVED_ITEMS_ENABLED: true,
};

/**
 * Check if a feature is enabled
 * @param feature - Feature key to check
 * @returns boolean indicating if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURES[feature] === true;
};

/**
 * Get feature status with reason
 * @param feature - Feature key to check
 * @returns Object with status and message
 */
export const getFeatureStatus = (feature: keyof FeatureFlags) => {
  const enabled = FEATURES[feature];
  
  const messages: Record<keyof FeatureFlags, string> = {
    CAMPAIGNS_ENABLED: 'Campaign system is being redesigned. Use direct collaboration requests instead.',
    COLLABORATION_REQUESTS_ENABLED: 'Collaboration requests coming soon!',
    ADVANCED_ANALYTICS_ENABLED: 'Advanced analytics coming soon!',
    VIDEO_POSTS_ENABLED: 'Video posts coming soon!',
    MATCH_HISTORY_ENABLED: 'Track your matching performance and insights over time.',
    SAVED_ITEMS_ENABLED: 'Save and organize your favorite content.',
  };
  
  return {
    enabled,
    message: enabled ? 'Feature is active' : messages[feature],
  };
};
