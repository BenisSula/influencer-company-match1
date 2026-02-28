import React from 'react';
import { MessageToastNotification } from './MessageToastNotification';
import { MessageToastData } from '../../types/notification.types';

interface MessageToastContainerProps {
  toasts: MessageToastData[];
  onToastClose: (id: string) => void;
}

export const MessageToastContainer: React.FC<MessageToastContainerProps> = ({
  toasts,
  onToastClose,
}) => {
  if (toasts.length === 0) return null;

  // Limit to 3 toasts max
  const visibleToasts = toasts.slice(-3);

  return (
    <>
      {visibleToasts.map((toast, index) => (
        <MessageToastNotification
          key={toast.id}
          toast={toast}
          onClose={onToastClose}
          index={index}
        />
      ))}
    </>
  );
};
