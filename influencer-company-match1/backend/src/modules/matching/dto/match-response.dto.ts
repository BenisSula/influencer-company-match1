export class ProfileDto {
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

export class MatchBreakdownDto {
  nicheCompatibility: number;
  locationCompatibility: number;
  budgetAlignment: number;
  platformOverlap: number;
  audienceSizeMatch: number;
  engagementTierMatch: number;
}

export class AIEnhancedDataDto {
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
}

export class MatchAnalyticsDto {
  viewCount: number;
  interactionCount: number;
  lastInteraction?: Date;
  similarMatchesSuccess: number;
}

export class MatchResponseDto {
  id: string;
  profile: ProfileDto;
  
  // Basic Matching
  score: number;
  tier: string;
  breakdown: MatchBreakdownDto;
  
  // AI-Enhanced Data (Optional)
  aiEnhanced?: AIEnhancedDataDto;
  
  // Analytics (Optional)
  analytics?: MatchAnalyticsDto;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}
