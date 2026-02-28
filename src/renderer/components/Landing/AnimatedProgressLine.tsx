import React, { useEffect, useState } from 'react';
import './AnimatedProgressLine.css';

interface AnimatedProgressLineProps {
  isActive: boolean;
  delay?: number;
}

export const AnimatedProgressLine: React.FC<AnimatedProgressLineProps> = ({
  isActive,
  delay = 0
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setProgress(100);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isActive, delay]);

  return (
    <div className="animated-progress-line">
      <div 
        className="progress-fill"
        style={{ width: `${progress}%` }}
      />
      <div className="progress-dot" />
    </div>
  );
};
