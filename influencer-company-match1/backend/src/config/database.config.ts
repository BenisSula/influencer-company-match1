import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { User } from '../modules/auth/entities/user.entity';
import { InfluencerProfile } from '../modules/auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../modules/auth/entities/company-profile.entity';
import { Connection } from '../modules/matching/entities/connection.entity';
import { Match } from '../modules/matching/entities/match.entity';
import { MatchHistory } from '../modules/matching/entities/match-history.entity';
import { FilterPreset } from '../modules/matching/entities/filter-preset.entity';
import { ProfileReview } from '../modules/profiles/entities/profile-review.entity';
import { SavedProfile } from '../modules/profiles/entities/saved-profile.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { Message } from '../modules/messaging/entities/message.entity';
import { Conversation } from '../modules/messaging/entities/conversation.entity';
import { FeedPost } from '../modules/feed/entities/feed-post.entity';
import { Collection } from '../modules/feed/entities/collection.entity';
import { Campaign } from '../modules/campaigns/entities/campaign.entity';
import { Collaboration } from '../modules/campaigns/entities/collaboration.entity';
import { CampaignApplication } from '../modules/campaigns/entities/campaign-application.entity';
import { Testimonial } from '../modules/landing/entities/testimonial.entity';
import { LandingStatistic } from '../modules/landing/entities/landing-statistic.entity';
import { LandingActivity } from '../modules/landing/entities/landing-activity.entity';
import { MarketRate } from '../modules/landing/entities/market-rate.entity';
import { IndustryBenchmark } from '../modules/landing/entities/industry-benchmark.entity';
import { LandingAnalytics } from '../modules/landing/entities/landing-analytics.entity';
import { Wallet } from '../modules/wallet/entities/wallet.entity';
import { Transaction } from '../modules/wallet/entities/transaction.entity';
import { Payout } from '../modules/wallet/entities/payout.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Invoice } from '../modules/payments/entities/invoice.entity';
import { ChatbotConversation } from '../modules/chatbot/entities/chatbot-conversation.entity';
import { ChatbotMessage } from '../modules/chatbot/entities/chatbot-message.entity';
import { ChatbotIntent } from '../modules/chatbot/entities/chatbot-intent.entity';
import { UserSettings } from '../modules/settings/entities/user-settings.entity';
import { SearchAnalytics } from '../modules/search/entities/search-analytics.entity';
import { Experiment } from '../modules/experiments/entities/experiment.entity';
import { Recommendation } from '../modules/ai-matching/entities/recommendation.entity';
import { MLModel } from '../modules/ai-matching/entities/ml-model.entity';
import { CollaborationOutcome } from '../modules/ai-matching/entities/collaboration-outcome.entity';

const logger = new Logger('DatabaseConfig');

// Support both individual DB variables and DATABASE_URL
const getDatabaseUrl = (): string | undefined => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return undefined;
};

// FORCE synchronize for initial deployment
// Can be disabled later by setting DISABLE_SYNC=true
const isProduction = process.env.NODE_ENV === 'production';
const forceSyncForInitialDeploy = process.env.FORCE_SYNC === 'true' || process.env.DB_SYNCHRONIZE === 'true';
const synchronizeEnabled = forceSyncForInitialDeploy || (!isProduction && process.env.NODE_ENV === 'development');

logger.log(`Environment: ${process.env.NODE_ENV}`);
logger.log(`Database synchronize enabled: ${synchronizeEnabled}`);
logger.log(`Database URL: ${getDatabaseUrl() ? 'set' : 'not set'}`);
logger.log(`FORCE_SYNC: ${process.env.FORCE_SYNC}`);
logger.log(`DB_SYNCHRONIZE: ${process.env.DB_SYNCHRONIZE}`);

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: getDatabaseUrl(),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'influencer_matching',
  // Explicitly list all entities to ensure they are all registered
  entities: [
    User,
    InfluencerProfile,
    CompanyProfile,
    Connection,
    Match,
    MatchHistory,
    FilterPreset,
    ProfileReview,
    SavedProfile,
    Notification,
    Message,
    Conversation,
    FeedPost,
    Collection,
    Campaign,
    Collaboration,
    CampaignApplication,
    Testimonial,
    LandingStatistic,
    LandingActivity,
    MarketRate,
    IndustryBenchmark,
    LandingAnalytics,
    Wallet,
    Transaction,
    Payout,
    Payment,
    Invoice,
    ChatbotConversation,
    ChatbotMessage,
    ChatbotIntent,
    UserSettings,
    SearchAnalytics,
    Experiment,
    Recommendation,
    MLModel,
    CollaborationOutcome,
  ],
  // In production, use synchronize if FORCE_SYNC or DB_SYNCHRONIZE is true
  // This allows initial table creation on first deployment
  synchronize: synchronizeEnabled,
  // Disable migrations for now since we're using synchronize
  migrationsRun: false,
  migrations: [],
  logging: process.env.NODE_ENV === 'development' || process.env.DB_LOGGING === 'true',
  extra: {
    connectionLimit: 5,
  },
  retryAttempts: 5,
  retryDelay: 5000,
};
