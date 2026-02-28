import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { SavedProfile } from './entities/saved-profile.entity';
import { ProfileReview } from './entities/profile-review.entity';
import { CreateInfluencerProfileDto } from './dto/create-influencer-profile.dto';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto';
import { UpdateInfluencerProfileDto } from './dto/update-influencer-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { v4 as uuidv4 } from 'uuid';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  caption?: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(InfluencerProfile)
    private readonly influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private readonly companyRepo: Repository<CompanyProfile>,
    @InjectRepository(SavedProfile)
    private readonly savedProfileRepo: Repository<SavedProfile>,
    @InjectRepository(ProfileReview)
    private readonly reviewRepo: Repository<ProfileReview>,
  ) {}

  async createInfluencerProfile(
    userId: string,
    dto: CreateInfluencerProfileDto,
  ): Promise<InfluencerProfile> {
    const profile = this.influencerRepo.create({
      ...dto,
      userId,
    });
    return this.influencerRepo.save(profile);
  }

  async createCompanyProfile(
    userId: string,
    dto: CreateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const profile = this.companyRepo.create({
      ...dto,
      userId,
    });
    return this.companyRepo.save(profile);
  }

  async getInfluencerProfile(userId: string): Promise<InfluencerProfile> {
    const profile = await this.influencerRepo.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }
    return profile;
  }

  async getCompanyProfile(userId: string): Promise<CompanyProfile> {
    const profile = await this.companyRepo.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Company profile not found');
    }
    return profile;
  }

  async getAllInfluencers(): Promise<InfluencerProfile[]> {
    return this.influencerRepo.find();
  }

  async getAllCompanies(): Promise<CompanyProfile[]> {
    return this.companyRepo.find();
  }

  async getProfileByUserId(userId: string): Promise<any> {
    // Try to find influencer profile first
    const influencerProfile = await this.influencerRepo.findOne({
      where: { userId },
    });

    if (influencerProfile) {
      return {
        id: userId, // ✅ Return user ID, not profile ID
        profileId: influencerProfile.id, // Add separate profileId field
        name: influencerProfile.name || influencerProfile.niche || 'Influencer',
        type: 'influencer',
        niche: influencerProfile.niche,
        audienceSize: influencerProfile.audienceSize,
        engagementRate: Number(influencerProfile.engagementRate),
        location: influencerProfile.location,
        platforms: influencerProfile.platforms,
        bio: influencerProfile.bio,
        avatarUrl: influencerProfile.avatarUrl,
        portfolioUrl: influencerProfile.portfolioUrl,
        budgetRange: {
          min: influencerProfile.minBudget,
          max: influencerProfile.maxBudget,
        },
        contentType: influencerProfile.contentType, // ✅ Restored - field now exists in entity
        collaborationPreference: influencerProfile.collaborationPreference,
        verificationStatus: influencerProfile.verificationStatus, // ✅ Restored - field now exists in entity
        createdAt: influencerProfile.createdAt,
        updatedAt: influencerProfile.updatedAt,
      };
    }

    // Try to find company profile
    const companyProfile = await this.companyRepo.findOne({
      where: { userId },
    });

    if (companyProfile) {
      return {
        id: userId, // ✅ Return user ID, not profile ID
        profileId: companyProfile.id, // Add separate profileId field
        name: companyProfile.name, // ✅ Changed from companyName
        type: 'company',
        industry: companyProfile.industry,
        budget: companyProfile.budget,
        location: companyProfile.location,
        platforms: companyProfile.platforms,
        bio: companyProfile.bio, // ✅ Keep as bio, not description
        description: companyProfile.bio, // Also provide as description for compatibility
        avatarUrl: companyProfile.avatarUrl,
        website: companyProfile.website,
        budgetRange: {
          min: companyProfile.budget ? Math.round(companyProfile.budget * 0.8) : null,
          max: companyProfile.budget ? Math.round(companyProfile.budget * 1.2) : null,
        }, // ✅ Fixed: Use budget fields, not audience size
        verificationStatus: companyProfile.verificationStatus,
        companySize: companyProfile.companySize,
        campaignType: companyProfile.campaignType,
        preferredInfluencerNiches: companyProfile.preferredInfluencerNiches,
        collaborationDuration: companyProfile.collaborationDuration,
        createdAt: companyProfile.createdAt,
        updatedAt: companyProfile.updatedAt,
      };
    }

    throw new NotFoundException('Profile not found');
  }

  async getUserIdFromProfileId(profileId: string): Promise<{ userId: string }> {
    // Try influencer profile first
    const influencerProfile = await this.influencerRepo.findOne({
      where: { id: profileId },
    });

    if (influencerProfile) {
      return { userId: influencerProfile.userId };
    }

    // Try company profile
    const companyProfile = await this.companyRepo.findOne({
      where: { id: profileId },
    });

    if (companyProfile) {
      return { userId: companyProfile.userId };
    }

    throw new NotFoundException('Profile not found');
  }

  async getInfluencerById(id: string): Promise<InfluencerProfile> {
    const profile = await this.influencerRepo.findOne({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }
    return profile;
  }

  async getCompanyById(id: string): Promise<CompanyProfile> {
    const profile = await this.companyRepo.findOne({
      where: { id },
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
    // Get profile
    const profile = await this.influencerRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }

    // Simple file validation (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Get media type from MIME type
    const mediaType = file.mimetype.startsWith('image/') ? 'image' : 
                      file.mimetype.startsWith('video/') ? 'video' : 'other';

    // Create media item with metadata
    const mediaItem: MediaItem = {
      id: uuidv4(),
      url: `/uploads/media/${file.filename}`,
      type: mediaType,
      caption: caption || undefined,
      uploadedAt: new Date(),
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    // ✅ DISABLED: mediaGallery field doesn't exist in InfluencerProfile entity
    // Add to gallery
    // const currentGallery = profile.mediaGallery || [];
    // profile.mediaGallery = [...currentGallery, mediaItem];

    // Save profile
    // await this.influencerRepo.save(profile);

    // TODO: Implement media storage in separate media_files table
    throw new Error('Media gallery feature not yet implemented');
    
    // return mediaItem;
  }

  /**
   * Delete media from influencer profile gallery
   * ✅ DISABLED: mediaGallery field doesn't exist in InfluencerProfile entity
   */
  async deleteMedia(profileId: string, mediaId: string): Promise<void> {
    // TODO: Implement media deletion from media_files table
    throw new Error('Media gallery feature not yet implemented');
    
    /* const profile = await this.influencerRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }

    if (!profile.mediaGallery) {
      throw new NotFoundException('Media item not found');
    }

    const mediaIndex = profile.mediaGallery.findIndex((m: MediaItem) => m.id === mediaId);

    if (mediaIndex === -1) {
      throw new NotFoundException('Media item not found');
    }

    // Remove media item
    profile.mediaGallery = profile.mediaGallery.filter((m: MediaItem) => m.id !== mediaId);

    // Save profile
    await this.influencerRepo.save(profile); */
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
    });

    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }

    // Update profile with provided fields
    Object.assign(profile, dto);

    // Save and return updated profile
    return this.influencerRepo.save(profile);
  }

  async updateCompanyProfile(
    profileId: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfile> {
    const profile = await this.companyRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Company profile not found');
    }

    // Update profile with provided fields
    Object.assign(profile, dto);

    // Save and return updated profile
    return this.companyRepo.save(profile);
  }

  async saveProfile(userId: string, profileId: string, notes?: string, tags?: string[]): Promise<SavedProfile> {
    // Check if already saved
    const existing = await this.savedProfileRepo.findOne({
      where: { userId, savedProfileId: profileId }
    });
    
    if (existing) {
      // Update notes/tags if provided
      if (notes !== undefined) existing.notes = notes;
      if (tags !== undefined) existing.tags = tags;
      return this.savedProfileRepo.save(existing);
    }
    
    const savedProfile = this.savedProfileRepo.create({
      userId,
      savedProfileId: profileId,
      notes,
      tags,
    });
    
    return this.savedProfileRepo.save(savedProfile);
  }

  async unsaveProfile(userId: string, profileId: string): Promise<void> {
    await this.savedProfileRepo.delete({
      userId,
      savedProfileId: profileId,
    });
  }

  async getSavedProfiles(userId: string): Promise<any[]> {
    const saved = await this.savedProfileRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    
    // Get full profile data for each saved profile
    const profiles = await Promise.all(
      saved.map(async (s) => {
        const profile = await this.getProfileByUserId(s.savedProfileId);
        return {
          ...profile,
          savedAt: s.createdAt,
          notes: s.notes,
          tags: s.tags,
        };
      })
    );
    
    return profiles;
  }

  async isProfileSaved(userId: string, profileId: string): Promise<boolean> {
    const count = await this.savedProfileRepo.count({
      where: { userId, savedProfileId: profileId },
    });
    return count > 0;
  }

  // Review Methods
  async createReview(
    reviewerId: string,
    profileId: string,
    dto: CreateReviewDto,
  ): Promise<ProfileReview> {
    // Check if reviewer is trying to review themselves
    if (reviewerId === profileId) {
      throw new BadRequestException('You cannot review your own profile');
    }

    // Check if review already exists for this connection
    if (dto.connectionId) {
      const existing = await this.reviewRepo.findOne({
        where: {
          profileId,
          reviewerId,
          connectionId: dto.connectionId,
        },
      });

      if (existing) {
        throw new BadRequestException('You have already reviewed this collaboration');
      }
    }

    const review = this.reviewRepo.create({
      profileId,
      reviewerId,
      ...dto,
    });

    return this.reviewRepo.save(review);
  }

  async getProfileReviews(profileId: string, limit: number = 10): Promise<ProfileReview[]> {
    return this.reviewRepo.find({
      where: { profileId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getProfileRatings(profileId: string): Promise<{
    overall: number;
    communication: number;
    professionalism: number;
    quality: number;
    timeliness: number;
    totalReviews: number;
    ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  }> {
    const reviews = await this.reviewRepo.find({
      where: { profileId },
    });

    if (reviews.length === 0) {
      return {
        overall: 0,
        communication: 0,
        professionalism: 0,
        quality: 0,
        timeliness: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.overallRating as 1 | 2 | 3 | 4 | 5]++;
    });

    const avgRating = (ratings: (number | null)[]) => {
      const valid = ratings.filter((r) => r !== null) as number[];
      return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    };

    return {
      overall: avgRating(reviews.map((r) => r.overallRating)),
      communication: avgRating(reviews.map((r) => r.communicationRating)),
      professionalism: avgRating(reviews.map((r) => r.professionalismRating)),
      quality: avgRating(reviews.map((r) => r.qualityRating)),
      timeliness: avgRating(reviews.map((r) => r.timelinessRating)),
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    };
  }

  async markReviewHelpful(reviewId: string): Promise<ProfileReview> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.helpfulCount++;
    return this.reviewRepo.save(review);
  }

  // Admin Review Management Methods
  async getAllReviews(): Promise<ProfileReview[]> {
    return this.reviewRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async toggleReviewFeature(reviewId: string, featured: boolean): Promise<void> {
    await this.reviewRepo.update(reviewId, { isFeatured: featured });
  }

  // Public Testimonials Method
  async getTestimonials(limit: number = 6): Promise<any[]> {
    const reviews = await this.reviewRepo.find({
      where: { isFeatured: true },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return reviews.map(review => ({
      id: review.id,
      rating: review.overallRating,
      comment: review.comment,
      reviewerName: review.reviewer?.name || 'Anonymous',
      reviewerAvatar: review.reviewer?.avatarUrl || null,
      reviewerRole: review.reviewer?.role || 'influencer',
      createdAt: review.createdAt,
    }));
  }

  // Platform Ratings Method
  async getPlatformRatings(): Promise<any> {
    const reviews = await this.reviewRepo.find({
      relations: ['reviewer'],
    });

    const total = reviews.length;
    if (total === 0) {
      return { 
        average: 0, 
        total: 0, 
        distribution: [],
        verifiedCount: 0,
        verifiedPercentage: 0,
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.overallRating, 0);
    const average = sum / total;

    // Distribution
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (r.overallRating >= 1 && r.overallRating <= 5) {
        dist[r.overallRating]++;
      }
    });

    const distribution = Object.entries(dist).map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage: (count / total) * 100,
    })).reverse(); // Sort 5 to 1

    // Verified count (reviews from users with verified email)
    const verifiedCount = reviews.filter(r => r.reviewer?.emailVerified).length;

    return {
      average: parseFloat(average.toFixed(1)),
      total,
      distribution,
      verifiedCount,
      verifiedPercentage: parseFloat(((verifiedCount / total) * 100).toFixed(1)),
    };
  }
}
