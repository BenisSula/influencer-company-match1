import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaService } from '../../services/media.service';
import { useLazyImage } from '../../hooks/useLazyImage';
import { analyticsService } from '../../services/analytics.service';
import './Avatar.css';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  email?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
  eager?: boolean; // For above-the-fold avatars
  userId?: string; // User ID for automatic profile navigation
  clickable?: boolean; // Enable/disable clickability (default: true if userId provided)
  trackingContext?: string; // Context for analytics tracking (e.g., 'feed_post', 'match_card')
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  email,
  size = 'md',
  className = '',
  onClick,
  eager = false,
  userId,
  clickable = true,
  trackingContext = 'avatar_click',
}) => {
  const navigate = useNavigate();
  const getInitials = (): string => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const getAvatarUrl = (): string | null => {
    if (!src) return null;
    
    // Handle absolute URLs
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Handle relative URLs
    return mediaService.getMediaUrl(src);
  };

  const avatarUrl = getAvatarUrl();
  const { imgRef, isLoaded, shouldLoad, setIsLoaded, setHasError } = useLazyImage({
    src: avatarUrl,
    eager,
    rootMargin: '100px',
  });

  const initials = getInitials();
  const displayName = alt || name || email || 'User';

  // Handle avatar click - prioritize custom onClick, then auto-navigate to profile
  const handleClick = () => {
    if (onClick) {
      // Custom onClick takes precedence
      onClick();
    } else if (userId && clickable) {
      // Auto-navigate to profile
      analyticsService.recordProfileView(userId, trackingContext);
      navigate(`/profile/${userId}`);
    }
  };

  const isClickable = (onClick || (userId && clickable));

  return (
    <div
      ref={imgRef as React.RefObject<HTMLDivElement>}
      className={`avatar avatar-${size} ${className} ${isClickable ? 'avatar-clickable' : ''} ${isLoaded ? 'avatar-loaded' : ''}`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      aria-label={isClickable ? `View ${displayName}'s profile` : displayName}
    >
      {/* Loading shimmer */}
      {shouldLoad && !isLoaded && (
        <div className="avatar-loading-shimmer" />
      )}

      {/* Avatar Image */}
      {shouldLoad && (
        <img
          src={avatarUrl!}
          alt={displayName}
          className="avatar-image"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}

      {/* Initials Placeholder */}
      <div 
        className="avatar-placeholder" 
        style={{ 
          display: (!shouldLoad || !isLoaded) ? 'flex' : 'none'
        }}
      >
        {initials}
      </div>
    </div>
  );
};
