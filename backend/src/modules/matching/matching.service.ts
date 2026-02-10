import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchingEngineService } from './matching-engine.service';
import { ProfilesService } from '../profiles/profiles.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { MatchFiltersDto } from './dto/match-filters.dto';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';
import { CompanyProfile } from '../profiles/entities/company-profile.entity';

export interface PaginatedMatchResponse {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(InfluencerProfile)
    private readonly influencerRepo: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private readonly companyRepo: Repository<CompanyProfile>,
    private readonly matchingEngine: MatchingEngineService,
    private readonly profilesService: ProfilesService,
  ) {}

  async getMatchesForUser(user: User, filters?: MatchFiltersDto) {
    try {
      if (user.role === UserRole.INFLUENCER) {
        return await this.getMatchesForInfluencer(user.id, filters);
      } else if (user.role === UserRole.COMPANY) {
        return await this.getMatchesForCompany(user.id, filters);
      }
      return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('Error getting matches for user:', error);
      // Return empty result instead of throwing error
      return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  }

  private async getMatchesForInfluencer(
    userId: string,
    filters?: MatchFiltersDto,
  ): Promise<PaginatedMatchResponse> {
    try {
      const influencerProfile = await this.profilesService.getInfluencerProfile(userId);
      
      // Check if profile is complete enough for matching
      if (!influencerProfile.niche || !influencerProfile.platforms || influencerProfile.platforms.length === 0) {
        console.log('Influencer profile incomplete, returning empty matches');
        return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }
      
      // Build query with filters
      const query = this.buildCompanyFilterQuery(filters);
      
      // Get filtered companies
      const companies = await query.getMany();

      // Filter out companies with incomplete profiles
      const validCompanies = companies.filter(
        company => company.industry && company.targetPlatforms && company.targetPlatforms.length > 0
      );

      // Calculate match scores
      let matches = validCompanies.map((company) => {
        const matchResult = this.matchingEngine.calculateMatch(influencerProfile, company);
        return {
          id: `${influencerProfile.id}-${company.id}`,
          profile: {
            id: company.id,
            name: company.companyName,
            type: 'company',
            industry: company.industry,
            budget: company.budget,
            location: company.targetLocation,
            platforms: company.targetPlatforms,
            description: company.description,
            website: company.website,
            companySize: company.companySize,
            campaignType: company.campaignType,
            verificationStatus: company.verificationStatus,
          },
          score: matchResult.score,
          tier: matchResult.tier,
          breakdown: matchResult.breakdown,
        };
      });

      // Apply sorting
      matches = this.applySorting(matches, filters?.sortBy, filters?.sortOrder);

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const total = matches.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedMatches = matches.slice(skip, skip + limit);

      return {
        data: paginatedMatches,
        meta: { page, limit, total, totalPages },
      };
    } catch (error) {
      console.error('Error in getMatchesForInfluencer:', error);
      return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  }

  private async getMatchesForCompany(
    userId: string,
    filters?: MatchFiltersDto,
  ): Promise<PaginatedMatchResponse> {
    try {
      const companyProfile = await this.profilesService.getCompanyProfile(userId);
      
      // Check if profile is complete enough for matching
      if (!companyProfile.industry || !companyProfile.targetPlatforms || companyProfile.targetPlatforms.length === 0) {
        console.log('Company profile incomplete, returning empty matches');
        return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }
      
      // Build query with filters
      const query = this.buildInfluencerFilterQuery(filters);
      
      // Get filtered influencers
      const influencers = await query.getMany();

      // Filter out influencers with incomplete profiles
      const validInfluencers = influencers.filter(
        influencer => influencer.niche && influencer.platforms && influencer.platforms.length > 0
      );

      // Calculate match scores
      let matches = validInfluencers.map((influencer) => {
        const matchResult = this.matchingEngine.calculateMatch(influencer, companyProfile);
        return {
          id: `${influencer.id}-${companyProfile.id}`,
          profile: {
            id: influencer.id,
            name: influencer.user?.email || 'Influencer',
            type: 'influencer',
            niche: influencer.niche,
            audienceSize: influencer.audienceSize,
            engagementRate: influencer.engagementRate,
            location: influencer.location,
            platforms: influencer.platforms,
            bio: influencer.bio,
            portfolioUrl: influencer.portfolioUrl,
            budgetRange: {
              min: influencer.minBudget,
              max: influencer.maxBudget,
            },
            contentType: influencer.contentType,
            collaborationPreference: influencer.collaborationPreference,
            verificationStatus: influencer.verificationStatus,
          },
          score: matchResult.score,
          tier: matchResult.tier,
          breakdown: matchResult.breakdown,
        };
      });

      // Apply sorting
      matches = this.applySorting(matches, filters?.sortBy, filters?.sortOrder);

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const total = matches.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedMatches = matches.slice(skip, skip + limit);

      return {
        data: paginatedMatches,
        meta: { page, limit, total, totalPages },
      };
    } catch (error) {
      console.error('Error in getMatchesForCompany:', error);
      return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  }

  private buildInfluencerFilterQuery(
    filters?: MatchFiltersDto,
  ): SelectQueryBuilder<InfluencerProfile> {
    const query = this.influencerRepo
      .createQueryBuilder('influencer')
      .leftJoinAndSelect('influencer.user', 'user');

    if (!filters) {
      return query;
    }

    // Niche filter
    if (filters.niches && filters.niches.length > 0) {
      query.andWhere('influencer.niche IN (:...niches)', { niches: filters.niches });
    }

    // Location filter
    if (filters.locations && filters.locations.length > 0) {
      query.andWhere('influencer.location IN (:...locations)', { locations: filters.locations });
    }

    // Budget range filter
    if (filters.minBudget !== undefined) {
      query.andWhere('influencer.maxBudget >= :minBudget', { minBudget: filters.minBudget });
    }
    if (filters.maxBudget !== undefined) {
      query.andWhere('influencer.minBudget <= :maxBudget', { maxBudget: filters.maxBudget });
    }

    // Audience size range filter
    if (filters.minAudienceSize !== undefined) {
      query.andWhere('influencer.audienceSize >= :minAudienceSize', {
        minAudienceSize: filters.minAudienceSize,
      });
    }
    if (filters.maxAudienceSize !== undefined) {
      query.andWhere('influencer.audienceSize <= :maxAudienceSize', {
        maxAudienceSize: filters.maxAudienceSize,
      });
    }

    // Platform filter (array overlap)
    if (filters.platforms && filters.platforms.length > 0) {
      query.andWhere('influencer.platforms && ARRAY[:...platforms]::varchar[]', {
        platforms: filters.platforms,
      });
    }

    // Engagement rate filter
    if (filters.minEngagementRate !== undefined) {
      query.andWhere('influencer.engagementRate >= :minEngagementRate', {
        minEngagementRate: filters.minEngagementRate,
      });
    }

    // Verification status filter
    if (filters.verifiedOnly === true) {
      query.andWhere('influencer.verificationStatus = :verified', { verified: true });
    }

    // Content type filter (array overlap)
    if (filters.contentTypes && filters.contentTypes.length > 0) {
      query.andWhere('influencer.contentType && ARRAY[:...contentTypes]::varchar[]', {
        contentTypes: filters.contentTypes,
      });
    }

    // Collaboration preference filter
    if (filters.collaborationPreferences && filters.collaborationPreferences.length > 0) {
      query.andWhere('influencer.collaborationPreference IN (:...collaborationPreferences)', {
        collaborationPreferences: filters.collaborationPreferences,
      });
    }

    return query;
  }

  private buildCompanyFilterQuery(
    filters?: MatchFiltersDto,
  ): SelectQueryBuilder<CompanyProfile> {
    const query = this.companyRepo
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.user', 'user');

    if (!filters) {
      return query;
    }

    // Niche filter (industry)
    if (filters.niches && filters.niches.length > 0) {
      query.andWhere('company.industry IN (:...niches)', { niches: filters.niches });
    }

    // Location filter
    if (filters.locations && filters.locations.length > 0) {
      query.andWhere('company.targetLocation IN (:...locations)', {
        locations: filters.locations,
      });
    }

    // Budget range filter
    if (filters.minBudget !== undefined) {
      query.andWhere('company.budget >= :minBudget', { minBudget: filters.minBudget });
    }
    if (filters.maxBudget !== undefined) {
      query.andWhere('company.budget <= :maxBudget', { maxBudget: filters.maxBudget });
    }

    // Audience size range filter (for companies, this maps to their target audience size)
    if (filters.minAudienceSize !== undefined) {
      query.andWhere('company.minAudienceSize <= :minAudienceSize', {
        minAudienceSize: filters.minAudienceSize,
      });
    }
    if (filters.maxAudienceSize !== undefined) {
      query.andWhere('company.maxAudienceSize >= :maxAudienceSize', {
        maxAudienceSize: filters.maxAudienceSize,
      });
    }

    // Platform filter (array overlap)
    if (filters.platforms && filters.platforms.length > 0) {
      query.andWhere('company.targetPlatforms && ARRAY[:...platforms]::varchar[]', {
        platforms: filters.platforms,
      });
    }

    // Verification status filter
    if (filters.verifiedOnly === true) {
      query.andWhere('company.verificationStatus = :verified', { verified: true });
    }

    // Campaign type filter (array overlap)
    if (filters.campaignTypes && filters.campaignTypes.length > 0) {
      query.andWhere('company.campaignType && ARRAY[:...campaignTypes]::varchar[]', {
        campaignTypes: filters.campaignTypes,
      });
    }

    // Company size filter
    if (filters.companySizes && filters.companySizes.length > 0) {
      query.andWhere('company.companySize IN (:...companySizes)', {
        companySizes: filters.companySizes,
      });
    }

    return query;
  }

  private applySorting(matches: any[], sortBy?: string, sortOrder?: 'asc' | 'desc'): any[] {
    if (!sortBy) {
      // Default: sort by score descending
      return matches.sort((a, b) => b.score - a.score);
    }

    const order = sortOrder === 'asc' ? 1 : -1;

    switch (sortBy) {
      case 'score':
        return matches.sort((a, b) => (a.score - b.score) * order);
      
      case 'audienceSize':
        return matches.sort((a, b) => {
          const aSize = a.profile.audienceSize || 0;
          const bSize = b.profile.audienceSize || 0;
          return (aSize - bSize) * order;
        });
      
      case 'engagementRate':
        return matches.sort((a, b) => {
          const aRate = a.profile.engagementRate || 0;
          const bRate = b.profile.engagementRate || 0;
          return (aRate - bRate) * order;
        });
      
      case 'recentActivity':
        // For now, maintain score order as we don't have activity tracking yet
        return matches.sort((a, b) => b.score - a.score);
      
      default:
        return matches.sort((a, b) => b.score - a.score);
    }
  }
}
