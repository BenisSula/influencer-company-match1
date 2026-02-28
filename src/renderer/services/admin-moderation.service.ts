import { adminApiClient } from './admin-api-client';

export interface ContentFlag {
  id: string;
  contentType: string;
  contentId: string;
  reporter: {
    id: string;
    email: string;
    fullName: string;
  };
  reason: string;
  description: string;
  status: string;
  reviewedBy?: {
    id: string;
    email: string;
    fullName: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  content?: any;
  createdAt: string;
}

export interface UserBan {
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  bannedBy: {
    id: string;
    email: string;
    fullName: string;
  };
  reason: string;
  notes?: string;
  type: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

class AdminModerationService {
  async getFlaggedContent(filters?: {
    status?: string;
    contentType?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.contentType) params.contentType = filters.contentType;
    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();

    return await adminApiClient.get('/admin/moderation/flagged-content', params);
  }

  async reviewFlag(flagId: string, decision: 'APPROVED' | 'REJECTED' | 'REMOVED', notes?: string) {
    return await adminApiClient.post(`/admin/moderation/review/${flagId}`, { decision, notes });
  }

  async getReportedUsers(page?: number, limit?: number) {
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();

    return await adminApiClient.get('/admin/moderation/reported-users', params);
  }

  async banUser(
    userId: string,
    reason: string,
    type: 'TEMPORARY' | 'PERMANENT',
    expiresAt?: string,
    notes?: string,
  ) {
    return await adminApiClient.post(`/admin/moderation/ban-user/${userId}`, { 
      reason, 
      type, 
      expiresAt, 
      notes 
    });
  }

  async unbanUser(userId: string) {
    return await adminApiClient.post(`/admin/moderation/unban-user/${userId}`, {});
  }

  async getBannedUsers(page?: number, limit?: number) {
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();

    return await adminApiClient.get('/admin/moderation/banned-users', params);
  }

  async getModerationStats() {
    return await adminApiClient.get('/admin/moderation/stats');
  }

  async createFlag(data: {
    contentType: string;
    contentId: string;
    reporterId: string;
    reason: string;
    description?: string;
  }) {
    return await adminApiClient.post('/admin/moderation/flag', data);
  }
}

export default new AdminModerationService();
