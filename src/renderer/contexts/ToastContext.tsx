import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/Toast/ToastContainer';
import { ToastProps, ToastType } from '../components/Toast/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: ToastProps['action']) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', action?: ToastProps['action']) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, action }]);
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};
