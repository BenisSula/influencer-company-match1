/**
 * Animation Utilities
 * 
 * Reusable animation functions for smooth UI interactions.
 * Single source of truth for animation logic across the application.
 */

/**
 * Animates a number from start to end value over a duration
 * Uses requestAnimationFrame for smooth 60fps animation
 * 
 * @param start - Starting number
 * @param end - Ending number
 * @param duration - Animation duration in milliseconds
 * @param onUpdate - Callback fired on each frame with current value
 * @param onComplete - Optional callback fired when animation completes
 * @returns Cancel function to stop animation
 * 
 * @example
 * const cancel = animateCountUp(0, 100, 2000, (value) => {
 *   setCount(value);
 * });
 */
export const animateCountUp = (
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): (() => void) => {
  let startTime: number | null = null;
  let animationFrame: number;

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    
    // Easing function (ease-out cubic)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(start + (end - start) * easeOut);
    
    onUpdate(currentValue);
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  };

  animationFrame = requestAnimationFrame(step);

  // Return cancel function
  return () => cancelAnimationFrame(animationFrame);
};

/**
 * Formats large numbers with K/M suffixes
 * Consistent number formatting across the application
 * 
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.5M", "250K", "999")
 * 
 * @example
 * formatStatNumber(1500000) // "1.5M"
 * formatStatNumber(50000) // "50K"
 * formatStatNumber(999) // "999"
 */
export const formatStatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
};

/**
 * Stagger animation delays for multiple elements
 * Creates a cascading effect for list animations
 * 
 * @param index - Element index
 * @param baseDelay - Base delay in seconds
 * @param increment - Delay increment per element
 * @returns CSS animation delay value
 * 
 * @example
 * <div style={{ animationDelay: getStaggerDelay(0, 0.1, 0.05) }}>
 */
export const getStaggerDelay = (
  index: number,
  baseDelay: number = 0,
  increment: number = 0.1
): string => {
  return `${baseDelay + (index * increment)}s`;
};
