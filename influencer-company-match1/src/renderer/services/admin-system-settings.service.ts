import { adminApiClient } from './admin-api-client';

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  isEncrypted?: boolean;
}

class AdminSystemSettingsService {
  async getAllSettings() {
    return await adminApiClient.get<SystemSetting[]>('/admin/system-settings');
  }

  async getSetting(key: string) {
    return await adminApiClient.get<SystemSetting>(`/admin/system-settings/${key}`);
  }

  async updateSetting(key: string, value: string, isEncrypted = false) {
    return await adminApiClient.put<SystemSetting>(`/admin/system-settings/${key}`, { value, isEncrypted });
  }

  async updateMultipleSettings(settings: Array<{ key: string; value: string; isEncrypted?: boolean }>) {
    return await adminApiClient.post<{ updated: number }>('/admin/system-settings/bulk-update', { settings });
  }

  async deleteSetting(key: string) {
    return await adminApiClient.delete<{ message: string }>(`/admin/system-settings/${key}`);
  }

  async getEmailSettings() {
    return await adminApiClient.get<SystemSetting[]>('/admin/system-settings/category/email');
  }

  async getStorageSettings() {
    return await adminApiClient.get<SystemSetting[]>('/admin/system-settings/category/storage');
  }

  async getSecuritySettings() {
    return await adminApiClient.get<SystemSetting[]>('/admin/system-settings/category/security');
  }

  async getAPISettings() {
    return await adminApiClient.get<SystemSetting[]>('/admin/system-settings/category/api');
  }

  async initializeDefaultSettings() {
    return await adminApiClient.post<{ message: string }>('/admin/system-settings/initialize', {});
  }

  async testEmail(config: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    emailFrom: string;
    testRecipient: string;
  }) {
    return await adminApiClient.post<{ success: boolean; message: string }>('/admin/system-settings/test-email', config);
  }

  async testStorage(config: {
    storageProvider: string;
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
  }) {
    return await adminApiClient.post<{ success: boolean; message: string }>('/admin/system-settings/test-storage', config);
  }
}

export default new AdminSystemSettingsService();
