import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { databaseConfig } from './config/database.config';
import stripeConfig from './config/stripe.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { FeedModule } from './modules/feed/feed.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { SearchModule } from './modules/search/search.module';
import { AIMatchingModule } from './modules/ai-matching/ai-matching.module';
import { ExperimentsModule } from './modules/experiments/experiments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CacheModule } from './cache/cache.module';
import { AdminModule } from './modules/admin/admin.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LandingModule } from './modules/landing/landing.module';
import { EmailModule } from './modules/email/email.module';

// Conditional Bull module configuration
const getBullModuleConfig = () => {
  const redisEnabled = process.env.REDIS_ENABLED === 'true';
  
  if (!redisEnabled) {
    return null;
  }

  return BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      lazyConnect: true,
    },
  });
};

const bullModuleConfig = getBullModuleConfig();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [stripeConfig],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ...(bullModuleConfig ? [bullModuleConfig] : []),
    CacheModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    MatchingModule,
    ConnectionsModule,
    FeedModule,
    MessagingModule,
    MediaModule,
    SettingsModule,
    CampaignsModule,
    SearchModule,
    AIMatchingModule,
    ExperimentsModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
    ChatbotModule,
    PaymentsModule,
    LandingModule,
    EmailModule,
  ],
})
export class AppModule {}
