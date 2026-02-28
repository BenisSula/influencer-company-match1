import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollaborationOutcome } from './entities/collaboration-outcome.entity';
import { Connection } from '../matching/entities/connection.entity';
import { FeatureEngineeringService } from './feature-engineering.service';
import { MLModelService } from './ml-model.service';

export interface RecordOutcomeDto {
  connectionId: string;
  successRating: number;
  completionStatus: string;
  userFeedback?: string;
  roiAchieved?: number;
  wouldCollaborateAgain: boolean;
}

@Injectable()
export class CollaborationOutcomeService {
  private readonly logger = new Logger(CollaborationOutcomeService.name);

  constructor(
    @InjectRepository(CollaborationOutcome)
    private outcomeRepository: Repository<CollaborationOutcome>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    private featureEngineeringService: FeatureEngineeringService,
    private mlModelService: MLModelService,
  ) {}

  async recordOutcome(
    userId: string,
    data: RecordOutcomeDto,
  ): Promise<CollaborationOutcome> {
    try {
      // Get connection with user details
      const connection = await this.connectionRepository.findOne({
        where: { id: data.connectionId },
        relations: ['requester', 'recipient'],
      });

      if (!connection) {
        this.logger.error(`Connection not found: ${data.connectionId}`);
        throw new Error('Connection not found');
      }

      // Verify user is part of this connection
      if (connection.requesterId !== userId && connection.recipientId !== userId) {
        this.logger.error(`Unauthorized: User ${userId} not part of connection ${data.connectionId}`);
        throw new Error('Unauthorized to rate this collaboration');
      }

      // Get the other user's ID
      const otherUserId = connection.requesterId === userId 
        ? connection.recipientId 
        : connection.requesterId;

      // Extract features at time of match (with error handling)
      let factorsAtMatch = {};
      try {
        factorsAtMatch = await this.featureEngineeringService.extractAdvancedFeatures(
          userId,
          otherUserId,
        );
      } catch (error) {
        this.logger.warn(`Failed to extract features for outcome: ${error.message}`);
        // Continue without features - they're not critical for recording the outcome
        factorsAtMatch = {};
      }

      // Create outcome record
      const outcome = this.outcomeRepository.create({
        connectionId: data.connectionId,
        successRating: data.successRating,
        completionStatus: data.completionStatus,
        userFeedback: data.userFeedback,
        factorsAtMatch,
        roiAchieved: data.roiAchieved,
        wouldCollaborateAgain: data.wouldCollaborateAgain,
        userId,
      });

      const savedOutcome = await this.outcomeRepository.save(outcome);

      this.logger.log(`Recorded collaboration outcome for connection ${data.connectionId}`);

      // Trigger ML model retraining if we have enough data (async, don't wait)
      this.checkAndTriggerRetraining().catch((err: Error) => {
        this.logger.error('Failed to trigger retraining:', err);
      });

      return savedOutcome;
    } catch (error) {
      this.logger.error(`Failed to record outcome: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getOutcomesByUser(userId: string): Promise<CollaborationOutcome[]> {
    return this.outcomeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOutcomeByConnection(connectionId: string, userId: string): Promise<CollaborationOutcome | null> {
    return this.outcomeRepository.findOne({
      where: { connectionId, userId },
    });
  }

  async getSuccessRate(userId: string): Promise<number> {
    const outcomes = await this.getOutcomesByUser(userId);
    
    if (outcomes.length === 0) return 0;
    
    const successfulOutcomes = outcomes.filter(o => o.successRating >= 4);
    return (successfulOutcomes.length / outcomes.length) * 100;
  }

  async getAverageRating(userId: string): Promise<number> {
    const outcomes = await this.getOutcomesByUser(userId);
    
    if (outcomes.length === 0) return 0;
    
    const totalRating = outcomes.reduce((sum, o) => sum + o.successRating, 0);
    return totalRating / outcomes.length;
  }

  async getCollaborationStats(userId: string): Promise<{
    totalCollaborations: number;
    successfulCollaborations: number;
    successRate: number;
    averageRating: number;
    averageROI: number;
    wouldCollaborateAgainRate: number;
  }> {
    const outcomes = await this.getOutcomesByUser(userId);
    
    if (outcomes.length === 0) {
      return {
        totalCollaborations: 0,
        successfulCollaborations: 0,
        successRate: 0,
        averageRating: 0,
        averageROI: 0,
        wouldCollaborateAgainRate: 0,
      };
    }

    const successfulOutcomes = outcomes.filter(o => o.successRating >= 4);
    const totalRating = outcomes.reduce((sum, o) => sum + o.successRating, 0);
    const outcomesWithROI = outcomes.filter(o => o.roiAchieved !== null && o.roiAchieved !== undefined);
    const totalROI = outcomesWithROI.reduce((sum, o) => sum + (o.roiAchieved || 0), 0);
    const wouldCollaborateAgain = outcomes.filter(o => o.wouldCollaborateAgain);

    return {
      totalCollaborations: outcomes.length,
      successfulCollaborations: successfulOutcomes.length,
      successRate: (successfulOutcomes.length / outcomes.length) * 100,
      averageRating: totalRating / outcomes.length,
      averageROI: outcomesWithROI.length > 0 ? totalROI / outcomesWithROI.length : 0,
      wouldCollaborateAgainRate: (wouldCollaborateAgain.length / outcomes.length) * 100,
    };
  }

  async getAllOutcomesForTraining(): Promise<CollaborationOutcome[]> {
    return this.outcomeRepository.find({
      order: { createdAt: 'DESC' },
      take: 1000, // Last 1000 outcomes
    });
  }

  private async checkAndTriggerRetraining(): Promise<void> {
    const totalOutcomes = await this.outcomeRepository.count();
    
    // Retrain every 50 new outcomes
    if (totalOutcomes % 50 === 0 && totalOutcomes > 0) {
      this.logger.log(`Triggering ML model retraining with ${totalOutcomes} outcomes`);
      
      try {
        const outcomes = await this.getAllOutcomesForTraining();
        
        // Convert outcomes to training data format expected by MLModelService
        const trainingData = outcomes.map(outcome => ({
          features: outcome.factorsAtMatch,
          outcome: outcome.successRating >= 4, // Success if rating >= 4
          successScore: outcome.successRating * 20, // Convert 1-5 to 0-100
        }));

        // Train the model with properly formatted data
        await this.mlModelService.trainModel(trainingData as any);
        
        this.logger.log('ML model retraining completed successfully');
      } catch (error) {
        this.logger.error('Failed to retrain ML model:', error);
      }
    }
  }

  async getRecentOutcomes(limit: number = 10): Promise<CollaborationOutcome[]> {
    return this.outcomeRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getOutcomesByStatus(status: string): Promise<CollaborationOutcome[]> {
    return this.outcomeRepository.find({
      where: { completionStatus: status },
      order: { createdAt: 'DESC' },
    });
  }

  async getHighPerformingCollaborations(minRating: number = 4): Promise<CollaborationOutcome[]> {
    return this.outcomeRepository
      .createQueryBuilder('outcome')
      .where('outcome.success_rating >= :minRating', { minRating })
      .orderBy('outcome.success_rating', 'DESC')
      .addOrderBy('outcome.created_at', 'DESC')
      .take(50)
      .getMany();
  }
}
