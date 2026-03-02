/**
 * Analytics Tracking Hook
 * Provides easy access to analytics tracking in components
 */

import { useEffect, useCallback, useRef } from 'react';
import { analyticsTracking } from '../services/analytics-tracking.service';

export const useAnalyticsTracking = () => {
  const hasTrackedPageView = useRef(false);
  
  /**
   * Track page view on mount
   */
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      analyticsTracking.trackPageView();
      hasTrackedPageView.current = true;
    }
  }, []);
  
  /**
   * Track CTA click
   */
  const trackCTAClick = useCallback((ctaName: string, location: string, role?: string) => {
    analyticsTracking.trackCTAClick(ctaName, location, role);
  }, []);
  
  /**
   * Track form submission
   */
  const trackFormSubmission = useCallback((formName: string, success: boolean, errorMessage?: string) => {
    analyticsTracking.trackFormSubmission(formName, success, errorMessage);
  }, []);
  
  /**
   * Track newsletter subscription
   */
  const trackNewsletterSubscription = useCallback((email: string, source: string) => {
    analyticsTracking.trackNewsletterSubscription(source);
  }, []);
  
  /**
   * Track signup initiation
   */
  const trackSignupInitiation = useCallback((role: 'influencer' | 'company', source: string) => {
    analyticsTracking.trackSignupInitiation(role, source);
  }, []);
  
  /**
   * Track signup completion
   */
  const trackSignupCompletion = useCallback((role: 'influencer' | 'company', userId: string) => {
    analyticsTracking.trackSignupCompletion(role, userId);
  }, []);
  
  /**
   * Track section view
   */
  const trackSectionView = useCallback((sectionName: string) => {
    analyticsTracking.trackSectionView(sectionName);
  }, []);
  
  /**
   * Track video play
   */
  const trackVideoPlay = useCallback((videoId: string, videoTitle: string) => {
    analyticsTracking.trackVideoPlay(videoId, videoTitle);
  }, []);
  
  /**
   * Track exit intent
   */
  const trackExitIntent = useCallback(() => {
    analyticsTracking.trackExitIntent();
  }, []);
  
  /**
   * Track custom event
   */
  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    analyticsTracking.trackEvent({
      category,
      action,
      label,
      value
    });
  }, []);
  
  /**
   * Track conversion
   */
  const trackConversion = useCallback((step: string, metadata?: Record<string, any>) => {
    analyticsTracking.trackConversion(step, metadata);
  }, []);
  
  /**
   * Get analytics summary
   */
  const getAnalyticsSummary = useCallback(() => {
    return analyticsTracking.getSummary();
  }, []);
  
  return {
    trackCTAClick,
    trackFormSubmission,
    trackNewsletterSubscription,
    trackSignupInitiation,
    trackSignupCompletion,
    trackSectionView,
    trackVideoPlay,
    trackExitIntent,
    trackEvent,
    trackConversion,
    getAnalyticsSummary
  };
};

/**
 * Hook for tracking section visibility
 */
export const useSectionTracking = (sectionName: string) => {
  const hasTracked = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current || hasTracked.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            analyticsTracking.trackSectionView(sectionName);
            hasTracked.current = true;
          }
        });
      },
      {
        threshold: 0.5 // Track when 50% of section is visible
      }
    );
    
    observer.observe(sectionRef.current);
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [sectionName]);
  
  return sectionRef;
};

/**
 * Hook for tracking exit intent
 */
export const useExitIntentTracking = () => {
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Track when mouse leaves viewport from top
      if (e.clientY <= 0) {
        analyticsTracking.trackExitIntent();
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
};
