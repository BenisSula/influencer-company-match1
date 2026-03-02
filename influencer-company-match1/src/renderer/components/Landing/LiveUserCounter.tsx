/**
 * LiveUserCounter Component
 * Real-time user count display with backend integration
 */

import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { AnimatedStatCounter } from './AnimatedStatCounter';
import { landingService } from '../../services/landing.service';
import './LiveUserCounter.css';

interface LiveUserCounterProps {
  baseCount?: number;
  updateInterval?: number; // in milliseconds
  incrementAmount?: number;
}

export const LiveUserCounter: React.FC<LiveUserCounterProps> = ({
  baseCount = 0, // Will be replaced by real data from backend
  updateInterval = 30000, // 30 seconds
  incrementAmount = 2
}) => {
  const [count, setCount] = useState(baseCount);
  const [loading, setLoading] = useState(true);
  const [justIncremented, setJustIncremented] = useState(false);

  useEffect(() => {
    const fetchRealTimeCount = async () => {
      try {
        const stats = await landingService.getRealtimeStatistics();
        const realCount = stats.activeUsersNow || 0;
        setCount(realCount);
        setLoading(false);
        setJustIncremented(true);
        setTimeout(() => setJustIncremented(false), 1000);
      } catch (error) {
        console.error('Failed to fetch real-time count:', error);
        setLoading(false);
        // Keep the last known count, don't reset to fallback
      }
    };

    // Initial fetch
    fetchRealTimeCount();

    // Set up interval for updates
    const interval = setInterval(fetchRealTimeCount, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, baseCount]);

  return (
    <div className="live-user-counter">
      <div className="live-user-counter__icon">
        <Users size={32} />
      </div>
      
      <div className="live-user-counter__content">
        <div className={`live-user-counter__count ${justIncremented ? 'live-user-counter__count--pulse' : ''}`}>
          {loading ? (
            <div className="loading-placeholder">---</div>
          ) : (
            <AnimatedStatCounter end={count} suffix="+" />
          )}
        </div>
        <div className="live-user-counter__label">
          <span className="live-dot"></span>
          {loading ? 'Loading...' : 'Active Users Right Now'}
        </div>
        <div className="live-user-counter__subtext">
          Join thousands of influencers and companies
        </div>
      </div>
    </div>
  );
};
