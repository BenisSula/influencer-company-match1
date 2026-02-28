import React from 'react';
import { Conversation } from '../../services/messaging.service';
import { Avatar } from '../Avatar';
import './ConversationList.css';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  collapsed?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ConversationListComponent: React.FC<ConversationListProps> = ({
  conversations = [], // Add default empty array
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  collapsed = false,
  onRefresh,
  isRefreshing = false,
}) => {
  const getOtherUser = (conversation: Conversation) => {
    return conversation.user1Id === currentUserId ? conversation.user2 : conversation.user1;
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.user1Id === currentUserId ? conversation.unreadCount1 : conversation.unreadCount2;
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString();
  };

  // Determine avatar size based on viewport width (no state, no re-renders)
  const getAvatarSize = () => {
    return window.innerWidth <= 768 ? "sm" : "md";
  };

  return (
    <div className={`conversation-list ${collapsed ? 'collapsed' : ''}`}>
      <div className="conversation-list-header">
        <h2>Messages</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            title="Refresh conversations"
          >
            🔄
          </button>
        )}
      </div>
      <div className="conversation-list-items">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet</p>
            <span>Start a conversation from a user's profile</span>
          </div>
        ) : (
          conversations.map((conversation, index) => {
            const otherUser = getOtherUser(conversation);
            const unreadCount = getUnreadCount(conversation);
            const lastMessage = conversation.messages?.[0];
            const previewContent = conversation.lastMessage ?? lastMessage?.content ?? 'No messages yet';
            const isSelected = conversation.id === selectedConversationId;

            return (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  isSelected ? 'selected' : ''
                } ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="conversation-avatar-wrapper">
                  <Avatar
                    src={otherUser?.profile?.avatarUrl || otherUser?.avatarUrl}
                    name={otherUser?.profile?.fullName || otherUser?.name}
                    email={otherUser?.email}
                    size={getAvatarSize()}
                    className="conversation-avatar"
                    eager={index < 5}
                    userId={otherUser?.id}
                    clickable={false}
                    trackingContext="conversation_list"
                  />
                  {unreadCount > 0 && (
                    <span 
                      className="conversation-unread-badge"
                      aria-label={`${unreadCount} unread messages`}
                      role="status"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-name">
                      {otherUser?.profile?.fullName || otherUser?.email}
                    </span>
                    {conversation.lastMessageAt && (
                      <span className="conversation-time">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="conversation-preview">
                    <span className={unreadCount > 0 ? 'unread' : ''}>
                      {previewContent}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const ConversationList = React.memo(ConversationListComponent);
