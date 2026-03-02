import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { CompanyProfile } from '../profiles/entities/company-profile.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectRepository(InfluencerProfile)
    private readonly influencerProfileRepo: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private readonly companyProfileRepo: Repository<CompanyProfile>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByIdWithProfile(id: string): Promise<any> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let profile = null;
    let profileData = null;

    if (user.role === UserRole.INFLUENCER) {
      profile = await this.influencerProfileRepo.findOne({
        where: { user: { id } },
      });
      if (profile) {
        profileData = {
          id: profile.id,
          name: profile.bio ? profile.bio.split('.')[0] : user.email.split('@')[0],
          type: 'influencer',
          niche: profile.niche,
          industry: undefined,
          audienceSize: profile.audienceSize,
          engagementRate: Number(profile.engagementRate),
          budget: undefined,
          location: profile.location,
          platforms: profile.platforms,
          bio: profile.bio,
          description: undefined,
          portfolioUrl: profile.portfolioUrl,
          website: undefined,
          budgetRange: {
            min: profile.minBudget,
            max: profile.maxBudget,
          },
          contentType: profile.contentType,
          collaborationPreference: profile.collaborationPreference,
          verificationStatus: profile.verificationStatus,
          companySize: undefined,
          campaignType: undefined,
        };
      }
    } else if (user.role === UserRole.COMPANY) {
      profile = await this.companyProfileRepo.findOne({
        where: { user: { id } },
      });
      if (profile) {
        profileData = {
          id: profile.id,
          name: profile.companyName,
          type: 'company',
          niche: undefined,
          industry: profile.industry,
          audienceSize: undefined,
          engagementRate: undefined,
          budget: profile.budget,
          location: profile.targetLocation,
          platforms: profile.targetPlatforms,
          bio: undefined,
          description: profile.description,
          portfolioUrl: undefined,
          website: profile.website,
          budgetRange: {
            min: profile.minAudienceSize,
            max: profile.maxAudienceSize,
          },
          contentType: undefined,
          collaborationPreference: undefined,
          verificationStatus: profile.verificationStatus,
          companySize: profile.companySize,
          campaignType: profile.campaignType,
        };
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: profileData,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(email: string, password: string, role: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersRepository.create({
      email,
      password: hashedPassword,
      role: role as any,
    });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
