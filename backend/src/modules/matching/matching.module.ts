import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { MatchingEngineService } from './matching-engine.service';
import { FilterPresetController } from './filter-preset.controller';
import { FilterPresetService } from './filter-preset.service';
import { Match } from './entities/match.entity';
import { FilterPreset } from './entities/filter-preset.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { CompanyProfile } from '../profiles/entities/company-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, FilterPreset, InfluencerProfile, CompanyProfile]),
    ProfilesModule,
  ],
  controllers: [MatchingController, FilterPresetController],
  providers: [MatchingService, MatchingEngineService, FilterPresetService],
  exports: [MatchingService, FilterPresetService],
})
export class MatchingModule {}
