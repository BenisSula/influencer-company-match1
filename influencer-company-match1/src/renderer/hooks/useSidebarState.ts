/**
 * Custom hook for managing sidebar collapse state
 * Implements DRY principle for reusable sidebar state management
 * Persists state in localStorage
 */

import { useState, useCallback } from 'react';

interface UseSidebarStateOptions {
  storageKey: string;
  defaultCollapsed?: boolean;
}

export const useSidebarState = ({ storageKey, defaultCollapsed = false }: UseSidebarStateOptions) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === 'true' : defaultCollapsed;
  });

  const toggle = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem(storageKey, String(newState));
      return newState;
    });
  }, [storageKey]);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  const expand = useCallback(() => {
    setIsCollapsed(false);
    localStorage.setItem(storageKey, 'false');
  }, [storageKey]);

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
  };
};
