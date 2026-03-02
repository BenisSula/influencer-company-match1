/**
 * NotificationContext
 * 
 * Manages the notification system for the application.
 * Handles two types of notifications:
 * 1. General notifications (likes, comments, follows) - shown in bell dropdown
 * 2. Message notifications (toast + unread count) - shown at Messages icon
 * 
 * @example
 * ```tsx
 * const { notifications, showNotification, messageToasts, unreadCount } = useNotifications();
 * 
 * // Show a like notification (bell dropdown)
 * showNotification({
 *   sender: { name: 'John Doe', avatar: '/avatar.jpg' },
 *   content: 'liked your post',
 *   type: 'like'
 * });
 * 
 * // Show a message toast (Messages icon)
 * showMessageToast({
 *   sender: { name: 'Jane Doe', avatar: '/avatar.jpg' },
 *   content: 'Hey, how are you?',
 *   conversationId: '123'
 * });
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { NotificationData, MessageToastData, NotificationContextType } from '../types/notification.types';
import { messagingService, Message } from '../services/messaging.service';
import { notificationService, Notification as BackendNotification } from '../services/notification.service';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [generalNotifications, setGeneralNotifications] = useState<BackendNotification[]>([]);
  const [generalUnreadCount, setGeneralUnreadCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageToasts, setMessageToasts] = useState<MessageToastData[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isMessagesPageActive, setIsMessagesPageActive] = useState(false);
  const [messagingConnected, setMessagingConnected] = useState(false);
  const messageListenersRef = useRef<Set<(message: Message) => void>>(new Set());

  /**
   * Add a new notification to the list
   * Used for general notifications (likes, comments, follows, etc.)
   * NOTE: Message notifications should use showMessageToast instead
   */
  const showNotification = (data: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const notification: NotificationData = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, notification]);
  };

  /**
   * Remove a specific notification from the list
   */
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * Clear all general notifications
   */
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  /**
   * Add a new message toast notification
   * Used exclusively for message notifications that appear near Messages icon
   */
  const showMessageToast = (data: Omit<MessageToastData, 'id' | 'timestamp'>) => {
    const toast: MessageToastData = {
      ...data,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setMessageToasts(prev => {
      // Limit to 3 toasts max
      const newToasts = [...prev, toast];
      return newToasts.slice(-3);
    });
  };

  /**
   * Remove a specific message toast
   */
  const removeMessageToast = (id: string) => {
    setMessageToasts(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Clear all message notifications (toasts and unread count)
   */
  const clearMessageNotifications = () => {
    setMessageToasts([]);
    setUnreadCount(0);
  };

  /**
   * Update unread message count from backend
   */
  const updateUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const count = await messagingService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently fail if unauthorized (user not logged in)
      if (error instanceof Error && error.message.includes('401')) {
        setUnreadCount(0);
      } else {
        console.error('[NotificationContext] Failed to update unread count:', error);
      }
    }
  };

  /**
   * Load general notifications from backend (collaboration requests, etc.)
   */
  const loadGeneralNotifications = async () => {
    if (!user) {
      setGeneralNotifications([]);
      setGeneralUnreadCount(0);
      return;
    }

    try {
      const notifications = await notificationService.getNotifications();
      setGeneralNotifications(notifications);

      const count = await notificationService.getUnreadCount();
      setGeneralUnreadCount(count);
    } catch (error) {
      console.error('[NotificationContext] Failed to load general notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      updateUnreadCount();
      loadGeneralNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadGeneralNotifications, 30000);
      
      // Listen for notification read events
      const handleNotificationRead = () => {
        loadGeneralNotifications();
      };
      window.addEventListener('notificationRead', handleNotificationRead);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notificationRead', handleNotificationRead);
      };
    }
  }, [user]);

  // Connect to messaging service and listen for new messages.
  // IMPORTANT: This is the ONLY place that should call messagingService.connect.
  // Other screens (like Messages) must use this context API instead of
  // touching the WebSocket connection directly.
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Connect to WebSocket with retry
    const connectWithRetry = () => {
      try {
        messagingService.connect(token);
      } catch (error) {
        console.error('[NotificationContext] Failed to connect, retrying in 3s:', error);
        setTimeout(connectWithRetry, 3000);
      }
    };
    
    connectWithRetry();

    // Handle new messages - show toast and update unread count
    const handleNewMessage = (message: Message) => {
      console.log('[NotificationContext] New message received:', message);
      
      // Only show notification if sender is not current user
      if (message.senderId === user.id) {
        return;
      }

      // If the user is actively viewing this conversation in the Messages page,
      // skip toast + unread increments to avoid noise and double counting.
      if (isMessagesPageActive && activeConversationId === message.conversationId) {
        return;
      }
      
      // Optimistically increment unread count for instant feedback
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification near Messages icon
      showMessageToast({
        sender: {
          name: (message.sender as any)?.profile?.fullName || message.sender?.name || message.sender?.email || 'Someone',
          avatar: (message.sender as any)?.profile?.avatarUrl || message.sender?.avatarUrl,
        },
        content: message.content,
        conversationId: message.conversationId,
      });
      
      // Sync with backend in background (debounced)
      setTimeout(() => updateUnreadCount(), 1000);

      // Fan out to any listeners (e.g. Messages page) that care about
      // updating local conversation state.
      messageListenersRef.current.forEach((listener) => {
        try {
          listener(message);
        } catch (err) {
          console.error('[NotificationContext] Message listener failed:', err);
        }
      });
    };

    messagingService.onNewMessage(handleNewMessage);

    // Periodically check connection and reconnect if needed
    const connectionCheckInterval = setInterval(() => {
      const connected = messagingService.isConnected();
      setMessagingConnected(connected);
      
      if (!connected) {
        console.log('[NotificationContext] Connection lost, reconnecting...');
        connectWithRetry();
      }
    }, 5000); // Check every 5 seconds

    // Initial connection status check
    setTimeout(() => {
      setMessagingConnected(messagingService.isConnected());
    }, 1000);

    return () => {
      messagingService.offNewMessage(handleNewMessage);
      clearInterval(connectionCheckInterval);
      // Keep connection alive - don't disconnect
    };
  }, [user, activeConversationId, isMessagesPageActive]);

  const subscribeToMessages = useCallback(
    (listener: (message: Message) => void) => {
      messageListenersRef.current.add(listener);
      return () => {
        messageListenersRef.current.delete(listener);
      };
    },
    [],
  );

  const value: NotificationContextType = {
    showNotification,
    notifications,
    removeNotification,
    clearAllNotifications,
    unreadCount,
    updateUnreadCount,
    messageToasts,
    showMessageToast,
    removeMessageToast,
    clearMessageNotifications,
    setActiveConversation: setActiveConversationId,
    setIsMessagesPageActive,
    subscribeToMessages,
    generalNotifications,
    generalUnreadCount,
    loadGeneralNotifications,
    messagingConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
