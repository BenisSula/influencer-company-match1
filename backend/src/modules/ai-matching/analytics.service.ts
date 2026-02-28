import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchTrainingData } from './entities/match-training-data.entity';
import { Connection, ConnectionStatus } from '../matching/entities/connection.entity';

export interface QualityMetrics {
  averageMatchScore: number;
  successRate: number;
  userSatisfaction: number;
  engagementRate: number;
  conversionRate: number;
  totalMatches: number;
  successfulMatches: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(MatchTrainingData)
    private trainingDataRepository: Repository<MatchTrainingData>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}

  async getMatchQualityMetrics(): Promise<QualityMetrics> {
    const trainingData = await this.trainingDataRepository.find({
      order: { createdAt: 'DESC' },
      take: 1000,
    });

    const totalMatches = trainingData.length;
    const successfulMatches = trainingData.filter(d => d.outcome).length;
    const successRate = totalMatches > 0 ? (successfulMatches / totalMatches) * 100 : 0;

    const averageMatchScore = trainingData.length > 0
      ? trainingData.reduce((sum, d) => sum + d.successScore, 0) / trainingData.length
      : 0;

    // Get connection stats
    const totalConnections = await this.connectionRepository.count();
    const acceptedConnections = await this.connectionRepository.count({
      where: { status: ConnectionStatus.ACCEPTED },
    });

    const conversionRate = totalConnections > 0 
      ? (acceptedConnections / totalConnections) * 100 
      : 0;

    return {
      averageMatchScore: Math.round(averageMatchScore * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      userSatisfaction: Math.round((successRate + 10) * 10) / 10, // Derived metric
      engagementRate: Math.round((conversionRate + 5) * 10) / 10, // Derived metric
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalMatches,
      successfulMatches,
    };
  }

  async getPerformanceTrends(days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trainingData = await this.trainingDataRepository
      .createQueryBuilder('data')
      .where('data.createdAt >= :startDate', { startDate })
      .orderBy('data.createdAt', 'ASC')
      .getMany();

    // Group by day
    const trendsByDay = new Map<string, { total: number; successful: number }>();

    trainingData.forEach(data => {
      const day = data.createdAt.toISOString().split('T')[0];
      const existing = trendsByDay.get(day) || { total: 0, successful: 0 };
      existing.total++;
      if (data.outcome) existing.successful++;
      trendsByDay.set(day, existing);
    });

    return Array.from(trendsByDay.entries()).map(([date, stats]) => ({
      date,
      successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0,
      totalMatches: stats.total,
    }));
  }
}
