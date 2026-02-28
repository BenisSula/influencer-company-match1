/**
 * AnimatedDashboardMockup Component
 * 
 * Displays an animated mockup of the matching dashboard with floating profile cards
 * and animated connection lines. Used in the hero section to showcase the platform.
 * 
 * Reuses FloatingProfileCard component for consistency.
 * 
 * @example
 * <AnimatedDashboardMockup />
 */

import { useState, useEffect } from 'react';
import { FloatingProfileCard } from './FloatingProfileCard';
import './AnimatedDashboardMockup.css';

export const AnimatedDashboardMockup: React.FC = () => {
  const [showConnection, setShowConnection] = useState(false);

  useEffect(() => {
    // Animate connection line every 4 seconds
    const interval = setInterval(() => {
      setShowConnection(prev => !prev);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animated-dashboard-mockup">
      {/* Influencer Card */}
      <FloatingProfileCard
        name="Sarah M."
        role="Lifestyle Influencer"
        followers="250K followers"
        matchScore={93}
        position="left"
        delay={0}
      />

      {/* Connection Line SVG */}
      <svg className="connection-line" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E1306C" />
            <stop offset="100%" stopColor="#FD8D32" />
          </linearGradient>
        </defs>
        <path
          d="M 50 100 Q 200 50 350 100"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          fill="none"
          className={showConnection ? 'line-animate' : ''}
        />
        {showConnection && (
          <>
            <circle cx="50" cy="100" r="6" fill="#E1306C" className="pulse" />
            <circle cx="350" cy="100" r="6" fill="#FD8D32" className="pulse" />
          </>
        )}
      </svg>

      {/* Company Card */}
      <FloatingProfileCard
        name="TechCorp"
        role="Technology Company"
        followers="$50K budget"
        matchScore={93}
        position="right"
        delay={0.5}
      />

      {/* Background Gradient Circles */}
      <div className="gradient-circle circle-1"></div>
      <div className="gradient-circle circle-2"></div>
      <div className="gradient-circle circle-3"></div>
    </div>
  );
};
