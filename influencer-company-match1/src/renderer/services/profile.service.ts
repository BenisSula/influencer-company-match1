import { apiClient } from './api-client';

export interface ProfileData {
  id: string;
  name: string;
  email?: string;
  role?: 'INFLUENCER' | 'COMPANY';
  type?: 'influencer' | 'company';
  avatarUrl?: string;
  location?: string;
  bio?: string;
  description?: string;
  niche?: string;
  industry?: string;
  audienceSize?: number;
  engagementRate?: number;
  platforms?: string[];
  budget?: number;
  budgetRange?: { min?: number; max?: number };
  minBudget?: number;
  maxBudget?: number;
  companySize?: string;
  portfolioUrl?: string;
  website?: string;
  contentType?: string | string[];
  collaborationPreference?: string;
  verificationStatus?: string | boolean;
  campaignType?: string | string[];
  preferredInfluencerNiches?: string;
  collaborationDuration?: string;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  savedAt?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

class ProfileService {
  async saveProfile(profileId: string, notes?: string, tags?: string[]): Promise<void> {
    await apiClient.post(`/profiles/${profileId}/save`, { notes, tags });
  }

  async unsaveProfile(profileId: string): Promise<void> {
    await apiClient.delete(`/profiles/${profileId}/save`);
  }

  async getSavedProfiles(): Promise<ProfileData[]> {
    return apiClient.get('/profiles/saved');
  }

  async isProfileSaved(profileId: string): Promise<boolean> {
    const response = await apiClient.get<{ saved: boolean }>(`/profiles/${profileId}/saved-status`);
    return response.saved;
  }

  async getProfile(userId: string): Promise<ProfileData> {
    return apiClient.get(`/profiles/user/${userId}`);
  }
}

export const profileService = new ProfileService();
