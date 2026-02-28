/**
 * Notification Type Definitions
 * 
 * This file contains all type definitions for the notification system.
 */
import type { Message } from '../services/messaging.service';
import type { Notification as BackendNotification } from '../services/notification.service';

/**
 * General notification data structure
 * Used for likes, comments, follows, mentions, etc.
 * NOTE: Message notifications are handled separately via MessageToastData
 */
export interface NotificationData {
  id: string;
  sender: {
    name: string;
    avatar?: string;
  };
  content: string;
  conversationId?: string; // For message notifications (deprecated - use MessageToastData)
  postId?: string; // For post-related notifications
  timestamp: Date;
  type?: 'like' | 'comment' | 'follow' | 'mention'; // Removed 'message' type
}

/**
 * Message toast notification data structure
 * Used exclusively for message notifications that appear near Messages icon
 */
export interface MessageToastData {
  id: string;
  sender: {
    name: string;
    avatar?: string;
  };
  content: string;
  conversationId: string;
  timestamp: Date;
}

/**
 * Notification context type
 */
export interface NotificationContextType {
  // General notifications (likes, comments, follows, etc.) - shown in bell dropdown
  notifications: NotificationData[];
  showNotification: (data: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Backend general notifications (collaboration requests, etc.) - shown in bell dropdown
  generalNotifications: BackendNotification[];
  generalUnreadCount: number;
  loadGeneralNotifications: () => void;
  
  // Message notifications (unread count + toast notifications) - shown at Messages icon
  unreadCount: number;
  updateUnreadCount: () => void;
  messageToasts: MessageToastData[];
  showMessageToast: (data: Omit<MessageToastData, 'id' | 'timestamp'>) => void;
  removeMessageToast: (id: string) => void;
  clearMessageNotifications: () => void;

  /**
   * Messaging page integration
   * Allows the Messages page to inform the notification system about
   * the currently open conversation so we can avoid noisy toasts and
   * unread increments for the active thread.
   */
  setActiveConversation: (conversationId: string | null) => void;
  setIsMessagesPageActive: (isActive: boolean) => void;

  /**
   * Subscribe to raw message events that have already been processed by
   * the notification system. This keeps WebSocket handling centralized
   * in NotificationContext while still allowing the Messages page to
   * update its local thread state.
   */
  subscribeToMessages: (listener: (message: Message) => void) => () => void;
  
  /**
   * WebSocket connection status for messaging
   */
  messagingConnected: boolean;
}
