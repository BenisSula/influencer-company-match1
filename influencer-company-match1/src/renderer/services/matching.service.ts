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
  avatarUrl?: string;
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
  // NEW: Analytics data (Phase 2)
  analytics?: {
    viewCount: number;
    interactionCount: number;
    lastInteraction?: Date;
    similarMatchesSuccess: number;
  };
  // NEW: AI-Enhanced data (prepared for Phase 3)
  aiEnhanced?: {
    aiScore: number;
    confidence: number;
    successProbability: number;
    aiFactors: {
      nicheAlignment: number;
      audienceMatch: number;
      engagementPotential: number;
      brandFit: number;
      historicalSuccess: number;
    };
    reasoning: string[];
  };
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
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
  minScore?: number;
  sortBy?:
    | 'score'
    | 'nicheCompatibility'
    | 'locationCompatibility'
    | 'budgetAlignment'
    | 'platformOverlap'
    | 'audienceSizeMatch'
    | 'engagementTierMatch'
    | 'audienceSize'
    | 'engagementRate'
    | 'recentActivity';
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
    const endpoint = queryString ? `/matching/matches?${queryString}` : '/matching/matches';
    
    const response = await apiClient.get<any>(endpoint);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[MatchingService] Raw backend response:', response);
    }
    
    // Transform backend response to frontend format
    if (Array.isArray(response)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[MatchingService] Transforming', response.length, 'matches');
      }
      let transformedMatches = response.map((match, index) => {
        const transformed = this.transformMatch(match);
        if (process.env.NODE_ENV === 'development' && index === 0) {
          console.log('[MatchingService] First match transformation:', {
            input: match,
            output: transformed
          });
        }
        return transformed;
      });
      
      // Apply client-side minScore filter
      if (filters?.minScore && filters.minScore > 0) {
        transformedMatches = transformedMatches.filter(match => match.score >= filters.minScore!);
      }
      
      // Apply client-side sorting
      if (filters?.sortBy) {
        transformedMatches = this.sortMatches(transformedMatches, filters.sortBy, filters.sortOrder || 'desc');
      }
      
      return {
        data: transformedMatches,
        meta: {
          page: 1,
          limit: transformedMatches.length,
          total: transformedMatches.length,
          totalPages: 1
        }
      };
    }
    
    // Backend returned paginated response
    return response;
  }

  private transformMatch = (backendMatch: any): Match => {
    // Backend now returns { id, profile, score, tier, breakdown }
    // Support legacy { id, user, score, factors } for backward compatibility
    const score = backendMatch.score || 0;
    
    // Support both 'breakdown' (new) and 'factors' (legacy) for backward compatibility
    const breakdownData = backendMatch.breakdown || backendMatch.factors;
    
    // Support both 'profile' (new) and 'user' (legacy) for backward compatibility
    const profileData = backendMatch.profile || backendMatch.user;
    
    // Log to debug breakdown
    if (!breakdownData) {
      console.warn('[MatchingService] No breakdown provided for match:', backendMatch.id);
    }
    
    // Handle analytics data if present (Phase 2)
    const analytics = backendMatch.analytics ? {
      viewCount: backendMatch.analytics.viewCount || 0,
      interactionCount: backendMatch.analytics.interactionCount || 0,
      lastInteraction: backendMatch.analytics.lastInteraction 
        ? new Date(backendMatch.analytics.lastInteraction) 
        : undefined,
      similarMatchesSuccess: backendMatch.analytics.similarMatchesSuccess || 0,
    } : undefined;

    // Handle AI-enhanced data if present (Phase 3 - prepared)
    const aiEnhanced = backendMatch.aiEnhanced ? {
      aiScore: backendMatch.aiEnhanced.aiScore || 0,
      confidence: backendMatch.aiEnhanced.confidence || 0,
      successProbability: backendMatch.aiEnhanced.successProbability || 0,
      aiFactors: backendMatch.aiEnhanced.aiFactors || {
        nicheAlignment: 0,
        audienceMatch: 0,
        engagementPotential: 0,
        brandFit: 0,
        historicalSuccess: 0,
      },
      reasoning: backendMatch.aiEnhanced.reasoning || [],
    } : undefined;
    
    return {
      id: backendMatch.id || profileData?.id || '',
      profile: {
        id: profileData?.id || backendMatch.id || '',
        name: profileData?.name || 'Unknown',
        type: (profileData?.role === 'INFLUENCER' || profileData?.type === 'influencer') ? 'influencer' : 'company',
        niche: profileData?.niche,
        industry: profileData?.industry,
        audienceSize: profileData?.audienceSize,
        engagementRate: profileData?.engagementRate,
        budget: profileData?.budget,
        location: profileData?.location,
        platforms: profileData?.platforms || [],
        bio: profileData?.bio,
        description: profileData?.description,
        portfolioUrl: profileData?.portfolioUrl,
        website: profileData?.website,
        budgetRange: profileData?.budgetRange,
        contentType: profileData?.contentType,
        collaborationPreference: profileData?.collaborationPreference,
        verificationStatus: profileData?.verificationStatus,
        companySize: profileData?.companySize,
        campaignType: profileData?.campaignType,
        avatarUrl: profileData?.avatarUrl,
      },
      score,
      tier: backendMatch.tier || this.calculateTier(score), // ✅ Use backend tier if provided
      breakdown: breakdownData ? {
        nicheCompatibility: breakdownData.nicheCompatibility || 50,
        locationCompatibility: breakdownData.locationCompatibility || 50,
        budgetAlignment: breakdownData.budgetAlignment || 50,
        platformOverlap: breakdownData.platformOverlap || 50,
        audienceSizeMatch: breakdownData.audienceSizeMatch || 50,
        engagementTierMatch: breakdownData.engagementTierMatch || 50,
      } : {
        // Fallback if backend doesn't provide breakdown
        nicheCompatibility: 50,
        locationCompatibility: 50,
        budgetAlignment: 50,
        platformOverlap: 50,
        audienceSizeMatch: 50,
        engagementTierMatch: 50,
      },
      analytics,
      aiEnhanced,
      createdAt: backendMatch.createdAt ? new Date(backendMatch.createdAt) : undefined,
      updatedAt: backendMatch.updatedAt ? new Date(backendMatch.updatedAt) : undefined,
    };
  };

  /**
   * Get matches with analytics data (Phase 2 - Enhanced)
   * Calls the enhanced backend endpoint that includes analytics
   */
  async getMatchesWithAnalytics(filters?: MatchFilters): Promise<PaginatedMatchResponse> {
    try {
      console.log('[MatchingService] Fetching matches with analytics...');
      
      const response = await apiClient.get<any>('/matching/matches/enhanced');
      
      console.log('[MatchingService] Enhanced matches response:', response);
      
      // Transform backend response
      if (Array.isArray(response)) {
        let transformedMatches = response.map(match => this.transformMatch(match));
        
        // Apply client-side filters if provided
        if (filters?.minScore && filters.minScore > 0) {
          transformedMatches = transformedMatches.filter(match => match.score >= filters.minScore!);
        }
        
        // Apply client-side sorting
        if (filters?.sortBy) {
          transformedMatches = this.sortMatches(transformedMatches, filters.sortBy, filters.sortOrder || 'desc');
        }
        
        return {
          data: transformedMatches,
          meta: {
            page: 1,
            limit: transformedMatches.length,
            total: transformedMatches.length,
            totalPages: 1
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('[MatchingService] Error fetching enhanced matches:', error);
      // Fallback to basic matches
      console.log('[MatchingService] Falling back to basic matches...');
      return this.getMatches(filters);
    }
  }

  private calculateTier = (score: number): string => {
    if (score >= 90) return 'Perfect';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  private sortMatches = (matches: Match[], sortBy: string, sortOrder: 'asc' | 'desc'): Match[] => {
    return matches.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'nicheCompatibility':
          aValue = a.breakdown.nicheCompatibility;
          bValue = b.breakdown.nicheCompatibility;
          break;
        case 'locationCompatibility':
          aValue = a.breakdown.locationCompatibility;
          bValue = b.breakdown.locationCompatibility;
          break;
        case 'budgetAlignment':
          aValue = a.breakdown.budgetAlignment;
          bValue = b.breakdown.budgetAlignment;
          break;
        case 'platformOverlap':
          aValue = a.breakdown.platformOverlap;
          bValue = b.breakdown.platformOverlap;
          break;
        case 'audienceSizeMatch':
          aValue = a.breakdown.audienceSizeMatch;
          bValue = b.breakdown.audienceSizeMatch;
          break;
        case 'engagementTierMatch':
          aValue = a.breakdown.engagementTierMatch;
          bValue = b.breakdown.engagementTierMatch;
          break;
        case 'audienceSize':
          aValue = a.profile.audienceSize || 0;
          bValue = b.profile.audienceSize || 0;
          break;
        case 'engagementRate':
          aValue = a.profile.engagementRate || 0;
          bValue = b.profile.engagementRate || 0;
          break;
        case 'recentActivity':
          // For now, sort by score as proxy for activity
          aValue = a.score;
          bValue = b.score;
          break;
        default:
          aValue = a.score;
          bValue = b.score;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  /**
   * Get a single match by ID
   */
  async getMatchById(matchId: string): Promise<Match> {
    const response = await apiClient.get<any>(`/matching/matches/${matchId}`);
    return this.transformMatch(response);
  }

  /**
   * Create a collaboration request
   */
  async createCollaborationRequest(data: {
    recipientId: string;
    message: string;
    budgetMin?: number;
    budgetMax?: number;
    timeline?: string;
    collaborationType?: string;
    platforms?: string[];
    deliverables?: string[];
    startDate?: string;
    additionalNotes?: string;
  }) {
    const response = await apiClient.post('/matching/collaboration-requests', data);
    return response;
  }

  /**
   * Get received collaboration requests
   */
  async getReceivedCollaborationRequests() {
    const response = await apiClient.get('/matching/collaboration-requests/received');
    return response;
  }

  /**
   * Get sent collaboration requests
   */
  async getSentCollaborationRequests() {
    const response = await apiClient.get('/matching/collaboration-requests/sent');
    return response;
  }

  /**
   * Update collaboration request status
   */
  async updateCollaborationRequest(requestId: string, data: {
    status: string;
    responseMessage?: string;
  }) {
    const response = await apiClient.put(`/matching/collaboration-requests/${requestId}`, data);
    return response;
  }

  /**
   * Get all my connections
   */
  async getMyConnections() {
    const response = await apiClient.get('/matching/connections');
    return response;
  }

  /**
   * Get connection status with a specific user
   */
  async getConnectionStatus(userId: string) {
    const response = await apiClient.get(`/matching/connections/status/${userId}`);
    return response;
  }

  /**
   * Get connection between current user and another user
   */
  async getConnectionByUserId(otherUserId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/matching/connections/user/${otherUserId}`);
      return response;
    } catch (error) {
      console.error('[MatchingService] Failed to get connection:', error);
      return null;
    }
  }

  /**
   * Accept a collaboration request
   */
  async acceptCollaborationRequest(connectionId: string) {
    const response = await apiClient.put(`/matching/collaboration-requests/${connectionId}/accept`);
    return response;
  }

  /**
   * Reject a collaboration request
   */
  async rejectCollaborationRequest(connectionId: string) {
    const response = await apiClient.put(`/matching/collaboration-requests/${connectionId}/reject`);
    return response;
  }
}

export const matchingService = new MatchingService();
