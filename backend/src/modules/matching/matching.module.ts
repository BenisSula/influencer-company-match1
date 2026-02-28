import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { MatchHistoryService } from './match-history.service';
import { MatchAnalyticsService } from './match-analytics.service';
import { Match } from './entities/match.entity';
import { Connection } from './entities/connection.entity';
import { MatchHistory } from './entities/match-history.entity';
import { User } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { CollaborationOutcome } from '../ai-matching/entities/collaboration-outcome.entity';
import { AuthModule } from '../auth/auth.module';
import { MessagingModule } from '../messaging/messaging.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { LandingModule } from '../landing/landing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Match, 
      Connection, 
      MatchHistory, 
      User, 
      InfluencerProfile, 
      CompanyProfile,
      CollaborationOutcome,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => MessagingModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => LandingModule),
    NotificationsModule,
  ],
  controllers: [MatchingController],
  providers: [MatchingService, MatchHistoryService, MatchAnalyticsService],
  exports: [MatchingService, MatchHistoryService, MatchAnalyticsService],
})
export class MatchingModule {}
