import { adminApiClient } from './admin-api-client';

class AdminUserService {
  async getUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    if (filters?.role) params.role = filters.role;
    if (filters?.isActive !== undefined) params.isActive = String(filters.isActive);
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);

    return await adminApiClient.get('/admin/users', params);
  }

  async getUser(id: string) {
    return await adminApiClient.get(`/admin/users/${id}`);
  }

  async getUserProfile(id: string) {
    return await adminApiClient.get(`/admin/users/${id}/profile`);
  }

  async getStats() {
    return await adminApiClient.get('/admin/users/stats');
  }

  async getUserActivity(id: string, page: number = 1, limit: number = 50) {
    return await adminApiClient.get(`/admin/users/${id}/activity`, { 
      page: String(page), 
      limit: String(limit) 
    });
  }

  async updateUser(id: string, data: any) {
    return await adminApiClient.patch(`/admin/users/${id}`, data);
  }

  async updateUserProfile(id: string, data: any) {
    return await adminApiClient.patch(`/admin/users/${id}/profile`, data);
  }

  async toggleUserStatus(id: string) {
    return await adminApiClient.patch(`/admin/users/${id}/toggle-status`, {});
  }

  async deleteUser(id: string) {
    return await adminApiClient.delete(`/admin/users/${id}`);
  }

  async bulkDelete(ids: string[]) {
    return await adminApiClient.post('/admin/users/bulk-delete', { ids });
  }

  async bulkUpdateStatus(ids: string[], isActive: boolean) {
    return await adminApiClient.post('/admin/users/bulk-update-status', { ids, isActive });
  }

  async exportUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const params: Record<string, string> = {};
    if (filters?.role) params.role = filters.role;
    if (filters?.isActive !== undefined) params.isActive = String(filters.isActive);
    if (filters?.search) params.search = filters.search;

    return await adminApiClient.get('/admin/users/export', params);
  }

  async createUser(data: {
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
  }) {
    return await adminApiClient.post('/admin/users', data);
  }
}

export const adminUserService = new AdminUserService();
