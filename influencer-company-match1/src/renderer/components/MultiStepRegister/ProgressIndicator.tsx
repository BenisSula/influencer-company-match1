import { Check } from 'lucide-react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  const steps = [
    { number: 1, label: 'Create Account' },
    { number: 2, label: 'Complete Profile' },
  ];

  return (
    <div className="progress-indicator">
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div key={step.number} className="progress-step-wrapper">
            <div className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > step.number ? (
                  <Check size={16} />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${currentStep > step.number ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
