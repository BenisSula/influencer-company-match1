import { apiClient } from './api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'INFLUENCER' | 'COMPANY';
}

export interface AuthResponse {
  access_token: string;
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
    budgetRange?: {
      min?: number;
      max?: number;
    };
    contentType?: string[];
    collaborationPreference?: string;
    verificationStatus?: boolean;
    companySize?: string;
    campaignType?: string[];
  };
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    apiClient.setToken(response.access_token);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    apiClient.setToken(response.access_token);
    return response;
  }

  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/me');
  }

  logout() {
    apiClient.clearToken();
  }
}

export const authService = new AuthService();
