import { apiClient } from './api-client';

export interface LandingStatistics {
  totalUsers: number;
  activeMatches: number;
  successfulCollaborations: number;
  averageMatchScore: number;
  platformGrowth: number;
  updatedAt: string;
}

export interface RealtimeStatistics extends LandingStatistics {
  activeUsersNow: number;
  recentActivity: number;
  lastUpdated: string;
}

export interface Activity {
  id: string;
  type: string;
  user: string;
  company?: string;
  location?: string;
  verified: boolean;
  timestamp: Date;
}

export interface Testimonial {
  id: number;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  content: string;
  rating: number;
  createdAt: Date;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
}

export interface MarketRates {
  influencerRates: {
    micro: { min: number; max: number; avg: number };
    mid: { min: number; max: number; avg: number };
    macro: { min: number; max: number; avg: number };
  };
  platformFees: {
    traditional: number;
    ourPlatform: number;
  };
  industryAverages: {
    engagementRate: number;
    conversionRate: number;
    averageOrderValue: number;
    reachMultiplier: number;
  };
}

export interface ROICalculationParams {
  campaignBudget: number;
  followers: number;
  engagementRate: number;
  niche?: string;
  postsPerMonth?: number;
}

export interface ROIResult {
  ourPlatformCost: number;
  traditionalCost: number;
  savings: number;
  savingsPercentage: number;
  estimatedReach: number;
  conversions: number;
  revenue: number;
  roi: number;
  breakdown: {
    platformFee: number;
    traditionalFee: number;
    engagementRate: number;
    conversionRate: number;
  };
}

export class LandingService {
  private static instance: LandingService;
  private statisticsCache: LandingStatistics | null = null;
  private testimonialsCache: Testimonial[] | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheTime: number = 0;

  static getInstance(): LandingService {
    if (!LandingService.instance) {
      LandingService.instance = new LandingService();
    }
    return LandingService.instance;
  }

  async getStatistics(): Promise<LandingStatistics> {
    try {
      // Check cache first
      if (this.statisticsCache && this.isCacheValid()) {
        return this.statisticsCache;
      }

      const response = await apiClient.get('/api/landing/statistics');
      this.statisticsCache = response.data;
      this.lastCacheTime = Date.now();
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      
      // Return cached data if available, otherwise fallback
      if (this.statisticsCache) {
        return this.statisticsCache;
      }
      
      return this.getFallbackStatistics();
    }
  }

  async getRealtimeStatistics(): Promise<RealtimeStatistics> {
    try {
      const response = await apiClient.get('/api/landing/statistics/realtime');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch realtime statistics:', error);
      // Fallback to base stats with simulated real-time data
      const baseStats = await this.getStatistics();
      return {
        ...baseStats,
        activeUsersNow: Math.floor(Math.random() * 50) + 20,
        recentActivity: Math.floor(Math.random() * 10) + 5,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const response = await apiClient.get(`/api/landing/activities/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      // Return empty array as fallback
      return [];
    }
  }

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      // Check cache first
      if (this.testimonialsCache && this.isCacheValid()) {
        return this.testimonialsCache;
      }

      const response = await apiClient.get('/api/landing/testimonials');
      this.testimonialsCache = response.data;
      this.lastCacheTime = Date.now();
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      
      // Return cached data if available, otherwise fallback
      if (this.testimonialsCache) {
        return this.testimonialsCache;
      }
      
      return this.getFallbackTestimonials();
    }
  }

  async subscribeNewsletter(email: string, source: string = 'landing_page'): Promise<NewsletterResponse> {
    try {
      const response = await apiClient.post('/api/landing/newsletter', {
        email,
        source
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error);
      return {
        success: false,
        message: 'Subscription failed. Please try again.'
      };
    }
  }

  async trackEvent(section: string, action: string, metadata?: any): Promise<void> {
    try {
      // Generate or get visitor ID
      const visitorId = this.getVisitorId();
      
      await apiClient.post('/api/landing/analytics/track', {
        section,
        action,
        metadata,
        visitorId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Silently fail for analytics - don't disrupt user experience
      console.warn('Failed to track event:', error);
    }
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheTime < this.cacheExpiry;
  }

  private getVisitorId(): string {
    let visitorId = localStorage.getItem('landing_visitor_id');
    
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('landing_visitor_id', visitorId);
    }
    
    return visitorId;
  }

  private getFallbackStatistics(): LandingStatistics {
    // Updated to match actual database values
    // These should be updated periodically to reflect real growth
    return {
      totalUsers: 15,
      activeMatches: 8,
      successfulCollaborations: 4,
      averageMatchScore: 89,
      platformGrowth: 15,
      updatedAt: new Date().toISOString()
    };
  }

  private getFallbackTestimonials(): Testimonial[] {
    return [
      {
        id: 1,
        authorName: 'Sarah Johnson',
        authorRole: 'Fashion Influencer',
        authorAvatar: '/avatars/sarah.jpg',
        content: 'ICMatch connected me with amazing brands that align perfectly with my values. The AI matching is incredibly accurate!',
        rating: 5,
        createdAt: new Date()
      },
      {
        id: 2,
        authorName: 'Mike Chen',
        authorRole: 'Tech Company CMO',
        authorAvatar: '/avatars/mike.jpg',
        content: 'We found the perfect influencers for our campaign in just 24 hours. The ROI has been exceptional.',
        rating: 5,
        createdAt: new Date()
      },
      {
        id: 3,
        authorName: 'Emma Rodriguez',
        authorRole: 'Lifestyle Blogger',
        authorAvatar: '/avatars/emma.jpg',
        content: 'The platform makes collaboration so easy. I love the transparent communication tools.',
        rating: 5,
        createdAt: new Date()
      }
    ];
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.statisticsCache = null;
    this.testimonialsCache = null;
    this.lastCacheTime = 0;
  }

  // ROI Calculator Methods
  async getMarketRates(): Promise<MarketRates> {
    try {
      const response = await apiClient.get('/api/landing/market-rates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch market rates:', error);
      // Return fallback rates
      return {
        influencerRates: {
          micro: { min: 100, max: 500, avg: 250 },
          mid: { min: 500, max: 2000, avg: 1000 },
          macro: { min: 2000, max: 10000, avg: 5000 },
        },
        platformFees: {
          traditional: 0.20,
          ourPlatform: 0.10,
        },
        industryAverages: {
          engagementRate: 3.5,
          conversionRate: 2.0,
          averageOrderValue: 50,
          reachMultiplier: 2.5,
        }
      };
    }
  }

  async calculateROI(params: ROICalculationParams): Promise<ROIResult> {
    try {
      const response = await apiClient.post('/api/landing/calculate-roi', params);
      return response.data;
    } catch (error) {
      console.error('Failed to calculate ROI:', error);
      throw new Error('ROI calculation failed');
    }
  }
}

// Export singleton instance
export const landingService = LandingService.getInstance();
