import { apiClient } from './api-client';

export interface AIMatchScore {
  score: number;
  confidence: number;
  factors: {
    nicheAlignment: number;
    audienceMatch: number;
    engagementPotential: number;
    brandFit: number;
    historicalSuccess: number;
  };
  reasoning: string[];
  successProbability: number;
}

export interface EnhancedMatch {
  id: string;
  userId: string;
  targetUserId: string;
  matchScore: number;
  aiScore: number;
  confidence: number;
  aiFactors: AIMatchScore['factors'];
  reasoning: string[];
  successProbability: number;
  user: any;
}

export interface Recommendation {
  id: string;
  user: any;
  score: number;
  type: string;
  reasoning: string[];
}

export interface QualityMetrics {
  averageMatchScore: number;
  successRate: number;
  userSatisfaction: number;
  engagementRate: number;
  conversionRate: number;
  totalMatches: number;
  successfulMatches: number;
}

class AIMatchingService {
  async getEnhancedMatches(limit: number = 20): Promise<EnhancedMatch[]> {
    const response = await apiClient.get('/ai-matching/matches', {
      params: { limit },
    } as any);
    return response.data;
  }

  async getEnhancedMatch(targetUserId: string): Promise<EnhancedMatch> {
    const response = await apiClient.get(`/ai-matching/matches/${targetUserId}`);
    return response.data;
  }

  async recordMatchOutcome(
    targetUserId: string,
    outcome: boolean,
    successScore: number,
  ): Promise<void> {
    await apiClient.post(`/ai-matching/matches/${targetUserId}/outcome`, {
      outcome,
      successScore,
    });
  }

  async getFeatureImportance(): Promise<Array<{ feature: string; importance: number }>> {
    const response = await apiClient.get('/ai-matching/feature-importance');
    return response.data;
  }

  async getRecommendations(limit: number = 10): Promise<Recommendation[]> {
    const response = await apiClient.get('/ai-matching/recommendations', {
      params: { limit },
    } as any);
    return response.data;
  }

  async getQualityMetrics(): Promise<QualityMetrics> {
    const response = await apiClient.get('/ai-matching/analytics/metrics');
    return response.data;
  }

  async getPerformanceTrends(days: number = 30): Promise<any[]> {
    const response = await apiClient.get('/ai-matching/analytics/trends', {
      params: { days },
    } as any);
    return response.data;
  }

  async getCompatibilityScore(targetUserId: string): Promise<{
    overallScore: number;
    factors: Array<{
      name: string;
      score: number;
      weight: number;
      description: string;
    }>;
  }> {
    const response = await apiClient.get(`/ai-matching/compatibility/${targetUserId}`);
    return response.data;
  }
}

export default new AIMatchingService();
