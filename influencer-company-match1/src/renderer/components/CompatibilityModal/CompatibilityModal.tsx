import React from 'react';
import { HiX } from 'react-icons/hi';
import { CompatibilityBreakdown, CompatibilityFactor } from '../CompatibilityBreakdown/CompatibilityBreakdown';
import './CompatibilityModal.css';

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  overallScore: number;
  factors: CompatibilityFactor[];
}

export const CompatibilityModal: React.FC<CompatibilityModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  overallScore,
  factors
}) => {
  if (!isOpen) return null;

  return (
    <div className="compatibility-modal-overlay" onClick={onClose}>
      <div className="compatibility-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compatibility-modal-header">
          <h2>Compatibility with {partnerName}</h2>
          <button 
            className="compatibility-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <HiX size={24} />
          </button>
        </div>

        <div className="compatibility-modal-body">
          <CompatibilityBreakdown 
            factors={factors}
            overallScore={overallScore}
          />
        </div>
      </div>
    </div>
  );
};
