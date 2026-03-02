import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchHistory } from './entities/match-history.entity';
import { User } from '../auth/entities/user.entity';

interface MatchRecord {
  matchUserId: string;
  score: number;
  factors: {
    nicheCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    engagementTierMatch: number;
    audienceSizeMatch: number;
    locationCompatibility: number;
  };
  userWeights?: Record<string, number>;
}

interface HistoryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
  limit?: number;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

interface MatchAnalytics {
  averageScore: {
    current: number;
    previous: number;
    change: number;
  };
  scoreDistribution: {
    perfect: number;
    excellent: number;
    good: number;
    fair: number;
  };
  factorTrends: {
    [factor: string]: {
      average: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
  };
  topMatches: any[];
  newMatchesCount: number;
}

export { MatchRecord, HistoryFilters, MatchAnalytics, PaginationOptions, PaginatedResult };

@Injectable()
export class MatchHistoryService {
  private readonly logger = new Logger(MatchHistoryService.name);

  constructor(
    @InjectRepository(MatchHistory)
    private matchHistoryRepository: Repository<MatchHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async recordMatch(userId: string, matchData: MatchRecord): Promise<void> {
    const historyRecord = this.matchHistoryRepository.create({
      userId,
      matchUserId: matchData.matchUserId,
      score: matchData.score,
      factors: matchData.factors,
      userWeights: matchData.userWeights,
    });

    await this.matchHistoryRepository.save(historyRecord);
    this.logger.log(`Recorded match history for user ${userId} with score ${matchData.score}`);
  }

  async getHistory(userId: string, filters?: HistoryFilters): Promise<MatchHistory[]> {
    const query = this.matchHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.matchUser', 'matchUser')
      .where('history.userId = :userId', { userId })
      .orderBy('history.createdAt', 'DESC');

    if (filters?.dateFrom) {
      query.andWhere('history.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('history.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters?.minScore) {
      query.andWhere('history.score >= :minScore', { minScore: filters.minScore });
    }

    if (filters?.maxScore) {
      query.andWhere('history.score <= :maxScore', { maxScore: filters.maxScore });
    }

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
  }

  async getHistoryPaginated(
    userId: string,
    filters?: HistoryFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MatchHistory>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.matchHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.matchUser', 'matchUser')
      .where('history.userId = :userId', { userId })
      .orderBy('history.createdAt', 'DESC');

    // Apply filters
    if (filters?.dateFrom) {
      query.andWhere('history.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('history.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters?.minScore) {
      query.andWhere('history.score >= :minScore', { minScore: filters.minScore });
    }

    if (filters?.maxScore) {
      query.andWhere('history.score <= :maxScore', { maxScore: filters.maxScore });
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    this.logger.log(`Retrieved page ${page} of ${totalPages} for user ${userId} (${data.length} records)`);

    return {
      data,
      total,
      page,
      totalPages,
      hasMore,
    };
  }

  async getAnalytics(userId: string, timeRange: 'week' | 'month' | 'all' = 'month'): Promise<MatchAnalytics> {
    const now = new Date();
    let currentPeriodStart: Date;
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    switch (timeRange) {
      case 'week':
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      case 'month':
        currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      default:
        currentPeriodStart = new Date(0);
        previousPeriodStart = new Date(0);
        previousPeriodEnd = new Date(0);
    }

    const currentData = await this.matchHistoryRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere('history.createdAt >= :start', { start: currentPeriodStart })
      .getMany();

    const previousData = timeRange !== 'all' ? await this.matchHistoryRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere('history.createdAt >= :start', { start: previousPeriodStart })
      .andWhere('history.createdAt < :end', { end: previousPeriodEnd })
      .getMany() : [];

    const currentAvg = currentData.length > 0 
      ? currentData.reduce((sum, record) => sum + record.score, 0) / currentData.length 
      : 0;
    
    const previousAvg = previousData.length > 0 
      ? previousData.reduce((sum, record) => sum + record.score, 0) / previousData.length 
      : 0;

    const scoreChange = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    const scoreDistribution = {
      perfect: currentData.filter(r => r.score >= 90).length,
      excellent: currentData.filter(r => r.score >= 75 && r.score < 90).length,
      good: currentData.filter(r => r.score >= 60 && r.score < 75).length,
      fair: currentData.filter(r => r.score < 60).length,
    };

    const factorTrends: { [factor: string]: { average: number; trend: 'up' | 'down' | 'stable'; change: number } } = {};
    
    if (currentData.length > 0) {
      const factorKeys = Object.keys(currentData[0].factors);
      
      for (const factor of factorKeys) {
        const currentFactorAvg = currentData.reduce((sum, record) => 
          sum + ((record.factors as any)[factor] || 0), 0) / currentData.length;
        
        const previousFactorAvg = previousData.length > 0 
          ? previousData.reduce((sum, record) => sum + ((record.factors as any)[factor] || 0), 0) / previousData.length
          : 0;
        
        const change = previousFactorAvg > 0 ? ((currentFactorAvg - previousFactorAvg) / previousFactorAvg) * 100 : 0;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(change) > 5) {
          trend = change > 0 ? 'up' : 'down';
        }
        
        factorTrends[factor] = {
          average: Math.round(currentFactorAvg * 100) / 100,
          trend,
          change: Math.round(change * 100) / 100,
        };
      }
    }

    const topMatches = await this.matchHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.matchUser', 'matchUser')
      .where('history.userId = :userId', { userId })
      .orderBy('history.score', 'DESC')
      .limit(5)
      .getMany();

    return {
      averageScore: {
        current: Math.round(currentAvg * 100) / 100,
        previous: Math.round(previousAvg * 100) / 100,
        change: Math.round(scoreChange * 100) / 100,
      },
      scoreDistribution,
      factorTrends,
      topMatches: topMatches.map(match => ({
        id: match.id,
        matchUser: {
          id: match.matchUser.id,
          email: match.matchUser.email,
          role: match.matchUser.role,
        },
        score: match.score,
        factors: match.factors,
        createdAt: match.createdAt,
      })),
      newMatchesCount: currentData.length,
    };
  }

  async getScoreTrends(userId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await this.matchHistoryRepository
      .createQueryBuilder('history')
      .where('history.userId = :userId', { userId })
      .andWhere('history.createdAt >= :startDate', { startDate })
      .orderBy('history.createdAt', 'ASC')
      .getMany();

    const trendsByDay = new Map<string, { total: number; sum: number; count: number }>();

    history.forEach(record => {
      const day = record.createdAt.toISOString().split('T')[0];
      const existing = trendsByDay.get(day) || { total: 0, sum: 0, count: 0 };
      existing.sum += record.score;
      existing.count++;
      existing.total = existing.sum / existing.count;
      trendsByDay.set(day, existing);
    });

    return Array.from(trendsByDay.entries()).map(([date, stats]) => ({
      date,
      averageScore: Math.round(stats.total * 100) / 100,
      matchCount: stats.count,
    }));
  }
}
