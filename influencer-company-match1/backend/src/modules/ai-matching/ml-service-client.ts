import axios, { AxiosInstance } from 'axios';
import { Injectable, Logger } from '@nestjs/common';

interface MLServiceConfig {
  baseUrl: string;
  timeout: number;
  enabled: boolean;
}

interface MLPrediction {
  score: number;
  confidence: number;
  successProbability: number;
  featureImportance: Record<string, number>;
}

interface MLTrainingData {
  features: any[];
  outcomes: boolean[];
}

interface MLTrainingResponse {
  status: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    cv_score: number;
    cv_std: number;
  };
  samples: number;
  modelVersion: string;
  timestamp: string;
}

@Injectable()
export class MLServiceClient {
  private readonly logger = new Logger(MLServiceClient.name);
  private client: AxiosInstance;
  private config: MLServiceConfig;
  private isAvailable: boolean = false;

  constructor() {
    this.config = {
      baseUrl: process.env.ML_MATCHING_SERVICE_URL || 'http://localhost:8001',
      timeout: parseInt(process.env.ML_SERVICE_TIMEOUT || '5000'),
      enabled: process.env.ML_SERVICE_ENABLED !== 'false',
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check availability on startup
    if (this.config.enabled) {
      this.checkAvailability();
    } else {
      this.logger.warn('ML Service is disabled via configuration');
    }
  }

  /**
   * Check if ML service is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 2000 });
      this.isAvailable = response.data.status === 'healthy';
      
      if (this.isAvailable) {
        this.logger.log(`ML Service is available at ${this.config.baseUrl}`);
      } else {
        this.logger.warn('ML Service health check failed');
      }
      
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      this.logger.warn(`ML Service not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get ML service availability status
   */
  getAvailability(): boolean {
    return this.isAvailable && this.config.enabled;
  }

  /**
   * Predict match success using ML service
   */
  async predict(features: any): Promise<MLPrediction> {
    if (!this.config.enabled) {
      throw new Error('ML Service is disabled');
    }

    try {
      const response = await this.client.post('/predict', features);
      return response.data;
    } catch (error) {
      this.logger.error(`ML Service prediction error: ${error.message}`);
      
      // Mark as unavailable if connection fails
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this.isAvailable = false;
      }
      
      throw error;
    }
  }

  /**
   * Train ML model with new data
   */
  async train(trainingData: MLTrainingData): Promise<MLTrainingResponse> {
    if (!this.config.enabled) {
      throw new Error('ML Service is disabled');
    }

    try {
      this.logger.log(`Training ML model with ${trainingData.outcomes.length} samples`);
      const response = await this.client.post('/train', trainingData);
      this.logger.log(`Model trained successfully. Version: ${response.data.modelVersion}`);
      return response.data;
    } catch (error) {
      this.logger.error(`ML Service training error: ${error.message}`);
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<any[]> {
    if (!this.config.enabled) {
      throw new Error('ML Service is disabled');
    }

    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      this.logger.error(`ML Service list models error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load specific model version
   */
  async loadModel(version: string): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('ML Service is disabled');
    }

    try {
      await this.client.post(`/models/${version}/load`);
      this.logger.log(`Loaded model version: ${version}`);
    } catch (error) {
      this.logger.error(`ML Service load model error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getHealth(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      this.logger.error(`ML Service health check error: ${error.message}`);
      throw error;
    }
  }
}
