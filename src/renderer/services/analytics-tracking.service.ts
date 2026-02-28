/**
 * Analytics & Conversion Tracking Service
 * Tracks user behavior, conversions, and provides insights
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface ConversionEvent {
  step: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PageView {
  path: string;
  title: string;
  referrer: string;
  timestamp: number;
}

/**
 * Analytics Tracking Service
 */
class AnalyticsTrackingService {
  private sessionId: string;
  private userId: string | null = null;
  private conversionFunnel: ConversionEvent[] = [];
  private pageViews: PageView[] = [];
  private events: AnalyticsEvent[] = [];
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Initialize tracking
   */
  private initializeTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent({
          category: 'engagement',
          action: 'page_hidden',
          label: window.location.pathname
        });
      } else {
        this.trackEvent({
          category: 'engagement',
          action: 'page_visible',
          label: window.location.pathname
        });
      }
    });
    
    // Track scroll depth
    this.initializeScrollTracking();
    
    // Track time on page
    this.initializeTimeTracking();
  }
  
  /**
   * Check if current page should be tracked
   */
  private shouldTrack(): boolean {
    const path = window.location.pathname;
    // Skip tracking for admin pages
    if (path.startsWith('/admin')) {
      return false;
    }
    return true;
  }

  /**
   * Track page view
   */
  trackPageView(path?: string, title?: string): void {
    if (!this.shouldTrack()) return;

    const pageView: PageView = {
      path: path || window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    };
    
    this.pageViews.push(pageView);
    
    // Send to backend
    this.sendToBackend('pageview', pageView);
    
    console.log('📊 Page View:', pageView);
  }
  
  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.shouldTrack()) return;

    const enrichedEvent = {
      ...event,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      path: window.location.pathname
    };
    
    this.events.push(enrichedEvent);
    
    // Send to backend
    this.sendToBackend('event', enrichedEvent);
    
    console.log('📊 Event:', enrichedEvent);
  }
  
  /**
   * Track conversion funnel step
   */
  trackConversion(step: string, metadata?: Record<string, any>): void {
    if (!this.shouldTrack()) return;

    const conversion: ConversionEvent = {
      step,
      timestamp: Date.now(),
      metadata
    };
    
    this.conversionFunnel.push(conversion);
    
    // Send to backend
    this.sendToBackend('conversion', {
      ...conversion,
      sessionId: this.sessionId,
      userId: this.userId,
      funnel: this.conversionFunnel
    });
    
    console.log('📊 Conversion:', conversion);
  }
  
  /**
   * Track CTA click
   */
  trackCTAClick(ctaName: string, location: string, role?: string): void {
    if (!this.shouldTrack()) return;

    this.trackEvent({
      category: 'cta',
      action: 'click',
      label: ctaName,
      metadata: {
        location,
        role,
        timestamp: Date.now()
      }
    });
    
    // Track in conversion funnel
    this.trackConversion('cta_click', {
      ctaName,
      location,
      role
    });
  }
  
  /**
   * Track form submission
   */
  trackFormSubmission(formName: string, success: boolean, errorMessage?: string): void {
    this.trackEvent({
      category: 'form',
      action: success ? 'submit_success' : 'submit_error',
      label: formName,
      metadata: {
        success,
        errorMessage,
        timestamp: Date.now()
      }
    });
    
    if (success) {
      this.trackConversion('form_submit', { formName });
    }
  }
  
  /**
   * Track newsletter subscription
   */
  trackNewsletterSubscription(source: string = 'landing_page'): void {
    this.trackEvent({
      category: 'newsletter',
      action: 'subscribe',
      label: source,
      metadata: {
        source,
        timestamp: Date.now()
      }
    });
    
    this.trackConversion('newsletter_subscribe', { source });
  }
  
  /**
   * Track signup initiation
   */
  trackSignupInitiation(role: 'influencer' | 'company', source: string): void {
    this.trackEvent({
      category: 'signup',
      action: 'initiate',
      label: role,
      metadata: {
        role,
        source,
        timestamp: Date.now()
      }
    });
    
    this.trackConversion('signup_initiate', { role, source });
  }
  
  /**
   * Track signup completion
   */
  trackSignupCompletion(role: 'influencer' | 'company', userId: string): void {
    this.userId = userId;
    
    this.trackEvent({
      category: 'signup',
      action: 'complete',
      label: role,
      metadata: {
        role,
        userId,
        timestamp: Date.now()
      }
    });
    
    this.trackConversion('signup_complete', { role, userId });
  }
  
  /**
   * Track section view (scroll into view)
   */
  trackSectionView(sectionName: string): void {
    this.trackEvent({
      category: 'engagement',
      action: 'section_view',
      label: sectionName,
      metadata: {
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Track video play
   */
  trackVideoPlay(videoId: string, videoTitle: string): void {
    this.trackEvent({
      category: 'video',
      action: 'play',
      label: videoTitle,
      metadata: {
        videoId,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Track exit intent
   */
  trackExitIntent(): void {
    this.trackEvent({
      category: 'engagement',
      action: 'exit_intent',
      label: window.location.pathname,
      metadata: {
        timeOnPage: this.getTimeOnPage(),
        scrollDepth: this.getScrollDepth(),
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Initialize scroll tracking
   */
  private initializeScrollTracking(): void {
    const scrollThresholds = [25, 50, 75, 100];
    const trackedThresholds = new Set<number>();
    
    const handleScroll = () => {
      const scrollDepth = this.getScrollDepth();
      
      scrollThresholds.forEach(threshold => {
        if (scrollDepth >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          this.trackEvent({
            category: 'engagement',
            action: 'scroll_depth',
            label: `${threshold}%`,
            value: threshold
          });
        }
      });
    };
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  /**
   * Initialize time tracking
   */
  private initializeTimeTracking(): void {
    const startTime = Date.now();
    
    // Track time on page every 30 seconds
    setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      
      if (timeOnPage % 30 === 0 && timeOnPage > 0) {
        this.trackEvent({
          category: 'engagement',
          action: 'time_on_page',
          label: window.location.pathname,
          value: timeOnPage
        });
      }
    }, 30000);
    
    // Track on page unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      this.trackEvent({
        category: 'engagement',
        action: 'page_exit',
        label: window.location.pathname,
        value: timeOnPage
      });
    });
  }
  
  /**
   * Get current scroll depth percentage
   */
  private getScrollDepth(): number {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDepth = (scrollTop / (documentHeight - windowHeight)) * 100;
    return Math.min(Math.round(scrollDepth), 100);
  }
  
  /**
   * Get time on page in seconds
   */
  private getTimeOnPage(): number {
    const firstPageView = this.pageViews[0];
    if (!firstPageView) return 0;
    return Math.floor((Date.now() - firstPageView.timestamp) / 1000);
  }
  
  /**
   * Get conversion funnel
   */
  getConversionFunnel(): ConversionEvent[] {
    return this.conversionFunnel;
  }
  
  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return this.events;
  }
  
  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }
  
  /**
   * Send data to backend
   */
  private async sendToBackend(type: string, data: any): Promise<void> {
    try {
      // Send to backend analytics endpoint
      const response = await fetch('/api/landing/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          data,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now()
        })
      });
      
      // Only log if response is not 404 (endpoint not implemented yet)
      if (!response.ok && response.status !== 404) {
        console.warn('Analytics tracking failed:', response.status);
      }
    } catch (error) {
      // Fail silently - don't break user experience
      // Analytics endpoint may not be implemented yet
    }
  }
  
  /**
   * Get analytics summary
   */
  getSummary(): {
    sessionId: string;
    userId: string | null;
    pageViews: number;
    events: number;
    conversions: number;
    timeOnPage: number;
    scrollDepth: number;
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      pageViews: this.pageViews.length,
      events: this.events.length,
      conversions: this.conversionFunnel.length,
      timeOnPage: this.getTimeOnPage(),
      scrollDepth: this.getScrollDepth()
    };
  }
}

// Export singleton instance
export const analyticsTracking = new AnalyticsTrackingService();
