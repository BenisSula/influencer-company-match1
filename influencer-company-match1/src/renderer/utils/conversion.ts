/**
 * Conversion Utilities
 * Helper functions for Phase 3 conversion optimization
 */

// Track conversion events (placeholder for analytics integration)
export const trackConversion = (event: string, data?: Record<string, any>) => {
  // TODO: Integrate with analytics service
  console.log('[Conversion]', event, data);
  
  // Store in localStorage for now
  try {
    const events = JSON.parse(localStorage.getItem('conversionEvents') || '[]');
    events.push({
      event,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('conversionEvents', JSON.stringify(events.slice(-100))); // Keep last 100
  } catch (error) {
    console.warn('Error tracking conversion:', error);
  }
};

// Store user preference
export const storeUserPreference = (key: string, value: any) => {
  try {
    localStorage.setItem(`pref_${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn('Error storing preference:', error);
  }
};

// Get user preference
export const getUserPreference = (key: string): any => {
  try {
    const value = localStorage.getItem(`pref_${key}`);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('Error getting preference:', error);
    return null;
  }
};

// Check if exit intent should be shown
export const shouldShowExitIntent = (): boolean => {
  const shown = sessionStorage.getItem('exitIntentShown');
  return shown !== 'true';
};

// Format time remaining for countdown
export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return '00:00:00';
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// Check if sticky CTA should be dismissed
export const isStickyCtaDismissed = (): boolean => {
  const dismissed = localStorage.getItem('stickyCtaDismissed');
  if (!dismissed) return false;
  
  try {
    const dismissedTime = new Date(dismissed).getTime();
    const now = new Date().getTime();
    const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
    
    // Show again after 24 hours
    return hoursSinceDismissed < 24;
  } catch (error) {
    return false;
  }
};

// Dismiss sticky CTA
export const dismissStickyCta = () => {
  localStorage.setItem('stickyCtaDismissed', new Date().toISOString());
  trackConversion('sticky_cta_dismissed');
};

// Get daily timer end time (resets at midnight)
export const getDailyTimerEndTime = (): Date => {
  const stored = localStorage.getItem('dailyTimerEndTime');
  
  if (stored) {
    const endTime = new Date(stored);
    const now = new Date();
    
    // Check if it's still today
    if (endTime.toDateString() === now.toDateString()) {
      return endTime;
    }
  }
  
  // Create new end time for today
  const now = new Date();
  const endTime = new Date(now);
  endTime.setHours(23, 59, 59, 999); // End of day
  
  localStorage.setItem('dailyTimerEndTime', endTime.toISOString());
  return endTime;
};

// Clear all conversion data (for testing)
export const clearConversionData = () => {
  localStorage.removeItem('conversionEvents');
  localStorage.removeItem('stickyCtaDismissed');
  localStorage.removeItem('dailyTimerEndTime');
  sessionStorage.removeItem('exitIntentShown');
};
