/**
 * Image Optimization Utilities
 * Handles lazy loading, responsive images, and performance optimization
 */

/**
 * Lazy load images using Intersection Observer
 */
export const lazyLoadImages = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          // Remove loading class, add loaded class
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          // Stop observing this image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    });
    
    // Observe all lazy images
    const lazyImages = document.querySelectorAll('img.lazy-loading');
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without Intersection Observer
    const lazyImages = document.querySelectorAll('img.lazy-loading') as NodeListOf<HTMLImageElement>;
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
    });
  }
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

/**
 * Get optimized image URL with parameters
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('fm', options.format);
  
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * Preload critical images
 */
export const preloadCriticalImages = (urls: string[]): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Image loading placeholder
 */
export const createImagePlaceholder = (width: number, height: number): string => {
  // Create a tiny base64 placeholder
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fill with light gray
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
};

/**
 * Check if image is in viewport
 */
export const isImageInViewport = (img: HTMLElement): boolean => {
  const rect = img.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Responsive image sizes configuration
 */
export const imageSizes = {
  thumbnail: [150, 300],
  small: [320, 640],
  medium: [768, 1536],
  large: [1024, 2048],
  hero: [1920, 3840]
};

/**
 * Image quality presets
 */
export const imageQuality = {
  low: 60,
  medium: 75,
  high: 85,
  max: 95
};

/**
 * Initialize lazy loading on page load
 */
export const initLazyLoading = (): void => {
  // Initial lazy load
  lazyLoadImages();
  
  // Re-run on dynamic content changes
  const observer = new MutationObserver(() => {
    lazyLoadImages();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};
