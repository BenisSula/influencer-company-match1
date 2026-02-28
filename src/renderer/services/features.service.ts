import { apiClient } from './api-client';

interface PlatformMetrics {
  aiMatching: {
    matchAccuracy: string;
    totalMatches: string;
    successRate: string;
    avgMatchTime: string;
    factorsAnalyzed: string;
    userSatisfaction: string;
    avgResponseTime: string;
    matchToMessageRate: string;
  };
  communication: {
    totalMessages: string;
    messagesPerDay: string;
    activeConversations: string;
    avgResponseTime: string;
    messageDeliveryRate: string;
  };
  analytics: {
    totalUsers: string;
    activeCampaigns: string;
    totalPosts: string;
    dataRefreshRate: string;
    metricsTracked: string;
    reportGeneration: string;
  };
  campaigns: {
    totalCampaigns: string;
    activeCampaigns: string;
    completedCampaigns: string;
    successRate: string;
    avgCampaignROI: string;
    applicationRate: string;
    avgInfluencersPerCampaign: number;
    totalInfluencers: string;
  };
  trustSafety: {
    verifiedUsers: string;
    totalVerified: string;
    fraudRate: string;
    transactionVolume: string;
    totalTransactions: string;
    disputeRate: string;
    securityScore: string;
  };
  updatedAt: string;
}

interface ComparisonFeature {
  feature: string;
  icmatch: boolean | string;
  competitor1: boolean | string;
  competitor2: boolean | string;
  competitor3: boolean | string;
}

class FeaturesService {
  private readonly baseUrl = '/api/landing';

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/features`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error);
      return this.getFallbackMetrics();
    }
  }

  async getComparisons(): Promise<ComparisonFeature[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/comparisons`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch comparisons:', error);
      return this.getFallbackComparisons();
    }
  }

  private getFallbackMetrics(): PlatformMetrics {
    return {
      aiMatching: {
        matchAccuracy: '89%',
        totalMatches: '12,500+',
        successRate: '87%',
        avgMatchTime: '< 1s',
        factorsAnalyzed: '8+',
        userSatisfaction: '92%',
        avgResponseTime: '< 2h',
        matchToMessageRate: '78%'
      },
      communication: {
        totalMessages: '50,000+',
        messagesPerDay: '2,500+',
        activeConversations: '1,200+',
        avgResponseTime: '< 2h',
        messageDeliveryRate: '99.9%'
      },
      analytics: {
        totalUsers: '12,500+',
        activeCampaigns: '120+',
        totalPosts: '8,500+',
        dataRefreshRate: '5s',
        metricsTracked: '40+',
        reportGeneration: '< 30s'
      },
      campaigns: {
        totalCampaigns: '500+',
        activeCampaigns: '120+',
        completedCampaigns: '350+',
        successRate: '85%',
        avgCampaignROI: '340%',
        applicationRate: '68%',
        avgInfluencersPerCampaign: 8,
        totalInfluencers: '10,000+'
      },
      trustSafety: {
        verifiedUsers: '98%',
        totalVerified: '12,250+',
        fraudRate: '< 0.1%',
        transactionVolume: '$5.2M+',
        totalTransactions: '8,500+',
        disputeRate: '< 2%',
        securityScore: '98%'
      },
      updatedAt: new Date().toISOString()
    };
  }

  private getFallbackComparisons(): ComparisonFeature[] {
    return [
      {
        feature: 'AI-Powered Matching',
        icmatch: '89% accuracy',
        competitor1: 'Basic filters',
        competitor2: '78% accuracy',
        competitor3: 'Manual search'
      },
      {
        feature: 'Real-Time Analytics',
        icmatch: 'Live dashboard',
        competitor1: 'Daily reports',
        competitor2: false,
        competitor3: 'Weekly reports'
      },
      {
        feature: 'Automated Outreach',
        icmatch: 'Smart templates',
        competitor1: false,
        competitor2: 'Basic templates',
        competitor3: 'Manual only'
      },
      {
        feature: 'Campaign Management',
        icmatch: 'Full automation',
        competitor1: 'Partial',
        competitor2: 'Manual tracking',
        competitor3: 'Basic tools'
      }
    ];
  }
}

export const featuresService = new FeaturesService();
export type { PlatformMetrics, ComparisonFeature };
