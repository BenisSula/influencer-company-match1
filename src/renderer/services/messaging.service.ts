import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3000';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    email: string;
    name: string; // ✅ Changed from nested profile.fullName to flat name
    avatarUrl?: string; // ✅ Flat structure
  };
  content: string;
  attachmentUrl?: string;
  readAt?: string;
  createdAt: string;
  /**
   * Client-side only status used for optimistic updates and error states.
   * Not persisted on the backend.
   */
  status?: 'pending' | 'failed' | 'sent';
}

export interface MessagesPage {
  messages: Message[];
  nextCursor: string | null;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: any;
  user2: any;
  messages?: Message[];
  /**
   * Last message content for quick preview.
   * This is populated on the backend via the last message relation
   * and may also be updated optimistically on the client.
   */
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount1: number;
  unreadCount2: number;
  createdAt: string;
}

class MessagingService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    if (this.socket?.connected) {
      console.log('[MessagingService] Already connected');
      return this.socket;
    }

    // Disconnect old socket if exists
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${API_URL}/messaging`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[MessagingService] Connected to messaging server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[MessagingService] Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[MessagingService] Connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[MessagingService] Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[MessagingService] Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[MessagingService] Reconnection failed');
    });

    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  reconnect() {
    if (this.token) {
      this.disconnect();
      this.connect(this.token);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('new_message', callback);
  }

  offNewMessage(callback: (message: Message) => void) {
    this.socket?.off('new_message', callback);
  }

  onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.on('user_typing', callback);
  }

  offUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.off('user_typing', callback);
  }

  sendMessage(recipientId: string, content: string, attachmentUrl?: string) {
    return new Promise((resolve, reject) => {
      this.socket?.emit('send_message', { recipientId, content, attachmentUrl }, (response: any) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  startTyping(recipientId: string) {
    this.socket?.emit('typing_start', { recipientId });
  }

  stopTyping(recipientId: string) {
    this.socket?.emit('typing_stop', { recipientId });
  }

  markAsRead(conversationId: string) {
    this.socket?.emit('mark_read', { conversationId });
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/api/messaging/conversations`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  }

  async getMessages(
    conversationId: string,
    options?: { before?: string; limit?: number },
  ): Promise<MessagesPage> {
    const params = new URLSearchParams();
    if (options?.limit) {
      params.set('limit', String(options.limit));
    }
    if (options?.before) {
      params.set('before', options.before);
    }

    const query = params.toString();
    const url = `${API_URL}/api/messaging/conversations/${conversationId}/messages${
      query ? `?${query}` : ''
    }`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  }

  async sendMessageHTTP(recipientId: string, content: string, attachmentUrl?: string): Promise<Message> {
    // Ensure token is set
    if (!this.token) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      this.token = token;
    }
    
    const response = await fetch(`${API_URL}/api/messaging/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ recipientId, content, attachmentUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      // Handle privacy restrictions specifically
      if (response.status === 403) {
        const privacyError = new Error(errorMessage);
        (privacyError as any).isPrivacyRestriction = true;
        throw privacyError;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/messaging/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark conversation as read');
    }
  }

  async getOrCreateConversation(recipientId: string): Promise<Conversation> {
    // First, get the user ID from the profile ID
    const userIdResponse = await fetch(`${API_URL}/api/profiles/${recipientId}/user-id`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!userIdResponse.ok) {
      throw new Error('Failed to get user ID from profile');
    }

    const { userId } = await userIdResponse.json();

    // Now check if conversation exists with this user
    const conversations = await this.getConversations();
    const existing = conversations.find(c => 
      c.user1Id === userId || c.user2Id === userId
    );
    
    if (existing) {
      return existing;
    }

    // Create by sending an initial message
    await this.sendMessageHTTP(userId, 'Hi!');
    const updatedConversations = await this.getConversations();
    const newConversation = updatedConversations.find(c => 
      c.user1Id === userId || c.user2Id === userId
    );
    
    if (!newConversation) {
      throw new Error('Failed to create conversation');
    }
    
    return newConversation;
  }

  async getUnreadCount(): Promise<number> {
    if (!this.token) {
      return 0;
    }
    
    const response = await fetch(`${API_URL}/api/messaging/unread-count`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return 0; // Not authenticated, return 0
      }
      throw new Error('Failed to fetch unread count');
    }

    const data = await response.json();
    return data.count;
  }
}

export const messagingService = new MessagingService();
