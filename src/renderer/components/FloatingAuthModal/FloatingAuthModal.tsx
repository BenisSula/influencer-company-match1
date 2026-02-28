import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { AuthLeftPanel } from '../AuthLeftPanel/AuthLeftPanel';
import { AuthRightPanel } from '../AuthRightPanel/AuthRightPanel';
import './FloatingAuthModal.css';

interface FloatingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onSuccess?: () => void;
}

export const FloatingAuthModal = ({ 
  isOpen, 
  onClose, 
  mode, 
  onModeChange,
  onSuccess 
}: FloatingAuthModalProps) => {
  
  // Handle ESC key press
  const handleEscKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscKey]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className="floating-auth-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="floating-auth-modal">
        {/* Close Button */}
        <button
          className="floating-auth-close"
          onClick={onClose}
          aria-label="Close authentication modal"
          type="button"
        >
          <X size={24} />
        </button>

        {/* Auth Content - Reusing existing panels */}
        <div className="floating-auth-content">
          <AuthLeftPanel mode={mode} />
          <AuthRightPanel 
            mode={mode} 
            onModeChange={onModeChange}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
};
