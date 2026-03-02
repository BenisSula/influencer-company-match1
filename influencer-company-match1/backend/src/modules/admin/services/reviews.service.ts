import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileReview } from '../../profiles/entities/profile-review.entity';
import { User } from '../../auth/entities/user.entity';
import { InfluencerProfile } from '../../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../../auth/entities/company-profile.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ProfileReview)
    private reviewRepository: Repository<ProfileReview>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
  ) {}

  async getAllReviews(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Enrich reviews with user names
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await this.userRepository.findOne({ where: { id: review.reviewerId } });
        
        // Get profile name based on profileId
        let profileName = 'Unknown';
        const influencerProfile = await this.influencerProfileRepository.findOne({ 
          where: { id: review.profileId },
          relations: ['user'],
        });
        if (influencerProfile) {
          profileName = influencerProfile.name || influencerProfile.user?.email || 'Influencer';
        } else {
          const companyProfile = await this.companyProfileRepository.findOne({ 
            where: { id: review.profileId },
            relations: ['user'],
          });
          if (companyProfile) {
            profileName = companyProfile.name || companyProfile.user?.email || 'Company';
          }
        }

        return {
          ...review,
          reviewerName: reviewer?.email || 'Unknown',
          profileName,
        };
      })
    );

    const featured = reviews.filter(r => r.isFeatured).length;
    const averageRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / total
      : 0;

    return {
      data: enrichedReviews,
      total,
      featured,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  async getReview(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async toggleFeatured(id: string, featured: boolean) {
    const review = await this.getReview(id);
    review.isFeatured = featured;
    return await this.reviewRepository.save(review);
  }

  async deleteReview(id: string) {
    const review = await this.getReview(id);
    await this.reviewRepository.remove(review);
  }

  async getReviewStats() {
    const total = await this.reviewRepository.count();
    const featured = await this.reviewRepository.count({ where: { isFeatured: true } });
    
    const reviews = await this.reviewRepository.find();
    const averageRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / total
      : 0;

    return {
      total,
      featured,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }
}
