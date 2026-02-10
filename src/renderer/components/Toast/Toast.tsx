import React, { useEffect } from 'react';
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle } from 'react-icons/hi';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 5000,
  action,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <HiCheckCircle size={20} />;
      case 'error':
        return <HiExclamationCircle size={20} />;
      case 'warning':
        return <HiExclamationCircle size={20} />;
      default:
        return <HiInformationCircle size={20} />;
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
        {action && (
          <button
            className="toast-action"
            onClick={() => {
              action.onClick();
              onClose(id);
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <HiX size={16} />
      </button>
    </div>
  );
};
