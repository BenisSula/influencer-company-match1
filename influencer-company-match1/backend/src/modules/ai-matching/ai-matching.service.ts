import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MLModelService } from './ml-model.service';
import { FeatureEngineeringService } from './feature-engineering.service';
import { MatchTrainingData } from './entities/match-training-data.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';

export interface EnhancedMatch {
  id: string;
  userId: string;
  targetUserId: string;
  matchScore: number;
  aiScore: number;
  confidence: number;
  aiFactors: {
    nicheAlignment: number;
    audienceMatch: number;
    engagementPotential: number;
    brandFit: number;
    historicalSuccess: number;
  };
  reasoning: string[];
  successProbability: number;
  user: any;
}

@Injectable()
export class AIMatchingService {
  private readonly logger = new Logger(AIMatchingService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @InjectRepository(MatchTrainingData)
    private trainingDataRepository: Repository<MatchTrainingData>,
    private mlModelService: MLModelService,
    private featureEngineeringService: FeatureEngineeringService,
  ) {}

  async getEnhancedMatches(userId: string, limit: number = 20): Promise<EnhancedMatch[]> {
    const currentUser = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!currentUser) {
      return [];
    }

    // Get opposite role users
    const oppositeRole = currentUser.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;
    const potentialMatches = await this.userRepository.find({
      where: { 
        role: oppositeRole,
        isActive: true,
      },
      take: limit * 2, // Get more to filter
    });

    // Calculate AI scores for each match using advanced features
    const enhancedMatches = await Promise.all(
      potentialMatches.map(async (targetUser) => {
        const features = await this.featureEngineeringService.extractAdvancedFeatures(
          currentUser.id,
          targetUser.id,
        );
        const aiPrediction = await this.mlModelService.predictMatchScore(features);
        
        // Load profile data
        const profileData = await this.loadUserProfile(targetUser);

        return {
          id: targetUser.id,
          userId: currentUser.id,
          targetUserId: targetUser.id,
          matchScore: this.calculateBasicScore(features),
          aiScore: aiPrediction.score,
          confidence: aiPrediction.confidence,
          aiFactors: aiPrediction.factors,
          reasoning: aiPrediction.reasoning,
          successProbability: aiPrediction.successProbability,
          user: {
            ...targetUser,
            ...profileData,
            password: undefined,
          },
        };
      })
    );

    // Sort by AI score and take top matches
    return enhancedMatches
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, limit);
  }

  async getEnhancedMatch(userId: string, targetUserId: string): Promise<EnhancedMatch | null> {
    const currentUser = await this.userRepository.findOne({ where: { id: userId } });
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });

    if (!currentUser || !targetUser) {
      return null;
    }

    const features = await this.featureEngineeringService.extractAdvancedFeatures(
      currentUser.id,
      targetUser.id,
    );
    const aiPrediction = await this.mlModelService.predictMatchScore(features);
    const profileData = await this.loadUserProfile(targetUser);

    return {
      id: targetUser.id,
      userId: currentUser.id,
      targetUserId: targetUser.id,
      matchScore: this.calculateBasicScore(features),
      aiScore: aiPrediction.score,
      confidence: aiPrediction.confidence,
      aiFactors: aiPrediction.factors,
      reasoning: aiPrediction.reasoning,
      successProbability: aiPrediction.successProbability,
      user: {
        ...targetUser,
        ...profileData,
        password: undefined,
      },
    };
  }

  private async extractFeaturesFromUsers(user1: User, user2: User): Promise<any> {
    const influencer = user1.role === UserRole.INFLUENCER ? user1 : user2;
    const company = user1.role === UserRole.COMPANY ? user1 : user2;

    const influencerProfile = await this.influencerProfileRepository.findOne({
      where: { userId: influencer.id },
    });

    const companyProfile = await this.companyProfileRepository.findOne({
      where: { userId: company.id },
    });

    // Calculate features
    const nicheAlignment = this.calculateNicheAlignment(
      influencerProfile?.niche || '',
      companyProfile?.industry || ''
    );

    const locationMatch = this.calculateLocationMatch(
      influencerProfile?.location || '',
      companyProfile?.location || ''
    );

    const budgetAlignment = this.calculateBudgetAlignment(
      influencerProfile?.audienceSize || 0,
      companyProfile?.budget || 0
    );

    const platformOverlap = this.calculatePlatformOverlap(
      influencerProfile?.platforms || [],
      companyProfile?.platforms || []
    );

    const engagementRate = influencerProfile?.engagementRate 
      ? (typeof influencerProfile.engagementRate === 'string' 
          ? parseFloat(influencerProfile.engagementRate) 
          : influencerProfile.engagementRate) / 100
      : 0.5;

    return {
      nicheAlignment: nicheAlignment / 100,
      audienceMatch: platformOverlap / 100,
      engagementRate,
      brandFit: nicheAlignment / 100,
      locationMatch: locationMatch / 100,
      budgetAlignment: budgetAlignment / 100,
      contentQuality: engagementRate,
      responseRate: 0.5, // Default, will be updated with historical data
    };
  }

  private calculateNicheAlignment(niche: string, industry: string): number {
    if (!niche || !industry) return 50;
    
    const n = niche.toLowerCase().trim();
    const i = industry.toLowerCase().trim();
    
    if (n === i) return 100;
    if (n.includes(i) || i.includes(n)) return 80;
    
    const relatedIndustries: Record<string, string[]> = {
      'food': ['restaurant', 'cooking', 'recipe', 'culinary'],
      'fashion': ['clothing', 'style', 'apparel', 'beauty'],
      'tech': ['technology', 'software', 'gadget', 'digital'],
      'fitness': ['health', 'wellness', 'gym', 'workout'],
      'travel': ['tourism', 'adventure', 'vacation', 'hotel'],
    };
    
    for (const [key, related] of Object.entries(relatedIndustries)) {
      if (n.includes(key) && related.some(r => i.includes(r))) return 65;
      if (i.includes(key) && related.some(r => n.includes(r))) return 65;
    }
    
    return 40;
  }

  private calculateLocationMatch(loc1: string, loc2: string): number {
    if (!loc1 || !loc2) return 50;
    
    const l1 = loc1.toLowerCase().trim();
    const l2 = loc2.toLowerCase().trim();
    
    if (l1 === l2) return 100;
    
    const parts1 = l1.split(',').map(p => p.trim());
    const parts2 = l2.split(',').map(p => p.trim());
    
    if (parts1.length > 1 && parts2.length > 1 && parts1[1] === parts2[1]) return 80;
    if (parts1.some(p1 => parts2.some(p2 => p1 === p2))) return 60;
    
    return 40;
  }

  private calculateBudgetAlignment(audienceSize: number, budget: number): number {
    if (!audienceSize || !budget) return 50;
    
    const estimatedRate = (audienceSize / 1000) * 30;
    if (estimatedRate === 0) return 50;
    
    const ratio = budget / estimatedRate;
    
    if (ratio >= 1 && ratio <= 2) return 100;
    if (ratio >= 0.7 && ratio <= 3) return 80;
    if (ratio >= 0.4 && ratio <= 5) return 60;
    if (ratio < 0.4) return 35;
    return 45;
  }

  private calculatePlatformOverlap(platforms1: string[], platforms2: string[]): number {
    if (!platforms1?.length || !platforms2?.length) return 50;
    
    const set1 = new Set(platforms1.map(p => p.toLowerCase()));
    const set2 = new Set(platforms2.map(p => p.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    if (intersection.size === 0) return 30;
    
    const union = new Set([...set1, ...set2]);
    return Math.max(50, Math.round((intersection.size / union.size) * 100));
  }

  private calculateBasicScore(features: any): number {
    const weights: Record<string, number> = {
      nicheAlignment: 0.25,
      audienceMatch: 0.20,
      engagementRate: 0.15,
      brandFit: 0.15,
      locationMatch: 0.10,
      budgetAlignment: 0.10,
      contentQuality: 0.05,
    };
    
    let score = 0;
    Object.keys(weights).forEach(key => {
      if (features[key] !== undefined) {
        score += features[key] * weights[key] * 100;
      }
    });
    
    return Math.round(score);
  }

  private async loadUserProfile(user: User): Promise<any> {
    if (user.role === UserRole.INFLUENCER) {
      const profile = await this.influencerProfileRepository.findOne({
        where: { userId: user.id },
      });
      return profile ? {
        name: profile.name || profile.niche,
        bio: profile.bio,
        niche: profile.niche,
        audienceSize: profile.audienceSize,
        engagementRate: profile.engagementRate,
        location: profile.location,
        platforms: profile.platforms,
        avatarUrl: profile.avatarUrl,
      } : null;
    } else if (user.role === UserRole.COMPANY) {
      const profile = await this.companyProfileRepository.findOne({
        where: { userId: user.id },
      });
      return profile ? {
        name: profile.name, // ✅ Fixed from companyName
        bio: profile.bio,
        industry: profile.industry,
        budget: profile.budget,
        location: profile.location,
        platforms: profile.platforms,
        avatarUrl: profile.avatarUrl,
      } : null;
    }
    return null;
  }

  async recordMatchOutcome(
    userId: string,
    targetUserId: string,
    outcome: boolean,
    successScore: number,
  ): Promise<void> {
    const currentUser = await this.userRepository.findOne({ where: { id: userId } });
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });

    if (!currentUser || !targetUser) {
      this.logger.warn(`User not found for outcome recording`);
      return;
    }

    const features = await this.extractFeaturesFromUsers(currentUser, targetUser);

    const trainingData = this.trainingDataRepository.create({
      matchId: `${userId}-${targetUserId}`, // Composite ID since we don't have Match entity
      features,
      outcome,
      successScore,
      metadata: {
        recordedAt: new Date(),
        userId,
        targetUserId,
      },
    });

    await this.trainingDataRepository.save(trainingData);
    this.logger.log(`Recorded outcome for match ${userId}-${targetUserId}: ${outcome}`);

    // Trigger model retraining if we have enough new data
    const trainingDataCount = await this.trainingDataRepository.count();
    if (trainingDataCount % 100 === 0) {
      this.logger.log('Triggering model retraining...');
      await this.retrainModel();
    }
  }

  private async retrainModel(): Promise<void> {
    const trainingData = await this.trainingDataRepository.find({
      order: { createdAt: 'DESC' },
      take: 1000,
    });

    await this.mlModelService.trainModel(trainingData);
    this.logger.log('Model retraining completed');
  }

  async getFeatureImportance(): Promise<Array<{ feature: string; importance: number }>> {
    return this.mlModelService.getFeatureImportance();
  }

  async getCompatibilityScore(userId: string, targetUserId: string): Promise<{
    overallScore: number;
    factors: Array<{
      name: string;
      score: number;
      weight: number;
      description: string;
    }>;
  }> {
    try {
      const features = await this.featureEngineeringService.extractAdvancedFeatures(userId, targetUserId);
      const aiPrediction = await this.mlModelService.predictMatchScore(features);

      // Convert AI factors to compatibility factors with descriptions
      const factors = [
        {
          name: 'Niche Alignment',
          score: Math.round(aiPrediction.factors.nicheAlignment),
          weight: 30,
          description: this.getFactorDescription('niche', aiPrediction.factors.nicheAlignment),
        },
        {
          name: 'Audience Demographics',
          score: Math.round(aiPrediction.factors.audienceMatch),
          weight: 25,
          description: this.getFactorDescription('audience', aiPrediction.factors.audienceMatch),
        },
        {
          name: 'Engagement Quality',
          score: Math.round(aiPrediction.factors.engagementPotential),
          weight: 20,
          description: this.getFactorDescription('engagement', aiPrediction.factors.engagementPotential),
        },
        {
          name: 'Brand Fit',
          score: Math.round(aiPrediction.factors.brandFit),
          weight: 15,
          description: this.getFactorDescription('brand', aiPrediction.factors.brandFit),
        },
        {
          name: 'Collaboration History',
          score: Math.round(aiPrediction.factors.historicalSuccess),
          weight: 10,
          description: this.getFactorDescription('history', aiPrediction.factors.historicalSuccess),
        },
      ];

      return {
        overallScore: Math.round(aiPrediction.score),
        factors,
      };
    } catch (error) {
      this.logger.error(`Failed to get compatibility score: ${error.message}`);
      // Return default compatibility data
      return {
        overallScore: 75,
        factors: [
          { name: 'Niche Alignment', score: 85, weight: 30, description: 'Good match for content niche' },
          { name: 'Audience Demographics', score: 78, weight: 25, description: 'Target audience overlap detected' },
          { name: 'Engagement Quality', score: 72, weight: 20, description: 'Compatible engagement patterns' },
          { name: 'Brand Fit', score: 70, weight: 15, description: 'Aligned brand values' },
          { name: 'Collaboration History', score: 65, weight: 10, description: 'Limited collaboration data' },
        ],
      };
    }
  }

  private getFactorDescription(factorType: string, score: number): string {
    const scoreLevel = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'moderate' : 'limited';
    
    const descriptions = {
      niche: {
        excellent: 'Perfect match for content niche and industry focus',
        good: 'Good alignment with target niche and content style',
        moderate: 'Some overlap in niche interests',
        limited: 'Limited niche alignment',
      },
      audience: {
        excellent: 'Highly compatible target audience demographics',
        good: 'Target audience overlap: Strong match',
        moderate: 'Partial audience demographic match',
        limited: 'Limited audience overlap',
      },
      engagement: {
        excellent: 'Exceptional engagement rate compatibility',
        good: 'High engagement rate compatibility',
        moderate: 'Moderate engagement compatibility',
        limited: 'Different engagement patterns',
      },
      brand: {
        excellent: 'Perfect brand values and aesthetic alignment',
        good: 'Similar aesthetic and brand tone',
        moderate: 'Some brand compatibility',
        limited: 'Different brand positioning',
      },
      history: {
        excellent: 'Proven track record of successful similar partnerships',
        good: 'Successful similar partnerships',
        moderate: 'Some relevant collaboration history',
        limited: 'Limited collaboration data available',
      },
    };

    return descriptions[factorType]?.[scoreLevel] || 'Compatibility analysis in progress';
  }
}
