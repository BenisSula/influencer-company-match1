/**
 * useExitIntent Hook
 * Detects when user is about to leave the page
 * Used by ExitIntentModal
 */

import { useState, useEffect, useCallback } from 'react';

interface UseExitIntentOptions {
  threshold?: number; // Mouse Y position threshold (default: 10px)
  delay?: number; // Delay before triggering (default: 500ms)
  sessionKey?: string; // localStorage key for session tracking
}

export const useExitIntent = (options: UseExitIntentOptions = {}) => {
  const {
    threshold = 10,
    delay = 500,
    sessionKey = 'exitIntentShown'
  } = options;

  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Check if already shown in this session
  useEffect(() => {
    const shown = sessionStorage.getItem(sessionKey);
    if (shown === 'true') {
      setHasShown(true);
    }
  }, [sessionKey]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger if mouse is leaving from top of viewport
    if (e.clientY <= threshold && !hasShown) {
      setTimeout(() => {
        setShowExitIntent(true);
        setHasShown(true);
        sessionStorage.setItem(sessionKey, 'true');
      }, delay);
    }
  }, [threshold, delay, hasShown, sessionKey]);

  const handleClose = useCallback(() => {
    setShowExitIntent(false);
  }, []);

  useEffect(() => {
    if (!hasShown) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown, handleMouseLeave]);

  return {
    showExitIntent,
    handleClose,
    hasShown
  };
};
