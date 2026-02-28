import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { FeedPost } from '../feed/entities/feed-post.entity';
import { Campaign, CampaignStatus } from '../campaigns/entities/campaign.entity';
import { SearchAnalytics } from './entities/search-analytics.entity';
import { SearchQueryDto, SearchResultsDto } from './dto/search-query.dto';
import { SearchResultDto, SearchResponseDto, TrendingSearchDto } from './dto/search-result.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InfluencerProfile)
    private influencerProfileRepository: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @InjectRepository(FeedPost)
    private feedPostRepository: Repository<FeedPost>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(SearchAnalytics)
    private searchAnalyticsRepository: Repository<SearchAnalytics>,
  ) {}

  async searchUsers(query: string, userId: string, options: SearchQueryDto): Promise<SearchResultDto[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return [];

    // Search opposite role
    const oppositeRole = user.role === UserRole.INFLUENCER ? UserRole.COMPANY : UserRole.INFLUENCER;
    
    const users = await this.userRepository.find({
      where: { role: oppositeRole, isActive: true },
      take: options.limit || 10,
    });

    const results: SearchResultDto[] = [];

    for (const targetUser of users) {
      let profile: any;
      let name: string;
      let subtitle: string;
      let avatarUrl: string | undefined;

      if (targetUser.role === UserRole.INFLUENCER) {
        profile = await this.influencerProfileRepository.findOne({
          where: { userId: targetUser.id },
        });
        if (!profile) continue;

        name = profile.name || profile.niche || 'Influencer';
        subtitle = profile.niche || '';
        avatarUrl = profile.avatarUrl;

        // Filter by search query
        const searchText = `${name} ${profile.bio || ''} ${profile.niche || ''} ${profile.location || ''}`.toLowerCase();
        if (!searchText.includes(query.toLowerCase())) continue;

        // Apply filters
        if (options.location && profile.location !== options.location) continue;
        if (options.niche && profile.niche !== options.niche) continue;

      } else {
        profile = await this.companyProfileRepository.findOne({
          where: { userId: targetUser.id },
        });
        if (!profile) continue;

        name = profile.companyName || 'Company';
        subtitle = profile.industry || '';
        avatarUrl = profile.avatarUrl;

        // Filter by search query
        const searchText = `${name} ${profile.bio || ''} ${profile.industry || ''} ${profile.location || ''}`.toLowerCase();
        if (!searchText.includes(query.toLowerCase())) continue;

        // Apply filters
        if (options.location && profile.location !== options.location) continue;
        if (options.industry && profile.industry !== options.industry) continue;
      }

      results.push({
        id: targetUser.id,
        type: 'user',
        title: name,
        subtitle,
        avatarUrl,
        metadata: {
          role: targetUser.role,
          location: profile.location,
          ...profile,
        },
      });
    }

    return results;
  }

  async searchPosts(query: string, userId: string, options: SearchQueryDto): Promise<SearchResultDto[]> {
    const posts = await this.feedPostRepository.find({
      where: {},
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: options.limit || 10,
    });

    const results: SearchResultDto[] = [];

    for (const post of posts) {
      const searchText = post.content.toLowerCase();
      if (!searchText.includes(query.toLowerCase())) continue;

      // Get author profile
      let authorName = 'User';
      let avatarUrl: string | undefined;

      if (post.author.role === UserRole.INFLUENCER) {
        const profile = await this.influencerProfileRepository.findOne({
          where: { userId: post.author.id },
        });
        authorName = profile?.name || 'Influencer';
        avatarUrl = profile?.avatarUrl;
      } else {
        const profile = await this.companyProfileRepository.findOne({
          where: { userId: post.author.id },
        });
        authorName = profile?.name || 'Company'; // ✅ Fixed from companyName
        avatarUrl = profile?.avatarUrl;
      }

      results.push({
        id: post.id,
        type: 'post',
        title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        subtitle: `by ${authorName}`,
        avatarUrl,
        metadata: {
          authorId: post.authorId,
          authorName,
          createdAt: post.createdAt,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
        },
      });
    }

    return results;
  }

  async searchCampaigns(query: string, userId: string, options: SearchQueryDto): Promise<SearchResultDto[]> {
    const campaigns = await this.campaignRepository.find({
      where: { status: CampaignStatus.ACTIVE },
      relations: ['company'],
      order: { createdAt: 'DESC' },
      take: options.limit || 10,
    });

    const results: SearchResultDto[] = [];

    for (const campaign of campaigns) {
      const searchText = `${campaign.title} ${campaign.description}`.toLowerCase();
      if (!searchText.includes(query.toLowerCase())) continue;

      // Get company profile
      const companyProfile = await this.companyProfileRepository.findOne({
        where: { userId: campaign.company.id },
      });

      results.push({
        id: campaign.id,
        type: 'campaign',
        title: campaign.title,
        subtitle: companyProfile?.name || 'Company', // ✅ Fixed from companyName
        avatarUrl: companyProfile?.avatarUrl,
        metadata: {
          budgetMin: campaign.budgetMin,
          budgetMax: campaign.budgetMax,
          applicationDeadline: campaign.applicationDeadline,
          status: campaign.status,
          applicationsCount: campaign.applications?.length || 0,
        },
      });
    }

    return results;
  }

  async searchAll(query: string, userId: string, options: SearchQueryDto): Promise<SearchResponseDto> {
    const [users, posts, campaigns] = await Promise.all([
      this.searchUsers(query, userId, { ...options, limit: 5 }),
      this.searchPosts(query, userId, { ...options, limit: 5 }),
      this.searchCampaigns(query, userId, { ...options, limit: 5 }),
    ]);

    const results = [...users, ...posts, ...campaigns];

    return {
      results,
      total: results.length,
    };
  }

  async getTrending(limit: number = 10): Promise<TrendingSearchDto[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trending = await this.searchAnalyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('analytics.created_at >= :date', { date: sevenDaysAgo })
      .groupBy('analytics.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return trending.map(item => ({
      query: item.query,
      count: parseInt(item.count),
      trend: 'stable' as const,
    }));
  }

  async trackSearch(userId: string, query: string, resultType: string, resultCount: number): Promise<void> {
    await this.searchAnalyticsRepository.save({
      userId,
      query,
      resultType,
      resultCount,
    });
  }

  async trackSearchClick(userId: string, query: string, resultId: string): Promise<void> {
    await this.searchAnalyticsRepository.save({
      userId,
      query,
      clickedResultId: resultId,
      resultCount: 0,
    });
  }
}
