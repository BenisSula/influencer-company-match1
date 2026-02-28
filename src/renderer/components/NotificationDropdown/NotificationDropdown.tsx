import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationData } from '../../types/notification.types';
import { Notification as BackendNotification, notificationService } from '../../services/notification.service';
import { Avatar } from '../Avatar/Avatar';
import { formatTimeAgo } from '../../utils/timeFormat';
import './NotificationDropdown.css';

/**
 * NotificationDropdown Component
 * 
 * Displays a dropdown list of general notifications (likes, comments, follows, etc.)
 * Appears when user clicks the bell icon in the header.
 * 
 * Note: Message notifications are NOT shown here - they use the Messages icon toast instead.
 */

interface NotificationDropdownProps {
  notifications: NotificationData[];
  generalNotifications: BackendNotification[];
  onNotificationClick: (notification: NotificationData) => void;
  onClearAll: () => void;
  onClose?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  generalNotifications,
  onNotificationClick,
  onClearAll,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleBackendNotificationClick = async (notification: BackendNotification) => {
    // Defensive check
    if (!notification) {
      console.warn('Notification is null or undefined');
      return;
    }

    // Mark as read
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        // Trigger reload of notifications in context
        window.dispatchEvent(new CustomEvent('notificationRead'));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.type === 'collaboration_request') {
      navigate('/connections');
    } else if (notification.type === 'collaboration_accepted' || notification.type === 'collaboration_rejected') {
      navigate('/connections');
    } else if (notification.type === 'connection_request' || notification.type === 'connection_accepted') {
      navigate('/connections');
    } else if (notification.type === 'profile_view') {
      if (notification.metadata?.viewerId) {
        navigate(`/profile/${notification.metadata.viewerId}`);
      }
    } else if (notification.type === 'match_found') {
      navigate('/matches');
    }

    // Close dropdown
    if (onClose) {
      onClose();
    }
  };
  const formatTime = (date: Date | string) => {
    return formatTimeAgo(date);
  };

  const getSenderName = (sender: any) => {
    if (sender.influencerProfile?.name) return sender.influencerProfile.name;
    if (sender.companyProfile?.name) return sender.companyProfile.name;
    if (sender.name) return sender.name;
    return sender.email || 'Someone';
  };

  const getSenderAvatar = (sender: any) => {
    if (sender.influencerProfile?.avatarUrl) return sender.influencerProfile.avatarUrl;
    if (sender.companyProfile?.logoUrl) return sender.companyProfile.logoUrl;
    return sender.avatarUrl;
  };

  const allNotifications = [
    ...(Array.isArray(generalNotifications) ? generalNotifications : []),
    ...(Array.isArray(notifications) ? notifications : [])
  ];

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {allNotifications.length > 0 && (
          <button onClick={onClearAll} className="clear-all-btn">
            Clear all
          </button>
        )}
      </div>
      
      <div className="notification-dropdown-body">
        {allNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <p>No new notifications</p>
            <span style={{ fontSize: '12px', marginTop: '8px', color: '#B8B8B8' }}>
              Collaboration requests and updates will appear here
            </span>
          </div>
        ) : (
          <div className="notification-list">
            {/* Backend notifications (collaboration requests, etc.) */}
            {generalNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleBackendNotificationClick(notification)}
                style={{ cursor: 'pointer' }}
              >
                <div className="notification-item-avatar">
                  <Avatar
                    src={getSenderAvatar(notification.sender)}
                    name={getSenderName(notification.sender)}
                    size="sm"
                    userId={notification.sender?.id}
                    clickable={true}
                    trackingContext="notification_dropdown"
                  />
                </div>
                
                <div className="notification-item-content">
                  <div className="notification-item-header">
                    <span className="notification-sender">{getSenderName(notification.sender)}</span>
                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                  </div>
                  <div className="notification-message">
                    {notification.content}
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator" />
                  )}
                </div>
              </div>
            ))}

            {/* Local notifications (likes, comments, etc.) */}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="notification-item"
                onClick={() => onNotificationClick(notification)}
              >
                <div className="notification-item-avatar">
                  {notification.sender.avatar ? (
                    <img src={notification.sender.avatar} alt={notification.sender.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {notification.sender.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="notification-type-badge">💬</div>
                </div>
                
                <div className="notification-item-content">
                  <div className="notification-item-header">
                    <span className="notification-sender">{notification.sender.name}</span>
                    <span className="notification-time">{formatTime(notification.timestamp)}</span>
                  </div>
                  <div className="notification-message">
                    {notification.content.length > 60
                      ? `${notification.content.substring(0, 60)}...`
                      : notification.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
