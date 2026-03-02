import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../Avatar';
import { MessageToastData } from '../../types/notification.types';
import './MessageToastNotification.css';

interface MessageToastNotificationProps {
  toast: MessageToastData;
  onClose: (id: string) => void;
  index: number;
}

export const MessageToastNotification: React.FC<MessageToastNotificationProps> = ({
  toast,
  onClose,
  index,
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 50);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const handleClick = () => {
    navigate('/messages', {
      state: {
        openConversationId: toast.conversationId,
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
      className={`message-toast ${isVisible && !isExiting ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
      onClick={handleClick}
      style={{ top: `${index * 80 + 10}px` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="message-toast-avatar">
        <Avatar
          src={toast.sender.avatar}
          name={toast.sender.name}
          size="sm"
        />
      </div>
      
      <div className="message-toast-content">
        <div className="message-toast-header">
          <span className="message-toast-sender">{toast.sender.name}</span>
          <span className="message-toast-time">{formatTime(toast.timestamp)}</span>
        </div>
        <div className="message-toast-message">
          {toast.content.length > 50
            ? `${toast.content.substring(0, 50)}...`
            : toast.content}
        </div>
      </div>
      
      <button 
        className="message-toast-close" 
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};
