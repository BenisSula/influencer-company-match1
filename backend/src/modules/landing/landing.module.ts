import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { PlatformMetricsService } from './platform-metrics.service';
import { LandingGateway } from './landing.gateway';
import { LandingStatistic } from './entities/landing-statistic.entity';
import { Testimonial } from './entities/testimonial.entity';
import { LandingAnalytics } from './entities/landing-analytics.entity';
import { LandingActivity } from './entities/landing-activity.entity';
import { User } from '../auth/entities/user.entity';
import { Connection } from '../matching/entities/connection.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';
import { Message } from '../messaging/entities/message.entity';
import { FeedPost } from '../feed/entities/feed-post.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { CampaignApplication } from '../campaigns/entities/campaign-application.entity';
import { Collaboration } from '../campaigns/entities/collaboration.entity';
import { UserBan } from '../admin/entities/user-ban.entity';
import { ContentFlag } from '../admin/entities/content-flag.entity';
import { ProfileReview } from '../profiles/entities/profile-review.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LandingStatistic,
      Testimonial,
      LandingAnalytics,
      LandingActivity,
      User,
      Connection,
      UserSettings,
      Message,
      FeedPost,
      Campaign,
      CampaignApplication,
      Collaboration,
      UserBan,
      ContentFlag,
      ProfileReview
    ]),
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL in seconds
      max: 100, // maximum number of items in cache
    }),
    EventEmitterModule.forRoot(),
    EmailModule,
  ],
  controllers: [LandingController],
  providers: [LandingService, PlatformMetricsService, LandingGateway],
  exports: [LandingService, PlatformMetricsService, LandingGateway]
})
export class LandingModule {}
