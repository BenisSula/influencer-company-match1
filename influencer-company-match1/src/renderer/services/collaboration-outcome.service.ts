import { apiClient } from './api-client';

export interface CollaborationOutcome {
  id: string;
  connectionId: string;
  successRating: number;
  completionStatus: string;
  userFeedback?: string;
  roiAchieved?: number;
  wouldCollaborateAgain: boolean;
  userId: string;
  createdAt: string;
}

export interface CollaborationStats {
  totalCollaborations: number;
  successfulCollaborations: number;
  successRate: number;
  averageRating: number;
  averageROI: number;
  wouldCollaborateAgainRate: number;
}

export interface RecordOutcomeData {
  connectionId: string;
  successRating: number;
  completionStatus: string;
  userFeedback?: string;
  roiAchieved?: number;
  wouldCollaborateAgain: boolean;
}

class CollaborationOutcomeService {
  async recordOutcome(data: RecordOutcomeData): Promise<CollaborationOutcome> {
    const response = await apiClient.post('/ai-matching/outcomes', data);
    return response.data;
  }

  async getMyOutcomes(): Promise<CollaborationOutcome[]> {
    const response = await apiClient.get('/ai-matching/outcomes/my');
    return response.data;
  }

  async getOutcomeByConnection(connectionId: string): Promise<CollaborationOutcome | null> {
    try {
      const response = await apiClient.get(`/ai-matching/outcomes/connection/${connectionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getMyStats(): Promise<CollaborationStats> {
    const response = await apiClient.get('/ai-matching/outcomes/stats');
    return response.data;
  }

  async getSuccessRate(): Promise<number> {
    const response = await apiClient.get('/ai-matching/outcomes/success-rate');
    return response.data.successRate;
  }

  async getRecentOutcomes(limit: number = 10): Promise<CollaborationOutcome[]> {
    const response = await apiClient.get(`/ai-matching/outcomes/recent?limit=${limit}`);
    return response.data;
  }

  async getHighPerformingCollaborations(minRating: number = 4): Promise<CollaborationOutcome[]> {
    const response = await apiClient.get(`/ai-matching/outcomes/high-performing?minRating=${minRating}`);
    return response.data;
  }
}

export default new CollaborationOutcomeService();
