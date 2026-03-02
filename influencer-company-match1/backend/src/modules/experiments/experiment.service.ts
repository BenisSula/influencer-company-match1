import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experiment } from './entities/experiment.entity';
import { ExperimentAssignment } from './entities/experiment-assignment.entity';
import { ExperimentEvent } from './entities/experiment-event.entity';
import { CreateExperimentDto } from './dto/create-experiment.dto';

export interface VariantStats {
  variant: string;
  users: Set<string>;
  successCount: number;
  totalEvents: number;
}

export interface VariantResult {
  variant: string;
  users: number;
  successRate: number;
  successCount: number;
  totalEvents: number;
}

export interface ExperimentResults {
  experimentId: string;
  results: VariantResult[];
  significance: number;
  winner: string | null;
  isSignificant: boolean;
}

@Injectable()
export class ExperimentService {
  private readonly logger = new Logger(ExperimentService.name);

  constructor(
    @InjectRepository(Experiment)
    private experimentRepository: Repository<Experiment>,
    @InjectRepository(ExperimentAssignment)
    private assignmentRepository: Repository<ExperimentAssignment>,
    @InjectRepository(ExperimentEvent)
    private eventRepository: Repository<ExperimentEvent>,
  ) {}

  // Create new experiment
  async createExperiment(dto: CreateExperimentDto, userId?: string): Promise<Experiment> {
    // Validate traffic allocation sums to 1.0
    const totalAllocation = Object.values(dto.trafficAllocation)
      .reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(totalAllocation - 1.0) > 0.01) {
      throw new BadRequestException('Traffic allocation must sum to 1.0');
    }

    // Validate all variants have allocation
    const variantNames = Object.keys(dto.variants);
    const allocationNames = Object.keys(dto.trafficAllocation);
    
    for (const variant of variantNames) {
      if (!allocationNames.includes(variant)) {
        throw new BadRequestException(`Variant ${variant} missing from traffic allocation`);
      }
    }

    const experiment = this.experimentRepository.create({
      ...dto,
      createdBy: userId,
    });
    
    return this.experimentRepository.save(experiment);
  }

  // Get all experiments
  async getAllExperiments(): Promise<Experiment[]> {
    return this.experimentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Get experiment by ID
  async getExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.experimentRepository.findOne({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new NotFoundException('Experiment not found');
    }

    return experiment;
  }

  // Start experiment
  async startExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.getExperiment(experimentId);

    if (experiment.status !== 'draft') {
      throw new BadRequestException('Only draft experiments can be started');
    }

    experiment.status = 'running';
    experiment.startDate = new Date();
    
    this.logger.log(`Started experiment: ${experiment.name}`);
    
    return this.experimentRepository.save(experiment);
  }

  // Pause experiment
  async pauseExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.getExperiment(experimentId);

    if (experiment.status !== 'running') {
      throw new BadRequestException('Only running experiments can be paused');
    }

    experiment.status = 'paused';
    
    this.logger.log(`Paused experiment: ${experiment.name}`);
    
    return this.experimentRepository.save(experiment);
  }

  // Complete experiment
  async completeExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.getExperiment(experimentId);

    experiment.status = 'completed';
    experiment.endDate = new Date();
    
    this.logger.log(`Completed experiment: ${experiment.name}`);
    
    return this.experimentRepository.save(experiment);
  }

  // Assign user to variant
  async assignVariant(experimentId: string, userId: string): Promise<string> {
    // Check existing assignment
    const existing = await this.assignmentRepository.findOne({
      where: { experimentId, userId },
    });

    if (existing) {
      return existing.variant;
    }

    // Get experiment
    const experiment = await this.experimentRepository.findOne({
      where: { id: experimentId, status: 'running' },
    });

    if (!experiment) {
      // No active experiment, return control
      return 'control';
    }

    // Assign variant using consistent hashing
    const variant = this.selectVariant(
      userId,
      experiment.trafficAllocation
    );

    // Save assignment
    await this.assignmentRepository.save({
      experimentId,
      userId,
      variant,
    });

    this.logger.debug(`Assigned user ${userId} to variant ${variant} in experiment ${experiment.name}`);

    return variant;
  }

  // Get user's variant assignment
  async getUserVariant(experimentId: string, userId: string): Promise<string | null> {
    const assignment = await this.assignmentRepository.findOne({
      where: { experimentId, userId },
    });

    return assignment?.variant || null;
  }

  // Select variant using consistent hashing
  private selectVariant(
    userId: string,
    allocation: Record<string, number>
  ): string {
    // Hash user ID to get consistent 0-1 value
    const hash = this.hashUserId(userId);
    
    // Select variant based on allocation
    let cumulative = 0;
    for (const [variant, percentage] of Object.entries(allocation)) {
      cumulative += percentage;
      if (hash <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return Object.keys(allocation)[0];
  }

  // Simple hash function
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 10000) / 10000; // 0-1 range
  }

  // Track event
  async trackEvent(
    experimentId: string,
    userId: string,
    eventType: string,
    eventData?: any,
  ): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { experimentId, userId },
    });

    if (!assignment) {
      // User not in experiment, skip tracking
      return;
    }

    await this.eventRepository.save({
      experimentId,
      userId,
      variant: assignment.variant,
      eventType,
      eventData,
    });

    this.logger.debug(`Tracked event ${eventType} for user ${userId} in variant ${assignment.variant}`);
  }

  // Get experiment results
  async getResults(experimentId: string): Promise<ExperimentResults> {
    const experiment = await this.getExperiment(experimentId);
    
    const events = await this.eventRepository.find({
      where: { experimentId },
    });

    if (events.length === 0) {
      return {
        experimentId,
        results: [],
        significance: 0,
        winner: null,
        isSignificant: false,
      };
    }

    // Group by variant
    const variantStats = new Map<string, VariantStats>();

    events.forEach(event => {
      if (!variantStats.has(event.variant)) {
        variantStats.set(event.variant, {
          variant: event.variant,
          users: new Set(),
          successCount: 0,
          totalEvents: 0,
        });
      }

      const stats = variantStats.get(event.variant)!;
      stats.users.add(event.userId);
      stats.totalEvents++;

      if (event.eventType === experiment.successMetric || event.eventType === 'success') {
        stats.successCount++;
      }
    });

    // Calculate metrics
    const results: VariantResult[] = Array.from(variantStats.values()).map(stats => ({
      variant: stats.variant,
      users: stats.users.size,
      successRate: stats.totalEvents > 0 ? stats.successCount / stats.totalEvents : 0,
      successCount: stats.successCount,
      totalEvents: stats.totalEvents,
    }));

    // Statistical significance
    const significance = this.calculateSignificance(results);
    const winner = this.determineWinner(results, significance, experiment.confidenceLevel);

    return {
      experimentId,
      results,
      significance,
      winner,
      isSignificant: significance >= experiment.confidenceLevel,
    };
  }

  // Calculate statistical significance (Chi-square test)
  private calculateSignificance(results: VariantResult[]): number {
    if (results.length < 2) return 0;

    const [control, treatment] = results;
    
    // Need minimum sample size
    if (control.totalEvents < 10 || treatment.totalEvents < 10) {
      return 0;
    }

    // Sample sizes
    const n1 = control.totalEvents;
    const n2 = treatment.totalEvents;
    
    // Success rates
    const p1 = control.successRate;
    const p2 = treatment.successRate;
    
    // Pooled proportion
    const pooled = (n1 * p1 + n2 * p2) / (n1 + n2);
    
    // Avoid division by zero
    if (pooled === 0 || pooled === 1) {
      return 0;
    }
    
    // Standard error
    const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));
    
    if (se === 0) {
      return 0;
    }
    
    // Z-score
    const z = Math.abs(p2 - p1) / se;
    
    // Convert to confidence level (simplified)
    const confidence = 1 - (2 * (1 - this.normalCDF(z)));
    
    return Math.max(0, Math.min(1, confidence));
  }

  // Standard normal CDF
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  // Error function approximation
  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // Determine winner
  private determineWinner(
    results: VariantResult[],
    significance: number,
    confidenceLevel: number,
  ): string | null {
    if (significance < confidenceLevel) {
      return null; // Not statistically significant
    }

    // Return variant with highest success rate
    return results.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    ).variant;
  }

  // Delete experiment
  async deleteExperiment(experimentId: string): Promise<void> {
    const experiment = await this.getExperiment(experimentId);
    
    if (experiment.status === 'running') {
      throw new BadRequestException('Cannot delete running experiment. Pause it first.');
    }

    await this.experimentRepository.remove(experiment);
    this.logger.log(`Deleted experiment: ${experiment.name}`);
  }
}
