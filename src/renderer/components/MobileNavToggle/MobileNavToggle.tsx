import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import './MobileNavToggle.css';

interface MobileNavToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MobileNavToggle: React.FC<MobileNavToggleProps> = ({ isOpen, onClick }) => {
  return (
    <button
      className="mobile-nav-toggle"
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
    </button>
  );
};
