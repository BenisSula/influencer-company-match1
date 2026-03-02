import { apiClient } from './api-client';

export interface FeedPost {
  id: string;
  authorId: string;
  author: {
    id: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  content: string;
  postType: 'update' | 'collaboration_story' | 'campaign_announcement' | 'portfolio';
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  author: {
    id: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  postType?: 'update' | 'collaboration_story' | 'campaign_announcement' | 'portfolio';
  mediaUrls?: string[];
}

export interface CreateCommentData {
  content: string;
}

export interface FeedQuery {
  page?: number;
  limit?: number;
  postType?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class FeedService {
  async createPost(data: CreatePostData): Promise<FeedPost> {
    return apiClient.post<FeedPost>('/feed/posts', data);
  }

  async getFeed(query?: FeedQuery): Promise<PaginatedResponse<FeedPost>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.postType) params.append('postType', query.postType);

    const queryString = params.toString();
    return apiClient.get<PaginatedResponse<FeedPost>>(
      `/feed/posts${queryString ? `?${queryString}` : ''}`
    );
  }

  async getPersonalizedFeed(query?: FeedQuery): Promise<PaginatedResponse<FeedPost>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.postType) params.append('postType', query.postType);

    const queryString = params.toString();
    return apiClient.get<PaginatedResponse<FeedPost>>(
      `/feed/personalized${queryString ? `?${queryString}` : ''}`
    );
  }

  async getPost(postId: string): Promise<FeedPost> {
    return apiClient.get<FeedPost>(`/feed/posts/${postId}`);
  }

  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/feed/posts/${postId}`);
  }

  async likePost(postId: string): Promise<void> {
    await apiClient.post(`/feed/posts/${postId}/like`);
  }

  async unlikePost(postId: string): Promise<void> {
    await apiClient.delete(`/feed/posts/${postId}/like`);
  }

  async hasLikedPost(postId: string): Promise<boolean> {
    const response = await apiClient.get<{ liked: boolean }>(`/feed/posts/${postId}/liked`);
    return response.liked;
  }

  async createComment(postId: string, data: CreateCommentData): Promise<PostComment> {
    return apiClient.post<PostComment>(`/feed/posts/${postId}/comments`, data);
  }

  async getComments(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<PostComment>> {
    return apiClient.get<PaginatedResponse<PostComment>>(
      `/feed/posts/${postId}/comments?page=${page}&limit=${limit}`
    );
  }

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/feed/comments/${commentId}`);
  }

  async savePost(postId: string, collectionId?: string): Promise<void> {
    await apiClient.post(`/feed/posts/${postId}/save`, { collectionId });
  }

  async unsavePost(postId: string): Promise<void> {
    await apiClient.delete(`/feed/posts/${postId}/save`);
  }

  async hasSavedPost(postId: string): Promise<boolean> {
    const response = await apiClient.get<{ saved: boolean }>(`/feed/posts/${postId}/saved`);
    return response.saved;
  }

  async getSavedPosts(page: number = 1, limit: number = 20): Promise<PaginatedResponse<FeedPost>> {
    return apiClient.get<PaginatedResponse<FeedPost>>(
      `/feed/saved?page=${page}&limit=${limit}`
    );
  }

  async getPostInteractionStatus(postId: string): Promise<{ liked: boolean; saved: boolean }> {
    return apiClient.get<{ liked: boolean; saved: boolean }>(`/feed/posts/${postId}/interaction-status`);
  }

  // ==================== REACTION METHODS ====================

  async reactToPost(postId: string, reactionType: string): Promise<void> {
    await apiClient.post(`/feed/posts/${postId}/react`, { reactionType });
  }

  async removeReaction(postId: string): Promise<void> {
    await apiClient.delete(`/feed/posts/${postId}/react`);
  }

  async getPostReactions(postId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    userReaction: string | null;
    recentReactors: Array<{
      userId: string;
      userName: string;
      avatarUrl: string | null;
      reactionType: string;
    }>;
  }> {
    return apiClient.get(`/feed/posts/${postId}/reactions`);
  }

  // ==================== COLLECTION METHODS ====================

  async createCollection(name: string, description?: string): Promise<any> {
    return apiClient.post('/feed/collections', { name, description });
  }

  async getCollections(): Promise<any[]> {
    return apiClient.get('/feed/collections');
  }

  async getCollection(id: string): Promise<any> {
    return apiClient.get(`/feed/collections/${id}`);
  }

  async updateCollection(id: string, name?: string, description?: string): Promise<any> {
    return apiClient.put(`/feed/collections/${id}`, { name, description });
  }

  async deleteCollection(id: string): Promise<void> {
    await apiClient.delete(`/feed/collections/${id}`);
  }

  async getSavedPostsByCollection(collectionId?: string): Promise<FeedPost[]> {
    const params = collectionId ? `?collectionId=${collectionId}` : '';
    return apiClient.get(`/feed/saved/by-collection${params}`);
  }

  // ==================== SHARE METHODS ====================

  async trackShare(itemId: string, shareType: string): Promise<void> {
    await apiClient.post(`/feed/posts/${itemId}/share`, { shareType });
  }

  async getShareCount(itemId: string): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>(`/feed/posts/${itemId}/share-count`);
  }

  async getShareDetails(itemId: string): Promise<{
    count: number;
    breakdown: Record<string, number>;
    recentSharers: any[];
  }> {
    return apiClient.get(`/feed/posts/${itemId}/share-details`);
  }

  // ==================== HASHTAG METHODS ====================

  async getTrendingHashtags(limit: number = 10) {
    return apiClient.get<{ hashtags: Hashtag[] }>(`/feed/hashtags/trending?limit=${limit}`);
  }

  async searchHashtags(query: string, limit: number = 10) {
    return apiClient.get<{ hashtags: Hashtag[] }>(`/feed/hashtags/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getPostsByHashtag(hashtagName: string, page: number = 1, limit: number = 20) {
    return apiClient.get<{ posts: FeedPost[]; hashtag: Hashtag | null }>(
      `/feed/hashtags/${encodeURIComponent(hashtagName)}/posts?page=${page}&limit=${limit}`
    );
  }

  // ==================== MENTION METHODS ====================

  async searchUsersForMention(query: string, limit: number = 10) {
    return apiClient.get<{ users: MentionUser[] }>(
      `/feed/mentions/search-users?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async getMyMentions(page: number = 1, limit: number = 20) {
    return apiClient.get<{ mentions: UserMention[] }>(
      `/feed/mentions/my-mentions?page=${page}&limit=${limit}`
    );
  }
}

// ==================== TYPES ====================

export interface Hashtag {
  id: string;
  name: string;
  normalizedName: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MentionUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface UserMention {
  id: string;
  post: FeedPost;
  mentionerUser: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export const feedService = new FeedService();
