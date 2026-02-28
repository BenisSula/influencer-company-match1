import { adminApiClient } from './admin-api-client';

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  subscriptionTier: 'trial' | 'basic' | 'pro' | 'enterprise';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    maxUsers: number;
    maxMatches: number;
    aiMatching: boolean;
    analytics: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  subdomain: string;
  name: string;
  subscriptionTier?: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  adminEmail: string;
  adminPassword: string;
  adminFullName: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
}

export interface UpdateTenantDto {
  name?: string;
  subscriptionTier?: 'trial' | 'basic' | 'pro' | 'enterprise';
  status?: 'trial' | 'active' | 'suspended' | 'cancelled';
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface TenantListResponse {
  data: Tenant[];
  total: number;
}

class AdminTenantService {
  async getTenants(page: number = 1, limit: number = 20): Promise<TenantListResponse> {
    return await adminApiClient.get<TenantListResponse>('/admin/tenants', { page: page.toString(), limit: limit.toString() });
  }

  async getTenant(id: string): Promise<Tenant> {
    return await adminApiClient.get<Tenant>(`/admin/tenants/${id}`);
  }

  async createTenant(data: CreateTenantDto): Promise<Tenant> {
    return await adminApiClient.post<Tenant>('/admin/tenants', data);
  }

  async updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant> {
    return await adminApiClient.patch<Tenant>(`/admin/tenants/${id}`, data);
  }

  async deleteTenant(id: string): Promise<void> {
    await adminApiClient.delete<void>(`/admin/tenants/${id}`);
  }
}

export default new AdminTenantService();
