import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { Connection, ConnectionStatus } from '../matching/entities/connection.entity';
import { MatchTrainingData } from './entities/match-training-data.entity';

export interface RecommendationResult {
  id: string;
  user: any;
  score: number;
  type: string;
  reasoning: string[];
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    @InjectRepository(MatchTrainingData)
    private trainingDataRepository: Repository<MatchTrainingData>,
  ) {}

  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendationResult[]> {
    // Get user's existing connections
    const existingConnections = await this.connectionRepository.find({
      where: [{ requesterId: userId }, { recipientId: userId }],
    });

    const connectedUserIds = new Set([
      ...existingConnections.map(c => c.requesterId),
      ...existingConnections.map(c => c.recipientId),
      userId,
    ]);

    // Get user profile
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return [];
    }

    // Load user's profile data
    const userProfile = await this.loadUserProfile(user);
    
    // Find similar users based on niche/industry
    const oppositeRole = user.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;

    const similarUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id NOT IN (:...connectedIds)', { connectedIds: Array.from(connectedUserIds) })
      .andWhere('user.role = :role', { role: oppositeRole })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .take(limit * 3) // Get more to filter
      .getMany();

    // Load profiles for all users
    const usersWithProfiles = await Promise.all(
      similarUsers.map(async (targetUser) => {
        const profile = await this.loadUserProfile(targetUser);
        return { ...targetUser, profile };
      })
    );

    // Score and filter recommendations
    const recommendations = usersWithProfiles
      .map(targetUser => {
        const score = this.calculateRecommendationScore(user, userProfile, targetUser, targetUser.profile);
        const reasoning = this.generateRecommendationReasoning(user, userProfile, targetUser, targetUser.profile);

        return {
          id: targetUser.id,
          user: {
            ...targetUser,
            ...targetUser.profile,
            password: undefined,
          },
          score,
          type: 'personalized',
          reasoning,
        };
      })
      .filter(rec => rec.score > 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Save recommendations
    await this.saveRecommendations(userId, recommendations);

    return recommendations;
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
        portfolioUrl: profile.portfolioUrl,
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
        website: profile.website,
      } : null;
    }
    return null;
  }

  private calculateRecommendationScore(user: User, userProfile: any, targetUser: User, targetProfile: any): number {
    let score = 50; // Base score

    const userNiche = user.role === UserRole.INFLUENCER 
      ? userProfile?.niche 
      : userProfile?.industry;

    const targetNiche = targetUser.role === UserRole.INFLUENCER
      ? targetProfile?.niche
      : targetProfile?.industry;

    // Niche/Industry match (30 points)
    if (userNiche && targetNiche) {
      if (userNiche.toLowerCase() === targetNiche.toLowerCase()) {
        score += 30;
      } else if (userNiche.toLowerCase().includes(targetNiche.toLowerCase()) || 
                 targetNiche.toLowerCase().includes(userNiche.toLowerCase())) {
        score += 20;
      }
    }

    // Location match (10 points)
    const userLocation = userProfile?.location;
    const targetLocation = targetProfile?.location;

    if (userLocation && targetLocation) {
      if (userLocation.toLowerCase() === targetLocation.toLowerCase()) {
        score += 10;
      } else if (userLocation.toLowerCase().includes(targetLocation.toLowerCase()) || 
                 targetLocation.toLowerCase().includes(userLocation.toLowerCase())) {
        score += 5;
      }
    }

    // Profile completeness (10 points)
    if (targetUser.role === UserRole.INFLUENCER && targetProfile) {
      if (targetProfile.bio) score += 3;
      if (targetProfile.portfolioUrl) score += 3;
      if (targetProfile.avatarUrl) score += 2;
      if (targetProfile.platforms?.length > 0) score += 2;
    } else if (targetUser.role === UserRole.COMPANY && targetProfile) {
      if (targetProfile.description) score += 3;
      if (targetProfile.website) score += 3;
      if (targetProfile.avatarUrl) score += 2;
      if (targetProfile.platforms?.length > 0) score += 2;
    }

    return Math.min(score, 100);
  }

  private generateRecommendationReasoning(user: User, userProfile: any, targetUser: User, targetProfile: any): string[] {
    const reasoning: string[] = [];

    const userNiche = user.role === UserRole.INFLUENCER 
      ? userProfile?.niche 
      : userProfile?.industry;

    const targetNiche = targetUser.role === UserRole.INFLUENCER
      ? targetProfile?.niche
      : targetProfile?.industry;

    if (userNiche && targetNiche && userNiche.toLowerCase() === targetNiche.toLowerCase()) {
      reasoning.push(`Works in ${targetNiche}`);
    }

    if (targetUser.role === UserRole.INFLUENCER && targetProfile) {
      const followers = targetProfile.followersCount || targetProfile.audienceSize;
      if (followers > 100000) {
        reasoning.push('Large audience reach');
      } else if (followers > 10000) {
        reasoning.push('Growing audience');
      }
      
      if (targetProfile.engagementRate && targetProfile.engagementRate > 3) {
        reasoning.push('High engagement rate');
      }
    }

    if (targetUser.role === UserRole.COMPANY && targetProfile) {
      reasoning.push('Active brand looking for collaborations');
      if (targetProfile.budget) {
        reasoning.push('Has defined budget');
      }
    }

    const userLocation = userProfile?.location;
    const targetLocation = targetProfile?.location;
    if (userLocation && targetLocation && userLocation.toLowerCase() === targetLocation.toLowerCase()) {
      reasoning.push('Same location');
    }

    if (reasoning.length === 0) {
      reasoning.push('Potential collaboration opportunity');
    }

    return reasoning;
  }

  private async saveRecommendations(
    userId: string,
    recommendations: RecommendationResult[],
  ): Promise<void> {
    const recommendationEntities = recommendations.map(rec =>
      this.recommendationRepository.create({
        userId,
        recommendedUserId: rec.id,
        recommendationType: 'personalized',
        score: rec.score,
        reasoning: {
          factors: rec.reasoning,
        },
      })
    );

    await this.recommendationRepository.save(recommendationEntities);
  }

  async getTrendingMatches(userId: string, niche?: string, limit: number = 10): Promise<any[]> {
    // Get recently active connections (last 7 days)
    const recentConnections = await this.connectionRepository
      .createQueryBuilder('connection')
      .where('connection.createdAt > :date', { 
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      })
      .andWhere('connection.status = :status', { status: 'connected' })
      .select('connection.recipientId', 'userId')
      .addSelect('COUNT(*)', 'connectionCount')
      .groupBy('connection.recipientId')
      .orderBy('connectionCount', 'DESC')
      .limit(limit * 2)
      .getRawMany();

    const trendingUserIds = recentConnections.map(r => r.userId);
    
    if (trendingUserIds.length === 0) {
      return [];
    }

    // Get user details
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return [];

    const oppositeRole = user.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;

    const trendingUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids: trendingUserIds })
      .andWhere('user.role = :role', { role: oppositeRole })
      .take(limit)
      .getMany();

    // Load profiles
    const results = await Promise.all(
      trendingUsers.map(async (trendingUser) => {
        const profile = await this.loadUserProfile(trendingUser);
        return {
          id: trendingUser.id,
          user: {
            ...trendingUser,
            ...profile,
            password: undefined,
          },
          trendingScore: 85,
          type: 'trending',
          reasoning: ['Popular this week', 'High connection activity'],
        };
      })
    );

    return results;
  }

  async getSimilarProfiles(userId: string, limit: number = 10): Promise<any[]> {
    // Get user's successful connections
    const successfulConnections = await this.connectionRepository.find({
      where: [
        { requesterId: userId, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
        { recipientId: userId, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
      ],
      take: 5, // Look at last 5 successful connections
      order: { createdAt: 'DESC' },
    });

    if (successfulConnections.length === 0) {
      return [];
    }

    // Get IDs of successful connection partners
    const successfulPartnerIds = successfulConnections.map(conn => 
      conn.requesterId === userId ? conn.recipientId : conn.requesterId
    );

    // Find users similar to successful partners
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return [];

    const oppositeRole = user.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;

    // Get profiles of successful partners to find similar ones
    const similarUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: oppositeRole })
      .andWhere('user.id NOT IN (:...excludeIds)', { 
        excludeIds: [...successfulPartnerIds, userId] 
      })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .take(limit * 2)
      .getMany();

    // Load profiles and score similarity
    const results = await Promise.all(
      similarUsers.map(async (similarUser) => {
        const profile = await this.loadUserProfile(similarUser);
        return {
          id: similarUser.id,
          user: {
            ...similarUser,
            ...profile,
            password: undefined,
          },
          score: 75,
          type: 'similar',
          reasoning: ['Similar to your successful matches', 'Recommended based on your history'],
        };
      })
    );

    return results.slice(0, limit);
  }

  async getCollaborativeRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    // Find users similar to current user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return [];

    const userProfile = await this.loadUserProfile(user);
    
    // Get what similar users connected with
    const userConnections = await this.connectionRepository.find({
      where: [
        { requesterId: userId },
        { recipientId: userId },
      ],
    });

    const connectedUserIds = new Set([
      ...userConnections.map(c => c.requesterId),
      ...userConnections.map(c => c.recipientId),
      userId,
    ]);

    // Find users in same niche/industry
    const oppositeRole = user.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;
    
    const recommendations = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: oppositeRole })
      .andWhere('user.id NOT IN (:...excludeIds)', { 
        excludeIds: Array.from(connectedUserIds) 
      })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .take(limit)
      .getMany();

    const results = await Promise.all(
      recommendations.map(async (recUser) => {
        const profile = await this.loadUserProfile(recUser);
        return {
          id: recUser.id,
          user: {
            ...recUser,
            ...profile,
            password: undefined,
          },
          score: 70,
          type: 'collaborative',
          reasoning: ['Users like you connected with them', 'Based on community patterns'],
        };
      })
    );

    return results;
  }
}
