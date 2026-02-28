import React, { useState } from 'react';
import './MediaGrid.css';

export interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  type?: 'image' | 'video';
}

interface MediaGridProps {
  items: MediaItem[];
  maxDisplay?: number;
  onItemClick?: (item: MediaItem, index: number) => void;
  className?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  maxDisplay = 6,
  onItemClick,
  className = '',
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (!items || items.length === 0) {
    return null;
  }

  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - maxDisplay;
  const gridClass = `media-grid-${Math.min(displayItems.length, 6)}`;

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  const handleItemClick = (item: MediaItem, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  return (
    <div className={`media-grid ${gridClass} ${className}`}>
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const showOverlay = isLast && remainingCount > 0;
        const hasError = imageErrors.has(item.id);

        return (
          <div
            key={item.id}
            className={`media-item ${onItemClick ? 'media-item-clickable' : ''}`}
            onClick={() => handleItemClick(item, index)}
          >
            {!hasError ? (
              <>
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="media-content"
                    onError={() => handleImageError(item.id)}
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt || `Media ${index + 1}`}
                    className="media-content"
                    onError={() => handleImageError(item.id)}
                    loading="lazy"
                  />
                )}
                {showOverlay && (
                  <div className="media-overlay">
                    <span className="media-overlay-text">+{remainingCount}</span>
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="media-video-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </>
            ) : (
              <div className="media-error">
                <div className="media-error-icon">📷</div>
                <div className="media-error-text">Failed to load</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
