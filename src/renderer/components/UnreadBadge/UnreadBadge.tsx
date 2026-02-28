/**
 * UnreadBadge Component
 * 
 * Displays the unread message count badge on the Messages icon.
 * Shows a gradient badge with the number of unread messages.
 * Automatically hides when count is 0.
 * Animates when new messages arrive.
 */

import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import './UnreadBadge.css';

interface UnreadBadgeProps {
  className?: string;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ className = '' }) => {
  const { unreadCount } = useNotifications();
  const [animate, setAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  // Trigger animation when count increases
  useEffect(() => {
    if (unreadCount > prevCount && unreadCount > 0) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }
    setPrevCount(unreadCount);
  }, [unreadCount, prevCount]);

  if (unreadCount === 0) return null;

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <span className={`unread-badge ${animate ? 'new-message' : ''} ${className}`}>
      {displayCount}
    </span>
  );
};
