/**
 * useIntersectionObserver Hook
 * 
 * Reusable hook for detecting when an element enters the viewport.
 * Used for scroll-triggered animations across the application.
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 * 
 * return <div ref={ref} className={isVisible ? 'fade-in' : ''}>Content</div>
 */

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [RefObject<HTMLDivElement>, boolean] => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        if (isElementIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce && element) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
};
