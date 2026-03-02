import React from 'react';
import './MobileNavOverlay.css';

interface MobileNavOverlayProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MobileNavOverlay: React.FC<MobileNavOverlayProps> = ({ isOpen, onClick }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="mobile-nav-overlay"
      onClick={onClick}
      aria-hidden="true"
    />
  );
};
