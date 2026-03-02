import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './StepVideoModal.css';

interface StepVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepNumber: number;
  stepTitle: string;
}

export const StepVideoModal: React.FC<StepVideoModalProps> = ({
  isOpen,
  onClose,
  stepNumber,
  stepTitle
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Video URLs would be configured per step
  const videoUrls = {
    1: '/videos/step1-create-profile.mp4',
    2: '/videos/step2-ai-matching.mp4',
    3: '/videos/step3-collaborate.mp4'
  };

  return (
    <div 
      className="step-video-modal-overlay"
      onClick={handleBackdropClick}
    >
      <div className="step-video-modal" ref={modalRef}>
        <button 
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close video"
        >
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <h3>Step {stepNumber}: {stepTitle}</h3>
        </div>

        <div className="modal-video-container">
          <video 
            controls 
            autoPlay
            className="modal-video"
            src={videoUrls[stepNumber as keyof typeof videoUrls]}
          >
            Your browser does not support video playback.
          </video>
        </div>

        <div className="modal-footer">
          <p className="video-description">
            Watch how easy it is to {stepTitle.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
};
