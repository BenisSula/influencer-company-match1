import React from 'react';
import './MatchActionBar.css';

export interface MatchActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'primary' | 'success';
  disabled?: boolean;
  onClick: () => void;
}

interface MatchActionBarProps {
  items: MatchActionItem[];
  className?: string;
}

export const MatchActionBar: React.FC<MatchActionBarProps> = ({ 
  items, 
  className = '' 
}) => {
  return (
    <div className={`match-action-bar ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`match-action-item ${item.variant ? `match-action-item-${item.variant}` : ''}`}
          onClick={item.onClick}
          disabled={item.disabled}
          aria-label={item.label}
        >
          <span className="match-action-icon">{item.icon}</span>
          <span className="match-action-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
