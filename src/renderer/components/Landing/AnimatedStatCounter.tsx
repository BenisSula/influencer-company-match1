/**
 * AnimatedStatCounter Component
 * 
 * Displays an animated number counter that triggers when scrolled into view.
 * Reuses useIntersectionObserver hook and animateCountUp utility.
 * 
 * @example
 * <AnimatedStatCounter end={10000} suffix="+" duration={2000} />
 */

import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { animateCountUp, formatStatNumber } from '../../utils/animations';

interface AnimatedStatCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedStatCounter: React.FC<AnimatedStatCounterProps> = ({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      const cancel = animateCountUp(0, end, duration, setCount, () => {
        setHasAnimated(true);
      });
      return cancel;
    }
  }, [isVisible, hasAnimated, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatStatNumber(count)}{suffix}
    </span>
  );
};
