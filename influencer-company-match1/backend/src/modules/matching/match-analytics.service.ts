import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchHistory } from './entities/match-history.entity';
import { Connection, ConnectionStatus } from './entities/connection.entity';
import { CollaborationOutcome } from '../ai-matching/entities/collaboration-outcome.entity';

export interface MatchAnalytics {
  viewCount: number;
  interactionCount: number;
  lastInteraction?: Date;
  similarMatchesSuccess: number;
}

@Injectable()
export class MatchAnalyticsService {
  constructor(
    @InjectRepository(MatchHistory)
    private matchHistoryRepository: Repository<MatchHistory>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    @InjectRepository(CollaborationOutcome)
    private collaborationOutcomeRepository: Repository<CollaborationOutcome>,
  ) {}

  /**
   * Get analytics for a specific match
   */
  async getMatchAnalytics(userId: string, matchUserId: string): Promise<MatchAnalytics> {
    try {
      // Get view count from match history
      const viewCount = await this.matchHistoryRepository.count({
        where: {
          userId,
          matchUserId,
        },
      });

      // Get interaction count (connections, messages, etc.)
      const interactions = await this.connectionRepository.find({
        where: [
          { requesterId: userId, recipientId: matchUserId },
          { requesterId: matchUserId, recipientId: userId },
        ],
      });

      const interactionCount = interactions.length;
      const lastInteraction = interactions.length > 0
        ? interactions.reduce((latest, conn) => 
            conn.updatedAt > latest ? conn.updatedAt : latest, 
            interactions[0].updatedAt
          )
        : undefined;

      // Calculate similar matches success rate
      const similarMatchesSuccess = await this.calculateSimilarMatchesSuccess(userId, matchUserId);

      return {
        viewCount,
        interactionCount,
        lastInteraction,
        similarMatchesSuccess,
      };
    } catch (error) {
      console.error('[MatchAnalyticsService] Error getting match analytics:', error);
      // Return default values on error
      return {
        viewCount: 0,
        interactionCount: 0,
        similarMatchesSuccess: 0,
      };
    }
  }

  /**
   * Record a match view
   */
  async recordMatchView(userId: string, matchUserId: string, score: number, factors: any): Promise<void> {
    try {
      // This is already handled by MatchHistoryService.recordMatch
      // But we can add additional tracking here if needed
      console.log(`[MatchAnalyticsService] View recorded: ${userId} -> ${matchUserId}`);
    } catch (error) {
      console.error('[MatchAnalyticsService] Error recording match view:', error);
    }
  }

  /**
   * Record a match interaction (click, message, collaborate)
   */
  async recordMatchInteraction(
    userId: string, 
    matchUserId: string, 
    type: 'view' | 'click' | 'message' | 'collaborate'
  ): Promise<void> {
    try {
      // For now, interactions are tracked through connections
      // Future: Could create a dedicated match_interactions table
      console.log(`[MatchAnalyticsService] Interaction recorded: ${userId} -> ${matchUserId} (${type})`);
    } catch (error) {
      console.error('[MatchAnalyticsService] Error recording interaction:', error);
    }
  }

  /**
   * Calculate success rate of similar matches
   */
  private async calculateSimilarMatchesSuccess(userId: string, matchUserId: string): Promise<number> {
    try {
      // Get all connections for this user
      const userConnections = await this.connectionRepository.find({
        where: [
          { requesterId: userId },
          { recipientId: userId },
        ],
      });

      if (userConnections.length === 0) {
        return 0;
      }

      // Get successful collaborations (rating >= 4 and completed)
      const allOutcomes = await this.collaborationOutcomeRepository.find({
        where: {
          userId,
        },
      });

      const successfulCollaborations = allOutcomes.filter(
        outcome => outcome.successRating >= 4 && outcome.completionStatus === 'completed'
      ).length;

      // Calculate success rate
      const successRate = (successfulCollaborations / userConnections.length) * 100;
      return Math.round(successRate);
    } catch (error) {
      console.error('[MatchAnalyticsService] Error calculating similar matches success:', error);
      return 0;
    }
  }

  /**
   * Get aggregated analytics for a user
   */
  async getUserAnalytics(userId: string): Promise<{
    totalViews: number;
    totalInteractions: number;
    averageSuccessRate: number;
  }> {
    try {
      const totalViews = await this.matchHistoryRepository.count({
        where: { userId },
      });

      const totalInteractions = await this.connectionRepository.count({
        where: [
          { requesterId: userId },
          { recipientId: userId },
        ],
      });

      const allOutcomes = await this.collaborationOutcomeRepository.find({
        where: { userId },
      });

      const successfulCollaborations = allOutcomes.filter(
        outcome => outcome.successRating >= 4 && outcome.completionStatus === 'completed'
      ).length;

      const totalCollaborations = allOutcomes.length;

      const averageSuccessRate = totalCollaborations > 0
        ? Math.round((successfulCollaborations / totalCollaborations) * 100)
        : 0;

      return {
        totalViews,
        totalInteractions,
        averageSuccessRate,
      };
    } catch (error) {
      console.error('[MatchAnalyticsService] Error getting user analytics:', error);
      return {
        totalViews: 0,
        totalInteractions: 0,
        averageSuccessRate: 0,
      };
    }
  }
}
