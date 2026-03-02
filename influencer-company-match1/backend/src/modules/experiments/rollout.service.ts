import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rollout, RolloutSchedule } from './entities/rollout.entity';
import { CreateRolloutDto } from './dto/create-rollout.dto';

export interface ModelMetrics {
  errorRate: number;
  latency: number;
  accuracy: number;
}

@Injectable()
export class RolloutService {
  private readonly logger = new Logger(RolloutService.name);

  constructor(
    @InjectRepository(Rollout)
    private rolloutRepository: Repository<Rollout>,
  ) {}

  // Create rollout
  async createRollout(dto: CreateRolloutDto): Promise<Rollout> {
    const rollout = this.rolloutRepository.create({
      name: dto.name,
      description: dto.description,
      modelVersion: dto.modelVersion,
      schedule: dto.schedule,
      currentPercentage: 0,
      targetPercentage: 100,
      status: 'pending',
    });

    this.logger.log(`Created rollout: ${rollout.name} for model ${rollout.modelVersion}`);

    return this.rolloutRepository.save(rollout);
  }

  // Get all rollouts
  async getAllRollouts(): Promise<Rollout[]> {
    return this.rolloutRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Get rollout by ID
  async getRollout(rolloutId: string): Promise<Rollout> {
    const rollout = await this.rolloutRepository.findOne({
      where: { id: rolloutId },
    });

    if (!rollout) {
      throw new NotFoundException('Rollout not found');
    }

    return rollout;
  }

  // Start rollout
  async startRollout(rolloutId: string): Promise<Rollout> {
    const rollout = await this.getRollout(rolloutId);

    if (rollout.status !== 'pending') {
      throw new Error('Only pending rollouts can be started');
    }

    rollout.status = 'in_progress';
    rollout.schedule.startTime = new Date();

    this.logger.log(`Started rollout: ${rollout.name}`);

    return this.rolloutRepository.save(rollout);
  }

  // Update rollout percentage (called by cron job)
  async updateRolloutPercentage(rolloutId: string): Promise<void> {
    const rollout = await this.rolloutRepository.findOne({
      where: { id: rolloutId },
    });

    if (!rollout || rollout.status !== 'in_progress') {
      return;
    }

    const now = new Date();
    const targetPercentage = this.calculateTargetPercentage(
      rollout.schedule,
      now
    );

    if (targetPercentage > rollout.currentPercentage) {
      // Check health metrics before increasing
      const isHealthy = await this.checkHealthMetrics(rollout);

      if (isHealthy) {
        rollout.currentPercentage = targetPercentage;
        
        if (targetPercentage >= 100) {
          rollout.status = 'completed';
          this.logger.log(`Completed rollout: ${rollout.name}`);
        } else {
          this.logger.log(`Increased rollout ${rollout.name} to ${targetPercentage}%`);
        }

        await this.rolloutRepository.save(rollout);
      } else {
        // Rollback if unhealthy
        this.logger.warn(`Health check failed for rollout ${rollout.name}, rolling back`);
        await this.rollbackRollout(rolloutId);
      }
    }
  }

  // Calculate target percentage based on schedule
  private calculateTargetPercentage(
    schedule: RolloutSchedule,
    now: Date
  ): number {
    const startTime = new Date(schedule.startTime);
    const elapsed = now.getTime() - startTime.getTime();
    const elapsedHours = elapsed / (1000 * 60 * 60);

    // Find current stage
    let cumulativeHours = 0;
    for (const stage of schedule.stages) {
      cumulativeHours += stage.durationHours;
      
      if (elapsedHours < cumulativeHours) {
        return stage.percentage;
      }
    }

    return 100; // All stages complete
  }

  // Check health metrics
  private async checkHealthMetrics(rollout: Rollout): Promise<boolean> {
    // Get recent metrics for this model version
    const metrics = await this.getModelMetrics(rollout.modelVersion);

    // Define health thresholds
    const thresholds = {
      errorRate: 0.05, // Max 5% error rate
      latency: 200, // Max 200ms
      accuracy: 0.75, // Min 75% accuracy
    };

    const isHealthy = (
      metrics.errorRate < thresholds.errorRate &&
      metrics.latency < thresholds.latency &&
      metrics.accuracy > thresholds.accuracy
    );

    // Store metrics
    rollout.healthMetrics = {
      ...metrics,
      timestamp: new Date(),
      isHealthy,
    };

    await this.rolloutRepository.save(rollout);

    return isHealthy;
  }

  // Get model metrics (placeholder - implement based on your monitoring)
  private async getModelMetrics(modelVersion: string): Promise<ModelMetrics> {
    // TODO: Implement actual metrics collection
    // This would typically query your monitoring system (Prometheus, DataDog, etc.)
    
    // For now, return mock healthy metrics
    return {
      errorRate: 0.01, // 1%
      latency: 50, // 50ms
      accuracy: 0.85, // 85%
    };
  }

  // Rollback rollout
  async rollbackRollout(rolloutId: string): Promise<void> {
    const rollout = await this.rolloutRepository.findOne({
      where: { id: rolloutId },
    });

    if (!rollout) {
      return;
    }

    rollout.status = 'rolled_back';
    rollout.currentPercentage = 0;
    
    await this.rolloutRepository.save(rollout);

    this.logger.warn(`Rollout ${rollout.name} rolled back due to health issues`);
  }

  // Check if user should use new model
  async shouldUseNewModel(userId: string, rolloutId: string): Promise<boolean> {
    const rollout = await this.rolloutRepository.findOne({
      where: { id: rolloutId, status: 'in_progress' },
    });

    if (!rollout) {
      return false;
    }

    // Consistent hashing
    const hash = this.hashUserId(userId);
    return hash < rollout.currentPercentage;
  }

  // Get active rollout for model version
  async getActiveRollout(modelVersion: string): Promise<Rollout | null> {
    return this.rolloutRepository.findOne({
      where: { modelVersion, status: 'in_progress' },
    });
  }

  // Hash user ID to 0-100 range
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }

  // Delete rollout
  async deleteRollout(rolloutId: string): Promise<void> {
    const rollout = await this.getRollout(rolloutId);
    
    if (rollout.status === 'in_progress') {
      throw new Error('Cannot delete in-progress rollout. Roll it back first.');
    }

    await this.rolloutRepository.remove(rollout);
    this.logger.log(`Deleted rollout: ${rollout.name}`);
  }
}
