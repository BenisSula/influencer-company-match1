import { adminApiClient } from './admin-api-client';

export interface AdminReview {
  id: string;
  profileId: string;
  reviewerId: string;
  reviewerName?: string;
  profileName?: string;
  overallRating: number;
  communicationRating: number;
  professionalismRating: number;
  qualityRating: number;
  timelinessRating: number;
  comment: string;
  isFeatured: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsListResponse {
  data: AdminReview[];
  total: number;
  featured: number;
  averageRating: number;
}

class AdminReviewsService {
  async getAllReviews(page: number = 1, limit: number = 50): Promise<ReviewsListResponse> {
    return await adminApiClient.get<ReviewsListResponse>('/admin/reviews', { 
      page: page.toString(), 
      limit: limit.toString() 
    });
  }

  async getReview(id: string): Promise<AdminReview> {
    return await adminApiClient.get<AdminReview>(`/admin/reviews/${id}`);
  }

  async toggleFeatured(id: string, featured: boolean): Promise<AdminReview> {
    return await adminApiClient.patch<AdminReview>(`/admin/reviews/${id}/feature`, { featured });
  }

  async deleteReview(id: string): Promise<void> {
    await adminApiClient.delete<void>(`/admin/reviews/${id}`);
  }

  async getReviewStats(): Promise<{ total: number; featured: number; averageRating: number }> {
    return await adminApiClient.get<{ total: number; featured: number; averageRating: number }>('/admin/reviews/stats');
  }
}

export default new AdminReviewsService();
