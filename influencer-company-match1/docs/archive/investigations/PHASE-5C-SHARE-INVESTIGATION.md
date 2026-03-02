# Phase 5C: Share Functionality - Investigation & Implementation Plan

**Date:** February 11, 2026  
**Status:** 🔍 INVESTIGATION COMPLETE - READY TO IMPLEMENT

---

## Executive Summary

Phase 5C implements comprehensive share functionality allowing users to share posts, campaigns, and matches through multiple channels:
- Share to feed (repost)
- Share via direct message
- Copy link to clipboard
- External sharing (Twitter, LinkedIn, Facebook)
- Share tracking and analytics

---

## Current State Analysis

### ✅ What's Already Complete

#### Phase 5A: Reaction System ✅
- 6 reaction types (like, love, wow, haha, sad, angry)
- WhoReactedModal component
- Backend reactions table and endpoints
- Frontend integration complete

#### Phase 5B: Collections System ✅
- Collections for organizing saved items
- SavedItems page
- Collection management (CRUD)
- Backend collections table and endpoints
- Frontend integration complete

### ❌ What's Missing for Phase 5C

#### Backend:
- ❌ Shares database table
- ❌ Share entity
- ❌ Share tracking endpoints
- ❌ Share count endpoint

#### Frontend:
- ❌ ShareModal component
- ❌ Share button in FeedPost
- ❌ Share tracking service methods
- ❌ Share count display
- ❌ External platform integration

---

## Implementation Plan

### Step 1: Backend - Share Tracking Database

**Create Migration:** `backend/src/database/migrations/1707582000000-CreateSharesTable.ts`

**Table Structure:**
```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'post', 'campaign', 'match'
  item_id UUID NOT NULL,
  share_type VARCHAR(50) NOT NULL, -- 'feed', 'message', 'link', 'twitter', 'linkedin', 'facebook'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shares_item ON shares(item_type, item_id);
CREATE INDEX idx_shares_user ON shares(user_id);
```

**Features:**
- Track all share actions
- Support multiple item types (posts, campaigns, matches)
- Track share method (feed, message, external)
- User attribution
- Timestamp for analytics

---

### Step 2: Backend - Share Entity

**Create:** `backend/src/modules/feed/entities/share.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ShareType {
  FEED = 'feed',
  MESSAGE = 'message',
  LINK = 'link',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
}

export enum ItemType {
  POST = 'post',
  CAMPAIGN = 'campaign',
  MATCH = 'match',
}

@Entity('shares')
@Index(['itemType', 'itemId'])
@Index(['userId'])
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'item_type',
    type: 'varchar',
    length: 50,
  })
  itemType: ItemType;

  @Column({ name: 'item_id' })
  itemId: string;

  @Column({
    name: 'share_type',
    type: 'varchar',
    length: 50,
  })
  shareType: ShareType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

### Step 3: Backend - Share Service Methods

**Update:** `backend/src/modules/feed/feed.service.ts`

Add these methods:

```typescript
// Inject Share repository
constructor(
  @InjectRepository(Share)
  private shareRepository: Repository<Share>,
  // ... other repositories
) {}

/**
 * Track a share action
 */
async trackShare(
  itemId: string,
  userId: string,
  itemType: ItemType,
  shareType: ShareType,
): Promise<void> {
  const share = this.shareRepository.create({
    userId,
    itemType,
    itemId,
    shareType,
  });

  await this.shareRepository.save(share);
}

/**
 * Get share count for an item
 */
async getShareCount(itemId: string, itemType: ItemType): Promise<number> {
  return this.shareRepository.count({
    where: {
      itemId,
      itemType,
    },
  });
}

/**
 * Get share breakdown by type
 */
async getShareBreakdown(itemId: string, itemType: ItemType): Promise<Record<ShareType, number>> {
  const shares = await this.shareRepository.find({
    where: {
      itemId,
      itemType,
    },
  });

  const breakdown: Record<ShareType, number> = {
    [ShareType.FEED]: 0,
    [ShareType.MESSAGE]: 0,
    [ShareType.LINK]: 0,
    [ShareType.TWITTER]: 0,
    [ShareType.LINKEDIN]: 0,
    [ShareType.FACEBOOK]: 0,
  };

  shares.forEach((share) => {
    breakdown[share.shareType]++;
  });

  return breakdown;
}

/**
 * Get recent sharers
 */
async getRecentSharers(itemId: string, itemType: ItemType, limit: number = 10): Promise<any[]> {
  const shares = await this.shareRepository.find({
    where: {
      itemId,
      itemType,
    },
    relations: ['user'],
    order: { createdAt: 'DESC' },
    take: limit,
  });

  return shares.map((share) => ({
    userId: share.userId,
    userName: share.user.email.split('@')[0],
    avatarUrl: share.user.avatarUrl,
    shareType: share.shareType,
    sharedAt: share.createdAt,
  }));
}
```

---

### Step 4: Backend - Share Endpoints

**Update:** `backend/src/modules/feed/feed.controller.ts`

Add these endpoints:

```typescript
// ==================== SHARE ENDPOINTS ====================

@Post('posts/:id/share')
async sharePost(
  @Param('id') id: string,
  @CurrentUser() user: any,
  @Body() body: { shareType: ShareType },
) {
  await this.feedService.trackShare(id, user.sub, ItemType.POST, body.shareType);
  return { message: 'Share tracked successfully' };
}

@Get('posts/:id/share-count')
async getShareCount(@Param('id') id: string) {
  const count = await this.feedService.getShareCount(id, ItemType.POST);
  return { count };
}

@Get('posts/:id/share-details')
async getShareDetails(@Param('id') id: string) {
  const [count, breakdown, recentSharers] = await Promise.all([
    this.feedService.getShareCount(id, ItemType.POST),
    this.feedService.getShareBreakdown(id, ItemType.POST),
    this.feedService.getRecentSharers(id, ItemType.POST),
  ]);

  return {
    count,
    breakdown,
    recentSharers,
  };
}
```

---

### Step 5: Frontend - Feed Service Methods

**Update:** `src/renderer/services/feed.service.ts`

Add share methods:

```typescript
// ==================== SHARE METHODS ====================

async trackShare(itemId: string, itemType: string, shareType: string): Promise<void> {
  await apiClient.post(`/feed/posts/${itemId}/share`, { shareType });
}

async getShareCount(itemId: string): Promise<{ count: number }> {
  return apiClient.get<{ count: number }>(`/feed/posts/${itemId}/share-count`);
}

async getShareDetails(itemId: string): Promise<{
  count: number;
  breakdown: Record<string, number>;
  recentSharers: any[];
}> {
  return apiClient.get(`/feed/posts/${itemId}/share-details`);
}
```

---

### Step 6: Frontend - ShareModal Component

**Create:** `src/renderer/components/ShareModal/ShareModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiNewspaper,
  HiMail,
  HiLink,
  HiX,
} from 'react-icons/hi';
import { FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { feedService } from '../../services/feed.service';
import { useToast } from '../../contexts/ToastContext';
import './ShareModal.css';

interface ShareModalProps {
  itemType: 'post' | 'campaign' | 'match';
  itemId: string;
  itemTitle?: string;
  itemUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  itemType,
  itemId,
  itemTitle,
  itemUrl,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [shareCount, setShareCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShareCount();
    }
  }, [isOpen, itemId]);

  const loadShareCount = async () => {
    try {
      const { count } = await feedService.getShareCount(itemId);
      setShareCount(count);
    } catch (error) {
      console.error('Failed to load share count:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      setLoading(true);
      const url = itemUrl || `${window.location.origin}/#/${itemType}/${itemId}`;
      await navigator.clipboard.writeText(url);
      await feedService.trackShare(itemId, itemType, 'link');
      setShareCount(prev => prev + 1);
      showToast('Link copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShareToFeed = async () => {
    try {
      setLoading(true);
      await feedService.trackShare(itemId, itemType, 'feed');
      setShareCount(prev => prev + 1);
      navigate('/feed', {
        state: {
          sharedItem: { type: itemType, id: itemId, title: itemTitle },
        },
      });
      onClose();
    } catch (error) {
      showToast('Failed to share to feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShareViaMessage = async () => {
    try {
      setLoading(true);
      await feedService.trackShare(itemId, itemType, 'message');
      setShareCount(prev => prev + 1);
      navigate('/messages', {
        state: {
          sharedItem: { type: itemType, id: itemId, title: itemTitle },
        },
      });
      onClose();
    } catch (error) {
      showToast('Failed to share via message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalShare = async (platform: 'twitter' | 'linkedin' | 'facebook') => {
    try {
      setLoading(true);
      const url = itemUrl || `${window.location.origin}/#/${itemType}/${itemId}`;
      const text = itemTitle || `Check out this ${itemType}`;

      let shareUrl = '';
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
      }

      window.open(shareUrl, '_blank', 'width=600,height=400');
      await feedService.trackShare(itemId, itemType, platform);
      setShareCount(prev => prev + 1);
      showToast(`Shared to ${platform}!`, 'success');
    } catch (error) {
      showToast(`Failed to share to ${platform}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <HiX size={24} />
          </button>
        </div>

        <div className="share-options">
          <button
            className="share-option"
            onClick={handleShareToFeed}
            disabled={loading}
          >
            <div className="share-option-icon">
              <HiNewspaper size={24} />
            </div>
            <span>Share to Feed</span>
          </button>

          <button
            className="share-option"
            onClick={handleShareViaMessage}
            disabled={loading}
          >
            <div className="share-option-icon">
              <HiMail size={24} />
            </div>
            <span>Send via Message</span>
          </button>

          <button
            className="share-option"
            onClick={handleCopyLink}
            disabled={loading}
          >
            <div className="share-option-icon">
              <HiLink size={24} />
            </div>
            <span>Copy Link</span>
          </button>

          <div className="share-divider" />

          <button
            className="share-option external"
            onClick={() => handleExternalShare('twitter')}
            disabled={loading}
          >
            <div className="share-option-icon twitter">
              <FaTwitter size={24} />
            </div>
            <span>Share on Twitter</span>
          </button>

          <button
            className="share-option external"
            onClick={() => handleExternalShare('linkedin')}
            disabled={loading}
          >
            <div className="share-option-icon linkedin">
              <FaLinkedin size={24} />
            </div>
            <span>Share on LinkedIn</span>
          </button>

          <button
            className="share-option external"
            onClick={() => handleExternalShare('facebook')}
            disabled={loading}
          >
            <div className="share-option-icon facebook">
              <FaFacebook size={24} />
            </div>
            <span>Share on Facebook</span>
          </button>
        </div>

        {shareCount > 0 && (
          <div className="share-count">
            Shared {shareCount} {shareCount === 1 ? 'time' : 'times'}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Step 7: Frontend - ShareModal Styles

**Create:** `src/renderer/components/ShareModal/ShareModal.css`

```css
.share-modal {
  background: white;
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.share-options {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
  font-size: 1rem;
}

.share-option:hover:not(:disabled) {
  background: var(--color-bg-secondary);
}

.share-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.share-option-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.share-option-icon.twitter {
  background: #1DA1F2;
  color: white;
}

.share-option-icon.linkedin {
  background: #0A66C2;
  color: white;
}

.share-option-icon.facebook {
  background: #1877F2;
  color: white;
}

.share-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.5rem 0;
}

.share-count {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  border-top: 1px solid var(--color-border);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .share-modal {
    width: 95%;
    max-width: none;
  }

  .share-option {
    padding: 0.875rem;
  }

  .share-option-icon {
    width: 40px;
    height: 40px;
  }
}
```

---

### Step 8: Frontend - Update FeedPost Component

**Update:** `src/renderer/components/FeedPost/FeedPost.tsx`

Add share button and modal:

```typescript
import { ShareModal } from '../ShareModal/ShareModal';

// Add state
const [showShareModal, setShowShareModal] = useState(false);
const [shareCount, setShareCount] = useState(0);

// Load share count on mount
useEffect(() => {
  loadShareCount();
}, [post.id]);

const loadShareCount = async () => {
  try {
    const { count } = await feedService.getShareCount(post.id);
    setShareCount(count);
  } catch (error) {
    console.error('Failed to load share count:', error);
  }
};

// Add to action bar
const actions = [
  {
    id: 'like',
    icon: reaction ? REACTIONS.find(r => r.type === reaction)?.emoji : <HiHeart />,
    label: `${likeCount}`,
    onClick: () => setShowReactionPicker(!showReactionPicker),
    active: liked,
  },
  {
    id: 'comment',
    icon: <HiChatAlt />,
    label: `${commentCount}`,
    onClick: () => setShowComments(!showComments),
  },
  {
    id: 'share',
    icon: <HiShare />,
    label: shareCount > 0 ? `${shareCount}` : 'Share',
    onClick: () => setShowShareModal(true),
  },
  {
    id: 'save',
    icon: saved ? <HiBookmark /> : <HiOutlineBookmark />,
    label: 'Save',
    onClick: handleSave,
    active: saved,
  },
];

// Add modal at the end of component
{showShareModal && (
  <ShareModal
    itemType="post"
    itemId={post.id}
    itemTitle={post.content.substring(0, 100)}
    isOpen={showShareModal}
    onClose={() => setShowShareModal(false)}
  />
)}
```

---

### Step 9: Frontend - Update Feed Module

**Update:** `backend/src/modules/feed/feed.module.ts`

Add Share entity:

```typescript
import { Share } from './entities/share.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeedPost,
      PostLike,
      PostComment,
      PostSave,
      Reaction,
      Collection,
      Share, // ADD THIS
      User,
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
```

---

## Implementation Checklist

### Backend Tasks:
- [ ] Create shares migration (1707582000000-CreateSharesTable.ts)
- [ ] Create Share entity (share.entity.ts)
- [ ] Add Share repository to FeedService
- [ ] Implement trackShare() method
- [ ] Implement getShareCount() method
- [ ] Implement getShareBreakdown() method
- [ ] Implement getRecentSharers() method
- [ ] Add share endpoints to FeedController
- [ ] Update FeedModule with Share entity
- [ ] Run migration: `npm run migration:run`

### Frontend Tasks:
- [ ] Add share methods to feed.service.ts
- [ ] Create ShareModal component
- [ ] Create ShareModal styles
- [ ] Update FeedPost with share button
- [ ] Add share count display
- [ ] Test copy link functionality
- [ ] Test share to feed
- [ ] Test share via message
- [ ] Test external sharing (Twitter, LinkedIn, Facebook)
- [ ] Test share count updates

### Testing:
- [ ] Share button appears in FeedPost
- [ ] ShareModal opens on click
- [ ] Copy link copies to clipboard
- [ ] Share to feed navigates correctly
- [ ] Share via message navigates correctly
- [ ] External share opens new window
- [ ] Share count increments
- [ ] Share tracking works
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Error handling works

---

## Success Criteria

### Functionality:
✅ Users can share posts through 6 different methods  
✅ Share tracking records all share actions  
✅ Share count displays correctly  
✅ External sharing opens correct platforms  
✅ Copy link works on all browsers  

### Performance:
✅ Share modal opens instantly  
✅ Share tracking is async (doesn't block UI)  
✅ Share count loads quickly  

### User Experience:
✅ Clear share options  
✅ Visual feedback on share  
✅ Toast notifications  
✅ Mobile responsive  
✅ Accessible (keyboard navigation)  

---

## Next Steps After Phase 5C

### Phase 5D: Mentions & Hashtags (Days 10-14)
- @mention autocomplete
- #hashtag discovery
- Trending hashtags
- Mention notifications
- Hashtag page

---

## Estimated Time

**Total:** 3 days (Days 7-9 of Phase 5)

- Day 7: Backend (migration, entity, service, endpoints) - 4 hours
- Day 8: Frontend (ShareModal component, styles) - 4 hours
- Day 9: Integration (FeedPost update, testing) - 4 hours

---

## Status: Ready to Implement! 🚀

All requirements analyzed, plan documented, and ready to begin Phase 5C implementation.

