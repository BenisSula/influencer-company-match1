import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsTrackingService } from './analytics-tracking.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsTrackingService: AnalyticsTrackingService,
  ) {}

  @Post('profile-view')
  async recordProfileView(
    @Request() req: any,
    @Body() body: { profileId: string; source?: string; viewDuration?: number },
  ) {
    await this.analyticsTrackingService.recordProfileView(
      body.profileId,
      req.user.sub,
      body.source,
      body.viewDuration,
    );
    return { success: true };
  }

  @Post('match-impressions')
  async recordMatchImpressions(
    @Request() req: any,
    @Body() body: {
      matches: Array<{ matchUserId: string; matchScore: number; position: number }>;
      source: string;
    },
  ) {
    await this.analyticsTrackingService.recordMatchImpressions(
      req.user.sub,
      body.matches,
      body.source,
    );
    return { success: true };
  }

  @Post('match-click')
  async recordMatchClick(
    @Request() req: any,
    @Body() body: { matchUserId: string },
  ) {
    await this.analyticsTrackingService.recordMatchClick(req.user.sub, body.matchUserId);
    return { success: true };
  }

  @Get('my-analytics')
  async getMyAnalytics(@Request() req: any) {
    const analytics = await this.analyticsTrackingService.getUserAnalytics(req.user.sub);
    const responseRate = await this.analyticsTrackingService.calculateResponseRate(req.user.sub);

    return {
      profileViews: analytics.totalProfileViews,
      matchImpressions: analytics.totalMatchImpressions,
      profileClicks: analytics.totalProfileClicks,
      connectionsSent: analytics.totalConnectionsSent,
      connectionsReceived: analytics.totalConnectionsReceived,
      messagesSent: analytics.totalMessagesSent,
      messagesReceived: analytics.totalMessagesReceived,
      responseRate,
      trend: responseRate >= 70 ? 'up' : responseRate >= 50 ? 'stable' : 'down',
    };
  }

  @Get('profile-views/:profileId')
  async getProfileViews(
    @Param('profileId') profileId: string,
  ) {
    const count = await this.analyticsTrackingService.getProfileViewsCount(profileId);
    return { count };
  }
}
