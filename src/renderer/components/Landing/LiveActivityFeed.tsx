/**
 * LiveActivityFeed Component
 * Real-time activity stream with backend integration
 */

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, UserPlus, CheckCircle } from 'lucide-react';
import { landingService, Activity } from '../../services/landing.service';
import { sampleActivities } from '../../data/landing/activities';
import './LiveActivityFeed.css';

interface LiveActivityFeedProps {
  maxItems?: number;
  updateInterval?: number; // in milliseconds
  showVerifiedBadge?: boolean;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  maxItems = 5,
  updateInterval = 30000, // 30 seconds
  showVerifiedBadge = true
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await landingService.getRecentActivities(maxItems);
        if (data && data.length > 0) {
          setActivities(data);
        } else {
          // Fallback to sample data if no activities
          setActivities(sampleActivities.slice(0, maxItems).map(a => ({ ...a, verified: a.verified ?? false })));
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        // Fallback to static data
        setActivities(sampleActivities.slice(0, maxItems).map(a => ({ ...a, verified: a.verified ?? false })));
        setLoading(false);
      }
    };

    // Initial fetch
    fetchActivities();

    // Refresh periodically if not paused
    if (!isPaused) {
      const interval = setInterval(fetchActivities, updateInterval);
      return () => clearInterval(interval);
    }
  }, [maxItems, updateInterval, isPaused]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Users size={16} />;
      case 'collaboration':
        return <Briefcase size={16} />;
      case 'signup':
        return <UserPlus size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'match':
        return (
          <>
            <strong>{activity.user}</strong> matched with <strong>{activity.company}</strong>
          </>
        );
      case 'collaboration':
        return (
          <>
            <strong>{activity.user}</strong> started collaborating with <strong>{activity.company}</strong>
          </>
        );
      case 'signup':
        return (
          <>
            <strong>{activity.user}</strong> joined ICMatch
          </>
        );
      default:
        return <strong>{activity.user}</strong>;
    }
  };

  const getTimeAgo = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="live-activity-feed">
        <div className="live-activity-feed__header">
          <div className="live-activity-feed__title">
            <span className="live-dot"></span>
            Live Activity
          </div>
          <div className="live-activity-feed__subtitle">
            Loading...
          </div>
        </div>
        <div className="live-activity-feed__list">
          {[...Array(maxItems)].map((_, i) => (
            <div key={i} className="activity-item activity-item--loading">
              <div className="activity-item__icon"></div>
              <div className="activity-item__content">
                <div className="loading-placeholder"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="live-activity-feed"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="live-activity-feed__header">
        <div className="live-activity-feed__title">
          <span className="live-dot"></span>
          Live Activity
        </div>
        <div className="live-activity-feed__subtitle">
          Real-time platform updates
        </div>
      </div>

      <div className="live-activity-feed__list">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className="activity-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="activity-item__icon" data-type={activity.type}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-item__content">
              <div className="activity-item__text">
                {getActivityText(activity)}
                {showVerifiedBadge && activity.verified && (
                  <CheckCircle className="activity-item__verified" size={14} />
                )}
              </div>
              <div className="activity-item__meta">
                <span className="activity-item__time">{getTimeAgo(activity.timestamp)}</span>
                {activity.location && (
                  <>
                    <span className="activity-item__separator">•</span>
                    <span className="activity-item__location">{activity.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
