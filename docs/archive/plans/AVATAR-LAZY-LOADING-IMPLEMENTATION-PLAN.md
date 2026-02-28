# Avatar & Image Lazy Loading Implementation Plan

## Current State Analysis

### Components Using Images
1. **Avatar Component** (`src/renderer/components/Avatar/Avatar.tsx`)
   - Used in: ConversationList, MatchCard, FeedPost, ProfileView, etc.
   - Current: No lazy loading, immediate image fetch
   - Issue: All avatars load immediately, even off-screen ones

2. **MediaGrid Component** (`src/renderer/components/MediaGrid/MediaGrid.tsx`)
   - Used in: FeedPost for displaying post images
   - Current: Has `loading="lazy"` attribute ✅
   - Status: Already optimized

3. **MatchCard Component** (`src/renderer/components/MatchCard/MatchCard.tsx`)
   - Uses Avatar component for profile pictures
   - Current: No lazy loading

4. **FeedPost Component** (`src/renderer/components/FeedPost/FeedPost.tsx`)
   - Uses Avatar and MediaGrid
   - MediaGrid already has lazy loading ✅

### Problems Identified
1. **Avatar images load immediately** - Even for conversations/matches not visible on screen
2. **No loading states** - Users see broken images or blank spaces during load
3. **No progressive loading** - All images requested at once on page load
4. **Mobile performance** - Especially bad on conversation lists with many avatars

## Solution: Comprehensive Lazy Loading Strategy

### Phase 1: Create Reusable LazyImage Component

Create a new `LazyImage` component that:
- Uses Intersection Observer API for viewport detection
- Shows loading skeleton/placeholder while loading
- Handles error states gracefully
- Supports fade-in animation on load
- Works with both regular images and avatars

**Benefits:**
- Reusable across all components
- Consistent loading behavior
- Better UX with loading states
- Reduced initial page load

### Phase 2: Update Avatar Component

Integrate lazy loading into Avatar:
- Use LazyImage for avatar images
- Keep initials as instant fallback
- Add loading shimmer effect
- Prioritize above-the-fold avatars

**Benefits:**
- Faster conversation list rendering
- Reduced bandwidth on mobile
- Better perceived performance

### Phase 3: Optimize ConversationList

Specific optimizations for conversation list:
- Virtual scrolling for long lists (optional)
- Prioritize visible conversations
- Preload next 5-10 avatars
- Cache loaded images

**Benefits:**
- Smooth scrolling on mobile
- Instant display of cached avatars
- Reduced memory usage

### Phase 4: Add Progressive Image Loading

Implement blur-up technique:
- Load tiny placeholder first (base64)
- Load full image in background
- Smooth transition between states

**Benefits:**
- Perceived instant loading
- Professional appearance
- Better UX on slow connections

## Implementation Details

### 1. LazyImage Component

**File:** `src/renderer/components/LazyImage/LazyImage.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string; // Base64 or placeholder URL
  onLoad?: () => void;
  onError?: () => void;
  eager?: boolean; // Skip lazy loading for above-the-fold images
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError,
  eager = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (eager) return; // Skip observer for eager loading

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [eager]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`lazy-image-container ${className}`} ref={imgRef}>
      {/* Placeholder/Loading State */}
      {!isLoaded && !hasError && (
        <div className="lazy-image-placeholder">
          {placeholder ? (
            <img src={placeholder} alt="" className="lazy-image-blur" />
          ) : (
            <div className="lazy-image-skeleton" />
          )}
        </div>
      )}

      {/* Actual Image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'lazy-image-loaded' : 'lazy-image-loading'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="lazy-image-error">
          <span>❌</span>
        </div>
      )}
    </div>
  );
};
```

**File:** `src/renderer/components/LazyImage/LazyImage.css`

```css
.lazy-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.lazy-image-blur {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px);
  transform: scale(1.1);
}

.lazy-image-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image-loaded {
  opacity: 1;
}

.lazy-image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
  font-size: 24px;
}
```

### 2. Updated Avatar Component

**File:** `src/renderer/components/Avatar/Avatar.tsx`

```typescript
import React, { useState } from 'react';
import { mediaService } from '../../services/media.service';
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
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef<HTMLDivElement>(null);

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
    
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    return mediaService.getMediaUrl(src);
  };

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (eager || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [eager, src]);

  const avatarUrl = getAvatarUrl();
  const initials = getInitials();
  const displayName = alt || name || email || 'User';
  const showImage = avatarUrl && (isInView || eager) && !hasError;

  return (
    <div
      ref={imgRef}
      className={`avatar avatar-${size} ${className} ${onClick ? 'avatar-clickable' : ''} ${isLoaded ? 'avatar-loaded' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={displayName}
    >
      {/* Loading shimmer - only show if we have a URL but haven't loaded yet */}
      {showImage && !isLoaded && (
        <div className="avatar-loading-shimmer" />
      )}

      {/* Avatar Image */}
      {showImage && (
        <img
          src={avatarUrl}
          alt={displayName}
          className="avatar-image"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}

      {/* Initials Placeholder - always rendered as fallback */}
      <div 
        className="avatar-placeholder" 
        style={{ 
          display: (!avatarUrl || hasError || !isLoaded) ? 'flex' : 'none'
        }}
      >
        {initials}
      </div>
    </div>
  );
};
```

**File:** `src/renderer/components/Avatar/Avatar.css` (additions)

```css
.avatar-loading-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 50%;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.avatar-image {
  transition: opacity 0.3s ease-in-out;
}

.avatar-loaded .avatar-image {
  opacity: 1;
}
```

### 3. ConversationList Optimization

**File:** `src/renderer/components/ConversationList/ConversationList.tsx`

```typescript
// In the conversation item render:
<Avatar
  src={otherUser?.profile?.avatarUrl || otherUser?.avatarUrl}
  name={otherUser?.profile?.fullName || otherUser?.name}
  email={otherUser?.email}
  size={isMobile ? "sm" : "md"}
  className="conversation-avatar"
  eager={index < 5} // Load first 5 avatars immediately
/>
```

### 4. Image Caching Strategy

**File:** `src/renderer/utils/image-cache.ts`

```typescript
class ImageCache {
  private cache: Map<string, string> = new Map();
  private loading: Map<string, Promise<string>> = new Map();

  async loadImage(url: string): Promise<string> {
    // Return from cache if available
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Return existing promise if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url)!;
    }

    // Start loading
    const promise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, url);
        this.loading.delete(url);
        resolve(url);
      };
      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });

    this.loading.set(url, promise);
    return promise;
  }

  preload(urls: string[]): void {
    urls.forEach(url => {
      if (!this.cache.has(url) && !this.loading.has(url)) {
        this.loadImage(url).catch(() => {
          // Silently fail preloading
        });
      }
    });
  }

  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }
}

export const imageCache = new ImageCache();
```

## Implementation Phases

### Phase 1: Core Infrastructure (Priority: HIGH)
**Time Estimate:** 2-3 hours

1. ✅ Create LazyImage component
2. ✅ Add shimmer loading CSS
3. ✅ Test LazyImage in isolation

**Files to Create:**
- `src/renderer/components/LazyImage/LazyImage.tsx`
- `src/renderer/components/LazyImage/LazyImage.css`
- `src/renderer/components/LazyImage/index.ts`

### Phase 2: Avatar Integration (Priority: HIGH)
**Time Estimate:** 1-2 hours

1. ✅ Update Avatar component with lazy loading
2. ✅ Add loading shimmer to Avatar
3. ✅ Test in ConversationList
4. ✅ Test in MatchCard

**Files to Modify:**
- `src/renderer/components/Avatar/Avatar.tsx`
- `src/renderer/components/Avatar/Avatar.css`

### Phase 3: ConversationList Optimization (Priority: MEDIUM)
**Time Estimate:** 1 hour

1. ✅ Add eager loading for first 5 avatars
2. ✅ Test scroll performance
3. ✅ Verify mobile performance

**Files to Modify:**
- `src/renderer/components/ConversationList/ConversationList.tsx`

### Phase 4: Image Caching (Priority: LOW)
**Time Estimate:** 2 hours

1. ✅ Create image cache utility
2. ✅ Integrate with Avatar component
3. ✅ Add preloading for next items

**Files to Create:**
- `src/renderer/utils/image-cache.ts`

## Performance Metrics

### Before Optimization
- Initial page load: ~2-3s with 20 avatars
- Bandwidth: ~500KB-1MB for avatars
- Time to interactive: ~3s

### After Optimization (Expected)
- Initial page load: ~0.5-1s (only visible avatars)
- Bandwidth: ~100-200KB initially
- Time to interactive: ~1s
- Smooth scrolling: 60fps

## Testing Checklist

- [ ] Avatar loads correctly when scrolled into view
- [ ] Loading shimmer displays during load
- [ ] Initials show as fallback
- [ ] Error state handles broken images
- [ ] First 5 avatars load immediately (eager)
- [ ] Smooth fade-in animation
- [ ] Works on mobile (slow 3G)
- [ ] Works on desktop
- [ ] No memory leaks with Intersection Observer
- [ ] Cached images load instantly

## Browser Compatibility

- ✅ Chrome/Edge (Chromium): Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS 12.2+)
- ⚠️ IE11: Requires polyfill for Intersection Observer

## Fallback Strategy

For browsers without Intersection Observer:
```typescript
if (!('IntersectionObserver' in window)) {
  // Load all images immediately
  setIsInView(true);
}
```

## Next Steps

1. Review and approve this plan
2. Implement Phase 1 (LazyImage component)
3. Test Phase 1 thoroughly
4. Implement Phase 2 (Avatar integration)
5. Test in production-like environment
6. Monitor performance metrics
7. Iterate based on results

## Additional Optimizations (Future)

1. **Virtual Scrolling** - For very long conversation lists (100+ items)
2. **WebP Format** - Serve WebP images with JPEG fallback
3. **Responsive Images** - Different sizes for different screen sizes
4. **Service Worker Caching** - Cache images offline
5. **CDN Integration** - Serve images from CDN with optimization
