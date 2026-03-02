/**
 * useScrollPosition Hook
 * Tracks scroll position with debouncing for performance
 * Used by StickyHeaderCTA and other scroll-based components
 */

import { useState, useEffect } from 'react';

interface UseScrollPositionOptions {
  threshold?: number;
  debounceMs?: number;
}

export const useScrollPosition = (options: UseScrollPositionOptions = {}) => {
  const { threshold = 0, debounceMs = 100 } = options;
  
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    let timeoutId: NodeJS.Timeout;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (!ticking) {
          window.requestAnimationFrame(updateScrollPosition);
          ticking = true;
        }
      }, debounceMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    updateScrollPosition();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [threshold, debounceMs]);

  return { scrollY, isScrolled, scrollDirection };
};
