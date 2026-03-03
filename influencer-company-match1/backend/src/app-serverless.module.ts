import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';

// Load environment variables for serverless
config();

import { databaseConfig } from './config/database.config';
import stripeConfig from './config/stripe.config';

// Import only serverless-compatible modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { FeedModule } from './modules/feed/feed.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { SearchModule } from './modules/search/search.module';
import { AIMatchingModule } from './modules/ai-matching/ai-matching.module';
import { ExperimentsModule } from './modules/experiments/experiments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LandingModule } from './modules/landing/landing.module';

// NOTE: Excluded modules that don't work in serverless:
// - MessagingModule (WebSockets)
// - ChatbotModule (WebSockets)
// - EmailModule (Bull queues)
// - BullModule (Redis queues)
// - CacheModule (Redis)

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [stripeConfig],
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      // Serverless optimizations
      extra: {
        max: 1, // Single connection per function
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
      },
      logging: false,
    }),
    // Core modules that work in serverless
    AuthModule,
    UsersModule,
    ProfilesModule,
    MatchingModule,
    ConnectionsModule,
    FeedModule,
    MediaModule,
    SettingsModule,
    CampaignsModule,
    SearchModule,
    AIMatchingModule,
    ExperimentsModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
    PaymentsModule,
    LandingModule,
  ],
})
export class AppServerlessModule {}
