import { apiClient } from './api-client';

export interface Review {
  id: string;
  overallRating: number;
  communicationRating?: number;
  professionalismRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  comment: string;
  projectName?: string;
  collaborationType?: string;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  helpfulCount: number;
}

export interface ReviewRatings {
  averageOverall: number;
  averageCommunication: number;
  averageProfessionalism: number;
  averageQuality: number;
  averageTimeliness: number;
  totalReviews: number;
}

class ReviewsService {
  async getProfileReviews(profileId: string, limit: number = 10): Promise<Review[]> {
    try {
      const response = await apiClient.get<Review[]>(
        `/profiles/${profileId}/reviews?limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return [];
    }
  }

  async getProfileRatings(profileId: string): Promise<ReviewRatings> {
    try {
      const response = await apiClient.get<ReviewRatings>(
        `/profiles/${profileId}/ratings`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
      return {
        averageOverall: 0,
        averageCommunication: 0,
        averageProfessionalism: 0,
        averageQuality: 0,
        averageTimeliness: 0,
        totalReviews: 0,
      };
    }
  }

  async markReviewHelpful(reviewId: string): Promise<void> {
    try {
      await apiClient.post(`/profiles/reviews/${reviewId}/helpful`);
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      throw error;
    }
  }

  async submitReview(
    profileId: string,
    connectionId: string,
    reviewData: {
      overallRating: number;
      communicationRating: number;
      professionalismRating: number;
      qualityRating: number;
      timelinessRating: number;
      comment: string;
      projectName?: string;
      collaborationType?: string;
    }
  ): Promise<Review> {
    try {
      const response = await apiClient.post<Review>(
        `/profiles/${profileId}/reviews`,
        {
          ...reviewData,
          connectionId,
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }
}

export const reviewsService = new ReviewsService();
