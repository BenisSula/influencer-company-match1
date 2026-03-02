import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileView } from './entities/profile-view.entity';
import { MatchImpression } from './entities/match-impression.entity';
import { UserAnalytics } from './entities/user-analytics.entity';
import { AnalyticsTrackingService } from './analytics-tracking.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileView,
      MatchImpression,
      UserAnalytics,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsTrackingService],
  exports: [AnalyticsTrackingService],
})
export class AnalyticsModule {}
