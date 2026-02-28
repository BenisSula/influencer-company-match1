import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ConversationList } from '../components/ConversationList/ConversationList';
import { MessageThread } from '../components/MessageThread/MessageThread';
import { CollaborationFeedbackModal } from '../components/CollaborationFeedbackModal/CollaborationFeedbackModal';
import { messagingService, Conversation, Message } from '../services/messaging.service';
import { matchingService } from '../services/matching.service';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import { useCollaborationOutcomes } from '../hooks/useCollaborationOutcomes';
import { useNotifications } from '../contexts/NotificationContext';
import { usePageVisibility } from '../hooks/usePageVisibility';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { HiStar } from 'react-icons/hi';
import './Messages.css';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const { updateConnectionStatus } = useConnection();
  const {
    updateUnreadCount,
    setActiveConversation,
    setIsMessagesPageActive,
    subscribeToMessages,
  } = useNotifications();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('messaging-sidebar-collapsed') === 'true';
  });
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackConnectionId, setFeedbackConnectionId] = useState<string | null>(null);
  const { recordOutcome } = useCollaborationOutcomes();
  
  // Cache for messages per conversation (prevents reloading)
  const messagesCache = useRef<Map<string, Message[]>>(new Map());
  const messageCursors = useRef<Map<string, string | null>>(new Map());
  
  // Track if conversations have been loaded
  const conversationsLoaded = useRef(false);

  /**
   * Clear only toast notifications when page is viewed
   * Badge and unread counts persist until user clicks on conversation
   */
  usePageVisibility(() => {
    if (user) {
      // Only clear toast notifications, keep badge visible
      console.log('[Messages] Clearing toast notifications only');
      // Note: We don't call clearMessageNotifications() here anymore
      // Badge will update when user clicks on specific conversation
    }
  });

  // Debounced update functions to prevent excessive API calls
  const updateUnreadCountTimeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedUpdateUnreadCount = useCallback(() => {
    if (updateUnreadCountTimeoutRef.current) {
      clearTimeout(updateUnreadCountTimeoutRef.current);
    }
    updateUnreadCountTimeoutRef.current = setTimeout(() => {
      updateUnreadCount();
    }, 300);
  }, [updateUnreadCount]);

  const handleOpenFeedbackModal = async () => {
    if (!selectedConversation || !user) return;
    
    // Get the other user's ID
    const otherUserId = selectedConversation.user1Id === user.id 
      ? selectedConversation.user2Id 
      : selectedConversation.user1Id;
    
    try {
      // Fetch the connection ID
      const connection = await matchingService.getConnectionByUserId(otherUserId);
      
      if (!connection || !connection.id) {
        alert('No connection found. You need to connect with this user first.');
        return;
      }
      
      setFeedbackConnectionId(connection.id);
      setFeedbackModalOpen(true);
    } catch (error) {
      console.error('[Messages] Failed to get connection:', error);
      alert('Failed to load connection. Please try again.');
    }
  };

  const toggleSidebar = useCallback(() => {
    const newState = !sidebarCollapsed;
    
    // Immediate state update for instant visual feedback
    setSidebarCollapsed(newState);
    
    // Persist to localStorage asynchronously to avoid blocking UI
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        localStorage.setItem('messaging-sidebar-collapsed', String(newState));
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        localStorage.setItem('messaging-sidebar-collapsed', String(newState));
      }, 0);
    }
  }, [sidebarCollapsed]);

  // Define loadConversations before it's used in useEffect
  const loadConversations = useCallback(async () => {
    try {
      console.log('[Messages] Loading conversations...');
      const convos = await messagingService.getConversations();
      console.log('[Messages] Loaded conversations:', convos.length, convos);
      
      // Sort conversations: Unread first, then by lastMessageAt
      const sorted = convos.sort((a, b) => {
        const aUnread = a.user1Id === user?.id ? a.unreadCount1 : a.unreadCount2;
        const bUnread = b.user1Id === user?.id ? b.unreadCount1 : b.unreadCount2;
        
        // Unread conversations first
        if (aUnread > 0 && bUnread === 0) return -1;
        if (aUnread === 0 && bUnread > 0) return 1;
        
        // Then by last message time
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });
      
      setConversations(sorted);
      setLoading(false);
    } catch (error) {
      console.error('[Messages] Failed to load conversations:', error);
      setLoading(false);
    }
  }, [user?.id]);

  // Tell NotificationContext when the Messages page is active
  useEffect(() => {
    setIsMessagesPageActive(true);
    return () => setIsMessagesPageActive(false);
  }, [setIsMessagesPageActive]);

  useEffect(() => {
    if (!user) return;

    // Load conversations only once. WebSocket connection is owned by
    // NotificationContext, which ensures messagingService is connected.
    if (!conversationsLoaded.current) {
      loadConversations();
      conversationsLoaded.current = true;
    }

    // Listen for typing indicators (kept local to the Messages page)
    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (selectedConversation && user) {
        const otherUserId = selectedConversation.user1Id === user.id 
          ? selectedConversation.user2Id 
          : selectedConversation.user1Id;
        
        if (data.userId === otherUserId) {
          setIsTyping(data.isTyping);
        }
      }
    };

    messagingService.onUserTyping(handleTyping);

    // Don't disconnect when unmounting - let NotificationContext manage the connection
    return () => {
      // Clean up listeners
      messagingService.offUserTyping(handleTyping);
    };
  }, [user, selectedConversation, loadConversations]);

  // Subscribe to centralized message events from NotificationContext
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (message: Message) => {
      console.log('[Messages] New message received (via NotificationContext):', message);

      // Add message to current conversation if it matches
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => {
          const updated = [...prev, message];
          // Update cache
          messagesCache.current.set(selectedConversation.id, updated);
          return updated;
        });
        messagingService.markAsRead(selectedConversation.id);
      } else {
        // Update cache for other conversations
        const cachedMessages = messagesCache.current.get(message.conversationId);
        if (cachedMessages) {
          messagesCache.current.set(message.conversationId, [...cachedMessages, message]);
        }
      }

      // Optimistically update conversation list (instant feedback)
      setConversations(prev => {
        const updated = (prev || []).map(c => {
          if (c.id === message.conversationId) {
            // Update this conversation
            const isUser1 = c.user1Id === user?.id;
            return {
              ...c,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              // Increment unread count if not currently viewing this conversation
              ...(selectedConversation?.id !== c.id ? {
                unreadCount1: isUser1 ? c.unreadCount1 + 1 : c.unreadCount1,
                unreadCount2: !isUser1 ? c.unreadCount2 + 1 : c.unreadCount2,
              } : {}),
            };
          }
          return c;
        });
        
        // Re-sort: unread first, then by time
        return updated.sort((a, b) => {
          const aUnread = a.user1Id === user?.id ? a.unreadCount1 : a.unreadCount2;
          const bUnread = b.user1Id === user?.id ? b.unreadCount1 : b.unreadCount2;
          
          if (aUnread > 0 && bUnread === 0) return -1;
          if (aUnread === 0 && bUnread > 0) return 1;
          
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });
      });
    };

    const unsubscribe = subscribeToMessages(handleNewMessage);
    return () => {
      unsubscribe();
    };
  }, [user, selectedConversation, subscribeToMessages]);

  // Keep NotificationContext informed about the currently open conversation
  useEffect(() => {
    if (selectedConversation) {
      setActiveConversation(selectedConversation.id);
    } else {
      setActiveConversation(null);
    }
  }, [selectedConversation, setActiveConversation]);

  // Handle navigation state (when coming from MatchCard, ProfileView, or Notifications)
  useEffect(() => {
    if (!user) return;
    
    const state = location.state as { 
      recipientId?: string; 
      recipientName?: string; 
      isNewConnection?: boolean;
      openConversationId?: string;
    };
    
    // Handle opening existing conversation by ID (from notifications)
    if (state?.openConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === state.openConversationId);
      if (conversation && conversation.id !== selectedConversation?.id) {
        console.log('[Messages] Opening conversation from notification:', conversation.id);
        handleSelectConversation(conversation);
        // Clear the state to prevent re-opening on refresh
        window.history.replaceState({}, document.title);
      }
      return;
    }
    
    // Handle creating new conversation or opening by recipient ID
    if (state?.recipientId && !creatingConversation) {
      // Wait for conversations to load first
      if (conversations.length === 0 && loading) {
        console.log('[Messages] Still loading conversations, waiting...');
        return;
      }
      
      // Check if we already have this conversation
      const existingConvo = conversations.find(c => 
        c.user1Id === state.recipientId || c.user2Id === state.recipientId
      );

      if (existingConvo) {
        // Conversation exists, just select it
        if (selectedConversation?.id !== existingConvo.id) {
          console.log('[Messages] Found existing conversation, selecting it');
          handleSelectConversation(existingConvo);
          // Clear state to prevent re-triggering
          window.history.replaceState({}, document.title);
        }
      } else {
        // No conversation exists, create new one
        if (!selectedConversation) {
          console.log('[Messages] No existing conversation, creating new one');
          createNewConversation(state.recipientId, state.recipientName);
          // Clear state to prevent re-triggering
          window.history.replaceState({}, document.title);
        }
      }
    }
  }, [location.state, conversations, loading, selectedConversation, creatingConversation, user]);

  const createNewConversation = async (recipientId: string, recipientName?: string) => {
    if (!user || creatingConversation) return;

    console.log('[Messages] Creating new conversation:', { 
      recipientId, 
      recipientName,
      userId: user.id,
      hasToken: !!localStorage.getItem('auth_token'),
      conversationsCount: conversations.length
    });
    setCreatingConversation(true);
    
    try {
      // recipientId is already a user ID (from match.profile.id)
      // No need to convert - just send the message directly
      console.log('[Messages] Sending initial message...');
      const message = await messagingService.sendMessageHTTP(
        recipientId,  // This is already a user ID
        `Hi${recipientName ? ` ${recipientName}` : ''}! 👋`
      );
      console.log('[Messages] Message sent successfully:', message);
      
      // Mark connection as "connected" after first message
      updateConnectionStatus(user.id, recipientId, 'connected' as any);
      
      // Small delay to ensure backend has processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload conversations to get the new one
      console.log('[Messages] Reloading conversations...');
      await loadConversations();
      
      // Find and select the new conversation
      const convos = await messagingService.getConversations();
      console.log('[Messages] Total conversations after reload:', convos.length);
      
      const newConvo = convos.find(c => 
        c.user1Id === recipientId || c.user2Id === recipientId
      );
      
      if (newConvo) {
        console.log('[Messages] Found and selecting conversation:', newConvo.id);
        await handleSelectConversation(newConvo);
      } else {
        console.error('[Messages] Could not find newly created conversation');
        alert('Conversation created but could not be loaded. Please refresh the page.');
      }
    } catch (error) {
      console.error('[Messages] Failed to create conversation:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.message || axiosError.message || 'Network error';
      }
      
      // Show user-friendly error
      alert(`Failed to start conversation: ${errorMessage}`);
      
      // Log detailed error for debugging
      console.error('[Messages] Detailed error:', {
        error,
        recipientId,
        recipientName,
        hasToken: !!localStorage.getItem('auth_token'),
        userId: user?.id
      });
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    // Prevent multiple clicks and duplicate selections
    if (loadingMessages || selectedConversation?.id === conversation.id) return;
    
    setLoadingMessages(true);
    
    // Batch state updates for better performance
    setSelectedConversation(conversation);
    setIsTyping(false);
    
    if (isMobile) {
      setShowMobileThread(true);
    }

    try {
      // Check cache first
      const cachedMessages = messagesCache.current.get(conversation.id);
      
      if (cachedMessages && cachedMessages.length > 0) {
        // Use cached messages (instant load)
        console.log('[Messages] Using cached messages:', cachedMessages.length);
        setMessages(cachedMessages);
        setHasMoreMessages(messageCursors.current.get(conversation.id) != null);
        setLoadingMessages(false);
        
        // Mark as read in background
        messagingService.markConversationAsRead(conversation.id);
      } else {
        // Fetch from backend only if not cached
        console.log('[Messages] Fetching messages from backend');
        const [page] = await Promise.all([
          messagingService.getMessages(conversation.id),
          messagingService.markConversationAsRead(conversation.id)
        ]);

        const msgs = page.messages;
        
        // Update cache and cursor
        messagesCache.current.set(conversation.id, msgs);
        messageCursors.current.set(conversation.id, page.nextCursor ?? null);
        setMessages(msgs);
        setHasMoreMessages(!!page.nextCursor);
      }
      
      // Update unread count (debounced to prevent excessive calls)
      debouncedUpdateUnreadCount();
      
      // Update only this conversation in the list (don't refetch all)
      setConversations(prev => 
        (prev || []).map(c => 
          c.id === conversation.id 
            ? { ...c, unreadCount1: 0, unreadCount2: 0 }
            : c
        )
      );
      
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [loadingMessages, selectedConversation?.id, isMobile, debouncedUpdateUnreadCount]);

  const handleBackToConversations = () => {
    setShowMobileThread(false);
    setSelectedConversation(null);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user) return;

    const otherUserId = selectedConversation.user1Id === user.id 
      ? selectedConversation.user2Id 
      : selectedConversation.user1Id;

    // Create an optimistic message so the UI feels instant
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: selectedConversation.id,
      senderId: user.id,
      sender: {
        id: user.id,
        email: user.email,
        profile: {
          fullName: user.profile?.name || user.name || user.email,
          avatarUrl: user.profile?.avatarUrl,
        },
      },
      content,
      createdAt: new Date().toISOString(),
      status: 'pending',
    } as any;

    setMessages((prev) => {
      const updated = [...prev, optimisticMessage];
      messagesCache.current.set(selectedConversation.id, updated);
      return updated;
    });

    try {
      const message = await messagingService.sendMessageHTTP(otherUserId, content);
      
      // Replace optimistic message with the confirmed one
      setMessages((prev) => {
        const updated = prev.map(m => 
          m.id === tempId ? { ...(message as Message), status: 'sent' as const } : m
        );
        messagesCache.current.set(selectedConversation.id, updated);
        return updated;
      });
      
      // Optimistically update conversation list (no need to reload)
      setConversations(prev => 
        (prev || []).map(c => 
          c.id === selectedConversation.id 
            ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
      
      // Mark connection as "connected" after first message is sent
      // This ensures the button changes from "Connect" to "Message" on match cards
      updateConnectionStatus(user.id, otherUserId, 'connected' as any);
    } catch (error) {
      console.error('Failed to send message:', error);

      // Mark the optimistic message as failed so the user can retry
      setMessages((prev) => {
        const updated = prev.map(m =>
          m.id === tempId ? { ...m, status: 'failed' as const } : m
        );
        messagesCache.current.set(selectedConversation.id, updated);
        return updated;
      });

      let errorMessage = 'Failed to send message. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      // Surface a simple, user-visible error
      alert(errorMessage);
    }
  };
  
  const handleRetryMessage = async (failedMessage: Message) => {
    if (!selectedConversation || !user) return;

    const otherUserId = selectedConversation.user1Id === user.id 
      ? selectedConversation.user2Id 
      : selectedConversation.user1Id;

    // Mark the existing message as pending again
    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === failedMessage.id ? { ...m, status: 'pending' as const } : m
      );
      messagesCache.current.set(selectedConversation.id, updated);
      return updated;
    });

    try {
      const message = await messagingService.sendMessageHTTP(otherUserId, failedMessage.content);

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === failedMessage.id ? { ...(message as Message), status: 'sent' as const } : m
        );
        messagesCache.current.set(selectedConversation.id, updated);
        return updated;
      });
    } catch (error) {
      console.error('Failed to resend message:', error);

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === failedMessage.id ? { ...m, status: 'failed' as const } : m
        );
        messagesCache.current.set(selectedConversation.id, updated);
        return updated;
      });

      let errorMessage = 'Failed to resend message. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      alert(errorMessage);
    }
  };
  
  const handleLoadOlderMessages = async () => {
    if (!selectedConversation) return;
    const cursor = messageCursors.current.get(selectedConversation.id);
    if (!cursor || loadingOlderMessages) return;

    setLoadingOlderMessages(true);
    try {
      const page = await messagingService.getMessages(selectedConversation.id, {
        before: cursor,
      });
      const olderMessages = page.messages;

      setMessages((prev) => {
        const combined = [...olderMessages, ...prev];
        messagesCache.current.set(selectedConversation.id, combined);
        return combined;
      });

      messageCursors.current.set(selectedConversation.id, page.nextCursor ?? null);
      setHasMoreMessages(!!page.nextCursor);
    } catch (error) {
      console.error('[Messages] Failed to load older messages:', error);
      alert('Failed to load older messages. Please try again.');
    } finally {
      setLoadingOlderMessages(false);
    }
  };
  
  // Manual refresh function for users
  const handleRefreshConversations = useCallback(async () => {
    console.log('[Messages] Manual refresh triggered');
    setLoading(true);
    await loadConversations();
    // Clear message cache to force reload
    messagesCache.current.clear();
    messageCursors.current.clear();
    if (selectedConversation) {
      const page = await messagingService.getMessages(selectedConversation.id);
      messagesCache.current.set(selectedConversation.id, page.messages);
      messageCursors.current.set(selectedConversation.id, page.nextCursor ?? null);
      setMessages(page.messages);
      setHasMoreMessages(!!page.nextCursor);
    }
    setLoading(false);
  }, [selectedConversation]);

  const handleTypingStart = () => {
    if (!selectedConversation || !user) return;

    const otherUserId = selectedConversation.user1Id === user.id 
      ? selectedConversation.user2Id 
      : selectedConversation.user1Id;

    messagingService.startTyping(otherUserId);
  };

  const handleTypingStop = () => {
    if (!selectedConversation || !user) return;

    const otherUserId = selectedConversation.user1Id === user.id 
      ? selectedConversation.user2Id 
      : selectedConversation.user1Id;

    messagingService.stopTyping(otherUserId);
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    console.log('[Messages] Submitting feedback:', feedbackData);
    try {
      const result = await recordOutcome(feedbackData);
      console.log('[Messages] Feedback submitted successfully:', result);
      setFeedbackModalOpen(false);
      alert('Thank you for your feedback! This helps improve our matching algorithm.');
    } catch (error: any) {
      console.error('[Messages] Failed to submit feedback:', error);
      console.error('[Messages] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(`Failed to submit feedback: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  if (!user) {
    return (
      <div className="messages-page">
        <div className="loading-state">Loading user data...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading-state">Loading messages...</div>
      </div>
    );
  }

  if (creatingConversation) {
    return (
      <div className="messages-page">
        <div className="loading-state">Starting conversation...</div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className={`messages-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${showMobileThread ? 'show-thread' : ''}`}>
        <div className="conversations-panel">
          {/* Desktop toggle button */}
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
          
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={handleSelectConversation}
            collapsed={sidebarCollapsed}
            onRefresh={handleRefreshConversations}
            isRefreshing={loading}
          />
        </div>
        <div className="messages-panel">
          {selectedConversation && (
            <div className="messages-thread-header">
              <div className="messages-thread-header-left">
                {/* Mobile back button - only visible on mobile */}
                {window.innerWidth <= 768 && (
                  <button
                    className="mobile-back-button"
                    onClick={handleBackToConversations}
                    title="Back to conversations"
                  >
                    ←
                  </button>
                )}
                <h3 className="messages-thread-title">
                  {selectedConversation.user1Id === user.id
                    ? selectedConversation.user2?.profile?.name || selectedConversation.user2?.email || 'Partner'
                    : selectedConversation.user1?.profile?.name || selectedConversation.user1?.email || 'Partner'}
                </h3>
              </div>
              <button
                onClick={handleOpenFeedbackModal}
                className="messages-thread-rate-btn"
                title="Rate this collaboration"
              >
                <HiStar size={16} />
                Rate
              </button>
            </div>
          )}
          <MessageThread
            conversation={selectedConversation}
            messages={messages}
            currentUserId={user.id}
            isTyping={isTyping}
            loadingMessages={loadingMessages}
            onSendMessage={handleSendMessage}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            onRetryMessage={handleRetryMessage}
            onLoadOlderMessages={hasMoreMessages ? handleLoadOlderMessages : undefined}
            loadingOlderMessages={loadingOlderMessages}
          />
        </div>
      </div>

      {/* Collaboration Feedback Modal */}
      {feedbackModalOpen && selectedConversation && user && feedbackConnectionId && (
        <CollaborationFeedbackModal
          connectionId={feedbackConnectionId}
          partnerName={
            selectedConversation.user1Id === user.id
              ? selectedConversation.user2?.profile?.name || selectedConversation.user2?.email || 'Partner'
              : selectedConversation.user1?.profile?.name || selectedConversation.user1?.email || 'Partner'
          }
          onClose={() => {
            setFeedbackModalOpen(false);
            setFeedbackConnectionId(null);
          }}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};
