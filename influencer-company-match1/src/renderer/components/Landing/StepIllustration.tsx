import React from 'react';
import { CheckCircle, Users, Sparkles } from 'lucide-react';
import './StepIllustration.css';

interface StepIllustrationProps {
  stepNumber: number;
  isHovered: boolean;
}

export const StepIllustration: React.FC<StepIllustrationProps> = ({
  stepNumber,
  isHovered
}) => {
  const illustrations = {
    1: <Users size={48} />,
    2: <Sparkles size={48} />,
    3: <CheckCircle size={48} />
  };

  return (
    <div className={`step-illustration ${isHovered ? 'hovered' : ''}`}>
      <div className="illustration-icon">
        {illustrations[stepNumber as keyof typeof illustrations]}
      </div>
      <div className="illustration-glow"></div>
    </div>
  );
};
