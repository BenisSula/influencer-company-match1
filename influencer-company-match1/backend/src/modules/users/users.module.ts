import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { CompanyProfile } from '../profiles/entities/company-profile.entity';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, InfluencerProfile, CompanyProfile])],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
