import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MessageNotification.css';

export interface NotificationData {
  id: string;
  sender: {
    name: string;
    avatar?: string;
  };
  content: string;
  conversationId: string;
  timestamp: Date;
}

interface MessageNotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

export const MessageNotification: React.FC<MessageNotificationProps> = ({
  notification,
  onClose,
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const handleClick = () => {
    navigate('/messages', {
      state: {
        openConversationId: notification.conversationId,
      },
    });
    handleClose();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`message-notification ${isVisible ? 'visible' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-avatar">
        {notification.sender.avatar ? (
          <img src={notification.sender.avatar} alt={notification.sender.name} />
        ) : (
          <div className="avatar-placeholder">
            {notification.sender.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="notification-content">
        <div className="notification-header">
          <span className="sender-name">{notification.sender.name}</span>
          <span className="notification-time">{formatTime(notification.timestamp)}</span>
        </div>
        <div className="notification-message">
          {notification.content.length > 50
            ? `${notification.content.substring(0, 50)}...`
            : notification.content}
        </div>
      </div>
      
      <button className="notification-close" onClick={(e) => {
        e.stopPropagation();
        handleClose();
      }}>
        ×
      </button>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: NotificationData[];
  onRemove: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemove,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <MessageNotification
          key={notification.id}
          notification={notification}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};
