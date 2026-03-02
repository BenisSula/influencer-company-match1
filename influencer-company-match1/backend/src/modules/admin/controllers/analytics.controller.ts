import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AnalyticsService } from '../services/analytics.service';

@Controller('admin/analytics')
@UseGuards(AdminAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getOverview(start, end);
  }

  @Get('users')
  async getUserAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getUserAnalytics(start, end);
  }

  @Get('revenue')
  async getRevenueStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getRevenueStats(start, end);
  }

  @Get('engagement')
  async getEngagementMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getEngagementMetrics(start, end);
  }

  @Get('campaigns')
  async getCampaignAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getCampaignAnalytics(start, end);
  }

  @Get('matches')
  async getMatchAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getMatchAnalytics(start, end);
  }

  @Post('export')
  async exportData(
    @Body() body: { type: string; startDate?: string; endDate?: string },
  ) {
    const start = body.startDate ? new Date(body.startDate) : undefined;
    const end = body.endDate ? new Date(body.endDate) : undefined;
    return this.analyticsService.exportData(body.type, start, end);
  }
}
