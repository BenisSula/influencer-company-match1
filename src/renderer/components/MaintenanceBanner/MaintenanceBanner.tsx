import React, { useEffect, useState } from 'react';
import './MaintenanceBanner.css';

export const MaintenanceBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('System maintenance in progress');

  useEffect(() => {
    const handleMaintenanceChange = (event: any) => {
      const { enabled, message: newMessage } = event.detail;
      setIsVisible(enabled);
      if (newMessage) {
        setMessage(newMessage);
      }
    };

    window.addEventListener('maintenance-mode-changed', handleMaintenanceChange);
    
    return () => {
      window.removeEventListener('maintenance-mode-changed', handleMaintenanceChange);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="maintenance-banner">
      <div className="maintenance-banner-content">
        <span className="maintenance-icon">🚧</span>
        <span className="maintenance-message">{message}</span>
      </div>
    </div>
  );
};
