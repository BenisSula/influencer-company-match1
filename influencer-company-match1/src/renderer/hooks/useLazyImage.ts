import { useState, useEffect, useRef } from 'react';

interface UseLazyImageOptions {
  src?: string | null;
  eager?: boolean;
  rootMargin?: string;
  threshold?: number;
}

interface UseLazyImageReturn {
  imgRef: React.RefObject<HTMLElement>;
  isLoaded: boolean;
  isInView: boolean;
  hasError: boolean;
  shouldLoad: boolean;
  setIsLoaded: (loaded: boolean) => void;
  setHasError: (error: boolean) => void;
}

/**
 * Custom hook for lazy loading images using Intersection Observer
 * Follows DRY principle - reusable across all image components
 */
export const useLazyImage = ({
  src,
  eager = false,
  rootMargin = '100px',
  threshold = 0.01,
}: UseLazyImageOptions): UseLazyImageReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Reset loaded state when src changes
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    // Skip observer if eager loading or no src
    if (eager || !src) {
      setIsInView(true);
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [eager, src, rootMargin, threshold]);

  const shouldLoad = Boolean(src && isInView);

  return {
    imgRef,
    isLoaded,
    isInView,
    hasError,
    shouldLoad,
    setIsLoaded,
    setHasError,
  };
};

/**
 * Helper function to handle image load event
 */
export const createImageLoadHandler = (
  setIsLoaded: (loaded: boolean) => void,
  onLoad?: () => void
) => {
  return () => {
    setIsLoaded(true);
    onLoad?.();
  };
};

/**
 * Helper function to handle image error event
 */
export const createImageErrorHandler = (
  setHasError: (error: boolean) => void,
  setIsLoaded: (loaded: boolean) => void,
  onError?: () => void
) => {
  return () => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  };
};
