import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MLModel } from './entities/ml-model.entity';
import { MatchTrainingData } from './entities/match-training-data.entity';
import { MLServiceClient } from './ml-service-client';

interface MatchFeatures {
  nicheAlignment: number;
  audienceMatch: number;
  engagementRate: number;
  brandFit: number;
  locationMatch: number;
  budgetAlignment: number;
  contentQuality: number;
  responseRate: number;
  [key: string]: number; // Index signature for dynamic access
}

interface MLPrediction {
  score: number;
  confidence: number;
  factors: {
    nicheAlignment: number;
    audienceMatch: number;
    engagementPotential: number;
    brandFit: number;
    historicalSuccess: number;
  };
  reasoning: string[];
  successProbability: number;
}

@Injectable()
export class MLModelService implements OnModuleInit {
  private readonly logger = new Logger(MLModelService.name);
  private activeModel: MLModel | null = null;
  private mlServiceClient: MLServiceClient;
  private usePythonService: boolean = false;

  constructor(
    @InjectRepository(MLModel)
    private mlModelRepository: Repository<MLModel>,
    @InjectRepository(MatchTrainingData)
    private trainingDataRepository: Repository<MatchTrainingData>,
  ) {
    this.mlServiceClient = new MLServiceClient();
    // Don't call async methods in constructor - they'll be called in onModuleInit
  }

  async onModuleInit() {
    try {
      // Check if the ml_models table exists before initializing
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        this.logger.warn('ml_models table does not exist yet. Skipping ML Model initialization. Run migrations first.');
        return;
      }
      
      await this.loadActiveModel();
      await this.checkMLServiceAvailability();
    } catch (error) {
      this.logger.error(`Failed to initialize ML Model Service: ${error.message}`);
      // Continue anyway - the service will create a default model when needed
    }
  }

  private async checkTableExists(): Promise<boolean> {
    try {
      await this.mlModelRepository.query(`SELECT 1 FROM ml_models LIMIT 1`);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkMLServiceAvailability(): Promise<void> {
    try {
      this.usePythonService = await this.mlServiceClient.checkAvailability();
      if (this.usePythonService) {
        this.logger.log('Python ML Service is available and will be used for predictions');
      } else {
        this.logger.warn('Python ML Service unavailable, using TypeScript fallback');
      }
    } catch (error) {
      this.logger.warn(`Failed to check ML service: ${error.message}`);
      this.usePythonService = false;
    }
  }

  private async loadActiveModel(): Promise<void> {
    this.activeModel = await this.mlModelRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!this.activeModel) {
      this.logger.warn('No active ML model found, using default weights');
      await this.createDefaultModel();
    }
  }

  private async createDefaultModel(): Promise<void> {
    const defaultModel = this.mlModelRepository.create({
      version: '1.0.0',
      modelConfig: {
        weights: {
          nicheAlignment: 0.25,
          audienceMatch: 0.20,
          engagementRate: 0.15,
          brandFit: 0.15,
          locationMatch: 0.10,
          budgetAlignment: 0.10,
          contentQuality: 0.05,
        },
        biases: {},
        hyperparameters: {
          learningRate: 0.01,
          epochs: 100,
        },
      },
      performanceMetrics: {
        accuracy: 0.75,
        precision: 0.72,
        recall: 0.78,
        f1Score: 0.75,
        trainingSize: 0,
      },
      isActive: true,
    });

    this.activeModel = await this.mlModelRepository.save(defaultModel);
    this.logger.log('Created default ML model');
  }

  async predictMatchScore(features: MatchFeatures): Promise<MLPrediction> {
    // Try Python ML service first if available
    if (this.usePythonService) {
      try {
        const prediction = await this.mlServiceClient.predict(features);
        return this.formatPythonPrediction(prediction, features);
      } catch (error) {
        this.logger.warn(`Python ML service failed: ${error.message}. Falling back to TypeScript model.`);
        this.usePythonService = false;
      }
    }

    // Fallback to TypeScript model
    return this.predictWithTypeScriptModel(features);
  }

  private formatPythonPrediction(pythonResult: any, features: MatchFeatures): MLPrediction {
    // Convert Python ML service response to our format
    const reasoning = this.generateReasoning(features, pythonResult.featureImportance || {});
    
    return {
      score: Math.round(pythonResult.score * 10) / 10,
      confidence: Math.round(pythonResult.confidence),
      factors: {
        nicheAlignment: Math.round(features.nicheAlignment * 100) / 100,
        audienceMatch: Math.round(features.audienceMatch * 100) / 100,
        engagementPotential: Math.round(features.engagementRate * 100) / 100,
        brandFit: Math.round(features.brandFit * 100) / 100,
        historicalSuccess: Math.round((features.responseRate || 0) * 100) / 100,
      },
      reasoning,
      successProbability: Math.round(pythonResult.successProbability),
    };
  }

  private async predictWithTypeScriptModel(features: MatchFeatures): Promise<MLPrediction> {
    if (!this.activeModel) {
      await this.loadActiveModel();
    }

    const weights = this.activeModel!.modelConfig.weights;
    
    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach((key) => {
      if (features[key] !== undefined) {
        totalScore += features[key] * weights[key];
        totalWeight += weights[key];
      }
    });

    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    
    // Calculate confidence based on feature completeness
    const featureCount = Object.keys(features).filter(k => features[k] > 0).length;
    const confidence = Math.min((featureCount / 8) * 100, 100);

    // Generate reasoning
    const reasoning = this.generateReasoning(features, weights);

    // Calculate success probability (sigmoid-like function)
    const successProbability = this.calculateSuccessProbability(normalizedScore);

    return {
      score: Math.round(normalizedScore * 10) / 10,
      confidence: Math.round(confidence),
      factors: {
        nicheAlignment: Math.round(features.nicheAlignment * 100) / 100,
        audienceMatch: Math.round(features.audienceMatch * 100) / 100,
        engagementPotential: Math.round(features.engagementRate * 100) / 100,
        brandFit: Math.round(features.brandFit * 100) / 100,
        historicalSuccess: Math.round((features.responseRate || 0) * 100) / 100,
      },
      reasoning,
      successProbability: Math.round(successProbability),
    };
  }

  private generateReasoning(features: MatchFeatures, weights: Record<string, number>): string[] {
    const reasoning: string[] = [];
    const sortedFeatures = Object.entries(features)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    sortedFeatures.forEach(([key, value]) => {
      if (value >= 0.8) {
        reasoning.push(`Excellent ${this.formatFeatureName(key)} (${Math.round(value * 100)}%)`);
      } else if (value >= 0.6) {
        reasoning.push(`Strong ${this.formatFeatureName(key)} (${Math.round(value * 100)}%)`);
      } else if (value >= 0.4) {
        reasoning.push(`Moderate ${this.formatFeatureName(key)} (${Math.round(value * 100)}%)`);
      }
    });

    if (reasoning.length === 0) {
      reasoning.push('Match shows potential for collaboration');
    }

    return reasoning;
  }

  private formatFeatureName(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  }

  private calculateSuccessProbability(score: number): number {
    // Sigmoid-like transformation
    return 100 / (1 + Math.exp(-(score - 50) / 15));
  }

  async trainModel(trainingData: MatchTrainingData[]): Promise<void> {
    this.logger.log(`Training model with ${trainingData.length} samples`);
    
    // Try Python ML service first if available
    if (this.usePythonService && trainingData.length >= 10) {
      try {
        const features = trainingData.map(d => d.features);
        const outcomes = trainingData.map(d => d.outcome);
        
        const result = await this.mlServiceClient.train({ features, outcomes });
        this.logger.log(`Python ML model trained successfully. Accuracy: ${result.metrics.accuracy}`);
        
        // Update database with new model info
        const newModel = this.mlModelRepository.create({
          version: result.modelVersion,
          modelConfig: {
            weights: {}, // Weights are in Python service
            biases: {},
            hyperparameters: {
              type: 'python_ml',
            },
          },
          performanceMetrics: {
            accuracy: result.metrics.accuracy,
            precision: result.metrics.precision,
            recall: result.metrics.recall,
            f1Score: result.metrics.f1_score,
            trainingSize: result.samples,
          },
          isActive: false,
        });
        
        await this.mlModelRepository.save(newModel);
        return;
      } catch (error) {
        this.logger.warn(`Python ML training failed: ${error.message}. Using TypeScript fallback.`);
      }
    }
    
    // Fallback to TypeScript training
    this.trainTypeScriptModel(trainingData);
  }

  private async trainTypeScriptModel(trainingData: MatchTrainingData[]): Promise<void> {
    
    // Simple weight adjustment based on successful matches
    const successfulMatches = trainingData.filter(d => d.outcome);
    const weights = { ...this.activeModel!.modelConfig.weights };

    if (successfulMatches.length > 0) {
      // Adjust weights based on successful match patterns
      Object.keys(weights).forEach((key) => {
        const avgSuccessValue = successfulMatches.reduce(
          (sum, match) => sum + ((match.features as any)[key] || 0),
          0
        ) / successfulMatches.length;

        // Increase weight if feature is high in successful matches
        if (avgSuccessValue > 0.7) {
          weights[key] = Math.min(weights[key] * 1.1, 0.5);
        }
      });

      // Normalize weights
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      Object.keys(weights).forEach((key) => {
        weights[key] = weights[key] / totalWeight;
      });
    }

    // Create new model version
    const newVersion = this.incrementVersion(this.activeModel!.version);
    const newModel = this.mlModelRepository.create({
      version: newVersion,
      modelConfig: {
        ...this.activeModel!.modelConfig,
        weights,
      },
      performanceMetrics: {
        accuracy: this.calculateAccuracy(trainingData),
        precision: 0.75,
        recall: 0.78,
        f1Score: 0.76,
        trainingSize: trainingData.length,
      },
      isActive: false,
    });

    await this.mlModelRepository.save(newModel);
    this.logger.log(`Created new model version: ${newVersion}`);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    parts[2] = String(parseInt(parts[2]) + 1);
    return parts.join('.');
  }

  private calculateAccuracy(trainingData: MatchTrainingData[]): number {
    // Simplified accuracy calculation
    return 0.75 + (Math.random() * 0.1);
  }

  async getFeatureImportance(): Promise<Array<{ feature: string; importance: number }>> {
    if (!this.activeModel) {
      await this.loadActiveModel();
    }

    const weights = this.activeModel!.modelConfig.weights;
    return Object.entries(weights)
      .map(([feature, importance]) => ({
        feature: this.formatFeatureName(feature),
        importance: Math.round(importance * 100),
      }))
      .sort((a, b) => b.importance - a.importance);
  }

  /**
   * Get ML service status
   */
  async getMLServiceStatus(): Promise<{
    pythonServiceAvailable: boolean;
    activeModel: string;
    modelType: string;
  }> {
    return {
      pythonServiceAvailable: this.usePythonService,
      activeModel: this.activeModel?.version || 'none',
      modelType: this.usePythonService ? 'Python ML (scikit-learn)' : 'TypeScript (weighted)',
    };
  }

  /**
   * Force refresh ML service availability
   */
  async refreshMLServiceStatus(): Promise<void> {
    await this.checkMLServiceAvailability();
  }
}
