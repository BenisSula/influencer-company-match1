import { useEffect, useRef } from 'react';

/**
 * Hook to detect when page becomes visible
 * Useful for refreshing data when user returns to the tab
 * 
 * @param callback Function to call when page becomes visible
 * 
 * @example
 * ```tsx
 * usePageVisibility(() => {
 *   console.log('Page is now visible');
 *   refreshData();
 * });
 * ```
 */
export const usePageVisibility = (callback: () => void) => {
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    // Call immediately on mount
    callbackRef.current();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        callbackRef.current();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty deps - only run once
};
