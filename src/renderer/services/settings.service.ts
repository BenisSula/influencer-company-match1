import { apiClient } from './api-client';

export interface UserSettings {
  id: string;
  userId: string;
  // Privacy Settings
  profileVisibility: string;
  showInSearch: boolean;
  showActivityStatus: boolean;
  messagePermission: string;
  emailVisibility: string;
  // Notification Settings
  emailNewMatch: boolean;
  emailNewMessage: boolean;
  emailConnectionRequest: boolean;
  emailPostInteractions: boolean;
  emailWeeklySummary: boolean;
  emailMarketing: boolean;
  // Communication Settings
  readReceipts: boolean;
  typingIndicators: boolean;
  // Preferences
  language: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Default settings to use when API is unavailable
export const defaultUserSettings: UserSettings = {
  id: '',
  userId: '',
  profileVisibility: 'public',
  showInSearch: true,
  showActivityStatus: true,
  messagePermission: 'everyone',
  emailVisibility: 'connections',
  emailNewMatch: true,
  emailNewMessage: true,
  emailConnectionRequest: true,
  emailPostInteractions: true,
  emailWeeklySummary: false,
  emailMarketing: false,
  readReceipts: true,
  typingIndicators: true,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class SettingsService {
  async getSettings(): Promise<UserSettings> {
    return apiClient.get<UserSettings>('/settings');
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return apiClient.put<UserSettings>('/settings', settings);
  }

  async resetSettings(): Promise<UserSettings> {
    return apiClient.post<UserSettings>('/settings/reset');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/settings/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async deactivateAccount(password: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/settings/deactivate', { password });
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/settings/delete', { password });
  }
}

export const settingsService = new SettingsService();
