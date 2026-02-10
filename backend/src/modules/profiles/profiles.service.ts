import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfluencerProfile, MediaItem } from './entities/influencer-profile.entity';
import { CompanyProfile } from './entities/company-profile.entity';
import { CreateInfluencerProfileDto } from './dto/create-influencer-profile.dto';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto';
import { UpdateInfluencerProfileDto } from './dto/update-influencer-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { User } from '../users/entities/user.entity';
import { validateFileSize, getMediaType } from '../../common/utils/file-upload.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(InfluencerProfile)
    private readonly influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private readonly companyRepo: Repository<CompanyProfile>,
  ) {}

  async createInfluencerProfile(
    userId: string,
    dto: CreateInfluencerProfileDto,
  ): Promise<InfluencerProfile> {
    const profile = this.influencerRepo.create({
      ...dto,
      user: { id: userId } as User,
    });
    return this.influencerRepo.save(profile);
  }

  async createCompanyProfile(
    userId: string,
    dto: CreateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const profile = this.companyRepo.create({
      ...dto,
      user: { id: userId } as User,
    });
    return this.companyRepo.save(profile);
  }

  async getInfluencerProfile(userId: string): Promise<InfluencerProfile> {
    const profile = await this.influencerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }
    return profile;
  }

  async getCompanyProfile(userId: string): Promise<CompanyProfile> {
    const profile = await this.companyRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Company profile not found');
    }
    return profile;
  }

  async getAllInfluencers(): Promise<InfluencerProfile[]> {
    return this.influencerRepo.find({ relations: ['user'] });
  }

  async getAllCompanies(): Promise<CompanyProfile[]> {
    return this.companyRepo.find({ relations: ['user'] });
  }

  async getProfileByUserId(userId: string): Promise<any> {
    // Try to find influencer profile first
    const influencerProfile = await this.influencerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (influencerProfile) {
      return {
        id: influencerProfile.id,
        name: influencerProfile.bio ? influencerProfile.bio.split('.')[0] : influencerProfile.user.email.split('@')[0],
        type: 'influencer',
        niche: influencerProfile.niche,
        audienceSize: influencerProfile.audienceSize,
        engagementRate: Number(influencerProfile.engagementRate),
        location: influencerProfile.location,
        platforms: influencerProfile.platforms,
        bio: influencerProfile.bio,
        portfolioUrl: influencerProfile.portfolioUrl,
        budgetRange: {
          min: influencerProfile.minBudget,
          max: influencerProfile.maxBudget,
        },
        contentType: influencerProfile.contentType,
        collaborationPreference: influencerProfile.collaborationPreference,
        verificationStatus: influencerProfile.verificationStatus,
      };
    }

    // Try to find company profile
    const companyProfile = await this.companyRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (companyProfile) {
      return {
        id: companyProfile.id,
        name: companyProfile.companyName,
        type: 'company',
        industry: companyProfile.industry,
        budget: companyProfile.budget,
        location: companyProfile.targetLocation,
        platforms: companyProfile.targetPlatforms,
        description: companyProfile.description,
        website: companyProfile.website,
        budgetRange: {
          min: companyProfile.minAudienceSize,
          max: companyProfile.maxAudienceSize,
        },
        verificationStatus: companyProfile.verificationStatus,
        companySize: companyProfile.companySize,
        campaignType: companyProfile.campaignType,
      };
    }

    throw new NotFoundException('Profile not found');
  }

  async getInfluencerById(id: string): Promise<InfluencerProfile> {
    const profile = await this.influencerRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }
    return profile;
  }

  async getCompanyById(id: string): Promise<CompanyProfile> {
    const profile = await this.companyRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Company profile not found');
    }
    return profile;
  }

  /**
   * Upload media to influencer profile gallery
   * Validates: Requirements 1.1.6, 1.1.7, 1.1.8, 1.1.9
   */
  async uploadMedia(
    profileId: string,
    file: Express.Multer.File,
    caption?: string,
  ): Promise<MediaItem> {
    // Validate file size (max 10MB)
    // Validates: Requirements 1.1.8
    validateFileSize(file);

    // Get profile
    const profile = await this.influencerRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }

    // Get media type from MIME type
    // Validates: Requirements 1.1.7
    const mediaType = getMediaType(file.mimetype);

    // Create media item with metadata
    // Validates: Requirements 1.1.9
    const mediaItem: MediaItem = {
      id: uuidv4(),
      url: `/uploads/media/${file.filename}`,
      type: mediaType,
      caption: caption || undefined,
      uploadedAt: new Date(),
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    // Add to gallery
    const currentGallery = profile.mediaGallery || [];
    profile.mediaGallery = [...currentGallery, mediaItem];

    // Save profile
    await this.influencerRepo.save(profile);

    return mediaItem;
  }

  /**
   * Delete media from influencer profile gallery
   */
  async deleteMedia(profileId: string, mediaId: string): Promise<void> {
    const profile = await this.influencerRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }

    if (!profile.mediaGallery) {
      throw new NotFoundException('Media item not found');
    }

    const mediaIndex = profile.mediaGallery.findIndex((m) => m.id === mediaId);

    if (mediaIndex === -1) {
      throw new NotFoundException('Media item not found');
    }

    // Remove media item
    profile.mediaGallery = profile.mediaGallery.filter((m) => m.id !== mediaId);

    // Save profile
    await this.influencerRepo.save(profile);
  }

  /**
   * Update influencer profile with new fields
   * Validates: Requirements 1.1.1-1.1.9
   */
  async updateInfluencerProfile(
    profileId: string,
    dto: UpdateInfluencerProfileDto,
  ): Promise<InfluencerProfile> {
    const profile = await this.influencerRepo.findOne({
      where: { id: profileId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }

    // Update profile with provided fields
    Object.assign(profile, dto);

    // Save and return updated profile
    return this.influencerRepo.save(profile);
  }

  /**
   * Update company profile with new fields
   * Validates: Requirements 1.2.1-1.2.7
   */
  async updateCompanyProfile(
    profileId: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const profile = await this.companyRepo.findOne({
      where: { id: profileId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Company profile not found');
    }

    // Update profile with provided fields
    Object.assign(profile, dto);

    // Save and return updated profile
    return this.companyRepo.save(profile);
  }
}
