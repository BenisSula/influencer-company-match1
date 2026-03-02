import { apiClient } from './api-client';
import type {
  Campaign,
  CampaignApplication,
  Collaboration,
  CampaignMilestone,
  CampaignFilters,
  CreateCampaignData,
  ApplyCampaignData,
  CreateMilestoneData,
  ApplicationStatus,
  CollaborationStatus,
  MilestoneStatus,
} from '../types/campaign.types';

class CampaignsService {
  // Campaign Management
  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    return apiClient.post<Campaign>('/campaigns', data);
  }

  async updateCampaign(id: string, data: Partial<CreateCampaignData>): Promise<Campaign> {
    return apiClient.put<Campaign>(`/campaigns/${id}`, data);
  }

  async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete(`/campaigns/${id}`);
  }

  async getCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
    const params = new URLSearchParams();
    
    if (filters?.niche) params.append('niche', filters.niche);
    if (filters?.budgetMin) params.append('budgetMin', filters.budgetMin.toString());
    if (filters?.budgetMax) params.append('budgetMax', filters.budgetMax.toString());
    if (filters?.platforms && filters.platforms.length > 0) {
      filters.platforms.forEach(platform => params.append('platforms', platform));
    }
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/campaigns?${queryString}` : '/campaigns';
    
    return apiClient.get<Campaign[]>(url);
  }

  async getCampaignById(id: string): Promise<Campaign> {
    return apiClient.get<Campaign>(`/campaigns/${id}`);
  }

  async getMyCampaigns(): Promise<Campaign[]> {
    return apiClient.get<Campaign[]>('/campaigns/my-campaigns');
  }

  // Application Management
  async applyCampaign(campaignId: string, data: ApplyCampaignData): Promise<CampaignApplication> {
    return apiClient.post<CampaignApplication>(`/campaigns/${campaignId}/apply`, data);
  }

  async getMyApplications(): Promise<CampaignApplication[]> {
    return apiClient.get<CampaignApplication[]>('/campaigns/my-applications/list');
  }

  async getReceivedApplications(): Promise<CampaignApplication[]> {
    return apiClient.get<CampaignApplication[]>('/campaigns/applications/received');
  }

  async withdrawApplication(applicationId: string): Promise<void> {
    return apiClient.delete(`/campaigns/applications/${applicationId}`);
  }

  async getCampaignApplications(campaignId: string): Promise<CampaignApplication[]> {
    return apiClient.get<CampaignApplication[]>(`/campaigns/${campaignId}/applications`);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus.ACCEPTED | ApplicationStatus.REJECTED
  ): Promise<CampaignApplication> {
    return apiClient.put<CampaignApplication>(
      `/campaigns/applications/${applicationId}/status`,
      { status }
    );
  }

  // Collaboration Management
  async getMyCollaborations(): Promise<Collaboration[]> {
    return apiClient.get<Collaboration[]>('/collaborations');
  }

  async getCollaborationById(id: string): Promise<Collaboration> {
    return apiClient.get<Collaboration>(`/collaborations/${id}`);
  }

  async updateCollaborationStatus(
    id: string,
    status: CollaborationStatus
  ): Promise<Collaboration> {
    return apiClient.put<Collaboration>(`/collaborations/${id}/status`, { status });
  }

  // Milestone Management
  async createMilestone(
    collaborationId: string,
    data: CreateMilestoneData
  ): Promise<CampaignMilestone> {
    return apiClient.post<CampaignMilestone>(
      `/collaborations/${collaborationId}/milestones`,
      data
    );
  }

  async updateMilestone(
    milestoneId: string,
    updates: {
      status?: MilestoneStatus;
      title?: string;
      description?: string;
      dueDate?: string;
    }
  ): Promise<CampaignMilestone> {
    return apiClient.put<CampaignMilestone>(
      `/collaborations/milestones/${milestoneId}`,
      updates
    );
  }
}

export const campaignsService = new CampaignsService();
