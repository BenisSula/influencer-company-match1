import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { InfluencerProfile } from './entities/influencer-profile.entity';
import { CompanyProfile } from './entities/company-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InfluencerProfile, CompanyProfile])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
