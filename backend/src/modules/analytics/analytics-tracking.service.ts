import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileView } from './entities/profile-view.entity';
import { MatchImpression } from './entities/match-impression.entity';
import { UserAnalytics } from './entities/user-analytics.entity';

@Injectable()
export class AnalyticsTrackingService {
  private readonly logger = new Logger(AnalyticsTrackingService.name);

  constructor(
    @InjectRepository(ProfileView)
    private profileViewRepository: Repository<ProfileView>,
    @InjectRepository(MatchImpression)
    private matchImpressionRepository: Repository<MatchImpression>,
    @InjectRepository(UserAnalytics)
    private userAnalyticsRepository: Repository<UserAnalytics>,
  ) {}

  /**
   * Record a profile view
   */
  async recordProfileView(
    profileId: string,
    viewerId?: string,
    source?: string,
    viewDuration?: number,
  ): Promise<void> {
    try {
      const view = this.profileViewRepository.create({
        profileId,
        viewerId,
        source,
        viewDuration,
      });

      await this.profileViewRepository.save(view);

      // Update user analytics summary
      await this.incrementUserAnalytics(profileId, 'totalProfileViews');

      this.logger.log(`Recorded profile view: ${profileId} by ${viewerId || 'anonymous'}`);
    } catch (error) {
      this.logger.error(`Failed to record profile view: ${error.message}`);
    }
  }

  /**
   * Record match impressions (batch)
   */
  async recordMatchImpressions(
    userId: string,
    matches: Array<{ matchUserId: string; matchScore: number; position: number }>,
    source: string,
  ): Promise<void> {
    try {
      const impressions = matches.map((match, index) =>
        this.matchImpressionRepository.create({
          userId,
          matchUserId: match.matchUserId,
          matchScore: match.matchScore,
          position: match.position || index,
          source,
          clicked: false,
        }),
      );

      await this.matchImpressionRepository.save(impressions);

      // Update user analytics summary for each match user
      for (const match of matches) {
        await this.incrementUserAnalytics(match.matchUserId, 'totalMatchImpressions');
      }

      this.logger.log(`Recorded ${matches.length} match impressions for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to record match impressions: ${error.message}`);
    }
  }

  /**
   * Record match click
   */
  async recordMatchClick(userId: string, matchUserId: string): Promise<void> {
    try {
      // Find the most recent impression and mark as clicked
      const impression = await this.matchImpressionRepository.findOne({
        where: { userId, matchUserId, clicked: false },
        order: { createdAt: 'DESC' },
      });

      if (impression) {
        impression.clicked = true;
        await this.matchImpressionRepository.save(impression);
      }

      // Update user analytics
      await this.incrementUserAnalytics(matchUserId, 'totalProfileClicks');

      this.logger.log(`Recorded match click: ${userId} -> ${matchUserId}`);
    } catch (error) {
      this.logger.error(`Failed to record match click: ${error.message}`);
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    let analytics = await this.userAnalyticsRepository.findOne({
      where: { userId },
    });

    if (!analytics) {
      // Create new analytics record
      analytics = this.userAnalyticsRepository.create({ userId });
      await this.userAnalyticsRepository.save(analytics);
    }

    return analytics;
  }

  /**
   * Get profile views count
   */
  async getProfileViewsCount(profileId: string, days?: number): Promise<number> {
    const query = this.profileViewRepository
      .createQueryBuilder('view')
      .where('view.profile_id = :profileId', { profileId });

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query.andWhere('view.created_at >= :startDate', { startDate });
    }

    return query.getCount();
  }

  /**
   * Get match impressions count
   */
  async getMatchImpressionsCount(matchUserId: string, days?: number): Promise<number> {
    const query = this.matchImpressionRepository
      .createQueryBuilder('impression')
      .where('impression.match_user_id = :matchUserId', { matchUserId });

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query.andWhere('impression.created_at >= :startDate', { startDate });
    }

    return query.getCount();
  }

  /**
   * Calculate response rate
   */
  async calculateResponseRate(userId: string): Promise<number> {
    const analytics = await this.getUserAnalytics(userId);
    
    const totalReceived = analytics.totalConnectionsReceived + analytics.totalMessagesReceived;
    const totalResponded = analytics.totalConnectionsSent + analytics.totalMessagesSent;

    if (totalReceived === 0) return 0;

    return Math.round((totalResponded / totalReceived) * 100 * 100) / 100;
  }

  /**
   * Increment user analytics counter
   */
  private async incrementUserAnalytics(
    userId: string,
    field: keyof UserAnalytics,
  ): Promise<void> {
    try {
      // Get or create analytics record
      let analytics = await this.userAnalyticsRepository.findOne({
        where: { userId },
      });

      if (!analytics) {
        analytics = this.userAnalyticsRepository.create({
          userId,
          totalProfileViews: field === 'totalProfileViews' ? 1 : 0,
          totalMatchImpressions: field === 'totalMatchImpressions' ? 1 : 0,
          totalProfileClicks: field === 'totalProfileClicks' ? 1 : 0,
          totalConnectionsSent: field === 'totalConnectionsSent' ? 1 : 0,
          totalConnectionsReceived: field === 'totalConnectionsReceived' ? 1 : 0,
          totalMessagesSent: field === 'totalMessagesSent' ? 1 : 0,
          totalMessagesReceived: field === 'totalMessagesReceived' ? 1 : 0,
        });
      } else {
        // Type-safe increment
        const currentValue = analytics[field];
        if (typeof currentValue === 'number') {
          (analytics as any)[field] = currentValue + 1;
        }
      }

      await this.userAnalyticsRepository.save(analytics);
    } catch (error) {
      this.logger.error(`Failed to increment ${field} for user ${userId}: ${error.message}`);
    }
  }
}
