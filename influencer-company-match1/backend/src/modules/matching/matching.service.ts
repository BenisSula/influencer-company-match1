import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Match } from './entities/match.entity';
import { Connection, ConnectionStatus } from './entities/connection.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { MatchHistoryService } from './match-history.service';
import { MatchAnalyticsService } from './match-analytics.service';
import { MessagingService } from '../messaging/messaging.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { MatchResponseDto } from './dto/match-response.dto';
import { PaymentsService } from '../payments/payments.service';
import { PaymentsGateway } from '../payments/payments.gateway';
import { LandingService } from '../landing/landing.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @Inject(forwardRef(() => MatchHistoryService))
    private matchHistoryService: MatchHistoryService,
    @Inject(forwardRef(() => MessagingService))
    private messagingService: MessagingService,
    private notificationsService: NotificationsService,
    private matchAnalyticsService: MatchAnalyticsService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    private paymentsGateway: PaymentsGateway,
    @Inject(forwardRef(() => LandingService))
    private landingService: LandingService,
  ) {}

  async getMatches(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all potential matches (opposite role)
    const oppositeRole = user.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;
    const potentialMatches = await this.userRepository.find({
      where: { 
        role: oppositeRole,
        isActive: true,
        id: Not(userId)
      }
    });

    // Load profiles for each match
    const matchesWithProfiles = await Promise.all(
      potentialMatches.map(async (match) => {
        let profileData: any = {};
        
        if (match.role === UserRole.INFLUENCER) {
          const profile = await this.influencerProfileRepository.findOne({
            where: { userId: match.id }
          });
          if (profile) {
            profileData = {
              name: profile.name || profile.niche,
              bio: profile.bio,
              niche: profile.niche,
              audienceSize: profile.audienceSize,
              engagementRate: profile.engagementRate ? parseFloat(profile.engagementRate.toString()) : null,
              location: profile.location,
              platforms: profile.platforms,
              budgetRange: profile.minBudget || profile.maxBudget ? {
                min: profile.minBudget,
                max: profile.maxBudget
              } : null,
            };
          }
        } else if (match.role === UserRole.COMPANY) {
          const profile = await this.companyProfileRepository.findOne({
            where: { userId: match.id }
          });
          if (profile) {
            profileData = {
              name: profile.name, // ✅ Fixed: use 'name' instead of 'companyName'
              bio: profile.bio,
              industry: profile.industry,
              budget: profile.budget,
              location: profile.location,
              platforms: profile.platforms,
            };
          }
        }

        const score = this.calculateMatchScore(user, { ...match, ...profileData });
        const breakdown = this.getMatchFactors(user, { ...match, ...profileData });
        
        // Record match history asynchronously with retry logic
        this.recordMatchHistoryWithRetry(userId, {
          matchUserId: match.id,
          score,
          factors: breakdown,
        });
        
        return {
          id: match.id,
          profile: { ...match, ...profileData }, // ✅ Changed from 'user' to 'profile'
          score,
          tier: this.calculateTier(score), // ✅ Add tier classification
          breakdown // ✅ Changed from 'factors' to 'breakdown'
        };
      })
    );

    // Sort by score (descending by default)
    matchesWithProfiles.sort((a, b) => b.score - a.score);

    return matchesWithProfiles;
  }

  async getMatch(userId: string, matchId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const match = await this.userRepository.findOne({ where: { id: matchId } });

    if (!user || !match) {
      throw new NotFoundException('User not found');
    }

    const score = this.calculateMatchScore(user, match);
    
    return {
      id: match.id,
      profile: match, // ✅ Changed from 'user' to 'profile'
      score,
      tier: this.calculateTier(score), // ✅ Add tier classification
      breakdown: this.getMatchFactors(user, match) // ✅ Changed from 'factors' to 'breakdown'
    };
  }

  /**
   * Get matches with analytics data (Enhanced version)
   * This method adds analytics information to each match
   */
  async getMatchesWithAnalytics(userId: string): Promise<MatchResponseDto[]> {
    try {
      // Get basic matches first
      const basicMatches = await this.getMatches(userId);

      // Enhance each match with analytics
      const enhancedMatches = await Promise.all(
        basicMatches.map(async (match) => {
          try {
            // Get analytics for this match
            const analytics = await this.matchAnalyticsService.getMatchAnalytics(
              userId,
              match.id
            );

            // Transform to MatchResponseDto format
            return {
              id: match.id,
              profile: {
                id: match.profile.id,
                name: match.profile.name,
                type: match.profile.role === UserRole.INFLUENCER ? 'influencer' : 'company',
                niche: match.profile.niche,
                industry: match.profile.industry,
                audienceSize: match.profile.audienceSize,
                engagementRate: match.profile.engagementRate,
                budget: match.profile.budget,
                location: match.profile.location,
                platforms: match.profile.platforms,
                bio: match.profile.bio,
                avatarUrl: match.profile.avatarUrl,
              },
              score: match.score,
              tier: this.calculateTier(match.score),
              breakdown: match.breakdown,
              analytics: {
                viewCount: analytics.viewCount,
                interactionCount: analytics.interactionCount,
                lastInteraction: analytics.lastInteraction,
                similarMatchesSuccess: analytics.similarMatchesSuccess,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            } as MatchResponseDto;
          } catch (error) {
            console.error(`[MatchingService] Error enhancing match ${match.id}:`, error);
            // Return match without analytics on error
            return {
              id: match.id,
              profile: {
                id: match.profile.id,
                name: match.profile.name,
                type: match.profile.role === UserRole.INFLUENCER ? 'influencer' : 'company',
                niche: match.profile.niche,
                industry: match.profile.industry,
                audienceSize: match.profile.audienceSize,
                engagementRate: match.profile.engagementRate,
                budget: match.profile.budget,
                location: match.profile.location,
                platforms: match.profile.platforms,
                bio: match.profile.bio,
                avatarUrl: match.profile.avatarUrl,
              },
              score: match.score,
              tier: this.calculateTier(match.score),
              breakdown: match.breakdown,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as MatchResponseDto;
          }
        })
      );

      return enhancedMatches;
    } catch (error) {
      console.error('[MatchingService] Error in getMatchesWithAnalytics:', error);
      // Fallback to basic matches
      const basicMatches = await this.getMatches(userId);
      return basicMatches.map(match => ({
        id: match.id,
        profile: {
          id: match.profile.id,
          name: match.profile.name,
          type: match.profile.role === UserRole.INFLUENCER ? 'influencer' : 'company',
          niche: match.profile.niche,
          industry: match.profile.industry,
          audienceSize: match.profile.audienceSize,
          engagementRate: match.profile.engagementRate,
          budget: match.profile.budget,
          location: match.profile.location,
          platforms: match.profile.platforms,
          bio: match.profile.bio,
          avatarUrl: match.profile.avatarUrl,
        },
        score: match.score,
        tier: this.calculateTier(match.score),
        breakdown: match.breakdown,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as MatchResponseDto));
    }
  }

  /**
   * Calculate tier based on score
   */
  private calculateTier(score: number): string {
    if (score >= 90) return 'Perfect';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  }

  async createConnection(userId: string, createConnectionDto: CreateConnectionDto) {
    const { recipientId } = createConnectionDto;

    // Check if connection already exists
    const existingConnection = await this.connectionRepository.findOne({
      where: [
        { requesterId: userId, recipientId },
        { requesterId: recipientId, recipientId: userId }
      ]
    });

    if (existingConnection) {
      throw new BadRequestException('Connection already exists');
    }

    const connection = this.connectionRepository.create({
      requesterId: userId,
      recipientId,
      status: ConnectionStatus.PENDING
    });

    const savedConnection = await this.connectionRepository.save(connection);

    // Log activity for landing page feed
    try {
      const requester = await this.userRepository.findOne({ where: { id: userId } });
      const recipient = await this.userRepository.findOne({ where: { id: recipientId } });
      
      if (requester && recipient) {
        await this.landingService.logActivity('match', userId, {
          recipientRole: recipient.role,
          connectionId: savedConnection.id,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      this.logger.warn('Failed to log match activity:', error);
    }

    return savedConnection;
  }

  async deleteConnection(userId: string, connectionId: string) {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.requesterId !== userId && connection.recipientId !== userId) {
      throw new BadRequestException('Not authorized to delete this connection');
    }

    await this.connectionRepository.remove(connection);
    return { message: 'Connection deleted successfully' };
  }

  async getConnectionStatus(userId: string, otherUserId: string) {
    try {
      // Validate input
      if (!userId || !otherUserId) {
        return { status: 'none', connection: null };
      }

      const connection = await this.connectionRepository.findOne({
        where: [
          { requesterId: userId, recipientId: otherUserId },
          { requesterId: otherUserId, recipientId: userId }
        ]
      });

      if (!connection) {
        return { status: 'none', connection: null };
      }

      return { 
        status: connection.status, 
        collaborationStatus: connection.collaborationStatus,
        connection 
      };
    } catch (error) {
      console.error('Error in getConnectionStatus:', error);
      // Return a safe default instead of throwing
      return { status: 'none', connection: null };
    }
  }

  async getConnectionByUserId(userId: string, otherUserId: string) {
    try {
      // Validate input
      if (!userId || !otherUserId) {
        return null;
      }

      const connection = await this.connectionRepository.findOne({
        where: [
          { requesterId: userId, recipientId: otherUserId },
          { requesterId: otherUserId, recipientId: userId }
        ]
      });

      return connection;
    } catch (error) {
      console.error('Error in getConnectionByUserId:', error);
      return null;
    }
  }

  async getMyConnections(userId: string) {
    try {
      // Get all connections where user is either requester or recipient
      const connections = await this.connectionRepository.find({
        where: [
          { requesterId: userId },
          { recipientId: userId }
        ],
        order: {
          createdAt: 'DESC'
        }
      });

      // Load user details for each connection
      const connectionsWithDetails = await Promise.all(
        connections.map(async (connection) => {
          // Determine the other user in the connection
          const otherUserId = connection.requesterId === userId 
            ? connection.recipientId 
            : connection.requesterId;

          // Load the other user's details
          const otherUser = await this.userRepository.findOne({
            where: { id: otherUserId }
          });

          let profileData: any = {};
          if (otherUser) {
            if (otherUser.role === UserRole.INFLUENCER) {
              const profile = await this.influencerProfileRepository.findOne({
                where: { userId: otherUser.id }
              });
              if (profile) {
                profileData = {
                  name: profile.name || profile.niche,
                  avatarUrl: profile.avatarUrl,
                  niche: profile.niche,
                };
              }
            } else if (otherUser.role === UserRole.COMPANY) {
              const profile = await this.companyProfileRepository.findOne({
                where: { userId: otherUser.id }
              });
              if (profile) {
                profileData = {
                  name: profile.name, // ✅ Fixed: use 'name' instead of 'companyName'
                  avatarUrl: profile.avatarUrl,
                  industry: profile.industry,
                };
              }
            }
          }

          // Determine if current user is requester or recipient
          const isRequester = connection.requesterId === userId;

          return {
            ...connection,
            // Map camelCase to snake_case for frontend compatibility
            collaboration_request_data: connection.collaborationRequestData,
            collaboration_status: connection.collaborationStatus,
            collaboration_type: connection.collaborationType,
            // Always provide partner info (the other user)
            partner: {
              id: otherUserId,
              ...profileData
            },
            requester: isRequester ? null : {
              id: otherUserId,
              ...profileData
            },
            recipient: isRequester ? {
              id: otherUserId,
              ...profileData
            } : null
          };
        })
      );

      return connectionsWithDetails;
    } catch (error) {
      console.error('Error in getMyConnections:', error);
      return [];
    }
  }

  async searchUsers(userId: string, query: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oppositeRole = user.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: oppositeRole })
      .andWhere('user.id != :userId', { userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .take(20)
      .getMany();

    return users.map(u => {
      if (u.password) {
        delete u.password;
      }
      return u;
    });
  }

  private calculateMatchScore(user1: User, user2: User): number {
    const factors = this.calculateDetailedMatchFactors(user1, user2);
    
    // Weighted average (adjust weights based on importance)
    const weights = {
      nicheCompatibility: 0.25,      // 25% - Most important
      budgetAlignment: 0.20,          // 20% - Very important
      platformOverlap: 0.15,          // 15% - Important
      engagementTierMatch: 0.15,      // 15% - Important
      audienceSizeMatch: 0.15,        // 15% - Important
      locationCompatibility: 0.10,    // 10% - Less important (remote work)
    };
    
    const score = 
      factors.nicheCompatibility * weights.nicheCompatibility +
      factors.budgetAlignment * weights.budgetAlignment +
      factors.platformOverlap * weights.platformOverlap +
      factors.engagementTierMatch * weights.engagementTierMatch +
      factors.audienceSizeMatch * weights.audienceSizeMatch +
      factors.locationCompatibility * weights.locationCompatibility;
    
    return Math.round(score);
  }

  private calculateDetailedMatchFactors(user1: User, user2: User): any {
    // Determine roles
    const influencer = user1.role === UserRole.INFLUENCER ? user1 : user2;
    const company = user1.role === UserRole.COMPANY ? user1 : user2;
    
    return {
      nicheCompatibility: this.calculateNicheCompatibility(influencer.niche || '', company.industry || ''),
      locationCompatibility: this.calculateLocationCompatibility(influencer.location || '', company.location || ''),
      budgetAlignment: this.calculateBudgetAlignment(influencer.audienceSize || 0, company.budget || 0),
      platformOverlap: this.calculatePlatformOverlap(influencer.platforms || [], company.platforms || []),
      audienceSizeMatch: this.calculateAudienceSizeMatch(influencer.audienceSize || 0, company.budget || 0),
      engagementTierMatch: this.calculateEngagementTierMatch(influencer.engagementRate || 0),
    };
  }

  private calculateNicheCompatibility(influencerNiche: string, companyIndustry: string): number {
    if (!influencerNiche || !companyIndustry) return 50;
    
    const niche = influencerNiche.toLowerCase().trim();
    const industry = companyIndustry.toLowerCase().trim();
    
    // Exact match
    if (niche === industry) return 100;
    
    // Partial match (contains)
    if (niche.includes(industry) || industry.includes(niche)) return 80;
    
    // Related industries mapping
    const relatedIndustries: Record<string, string[]> = {
      'food': ['restaurant', 'cooking', 'recipe', 'culinary', 'chef', 'dining'],
      'fashion': ['clothing', 'style', 'apparel', 'beauty', 'makeup', 'cosmetics'],
      'tech': ['technology', 'software', 'gadget', 'digital', 'app', 'gaming'],
      'fitness': ['health', 'wellness', 'gym', 'workout', 'sports', 'nutrition'],
      'travel': ['tourism', 'adventure', 'vacation', 'hotel', 'airline'],
      'lifestyle': ['home', 'decor', 'living', 'family', 'parenting'],
    };
    
    // Check for related matches
    for (const [key, related] of Object.entries(relatedIndustries)) {
      if (niche.includes(key) && related.some(r => industry.includes(r))) {
        return 65;
      }
      if (industry.includes(key) && related.some(r => niche.includes(r))) {
        return 65;
      }
    }
    
    return 40; // No clear match
  }

  private calculateLocationCompatibility(location1: string, location2: string): number {
    if (!location1 || !location2) return 50;
    
    const loc1 = location1.toLowerCase().trim();
    const loc2 = location2.toLowerCase().trim();
    
    // Exact match (same city)
    if (loc1 === loc2) return 100;
    
    // Extract city/state/country parts
    const parts1 = loc1.split(',').map(p => p.trim());
    const parts2 = loc2.split(',').map(p => p.trim());
    
    // Same state/region (if format is "City, State")
    if (parts1.length > 1 && parts2.length > 1 && parts1[1] === parts2[1]) {
      return 80;
    }
    
    // Check if any part matches (could be same country)
    const hasCommonPart = parts1.some(p1 => parts2.some(p2 => p1 === p2));
    if (hasCommonPart) return 60;
    
    // Different locations
    return 40;
  }

  private calculateBudgetAlignment(audienceSize: number, companyBudget: number): number {
    if (!audienceSize || !companyBudget) return 50;
    
    // Estimate influencer rate based on audience size
    // Rough estimate: $10-50 per 1000 followers
    const estimatedRate = (audienceSize / 1000) * 30; // $30 per 1K followers
    
    if (estimatedRate === 0) return 50;
    
    const ratio = companyBudget / estimatedRate;
    
    // Perfect alignment (budget is 1-2x the estimated rate)
    if (ratio >= 1 && ratio <= 2) return 100;
    
    // Good alignment (budget is 0.7-3x the rate)
    if (ratio >= 0.7 && ratio <= 3) return 80;
    
    // Fair alignment (budget is 0.4-5x the rate)
    if (ratio >= 0.4 && ratio <= 5) return 60;
    
    // Poor alignment
    if (ratio < 0.4) return 35; // Budget too low
    return 45; // Budget very high (might be for larger campaign)
  }

  private calculatePlatformOverlap(platforms1: string[], platforms2: string[]): number {
    if (!platforms1?.length || !platforms2?.length) return 50;
    
    const set1 = new Set(platforms1.map(p => p.toLowerCase()));
    const set2 = new Set(platforms2.map(p => p.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    if (intersection.size === 0) return 30; // No overlap
    
    // Calculate Jaccard similarity
    const union = new Set([...set1, ...set2]);
    const overlap = (intersection.size / union.size) * 100;
    
    // Boost score if there's any overlap
    return Math.max(50, Math.round(overlap));
  }

  private calculateAudienceSizeMatch(audienceSize: number, companyBudget: number): number {
    if (!audienceSize || !companyBudget) return 50;
    
    // Estimate target audience from budget
    // Rough estimate: $30 per 1K followers
    const targetAudience = (companyBudget / 30) * 1000;
    
    if (targetAudience === 0) return 50;
    
    const ratio = audienceSize / targetAudience;
    
    // Perfect match (within 30%)
    if (ratio >= 0.7 && ratio <= 1.3) return 100;
    
    // Good match (within 50%)
    if (ratio >= 0.5 && ratio <= 1.5) return 80;
    
    // Fair match (within 2x)
    if (ratio >= 0.4 && ratio <= 2.5) return 60;
    
    // Poor match
    if (ratio < 0.4) return 40; // Too small
    return 45; // Too large
  }

  private calculateEngagementTierMatch(engagementRate: number): number {
    if (!engagementRate) return 50;
    
    const rate = typeof engagementRate === 'string' ? parseFloat(engagementRate) : engagementRate;
    
    // Excellent engagement (>5%)
    if (rate >= 5) return 100;
    
    // Good engagement (3-5%)
    if (rate >= 3) return 85;
    
    // Fair engagement (1.5-3%)
    if (rate >= 1.5) return 70;
    
    // Moderate engagement (0.5-1.5%)
    if (rate >= 0.5) return 55;
    
    // Poor engagement (<0.5%)
    return 40;
  }

  private getMatchFactors(user1: User, user2: User): any {
    return this.calculateDetailedMatchFactors(user1, user2);
  }

  /**
   * Record match history with retry logic
   */
  private async recordMatchHistoryWithRetry(
    userId: string,
    data: any,
    retries: number = 3,
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.matchHistoryService.recordMatch(userId, data);
        return; // Success
      } catch (error) {
        console.error(`[MatchingService] Failed to record match history (attempt ${attempt}/${retries}):`, error);
        
        if (attempt === retries) {
          // Final attempt failed, log but don't throw
          console.error('[MatchingService] All retry attempts exhausted for match history recording');
          return;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }

  /**
   * Create a collaboration request
   */
  async createCollaborationRequest(
    requesterId: string,
    dto: any,
  ) {
    try {
      // Handle both recipientId and targetUserId for compatibility
      const recipientId = dto.recipientId || dto.targetUserId;
      
      if (!recipientId) {
        throw new BadRequestException('Recipient ID is required');
      }

      if (!dto.message || !dto.message.trim()) {
        throw new BadRequestException('Message is required');
      }

      // Check if connection already exists
      const existingConnection = await this.connectionRepository.findOne({
        where: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId },
        ],
      });

      // Parse budget if provided
      let budgetMin: number | undefined;
      let budgetMax: number | undefined;
      if (dto.budget && typeof dto.budget === 'string' && dto.budget.includes('-')) {
        const parts = dto.budget.split('-');
        budgetMin = parseFloat(parts[0]);
        budgetMax = parseFloat(parts[1]);
      } else if (dto.budgetMin !== undefined) {
        budgetMin = dto.budgetMin;
        budgetMax = dto.budgetMax;
      }

      // If connection exists, update it with new collaboration request
      if (existingConnection) {
        // Update the existing connection with new collaboration data
        existingConnection.collaborationStatus = 'requested' as any;
        existingConnection.collaborationRequestData = {
          message: dto.message.trim(),
          projectTitle: dto.projectTitle,
          projectDescription: dto.projectDescription,
          budgetMin,
          budgetMax,
          timeline: dto.timeline,
          startDate: dto.startDate,
          endDate: dto.endDate,
          deliverables: dto.deliverables ? (Array.isArray(dto.deliverables) ? dto.deliverables : [dto.deliverables]) : undefined,
          platforms: dto.platforms,
          collaborationType: dto.collaborationType,
          additionalNotes: dto.additionalNotes,
        };
        existingConnection.updatedAt = new Date();

        const updatedConnection = await this.connectionRepository.save(existingConnection);
        
        // Send a message to the recipient with the updated collaboration request
        try {
          const conversation = await this.messagingService.getOrCreateConversation(requesterId, recipientId);
          
          // Format the collaboration request message
          let messageText = `📋 Updated Collaboration Request\n\n${dto.message}`;
          
          if (dto.projectTitle) {
            messageText += `\n\n🎯 Project: ${dto.projectTitle}`;
          }
          if (budgetMin && budgetMax) {
            messageText += `\n💰 Budget: $${budgetMin} - $${budgetMax}`;
          } else if (dto.budget) {
            messageText += `\n💰 Budget: ${dto.budget}`;
          }
          if (dto.timeline) {
            messageText += `\n⏰ Timeline: ${dto.timeline}`;
          }
          if (dto.deliverables) {
            messageText += `\n📦 Deliverables: ${dto.deliverables}`;
          }
          if (dto.projectDescription) {
            messageText += `\n\n📝 Details: ${dto.projectDescription}`;
          }

          await this.messagingService.createMessage(requesterId, {
            recipientId: recipientId,
            content: messageText,
          });
        } catch (error) {
          console.error('Failed to send collaboration request message:', error);
          // Don't fail the whole request if messaging fails
        }
        
        return updatedConnection;
      }

      // Verify both users exist
      const [requester, recipient] = await Promise.all([
        this.userRepository.findOne({ where: { id: requesterId } }),
        this.userRepository.findOne({ where: { id: recipientId } }),
      ]);

      if (!requester || !recipient) {
        throw new BadRequestException('User not found');
      }

      // Create the connection with collaboration data
      const connection = this.connectionRepository.create({
        requesterId,
        recipientId,
        status: ConnectionStatus.PENDING,
        collaborationStatus: 'requested' as any,
        collaborationRequestData: {
          message: dto.message.trim(),
          projectTitle: dto.projectTitle,
          projectDescription: dto.projectDescription,
          budgetMin,
          budgetMax,
          timeline: dto.timeline,
          startDate: dto.startDate,
          endDate: dto.endDate,
          deliverables: dto.deliverables ? (Array.isArray(dto.deliverables) ? dto.deliverables : [dto.deliverables]) : undefined,
          platforms: dto.platforms,
          collaborationType: dto.collaborationType,
          additionalNotes: dto.additionalNotes,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedConnection = await this.connectionRepository.save(connection);

      // Send a message to the recipient with the collaboration request
      try {
        const conversation = await this.messagingService.getOrCreateConversation(requesterId, recipientId);
        
        // Format the collaboration request message
        let messageText = `📋 Collaboration Request\n\n${dto.message}`;
        
        if (dto.projectTitle) {
          messageText += `\n\n🎯 Project: ${dto.projectTitle}`;
        }
        if (budgetMin && budgetMax) {
          messageText += `\n💰 Budget: $${budgetMin} - $${budgetMax}`;
        } else if (dto.budget) {
          messageText += `\n💰 Budget: ${dto.budget}`;
        }
        if (dto.timeline) {
          messageText += `\n⏰ Timeline: ${dto.timeline}`;
        }
        if (dto.deliverables) {
          messageText += `\n📦 Deliverables: ${dto.deliverables}`;
        }
        if (dto.projectDescription) {
          messageText += `\n\n📝 Details: ${dto.projectDescription}`;
        }

        await this.messagingService.createMessage(requesterId, {
          recipientId: recipientId,
          content: messageText,
        });
      } catch (error) {
        console.error('Failed to send collaboration request message:', error);
        // Don't fail the whole request if messaging fails
      }

      // Send notification
      try {
        await this.notificationsService.createNotification({
          recipientId,
          senderId: requesterId,
          type: NotificationType.COLLABORATION_REQUEST,
          content: 'sent you a collaboration request',
          metadata: {
            connectionId: savedConnection.id,
            collaborationType: dto.collaborationType,
            budgetRange: budgetMin && budgetMax ? `${budgetMin}-${budgetMax}` : undefined,
          },
        });
      } catch (error) {
        console.error('Failed to send collaboration request notification:', error);
      }

      return savedConnection;
    } catch (error) {
      console.error('Error creating collaboration request:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create collaboration request');
    }
  }

  /**
   * Get collaboration requests received by user
   */
  async getReceivedCollaborationRequests(userId: string) {
    const requests = await this.connectionRepository.find({
      where: {
        recipientId: userId,
        collaborationStatus: 'requested' as any,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Load requester details and profiles manually
    return Promise.all(
      requests.map(async (request) => {
        const requester = await this.userRepository.findOne({
          where: { id: request.requesterId },
        });
        
        if (!requester) {
          return null;
        }

        const profile = await this.loadUserProfile(requester);
        return {
          ...request,
          requester: {
            ...requester,
            profile,
          },
        };
      }),
    ).then(results => results.filter(r => r !== null));
  }

  /**
   * Get collaboration requests sent by user
   */
  async getSentCollaborationRequests(userId: string) {
    const requests = await this.connectionRepository.find({
      where: {
        requesterId: userId,
        collaborationStatus: 'requested' as any,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Load recipient details and profiles manually
    return Promise.all(
      requests.map(async (request) => {
        const recipient = await this.userRepository.findOne({
          where: { id: request.recipientId },
        });
        
        if (!recipient) {
          return null;
        }

        const profile = await this.loadUserProfile(recipient);
        return {
          ...request,
          recipient: {
            ...recipient,
            profile,
          },
        };
      }),
    ).then(results => results.filter(r => r !== null));
  }

  /**
   * Update collaboration request status
   */
  async updateCollaborationRequest(
    userId: string,
    connectionId: string,
    dto: any,
  ) {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Collaboration request not found');
    }

    // Only recipient can update status
    if (connection.recipientId !== userId) {
      throw new BadRequestException('Not authorized to update this request');
    }

    connection.collaborationStatus = dto.status;
    
    // If accepted, also update connection status
    if (dto.status === 'agreed') {
      connection.status = ConnectionStatus.ACCEPTED;
    } else if (dto.status === 'rejected') {
      connection.status = ConnectionStatus.REJECTED;
    }

    return this.connectionRepository.save(connection);
  }

  /**
   * Helper method to load user profile
   */
  private async loadUserProfile(user: User) {
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
        name: profile.name,
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

  /**
   * Accept a collaboration request
   * Creates payment and updates statuses
   */
  async acceptCollaborationRequest(userId: string, connectionId: string) {
    try {
      // Find the connection
      const connection = await this.connectionRepository.findOne({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new NotFoundException('Collaboration request not found');
      }

      // Verify user is the recipient (the one accepting)
      if (connection.recipientId !== userId) {
        throw new BadRequestException('Only the recipient can accept this collaboration request');
      }

      // Check current status
      if (connection.collaborationStatus !== 'requested') {
        throw new BadRequestException(`Collaboration request is already ${connection.collaborationStatus}`);
      }

      // Extract budget from collaboration request data
      const requestData: any = connection.collaborationRequestData || {};
      const budgetMin = requestData.budgetMin || requestData.budget || 0;
      const budgetMax = requestData.budgetMax || requestData.budget || budgetMin;
      const budget = budgetMax; // Use max budget for payment

      if (!budget || budget <= 0) {
        throw new BadRequestException('Invalid budget amount in collaboration request');
      }

      // Determine who is company and who is influencer
      const requester = await this.userRepository.findOne({ where: { id: connection.requesterId } });
      const recipient = await this.userRepository.findOne({ where: { id: connection.recipientId } });

      if (!requester || !recipient) {
        throw new NotFoundException('User not found');
      }

      const companyId = requester.role === UserRole.COMPANY ? requester.id : recipient.id;
      const influencerId = requester.role === UserRole.INFLUENCER ? requester.id : recipient.id;

      // Update collaboration status to 'active'
      connection.collaborationStatus = 'active' as any;
      connection.status = ConnectionStatus.ACCEPTED;
      connection.updatedAt = new Date();

      const updatedConnection = await this.connectionRepository.save(connection);

      // Create payment for the collaboration
      let payment = null;
      let paymentError = null;
      try {
        payment = await this.paymentsService.createCollaborationPayment(
          connection.id,
          companyId,
          influencerId,
          budget,
        );
        this.logger.log(`Created payment ${payment.id} for collaboration ${connection.id}`);
      } catch (error) {
        paymentError = error.message || 'Payment creation failed';
        this.logger.warn(`Payment creation skipped for collaboration ${connection.id}: ${paymentError}`);
        // Don't fail the whole request if payment creation fails
        // The payment can be created manually later or collaboration can proceed without payment
      }

      // Create or get conversation for messaging
      let conversationId: string | null = null;
      try {
        const conversation = await this.messagingService.getOrCreateConversation(
          connection.requesterId,
          connection.recipientId,
        );
        conversationId = conversation.id;
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }

      // Send notification to requester
      try {
        await this.notificationsService.createNotification({
          recipientId: connection.requesterId,
          senderId: userId,
          type: NotificationType.COLLABORATION_ACCEPTED,
          content: 'accepted your collaboration request',
          metadata: {
            connectionId: connection.id,
            conversationId,
          },
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }

      // Emit WebSocket event to notify the company about accepted collaboration
      try {
        this.paymentsGateway.emitPaymentUpdate(connection.requesterId, {
          type: 'collaboration_accepted',
          collaborationId: connection.id,
          paymentId: payment?.id || null,
          paymentStatus: payment?.status || null,
          requiresPayment: !!payment,
          conversationId,
        });
        this.logger.log(`Emitted collaboration_accepted event to user ${connection.requesterId}`);
      } catch (error) {
        console.error('Failed to emit WebSocket event:', error);
      }

      // Return response with connection details
      return {
        connection: {
          ...updatedConnection,
          requester,
          recipient,
        },
        conversationId,
        requiresPayment: !!payment,
        payment: payment ? {
          id: payment.id,
          collaborationId: payment.collaborationId,
          amountTotal: payment.amountTotal,
          status: payment.status,
        } : null,
        paymentInfo: payment ? {
          companyId,
          influencerId,
          budget,
          collaborationId: connection.id,
        } : null,
        paymentError: paymentError, // Include payment error if any
        message: payment 
          ? 'Collaboration accepted! Payment created successfully.' 
          : paymentError 
            ? `Collaboration accepted! Note: ${paymentError}` 
            : 'Collaboration accepted!',
      };
    } catch (error) {
      console.error('Error accepting collaboration request:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Preserve the original error message for debugging
      const errorMessage = error.message || 'Unknown error';
      throw new InternalServerErrorException(`Failed to accept collaboration request: ${errorMessage}`);
    }
  }

  /**
   * Reject a collaboration request
   */
  async rejectCollaborationRequest(userId: string, connectionId: string) {
    try {
      // Find the connection
      const connection = await this.connectionRepository.findOne({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new NotFoundException('Collaboration request not found');
      }

      // Verify user is the recipient (the one rejecting)
      if (connection.recipientId !== userId) {
        throw new BadRequestException('Only the recipient can reject this collaboration request');
      }

      // Check current status
      if (connection.collaborationStatus !== 'requested') {
        throw new BadRequestException(`Collaboration request is already ${connection.collaborationStatus}`);
      }

      // Update collaboration status to 'rejected'
      connection.collaborationStatus = 'rejected' as any;
      connection.status = ConnectionStatus.REJECTED;
      connection.updatedAt = new Date();

      const updatedConnection = await this.connectionRepository.save(connection);

      // Send notification to requester
      try {
        await this.notificationsService.createNotification({
          recipientId: connection.requesterId,
          senderId: userId,
          type: NotificationType.COLLABORATION_REJECTED,
          content: 'declined your collaboration request',
          metadata: {
            connectionId: connection.id,
          },
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }

      return {
        connection: updatedConnection,
        message: 'Collaboration request declined',
      };
    } catch (error) {
      console.error('Error rejecting collaboration request:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reject collaboration request');
    }
  }
}
