import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { AuthRightPanel } from '../AuthRightPanel/AuthRightPanel';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
  onSuccess?: () => void;
}

export const AuthModal = ({ isOpen, mode, onClose, onModeChange, onSuccess }: AuthModalProps) => {
  // Close modal on successful auth and call onSuccess if provided
  const handleAuthSuccess = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal-container">
        <button 
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        <div className="auth-modal-content">
          <AuthRightPanel 
            mode={mode} 
            onModeChange={onModeChange}
            onSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    </div>
  );
};
