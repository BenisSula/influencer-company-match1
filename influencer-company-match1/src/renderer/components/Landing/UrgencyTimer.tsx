/**
 * UrgencyTimer Component
 * Countdown timer to create urgency
 * Phase 3.1.4: Smart CTAs
 */

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { AnimatedStatCounter } from './AnimatedStatCounter';
import './UrgencyTimer.css';

interface UrgencyTimerProps {
  endTime: Date;
  message?: string;
  onExpire?: () => void;
  showProgress?: boolean;
}

export const UrgencyTimer: React.FC<UrgencyTimerProps> = ({
  endTime,
  message = 'Limited spots available',
  onExpire,
  showProgress = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState(endTime.getTime() - Date.now());
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = endTime.getTime() - Date.now();
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        clearInterval(interval);
        onExpire?.();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
  const seconds = Math.floor((timeRemaining / 1000) % 60);

  const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in ms
  const progress = Math.max(0, Math.min(100, ((totalDuration - timeRemaining) / totalDuration) * 100));

  if (isExpired) {
    return (
      <div className="urgency-timer urgency-timer--expired">
        <div className="urgency-timer__container">
          <div className="urgency-timer__icon">
            <TrendingUp size={24} />
          </div>
          <div className="urgency-timer__content">
            <p className="urgency-timer__message">
              Join thousands of successful matches today!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="urgency-timer">
      <div className="urgency-timer__container">
        <div className="urgency-timer__icon">
          <Clock size={24} />
        </div>
        <div className="urgency-timer__content">
          <p className="urgency-timer__message">{message}</p>
          <div className="urgency-timer__countdown" role="timer" aria-live="polite">
            <div className="urgency-timer__unit">
              <AnimatedStatCounter end={hours} duration={500} />
              <span className="urgency-timer__label">hours</span>
            </div>
            <span className="urgency-timer__separator">:</span>
            <div className="urgency-timer__unit">
              <AnimatedStatCounter end={minutes} duration={500} />
              <span className="urgency-timer__label">min</span>
            </div>
            <span className="urgency-timer__separator">:</span>
            <div className="urgency-timer__unit">
              <AnimatedStatCounter end={seconds} duration={500} />
              <span className="urgency-timer__label">sec</span>
            </div>
          </div>
          {showProgress && (
            <div className="urgency-timer__progress">
              <div 
                className="urgency-timer__progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
