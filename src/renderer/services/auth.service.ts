import { apiClient } from './api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'INFLUENCER' | 'COMPANY';
  name: string;
  // Step 2 - Influencer fields
  niche?: string;
  primaryPlatform?: string;
  audienceSizeRange?: string;
  // Step 2 - Company fields
  industry?: string;
  companySize?: string;
  budgetRange?: string;
  // Common optional
  location?: string;
}

export interface AuthResponse {
  token: string; // Backend returns 'token', not 'access_token'
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'INFLUENCER' | 'COMPANY' | 'ADMIN';
  profileCompleted?: boolean;
  profileCompletionPercentage?: number;
  avatarUrl?: string;
  // Direct fields on user (from unified backend)
  name?: string;
  bio?: string;
  description?: string;
  niche?: string;
  industry?: string;
  location?: string;
  audienceSize?: number;
  engagementRate?: number;
  budget?: number;
  platforms?: string[];
  // Influencer-specific fields
  portfolioUrl?: string;
  minBudget?: number;
  maxBudget?: number;
  collaborationPreference?: string;
  contentType?: string | string[];
  verificationStatus?: boolean;
  // Company-specific fields
  companySize?: string;
  website?: string;
  campaignType?: string[];
  preferredInfluencerNiches?: string;
  collaborationDuration?: string;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  // Nested profile object (for backward compatibility)
  profile?: {
    id: string;
    name: string;
    type: 'influencer' | 'company';
    niche?: string;
    industry?: string;
    location?: string;
    audienceSize?: number;
    engagementRate?: number;
    budget?: number;
    platforms?: string[];
    bio?: string;
    description?: string;
    portfolioUrl?: string;
    website?: string;
    avatarUrl?: string;
    budgetRange?: {
      min?: number;
      max?: number;
    };
    contentType?: string[];
    collaborationPreference?: string;
    verificationStatus?: boolean;
    companySize?: string;
    campaignType?: string[];
    preferredInfluencerNiches?: string;
    collaborationDuration?: string;
    minAudienceSize?: number;
    maxAudienceSize?: number;
  };
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    apiClient.setToken(response.token); // Use 'token' instead of 'access_token'
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    apiClient.setToken(response.token); // Use 'token' instead of 'access_token'
    return response;
  }

  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/me');
  }

  async completeProfile(): Promise<void> {
    await apiClient.post('/auth/complete-profile');
  }

  logout() {
    apiClient.clearToken();
  }
}

export const authService = new AuthService();
