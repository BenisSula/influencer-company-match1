import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TenantMiddleware } from '../../common/middleware/tenant.middleware';
import { Tenant } from './entities/tenant.entity';
import { AdminUser } from './entities/admin-user.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Subscription } from './entities/subscription.entity';
import { Payment } from './entities/payment.entity';
import { Invoice } from './entities/invoice.entity';
import { PlatformConfig } from './entities/platform-config.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { AdminAnalytics } from './entities/admin-analytics.entity';
import { ContentFlag } from './entities/content-flag.entity';
import { UserBan } from './entities/user-ban.entity';
import { SystemConfig } from './entities/system-config.entity';
import { ProfileReview } from '../profiles/entities/profile-review.entity';
import { User } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { Match } from '../matching/entities/match.entity';
import { Connection } from '../matching/entities/connection.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Message } from '../messaging/entities/message.entity';
import { FeedPost } from '../feed/entities/feed-post.entity';
import { PostComment } from '../feed/entities/post-comment.entity';
import { TenantService } from './services/tenant.service';
import { AdminAuthService } from './services/admin-auth.service';
import { StripeService } from './services/stripe.service';
import { UserManagementService } from './services/user-management.service';
import { BrandingService } from './services/branding.service';
import { EmailTemplateService } from './services/email-template.service';
import { AnalyticsService } from './services/analytics.service';
import { ModerationService } from './services/moderation.service';
import { SystemSettingsService } from './services/system-settings.service';
import { ReviewsService } from './services/reviews.service';
import { SettingsGateway } from './gateways/settings.gateway';
import { TenantController } from './controllers/tenant.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { PaymentController } from './controllers/payment.controller';
import { UserManagementController } from './controllers/user-management.controller';
import { BrandingController } from './controllers/branding.controller';
import { BrandingAliasController } from './controllers/branding-alias.controller';
import { FeaturesAliasController } from './controllers/features-alias.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ModerationController } from './controllers/moderation.controller';
import { SystemSettingsController } from './controllers/system-settings.controller';
import { ReviewsController } from './controllers/reviews.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      AdminUser,
      AuditLog,
      Subscription,
      Payment,
      Invoice,
      PlatformConfig,
      EmailTemplate,
      AdminAnalytics,
      ContentFlag,
      UserBan,
      SystemConfig,
      User,
      InfluencerProfile,
      CompanyProfile,
      Match,
      Connection,
      Campaign,
      Message,
      FeedPost,
      PostComment,
      ProfileReview,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    TenantController,
    AdminAuthController,
    PaymentController,
    UserManagementController,
    BrandingController,
    BrandingAliasController,
    FeaturesAliasController,
    AnalyticsController,
    ModerationController,
    SystemSettingsController,
    ReviewsController,
  ],
  providers: [
    TenantService,
    AdminAuthService,
    StripeService,
    UserManagementService,
    BrandingService,
    EmailTemplateService,
    AnalyticsService,
    ModerationService,
    SystemSettingsService,
    ReviewsService,
    TenantMiddleware,
    SettingsGateway,
  ],
  exports: [
    TenantService,
    AdminAuthService,
    StripeService,
    UserManagementService,
    BrandingService,
    EmailTemplateService,
    AnalyticsService,
    ModerationService,
    SystemSettingsService,
    ReviewsService,
    SettingsGateway,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('admin/*');
  }
}
