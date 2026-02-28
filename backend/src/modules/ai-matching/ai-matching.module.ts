import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIMatchingService } from './ai-matching.service';
import { AIMatchingController } from './ai-matching.controller';
import { MLModelService } from './ml-model.service';
import { RecommendationService } from './recommendation.service';
import { AnalyticsService } from './analytics.service';
import { FeatureEngineeringService } from './feature-engineering.service';
import { CollaborationOutcomeService } from './collaboration-outcome.service';
import { MatchTrainingData } from './entities/match-training-data.entity';
import { MLModel } from './entities/ml-model.entity';
import { Recommendation } from './entities/recommendation.entity';
import { CollaborationOutcome } from './entities/collaboration-outcome.entity';
import { User } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { Connection } from '../matching/entities/connection.entity';
import { FeedPost } from '../feed/entities/feed-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MatchTrainingData,
      MLModel,
      Recommendation,
      CollaborationOutcome,
      User,
      InfluencerProfile,
      CompanyProfile,
      Connection,
      FeedPost,
    ]),
  ],
  controllers: [AIMatchingController],
  providers: [
    AIMatchingService,
    MLModelService,
    RecommendationService,
    AnalyticsService,
    FeatureEngineeringService,
    CollaborationOutcomeService,
  ],
  exports: [
    AIMatchingService,
    MLModelService,
    RecommendationService,
    AnalyticsService,
    FeatureEngineeringService,
    CollaborationOutcomeService,
  ],
})
export class AIMatchingModule {}
