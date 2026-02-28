import { useState, useEffect } from 'react';
import { landingService, LandingStatistics, Testimonial } from '../services/landing.service';
import { analyticsTracking } from '../services/analytics-tracking.service';
import { apiClient } from '../services/api-client';

interface LandingData {
  statistics: LandingStatistics | null;
  testimonials: Testimonial[] | null;
  loading: boolean;
  error: string | null;
}

// Updated fallback stats to match actual database values
const FALLBACK_STATS: LandingStatistics = {
  totalUsers: 15,
  activeMatches: 8,
  successfulCollaborations: 4,
  averageMatchScore: 89,
  platformGrowth: 15,
  updatedAt: new Date().toISOString()
};

export const useLandingStatistics = () => {
  const [stats, setStats] = useState<LandingStatistics>(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await landingService.getStatistics();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch landing stats, using fallback', error);
        // Keep fallback stats
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
};

export const useLandingData = () => {
  const [data, setData] = useState<LandingData>({
    statistics: null,
    testimonials: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        // Load data in parallel
        const [statistics, testimonials] = await Promise.all([
          landingService.getStatistics(),
          landingService.getTestimonials()
        ]);
        
        setData({
          statistics,
          testimonials,
          loading: false,
          error: null
        });
        
        // Track page view with new analytics service
        analyticsTracking.trackPageView();
        
        // Also track with backend
        landingService.trackEvent('landing_page', 'page_view', {
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        });
        
      } catch (error) {
        console.error('Failed to load landing data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load data. Please refresh the page.'
        }));
      }
    };
    
    loadAllData();
  }, []);

  const trackCTAClick = (source: string, role: string) => {
    // Track with new analytics service
    analyticsTracking.trackCTAClick(`${role}_signup`, source, role);
    
    // Also track with backend
    landingService.trackEvent('cta_click', 'signup_initiated', {
      source,
      role,
      timestamp: Date.now()
    });
  };

  const trackSectionView = (section: string) => {
    // Track with new analytics service
    analyticsTracking.trackSectionView(section);
    
    // Also track with backend
    landingService.trackEvent('section_view', 'scroll', {
      section,
      scrollDepth: window.scrollY,
      timestamp: Date.now()
    });
  };

  const subscribeNewsletter = async (email: string) => {
    try {
      const result = await landingService.subscribeNewsletter(email, 'landing_page');
      
      if (result.success) {
        // Track with new analytics service
        analyticsTracking.trackNewsletterSubscription('landing_page');
        
        // Also track with backend
        landingService.trackEvent('newsletter', 'subscribe_success', {
          email: email.split('@')[1], // Track domain only for privacy
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      return {
        success: false,
        message: 'Subscription failed. Please try again.'
      };
    }
  };

  return {
    ...data,
    trackCTAClick,
    trackSectionView,
    subscribeNewsletter
  };
};

export const useLiveActivities = (initialActivities: any[] = []) => {
  const [activities, setActivities] = useState<any[]>(initialActivities);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    // Import socket.io-client dynamically to avoid SSR issues
    import('socket.io-client').then(({ io }) => {
      setConnectionStatus('connecting');
      
      try {
        const socket = io(`${import.meta.env.VITE_API_URL}/landing`, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
        });

        // Connection status handlers
        socket.on('connect', () => {
          console.log('Connected to landing activity feed');
          setConnectionStatus('connected');
          socket.emit('subscribe');
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from landing activity feed');
          setConnectionStatus('disconnected');
        });

        socket.on('connect_error', (error) => {
          console.error('Landing socket connection error:', error);
          // Don't set to error - keep as disconnected to allow fallback display
          setConnectionStatus('disconnected');
        });

        socket.on('reconnect_failed', () => {
          console.log('Landing socket reconnection failed');
          setConnectionStatus('disconnected');
        });

        // Activity feed handlers
        socket.on('subscribed', (data) => {
          console.log('Subscribed to activity feed:', data.message);
          setConnectionStatus('connected');
        });

        socket.on('new-activity', (activity) => {
          console.log('New activity received:', activity);
          setActivities(prev => {
            // Add new activity to the beginning and keep only last 10
            const updated = [activity, ...prev.slice(0, 9)];
            return updated;
          });
        });

        socket.on('connection-count', (data) => {
          setOnlineUsers(data.count);
        });

        // Cleanup function
        return () => {
          socket.emit('unsubscribe');
          socket.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        // Keep as disconnected - don't crash the page
        setConnectionStatus('disconnected');
      }
    }).catch(error => {
      console.error('Failed to load socket.io-client:', error);
      // Keep as disconnected - don't crash the page
      setConnectionStatus('disconnected');
    });
  }, []);

  return {
    activities,
    connectionStatus,
    onlineUsers,
    isConnected: connectionStatus === 'connected'
  };
};

export const usePlatformRatings = () => {
  const [ratings, setRatings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        // Fixed: Use correct backend endpoint
        const response = await apiClient.get('/api/landing/ratings');
        setRatings(response.data);
      } catch (err: any) {
        console.error('Failed to load platform ratings:', err);
        setError(err.message || 'Failed to load ratings');
        // Set fallback data
        setRatings({
          averageRating: 4.8,
          totalReviews: 1247,
          distribution: { 5: 892, 4: 245, 3: 78, 2: 21, 1: 11 },
          trustScore: 96,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return { ratings, loading, error };
};
