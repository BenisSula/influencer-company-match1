import { apiClient } from './api-client';

export interface Notification {
  id: string;
  sender: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    influencerProfile?: {
      name?: string;
      avatarUrl?: string;
    };
    companyProfile?: {
      name?: string;
      logoUrl?: string;
    };
  };
  type: string;
  content: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async getNotifications(limit = 20): Promise<Notification[]> {
    const response = await apiClient.get(`/notifications?limit=${limit}`);
    return response as Notification[];
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');
    return (response as any).count || 0;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  }
}

export const notificationService = new NotificationService();
