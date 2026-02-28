import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIMatchingService } from './ai-matching.service';
import { MLModelService } from './ml-model.service';
import { RecommendationService } from './recommendation.service';
import { AnalyticsService } from './analytics.service';
import { CollaborationOutcomeService, RecordOutcomeDto } from './collaboration-outcome.service';

@Controller('ai-matching')
@UseGuards(JwtAuthGuard)
export class AIMatchingController {
  constructor(
    private readonly aiMatchingService: AIMatchingService,
    private readonly mlModelService: MLModelService,
    private readonly recommendationService: RecommendationService,
    private readonly analyticsService: AnalyticsService,
    private readonly collaborationOutcomeService: CollaborationOutcomeService,
  ) {}

  @Get('matches')
  async getEnhancedMatches(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.aiMatchingService.getEnhancedMatches(req.user.userId, limitNum);
  }

  @Get('matches/:targetUserId')
  async getEnhancedMatch(
    @Request() req: any,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.aiMatchingService.getEnhancedMatch(req.user.userId, targetUserId);
  }

  @Post('matches/:targetUserId/outcome')
  async recordMatchOutcome(
    @Request() req: any,
    @Param('targetUserId') targetUserId: string,
    @Body() body: { outcome: boolean; successScore: number },
  ) {
    await this.aiMatchingService.recordMatchOutcome(
      req.user.userId,
      targetUserId,
      body.outcome,
      body.successScore,
    );
    return { success: true };
  }

  @Get('feature-importance')
  async getFeatureImportance() {
    return this.aiMatchingService.getFeatureImportance();
  }

  @Get('recommendations')
  async getRecommendations(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.recommendationService.getPersonalizedRecommendations(req.user.userId, limitNum);
  }

  @Get('recommendations/trending')
  async getTrendingMatches(
    @Request() req: any,
    @Query('niche') niche?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.recommendationService.getTrendingMatches(req.user.userId, niche, limitNum);
  }

  @Get('recommendations/similar')
  async getSimilarProfiles(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.recommendationService.getSimilarProfiles(req.user.userId, limitNum);
  }

  @Get('recommendations/collaborative')
  async getCollaborativeRecommendations(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.recommendationService.getCollaborativeRecommendations(req.user.userId, limitNum);
  }

  @Get('analytics/metrics')
  async getQualityMetrics() {
    return this.analyticsService.getMatchQualityMetrics();
  }

  @Get('analytics/trends')
  async getPerformanceTrends(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 30;
    return this.analyticsService.getPerformanceTrends(daysNum);
  }

  // Collaboration Outcome Endpoints
  @Post('outcomes')
  async recordCollaborationOutcome(
    @Request() req: any,
    @Body() body: RecordOutcomeDto,
  ) {
    return this.collaborationOutcomeService.recordOutcome(req.user.userId, body);
  }

  @Get('outcomes/my')
  async getMyOutcomes(@Request() req: any) {
    return this.collaborationOutcomeService.getOutcomesByUser(req.user.userId);
  }

  @Get('outcomes/connection/:connectionId')
  async getOutcomeByConnection(
    @Request() req: any,
    @Param('connectionId') connectionId: string,
  ) {
    return this.collaborationOutcomeService.getOutcomeByConnection(connectionId, req.user.userId);
  }

  @Get('outcomes/stats')
  async getMyCollaborationStats(@Request() req: any) {
    return this.collaborationOutcomeService.getCollaborationStats(req.user.userId);
  }

  @Get('outcomes/success-rate')
  async getMySuccessRate(@Request() req: any) {
    const rate = await this.collaborationOutcomeService.getSuccessRate(req.user.userId);
    return { successRate: rate };
  }

  @Get('outcomes/recent')
  async getRecentOutcomes(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.collaborationOutcomeService.getRecentOutcomes(limitNum);
  }

  @Get('outcomes/high-performing')
  async getHighPerformingCollaborations(@Query('minRating') minRating?: string) {
    const rating = minRating ? parseInt(minRating) : 4;
    return this.collaborationOutcomeService.getHighPerformingCollaborations(rating);
  }

  @Get('compatibility/:targetUserId')
  async getCompatibilityScore(
    @Request() req: any,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.aiMatchingService.getCompatibilityScore(req.user.userId, targetUserId);
  }
}
