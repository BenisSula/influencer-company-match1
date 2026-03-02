import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsController, CollaborationsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './entities/campaign.entity';
import { CampaignApplication } from './entities/campaign-application.entity';
import { Collaboration } from './entities/collaboration.entity';
import { CampaignMilestone } from './entities/campaign-milestone.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      CampaignApplication,
      Collaboration,
      CampaignMilestone,
    ]),
    PaymentsModule,
  ],
  controllers: [CampaignsController, CollaborationsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
