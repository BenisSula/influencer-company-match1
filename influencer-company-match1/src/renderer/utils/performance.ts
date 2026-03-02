/**
 * Performance Optimization Utilities
 * Handles caching, prefetching, and performance monitoring
 */

/**
 * Simple in-memory cache with TTL
 */
class Cache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  
  set(key: string, data: any, ttl: number = 300000): void {
    // Default TTL: 5 minutes
    const expires = Date.now() + ttl;
    this.cache.set(key, { data, expires });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const cache = new Cache();

/**
 * Debounce function for performance
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Prefetch resources
 */
export const prefetchResource = (url: string, type: 'script' | 'style' | 'fetch' = 'fetch'): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Preconnect to external domains
 */
export const preconnect = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * DNS prefetch for external domains
 */
export const dnsPrefetch = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Measure performance metrics
 */
export const measurePerformance = (): {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
} => {
  const metrics = {
    fcp: null as number | null,
    lcp: null as number | null,
    fid: null as number | null,
    cls: null as number | null,
    ttfb: null as number | null
  };
  
  if ('performance' in window) {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }
    
    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }
  }
  
  return metrics;
};

/**
 * Report Web Vitals (Simplified - no external dependencies)
 */
export const reportWebVitals = (onPerfEntry?: (metric: any) => void): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Use Performance Observer API directly
    if ('PerformanceObserver' in window) {
      try {
        // Observe Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          onPerfEntry({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Observe First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            onPerfEntry({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor'
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Observe Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              onPerfEntry({
                name: 'CLS',
                value: clsValue,
                rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
              });
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.log('Performance Observer not fully supported');
      }
    }
  }
};

/**
 * Optimize scroll performance
 */
export const optimizeScroll = (callback: () => void): (() => void) => {
  let ticking = false;
  
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => window.removeEventListener('scroll', handleScroll);
};

/**
 * Lazy load component
 */
export const lazyLoadComponent = async (
  importFunc: () => Promise<any>
): Promise<any> => {
  try {
    return await importFunc();
  } catch (error) {
    console.error('Failed to lazy load component:', error);
    throw error;
  }
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get connection speed
 */
export const getConnectionSpeed = (): string => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    return connection.effectiveType || 'unknown';
  }
  
  return 'unknown';
};

/**
 * Check if user is on slow connection
 */
export const isSlowConnection = (): boolean => {
  const speed = getConnectionSpeed();
  return speed === 'slow-2g' || speed === '2g';
};

/**
 * Optimize for slow connections
 */
export const optimizeForSlowConnection = (): void => {
  if (isSlowConnection()) {
    // Disable animations
    document.body.classList.add('reduce-motion');
    
    // Reduce image quality
    const images = document.querySelectorAll('img[data-src]') as NodeListOf<HTMLImageElement>;
    images.forEach(img => {
      if (img.dataset.src) {
        img.dataset.src = img.dataset.src.replace(/\?q=\d+/, '?q=60');
      }
    });
  }
};

/**
 * Initialize performance optimizations
 */
export const initPerformanceOptimizations = (): void => {
  // Preconnect to external domains
  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com');
  
  // DNS prefetch for API
  dnsPrefetch('https://api.icmatch.com');
  
  // Optimize for slow connections
  optimizeForSlowConnection();
  
  // Report web vitals
  reportWebVitals((metric) => {
    console.log('Web Vital:', metric);
    // Send to analytics
  });
};

/**
 * Resource hints for critical resources
 */
export const addResourceHints = (): void => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
    { rel: 'dns-prefetch', href: 'https://api.icmatch.com' }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if ('crossorigin' in hint) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};
