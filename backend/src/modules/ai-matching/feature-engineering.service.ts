import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { Connection, ConnectionStatus } from '../matching/entities/connection.entity';
import { FeedPost } from '../feed/entities/feed-post.entity';

export interface AdvancedFeatures {
  // Basic features
  nicheAlignment: number;
  audienceMatch: number;
  engagementRate: number;
  brandFit: number;
  locationMatch: number;
  budgetAlignment: number;
  contentQuality: number;
  responseRate: number;
  
  // Temporal features
  accountAge: number;
  activityScore: number;
  lastActiveScore: number;
  
  // Behavioral features
  connectionAcceptanceRate: number;
  profileCompletionScore: number;
  portfolioQualityScore: number;
  
  // Network features
  networkStrength: number;
  mutualConnectionsScore: number;
  connectionDiversity: number;
  
  // Content features
  postingConsistency: number;
  contentEngagementScore: number;
  
  // Index signature for dynamic access
  [key: string]: number;
}

@Injectable()
export class FeatureEngineeringService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    @InjectRepository(FeedPost)
    private feedPostRepository: Repository<FeedPost>,
  ) {}

  async extractAdvancedFeatures(user1Id: string, user2Id: string): Promise<AdvancedFeatures> {
    // Load users without relations (they don't exist)
    const [user1, user2] = await Promise.all([
      this.userRepository.findOne({ where: { id: user1Id } }),
      this.userRepository.findOne({ where: { id: user2Id } }),
    ]);

    if (!user1 || !user2) {
      throw new Error('Users not found');
    }

    // Calculate all features in parallel
    const [
      basicFeatures,
      temporalFeatures,
      behavioralFeatures,
      networkFeatures,
      contentFeatures,
    ] = await Promise.all([
      this.calculateBasicFeatures(user1, user2),
      this.calculateTemporalFeatures(user1, user2),
      this.calculateBehavioralFeatures(user1, user2),
      this.calculateNetworkFeatures(user1, user2),
      this.calculateContentFeatures(user1, user2),
    ]);

    // Merge all features with defaults
    return {
      // Basic features
      nicheAlignment: basicFeatures.nicheAlignment || 0.5,
      audienceMatch: basicFeatures.audienceMatch || 0.5,
      engagementRate: basicFeatures.engagementRate || 0.5,
      brandFit: basicFeatures.brandFit || 0.5,
      locationMatch: basicFeatures.locationMatch || 0.5,
      budgetAlignment: basicFeatures.budgetAlignment || 0.5,
      contentQuality: basicFeatures.contentQuality || 0.5,
      responseRate: basicFeatures.responseRate || 0.5,
      
      // Temporal features
      accountAge: temporalFeatures.accountAge || 0.5,
      activityScore: temporalFeatures.activityScore || 0.5,
      lastActiveScore: temporalFeatures.lastActiveScore || 0.5,
      
      // Behavioral features
      connectionAcceptanceRate: behavioralFeatures.connectionAcceptanceRate || 0.5,
      profileCompletionScore: behavioralFeatures.profileCompletionScore || 0.5,
      portfolioQualityScore: behavioralFeatures.portfolioQualityScore || 0.5,
      
      // Network features
      networkStrength: networkFeatures.networkStrength || 0.5,
      mutualConnectionsScore: networkFeatures.mutualConnectionsScore || 0.5,
      connectionDiversity: networkFeatures.connectionDiversity || 0.5,
      
      // Content features
      postingConsistency: contentFeatures.postingConsistency || 0.5,
      contentEngagementScore: contentFeatures.contentEngagementScore || 0.5,
    };
  }

  private async calculateBasicFeatures(user1: User, user2: User): Promise<Partial<AdvancedFeatures>> {
    // Load profiles separately based on user role
    const profile1 = user1.role === UserRole.INFLUENCER
      ? await this.influencerProfileRepository.findOne({ where: { userId: user1.id } })
      : await this.companyProfileRepository.findOne({ where: { userId: user1.id } });
    
    const profile2 = user2.role === UserRole.INFLUENCER
      ? await this.influencerProfileRepository.findOne({ where: { userId: user2.id } })
      : await this.companyProfileRepository.findOne({ where: { userId: user2.id } });

    const niche1 = (profile1 as any)?.niche || (profile1 as any)?.industry || '';
    const niche2 = (profile2 as any)?.niche || (profile2 as any)?.industry || '';

    return {
      nicheAlignment: this.calculateNicheAlignment(niche1, niche2) / 100,
      audienceMatch: this.calculateAudienceMatch(profile1, profile2) / 100,
      engagementRate: this.calculateEngagementRate(profile1) / 100,
      brandFit: this.calculateBrandFit(niche1, niche2) / 100,
      locationMatch: this.calculateLocationMatch(profile1?.location, profile2?.location) / 100,
      budgetAlignment: this.calculateBudgetAlignment(profile1, profile2) / 100,
      contentQuality: this.calculateContentQuality(profile1) / 100,
      responseRate: 0.5, // Will be updated with historical data
    };
  }

  private async calculateTemporalFeatures(user1: User, user2: User): Promise<Partial<AdvancedFeatures>> {
    const accountAge1 = this.getAccountAge(user1.createdAt);
    const accountAge2 = this.getAccountAge(user2.createdAt);
    
    const avgAccountAge = (accountAge1 + accountAge2) / 2;
    const accountAgeScore = Math.min(avgAccountAge / 365, 1); // Normalize to 0-1 (max 1 year)

    // Activity score based on recent activity
    const activityScore = await this.calculateActivityScore(user1.id, user2.id);
    
    // Last active score
    const lastActiveScore = this.calculateLastActiveScore((user1 as any).lastActiveAt, (user2 as any).lastActiveAt);

    return {
      accountAge: accountAgeScore,
      activityScore,
      lastActiveScore,
    };
  }

  private async calculateBehavioralFeatures(user1: User, user2: User): Promise<Partial<AdvancedFeatures>> {
    const [acceptanceRate1, acceptanceRate2] = await Promise.all([
      this.calculateConnectionAcceptanceRate(user1.id),
      this.calculateConnectionAcceptanceRate(user2.id),
    ]);

    const avgAcceptanceRate = (acceptanceRate1 + acceptanceRate2) / 2;

    const profile1 = (user1 as any).influencerProfile || (user1 as any).companyProfile;
    const profile2 = (user2 as any).influencerProfile || (user2 as any).companyProfile;

    return {
      connectionAcceptanceRate: avgAcceptanceRate,
      profileCompletionScore: this.calculateProfileCompletion(profile1, profile2),
      portfolioQualityScore: this.calculatePortfolioQuality(profile1, profile2),
    };
  }

  private async calculateNetworkFeatures(user1: User, user2: User): Promise<Partial<AdvancedFeatures>> {
    const [connections1, connections2, mutualConnections] = await Promise.all([
      this.connectionRepository.count({
        where: [
          { requesterId: user1.id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
          { recipientId: user1.id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
        ],
      }),
      this.connectionRepository.count({
        where: [
          { requesterId: user2.id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
          { recipientId: user2.id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
        ],
      }),
      this.calculateMutualConnections(user1.id, user2.id),
    ]);

    const avgConnections = (connections1 + connections2) / 2;
    const networkStrength = Math.min(avgConnections / 50, 1); // Normalize (max 50 connections)

    const mutualConnectionsScore = Math.min(mutualConnections / 10, 1); // Normalize (max 10 mutual)

    const connectionDiversity = await this.calculateConnectionDiversity(user1.id, user2.id);

    return {
      networkStrength,
      mutualConnectionsScore,
      connectionDiversity,
    };
  }

  private async calculateContentFeatures(user1: User, user2: User): Promise<Partial<AdvancedFeatures>> {
    const [postingConsistency, contentEngagement] = await Promise.all([
      this.calculatePostingConsistency(user1.id, user2.id),
      this.calculateContentEngagement(user1.id, user2.id),
    ]);

    return {
      postingConsistency,
      contentEngagementScore: contentEngagement,
    };
  }

  // Helper methods
  private calculateNicheAlignment(niche1: string, niche2: string): number {
    if (!niche1 || !niche2) return 50;
    
    const n1 = niche1.toLowerCase().trim();
    const n2 = niche2.toLowerCase().trim();
    
    if (n1 === n2) return 100;
    if (n1.includes(n2) || n2.includes(n1)) return 80;
    
    const relatedIndustries: Record<string, string[]> = {
      'food': ['restaurant', 'cooking', 'recipe', 'culinary', 'dining'],
      'fashion': ['clothing', 'style', 'apparel', 'beauty', 'accessories'],
      'tech': ['technology', 'software', 'gadget', 'digital', 'innovation'],
      'fitness': ['health', 'wellness', 'gym', 'workout', 'nutrition'],
      'travel': ['tourism', 'adventure', 'vacation', 'hotel', 'destination'],
      'beauty': ['cosmetics', 'skincare', 'makeup', 'fashion', 'style'],
      'gaming': ['esports', 'streaming', 'entertainment', 'tech'],
      'lifestyle': ['wellness', 'home', 'decor', 'fashion', 'food'],
    };
    
    for (const [key, related] of Object.entries(relatedIndustries)) {
      if (n1.includes(key) && related.some(r => n2.includes(r))) return 65;
      if (n2.includes(key) && related.some(r => n1.includes(r))) return 65;
    }
    
    return 40;
  }

  private calculateAudienceMatch(profile1: any, profile2: any): number {
    const platforms1 = profile1?.platforms || [];
    const platforms2 = profile2?.platforms || [];
    
    if (!platforms1.length || !platforms2.length) return 50;
    
    const set1 = new Set(platforms1.map((p: string) => p.toLowerCase()));
    const set2 = new Set(platforms2.map((p: string) => p.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    if (intersection.size === 0) return 30;
    
    const union = new Set([...set1, ...set2]);
    return Math.max(50, Math.round((intersection.size / union.size) * 100));
  }

  private calculateEngagementRate(profile: any): number {
    if (!profile) return 50;
    
    const engagementRate = profile.engagementRate 
      ? (typeof profile.engagementRate === 'string' 
          ? parseFloat(profile.engagementRate) 
          : profile.engagementRate)
      : 0;
    
    // Normalize engagement rate (0-10% range)
    return Math.min((engagementRate / 10) * 100, 100);
  }

  private calculateBrandFit(niche1: string, niche2: string): number {
    return this.calculateNicheAlignment(niche1, niche2);
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

  private calculateBudgetAlignment(profile1: any, profile2: any): number {
    const audienceSize = profile1?.audienceSize || profile2?.audienceSize || 0;
    const budget = profile1?.budget || profile2?.budget || 0;
    
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

  private calculateContentQuality(profile: any): number {
    return this.calculateEngagementRate(profile);
  }

  private getAccountAge(createdAt: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  private async calculateActivityScore(user1Id: string, user2Id: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [posts1, posts2] = await Promise.all([
      this.feedPostRepository.count({
        where: { authorId: user1Id },
      }),
      this.feedPostRepository.count({
        where: { authorId: user2Id },
      }),
    ]);

    const avgPosts = (posts1 + posts2) / 2;
    return Math.min(avgPosts / 30, 1); // Normalize (max 30 posts)
  }

  private calculateLastActiveScore(lastActive1: Date | undefined, lastActive2: Date | undefined): number {
    const now = new Date();
    
    const daysSince1 = lastActive1 ? Math.floor((now.getTime() - lastActive1.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const daysSince2 = lastActive2 ? Math.floor((now.getTime() - lastActive2.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    const avgDaysSince = (daysSince1 + daysSince2) / 2;
    
    if (avgDaysSince <= 1) return 1.0;
    if (avgDaysSince <= 7) return 0.8;
    if (avgDaysSince <= 30) return 0.6;
    if (avgDaysSince <= 90) return 0.4;
    return 0.2;
  }

  private async calculateConnectionAcceptanceRate(userId: string): Promise<number> {
    const [totalRequests, acceptedRequests] = await Promise.all([
      this.connectionRepository.count({
        where: { recipientId: userId },
      }),
      this.connectionRepository.count({
        where: { recipientId: userId, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
      }),
    ]);

    if (totalRequests === 0) return 0.5;
    return acceptedRequests / totalRequests;
  }

  private calculateProfileCompletion(profile1: any, profile2: any): number {
    const score1 = this.getProfileCompletionScore(profile1);
    const score2 = this.getProfileCompletionScore(profile2);
    return (score1 + score2) / 2;
  }

  private getProfileCompletionScore(profile: any): number {
    if (!profile) return 0;
    
    let score = 0;
    const fields = ['bio', 'location', 'platforms', 'avatarUrl'];
    
    fields.forEach(field => {
      if (profile[field]) {
        if (Array.isArray(profile[field]) && profile[field].length > 0) score += 0.25;
        else if (typeof profile[field] === 'string' && profile[field].length > 0) score += 0.25;
      }
    });
    
    return score;
  }

  private calculatePortfolioQuality(profile1: any, profile2: any): number {
    const score1 = profile1?.portfolioUrl || profile1?.website ? 0.5 : 0;
    const score2 = profile2?.portfolioUrl || profile2?.website ? 0.5 : 0;
    return score1 + score2;
  }

  private async calculateMutualConnections(user1Id: string, user2Id: string): Promise<number> {
    const connections1 = await this.connectionRepository.find({
      where: [
        { requesterId: user1Id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
        { recipientId: user1Id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
      ],
    });

    const connections2 = await this.connectionRepository.find({
      where: [
        { requesterId: user2Id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
        { recipientId: user2Id, status: ConnectionStatus.ACCEPTED }, // ✅ Fixed from CONNECTED
      ],
    });

    const connectedUsers1 = new Set(
      connections1.map(c => c.requesterId === user1Id ? c.recipientId : c.requesterId)
    );
    const connectedUsers2 = new Set(
      connections2.map(c => c.requesterId === user2Id ? c.recipientId : c.requesterId)
    );

    const mutual = [...connectedUsers1].filter(id => connectedUsers2.has(id));
    return mutual.length;
  }

  private async calculateConnectionDiversity(user1Id: string, user2Id: string): Promise<number> {
    // Simplified: measure diversity based on different niches in network
    return 0.5; // Placeholder for now
  }

  private async calculatePostingConsistency(user1Id: string, user2Id: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [posts1, posts2] = await Promise.all([
      this.feedPostRepository.find({
        where: { authorId: user1Id },
        order: { createdAt: 'DESC' },
        take: 30,
      }),
      this.feedPostRepository.find({
        where: { authorId: user2Id },
        order: { createdAt: 'DESC' },
        take: 30,
      }),
    ]);

    const consistency1 = this.calculateConsistencyScore(posts1);
    const consistency2 = this.calculateConsistencyScore(posts2);

    return (consistency1 + consistency2) / 2;
  }

  private calculateConsistencyScore(posts: FeedPost[]): number {
    if (posts.length < 2) return 0.3;

    const intervals: number[] = [];
    for (let i = 1; i < posts.length; i++) {
      const diff = posts[i - 1].createdAt.getTime() - posts[i].createdAt.getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = more consistent
    const consistencyScore = Math.max(0, 1 - (stdDev / avgInterval));
    return Math.min(consistencyScore, 1);
  }

  private async calculateContentEngagement(user1Id: string, user2Id: string): Promise<number> {
    const [posts1, posts2] = await Promise.all([
      this.feedPostRepository.find({
        where: { authorId: user1Id },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      this.feedPostRepository.find({
        where: { authorId: user2Id },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const engagement1 = this.calculateAvgEngagement(posts1);
    const engagement2 = this.calculateAvgEngagement(posts2);

    return (engagement1 + engagement2) / 2;
  }

  private calculateAvgEngagement(posts: FeedPost[]): number {
    if (posts.length === 0) return 0.5;

    const totalEngagement = posts.reduce((sum, post) => {
      return sum + (post.likeCount || 0) + (post.commentCount || 0) + ((post as any).sharesCount || 0);
    }, 0);

    const avgEngagement = totalEngagement / posts.length;
    return Math.min(avgEngagement / 100, 1); // Normalize (max 100 interactions)
  }
}
