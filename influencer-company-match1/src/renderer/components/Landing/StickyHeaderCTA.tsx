/**
 * StickyHeaderCTA Component
 * Sticky header CTA that appears on scroll
 * Phase 3.1.1: Smart CTAs
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { trackConversion } from '../../utils/conversion';
import './StickyHeaderCTA.css';

interface StickyHeaderCTAProps {
  threshold?: number;
  onSignupClick: () => void;
  onDismiss?: () => void;
}

export const StickyHeaderCTA: React.FC<StickyHeaderCTAProps> = ({
  threshold = 300,
  onSignupClick,
  onDismiss
}) => {
  const { isScrolled } = useScrollPosition({ threshold, debounceMs: 100 });
  const [isDismissed, setIsDismissed] = useLocalStorage('stickyCtaDismissed', false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if dismissal has expired (24 hours)
  useEffect(() => {
    if (isDismissed) {
      const dismissedTime = localStorage.getItem('stickyCtaDismissedTime');
      if (dismissedTime) {
        const hoursSince = (Date.now() - new Date(dismissedTime).getTime()) / (1000 * 60 * 60);
        if (hoursSince >= 24) {
          setIsDismissed(false);
          localStorage.removeItem('stickyCtaDismissedTime');
        }
      }
    }
  }, [isDismissed, setIsDismissed]);

  // Update visibility based on scroll and dismissal
  useEffect(() => {
    setIsVisible(isScrolled && !isDismissed);
  }, [isScrolled, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('stickyCtaDismissedTime', new Date().toISOString());
    trackConversion('sticky_cta_dismissed');
    onDismiss?.();
  };

  const handleSignupClick = () => {
    trackConversion('sticky_cta_clicked');
    onSignupClick();
  };

  if (!isVisible) return null;

  return (
    <div className={`sticky-header-cta ${isVisible ? 'sticky-header-cta--visible' : ''}`}>
      <div className="sticky-header-cta__container">
        <div className="sticky-header-cta__content">
          <span className="sticky-header-cta__text">
            Start matching with brands today
          </span>
          <button
            onClick={handleSignupClick}
            className="sticky-header-cta__button"
            aria-label="Get started for free"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="sticky-header-cta__close"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
