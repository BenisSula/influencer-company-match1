import { apiClient } from './api-client';

export interface ReviewData {
  profileId: string;
  connectionId: string;
  overallRating: number;
  communicationRating: number;
  professionalismRating: number;
  qualityRating: number;
  timelinessRating: number;
  comment: string;
  projectName?: string;
  collaborationType?: string;
}

export interface Review extends ReviewData {
  id: string;
  reviewerId: string;
  createdAt: string;
  helpfulCount: number;
  reviewer: {
    name: string;
    avatarUrl: string;
  };
}

export interface ProfileRatings {
  averageOverall: number;
  averageCommunication: number;
  averageProfessionalism: number;
  averageQuality: number;
  averageTimeliness: number;
  totalReviews: number;
}

class ProfileReviewService {
  async createReview(data: ReviewData): Promise<Review> {
    return await apiClient.post<Review>('/profiles/reviews', data);
  }

  async getProfileReviews(profileId: string): Promise<Review[]> {
    return await apiClient.get<Review[]>(`/profiles/${profileId}/reviews`);
  }

  async markHelpful(reviewId: string): Promise<void> {
    await apiClient.post<void>(`/profiles/reviews/${reviewId}/helpful`);
  }

  async getProfileRatings(profileId: string): Promise<ProfileRatings> {
    return await apiClient.get<ProfileRatings>(`/profiles/${profileId}/ratings`);
  }

  async checkExistingReview(profileId: string, connectionId: string): Promise<Review | null> {
    try {
      return await apiClient.get<Review>(`/profiles/${profileId}/reviews/check/${connectionId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export default new ProfileReviewService();
