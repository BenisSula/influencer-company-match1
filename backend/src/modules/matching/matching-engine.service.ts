import { Injectable } from '@nestjs/common';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { CompanyProfile } from '../profiles/entities/company-profile.entity';

interface MatchWeights {
  nicheCompatibility: number;
  locationCompatibility: number;
  budgetAlignment: number;
  platformOverlap: number;
  audienceSizeMatch: number;
  engagementTierMatch: number;
}

@Injectable()
export class MatchingEngineService {
  private readonly weights: MatchWeights = {
    nicheCompatibility: 0.3,
    locationCompatibility: 0.15,
    budgetAlignment: 0.2,
    platformOverlap: 0.15,
    audienceSizeMatch: 0.1,
    engagementTierMatch: 0.1,
  };

  calculateMatch(
    influencer: InfluencerProfile,
    company: CompanyProfile,
  ): { score: number; tier: string; breakdown: any } {
    const breakdown = {
      nicheCompatibility: this.calculateNicheScore(influencer, company),
      locationCompatibility: this.calculateLocationScore(influencer, company),
      budgetAlignment: this.calculateBudgetScore(influencer, company),
      platformOverlap: this.calculatePlatformScore(influencer, company),
      audienceSizeMatch: this.calculateAudienceScore(influencer, company),
      engagementTierMatch: this.calculateEngagementScore(influencer),
    };

    const score =
      breakdown.nicheCompatibility * this.weights.nicheCompatibility +
      breakdown.locationCompatibility * this.weights.locationCompatibility +
      breakdown.budgetAlignment * this.weights.budgetAlignment +
      breakdown.platformOverlap * this.weights.platformOverlap +
      breakdown.audienceSizeMatch * this.weights.audienceSizeMatch +
      breakdown.engagementTierMatch * this.weights.engagementTierMatch;

    const tier = this.determineTier(score);

    return { score: Math.round(score * 100) / 100, tier, breakdown };
  }

  private calculateNicheScore(
    influencer: InfluencerProfile,
    company: CompanyProfile,
  ): number {
    // Handle empty or missing values
    if (!influencer.niche || !company.industry) return 0;
    
    // Exact match = 100, related = 50, unrelated = 0
    const nicheMatch = influencer.niche.toLowerCase() === company.industry.toLowerCase();
    return nicheMatch ? 100 : 50;
  }

  private calculateLocationScore(
    influencer: InfluencerProfile,
    company: CompanyProfile,
  ): number {
    if (!influencer.location || !company.targetLocation) return 50;
    return influencer.location.toLowerCase() === company.targetLocation.toLowerCase()
      ? 100
      : 0;
  }

  private calculateBudgetScore(
    influencer: InfluencerProfile,
    company: CompanyProfile,
  ): number {
    if (!influencer.minBudget || !influencer.maxBudget) return 50;
    
    const companyBudget = company.budget;
    if (
      companyBudget >= influencer.minBudget &&
      companyBudget <= influencer.maxBudget
    ) {
      return 100;
    }
    
    const distance = Math.min(
      Math.abs(companyBudget - influencer.minBudget),
      Math.abs(companyBudget - influencer.maxBudget),
    );
    return Math.max(0, 100 - distance / 1000);
  }

  private calculatePlatformScore(
    influencer: InfluencerProfile,
    company: CompanyProfile,
  ): number {
    // Handle empty or missing arrays
    if (!influencer.platforms || !company.targetPlatforms || 
        influencer.platforms.length === 0 || company.targetPlatforms.length === 0) {
      return 0;
    }
    
    const overlap = influencer.platforms.filter((p) =>
      company.targetPlatforms.includes(p),
    ).length;
    const total = Math.max(
      influencer.platforms.length,
      company.targetPlatforms.length,
    );
    return total > 0 ? (overlap / total) * 100 : 0;
  }

  private calculateAudienceScore(
    influencer: InfluencerProfile,
    company: CompanyProfile,
  ): number {
    if (!company.minAudienceSize || !company.maxAudienceSize) return 50;
    
    const audienceSize = influencer.audienceSize;
    if (
      audienceSize >= company.minAudienceSize &&
      audienceSize <= company.maxAudienceSize
    ) {
      return 100;
    }
    
    return 0;
  }

  private calculateEngagementScore(influencer: InfluencerProfile): number {
    const rate = influencer.engagementRate;
    if (rate >= 5) return 100;
    if (rate >= 3) return 75;
    if (rate >= 1) return 50;
    return 25;
  }

  private determineTier(score: number): string {
    if (score >= 90) return 'Perfect';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  }
}
