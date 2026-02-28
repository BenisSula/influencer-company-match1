import { useMemo } from 'react';
import { isFeatureEnabled, getFeatureStatus, FeatureFlags } from '../config/features';

/**
 * Custom hook for checking feature flags
 * 
 * @param feature - Feature key to check
 * @returns Object with enabled status and message
 * 
 * @example
 * const { enabled, message } = useFeatureFlag('CAMPAIGNS_ENABLED');
 * if (!enabled) {
 *   return <DisabledFeature message={message} />;
 * }
 */
export const useFeatureFlag = (feature: keyof FeatureFlags) => {
  const status = useMemo(() => getFeatureStatus(feature), [feature]);
  
  return {
    enabled: status.enabled,
    message: status.message,
    isEnabled: () => isFeatureEnabled(feature),
  };
};
