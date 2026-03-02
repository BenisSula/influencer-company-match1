import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { LandingService } from './landing.service';
import { PlatformMetricsService } from './platform-metrics.service';
import { VisitorTrackingDto, ActivityTrackingDto, ROICalculationDto } from './dto/newsletter-subscription.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('landing')
export class LandingController {
  constructor(
    private readonly landingService: LandingService,
    private readonly platformMetricsService: PlatformMetricsService,
  ) {}

  @Get('statistics')
  @Public()
  async getStatistics() {
    return await this.landingService.getStatistics();
  }

  @Get('statistics/realtime')
  @Public()
  async getRealtimeStatistics() {
    return await this.landingService.getRealtimeStatistics();
  }

  @Get('testimonials')
  @Public()
  async getTestimonials() {
    return await this.landingService.getTestimonials();
  }

  @Post('analytics/track')
  @Public()
  async trackVisitor(@Body() dto: VisitorTrackingDto, @Req() request: any) {
    return await this.landingService.trackVisitor(dto, request);
  }

  @Get('activities/recent')
  @Public()
  async getRecentActivities(@Query('limit') limit?: number) {
    return await this.landingService.getRecentActivities(limit || 10);
  }

  @Post('activities/track')
  @Public()
  async trackActivity(@Body() dto: ActivityTrackingDto) {
    return await this.landingService.trackActivity(dto);
  }

  @Get('market-rates')
  @Public()
  async getMarketRates() {
    return await this.landingService.getMarketRates();
  }

  @Post('calculate-roi')
  @Public()
  async calculateROI(@Body() dto: ROICalculationDto) {
    return await this.landingService.calculateROI(dto);
  }

  @Get('features')
  @Public()
  async getFeatures() {
    // Return platform metrics for features section
    return await this.platformMetricsService.getAllPlatformMetrics();
  }

  @Get('comparisons')
  @Public()
  async getComparisons() {
    // Return static comparison data (this is marketing content, not dynamic)
    return [
      {
        feature: 'AI-Powered Matching',
        icmatch: '89% accuracy',
        competitor1: 'Basic filters',
        competitor2: '78% accuracy',
        competitor3: 'Manual search'
      },
      {
        feature: 'Real-Time Analytics',
        icmatch: 'Live dashboard',
        competitor1: 'Daily reports',
        competitor2: false,
        competitor3: 'Weekly reports'
      },
      {
        feature: 'Automated Outreach',
        icmatch: 'Smart templates',
        competitor1: false,
        competitor2: 'Basic templates',
        competitor3: 'Manual only'
      },
      {
        feature: 'Campaign Management',
        icmatch: 'Full automation',
        competitor1: 'Partial',
        competitor2: 'Manual tracking',
        competitor3: 'Basic tools'
      }
    ];
  }

  @Get('ratings')
  @Public()
  async getPlatformRatings() {
    return await this.landingService.getPlatformRatings();
  }
}