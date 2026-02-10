import { apiClient } from './api-client';

export interface MatchProfile {
  id: string;
  name: string;
  type: 'influencer' | 'company';
  niche?: string;
  industry?: string;
  audienceSize?: number;
  engagementRate?: number;
  budget?: number;
  location?: string;
  platforms?: string[];
  bio?: string;
  description?: string;
  portfolioUrl?: string;
  website?: string;
  budgetRange?: {
    min?: number;
    max?: number;
  };
  contentType?: string[];
  collaborationPreference?: string;
  verificationStatus?: boolean;
  companySize?: string;
  campaignType?: string[];
}

export interface Match {
  id: string;
  profile: MatchProfile;
  score: number;
  tier: string;
  breakdown: {
    nicheCompatibility: number;
    locationCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    audienceSizeMatch: number;
    engagementTierMatch: number;
  };
}

export interface MatchFilters {
  niches?: string[];
  locations?: string[];
  minBudget?: number;
  maxBudget?: number;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  platforms?: string[];
  minEngagementRate?: number;
  verifiedOnly?: boolean;
  contentTypes?: string[];
  collaborationPreferences?: string[];
  campaignTypes?: string[];
  companySizes?: string[];
  sortBy?: 'score' | 'audienceSize' | 'engagementRate' | 'recentActivity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedMatchResponse {
  data: Match[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class MatchingService {
  async getMatches(filters?: MatchFilters): Promise<PaginatedMatchResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/matches?${queryString}` : '/matches';
    
    return apiClient.get<PaginatedMatchResponse>(endpoint);
  }
}

export const matchingService = new MatchingService();
