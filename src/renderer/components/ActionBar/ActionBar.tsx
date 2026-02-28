import React from 'react';
import './ActionBar.css';

export interface ActionBarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  disabledTooltip?: string; // Tooltip text shown when button is disabled
  onClick: () => void;
}

interface ActionBarProps {
  items: ActionBarItem[];
  className?: string;
  size?: 'md' | 'lg';
}

export const ActionBar: React.FC<ActionBarProps> = ({ 
  items, 
  className = '',
  size = 'lg'
}) => {
  return (
    <div className={`action-bar action-bar-${size} ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`action-bar-item ${item.active ? 'action-bar-item-active' : ''} ${item.disabled ? 'action-bar-item-disabled' : ''}`}
          onClick={item.onClick}
          disabled={item.disabled}
          data-tooltip={item.disabled && item.disabledTooltip ? item.disabledTooltip : undefined}
          aria-label={
            item.count 
              ? `${item.label} (${item.count})` 
              : item.label
          }
        >
          <span className="action-bar-icon-wrapper">
            <span className="action-bar-icon">{item.icon}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="action-bar-badge">
                {item.count > 99 ? '99+' : item.count}
              </span>
            )}
          </span>
          <span className="action-bar-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
