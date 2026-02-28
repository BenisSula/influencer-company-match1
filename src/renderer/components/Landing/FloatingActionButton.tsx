/**
 * FloatingActionButton Component
 * Mobile-only floating CTA button
 * Phase 3.1.3: Smart CTAs
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { trackConversion } from '../../utils/conversion';
import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  hideOnScroll?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  label = 'Get Started',
  icon,
  hideOnScroll = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll visibility
  useEffect(() => {
    if (!hideOnScroll) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  const handleClick = () => {
    trackConversion('floating_action_button_clicked');
    onClick();
  };

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <button
      onClick={handleClick}
      className={`floating-action-button ${isVisible ? 'floating-action-button--visible' : ''}`}
      aria-label={label}
    >
      <span className="floating-action-button__label">{label}</span>
      {icon || <ArrowRight size={20} />}
      <span className="floating-action-button__pulse" />
    </button>
  );
};
