import React from 'react';
import { Card, CardBody } from '../Card/Card';
import './WizardStep.css';

interface WizardStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <Card className="wizard-step">
      <CardBody>
        <div className="wizard-step-header">
          <h2 className="wizard-step-title">{title}</h2>
          {description && (
            <p className="wizard-step-description">{description}</p>
          )}
        </div>
        <div className="wizard-step-content">{children}</div>
      </CardBody>
    </Card>
  );
};
