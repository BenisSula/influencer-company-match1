import { apiClient } from './api-client';

export interface ProfileData {
  id: string;
  name: string;
  type: 'influencer' | 'company';
  niche?: string;
  industry?: string;
  audienceSize?: number;
  engagementRate?: number;
  budget?: number;
  location?: string;
  platforms?: string[];
  bio?: string;
  description?: string;
  portfolioUrl?: string;
  website?: string;
  budgetRange?: {
    min?: number;
    max?: number;
  };
  contentType?: string[];
  collaborationPreference?: string;
  verificationStatus?: boolean;
  companySize?: string;
  campaignType?: string[];
}

export class ProfileService {
  async getMyProfile(): Promise<ProfileData> {
    const response = await apiClient.get('/auth/me');
    return response.profile;
  }

  async getProfileById(id: string): Promise<ProfileData> {
    const response = await apiClient.get(`/profiles/user/${id}`);
    return response;
  }

  async updateInfluencerProfile(profileId: string, data: any) {
    return apiClient.patch(`/profiles/influencer/${profileId}`, data);
  }

  async updateCompanyProfile(profileId: string, data: any) {
    return apiClient.patch(`/profiles/company/${profileId}`, data);
  }
}

export const profileService = new ProfileService();
