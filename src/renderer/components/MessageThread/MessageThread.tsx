import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '../../services/messaging.service';
import { Avatar } from '../Avatar';
import { useNotifications } from '../../contexts/NotificationContext';
import './MessageThread.css';

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  loadingMessages: boolean;
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onRetryMessage?: (message: Message) => void;
   onLoadOlderMessages?: () => void;
   loadingOlderMessages?: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  currentUserId,
  isTyping,
  loadingMessages,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onRetryMessage,
  onLoadOlderMessages,
  loadingOlderMessages = false,
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { messagingConnected } = useNotifications();

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Handle typing indicator
    if (e.target.value.length > 0) {
      onTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop();
      }, 1000);
    } else {
      onTypingStop();
    }
  };

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
      onTypingStop();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="message-thread">
        <div className="empty-thread">
          <p>Select a conversation</p>
          <span>Choose a conversation from the list to start messaging</span>
        </div>
      </div>
    );
  }

  const otherUser = conversation.user1Id === currentUserId ? conversation.user2 : conversation.user1;

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="message-thread">
      <div className="message-thread-header">
        <Avatar
          src={otherUser.profile?.avatarUrl}
          name={otherUser.profile?.fullName}
          email={otherUser.email}
          size="md"
          className="thread-avatar"
          userId={otherUser.id}
          clickable={true}
          trackingContext="message_thread_header"
        />
        <div className="thread-user-info">
          <h3>{otherUser.profile?.fullName || otherUser.email}</h3>
          <p>{otherUser.profile?.role || 'User'}</p>
        </div>
      </div>

      <div className="message-list">
        {onLoadOlderMessages && (
          <div className="message-load-older">
            <button
              type="button"
              className="message-load-older-button"
              disabled={loadingOlderMessages}
              onClick={onLoadOlderMessages}
            >
              {loadingOlderMessages ? 'Loading messages…' : 'Load older messages'}
            </button>
          </div>
        )}

        {loadingMessages && messages.length === 0 && (
          <div className="message-loading">
            <div className="message-skeleton" />
            <div className="message-skeleton" />
            <div className="message-skeleton" />
          </div>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div className="empty-thread">
            <p>No messages yet</p>
            <span>Say hello to start the conversation</span>
          </div>
        )}

        {messages.length > 0 && (
          <>
            {messages.map((message) => {
              const isSent = message.senderId === currentUserId;
              return (
                <div key={message.id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                  <p className="message-content">{message.content}</p>
                  <div className="message-meta">
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                    {isSent && message.status === 'pending' && (
                      <span className="message-status message-status-pending">Sending…</span>
                    )}
                    {isSent && message.status === 'failed' && (
                      <button
                        type="button"
                        className="message-status message-status-failed"
                      onClick={() => onRetryMessage && onRetryMessage(message)}
                      >
                        Failed to send. Tap to retry.
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <div className="message-input-wrapper">
          <textarea
            className="message-input"
            placeholder="Type a message..."
            value={messageText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSend}
            disabled={!messageText.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
