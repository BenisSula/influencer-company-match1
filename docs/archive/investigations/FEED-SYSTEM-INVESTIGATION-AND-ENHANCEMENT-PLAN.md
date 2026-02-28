# Feed System Investigation & Phase 6 Enhancement Plan

## 🔍 Current State Investigation

### ✅ What's Working (Backend & Database Sync)

#### 1. **Backend Service** ✅ FULLY IMPLEMENTED
**File**: `backend/src/modules/feed/feed.service.ts`

**Core Features**:
- ✅ Create posts with media
- ✅ Get feed with pagination
- ✅ Like/Unlike posts
- ✅ Comment system
- ✅ Save/Unsave posts
- ✅ Reactions (6 types: like, love, wow, haha, sad, angry)
- ✅ Collections management
- ✅ Share tracking
- ✅ Hashtag processing & trending
- ✅ Mention system (@username)

**Database Integration**:
```typescript
// All entities properly connected to PostgreSQL
- FeedPost entity ✅
- PostLike entity ✅
- PostComment entity ✅
- PostSave entity ✅
- Reaction entity ✅
- Collection entity ✅
- Share entity ✅
- Hashtag entity ✅
- Mention entity ✅
- PostHashtag entity ✅
```

**Current Feed Query** (Line 73-95):
```typescript
async getFeed(query: FeedQueryDto) {
  const queryBuilder = this.feedPostRepo
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')
    .orderBy('post.createdAt', 'DESC') // ✅ Newest first
    .skip(skip)
    .take(limit);
  
  // ⚠️ NO FILTERING BY CONNECTIONS OR COMPATIBILITY
  // ⚠️ NO ALGORITHM - JUST CHRONOLOGICAL
}
```

#### 2. **Frontend Service** ✅ FULLY IMPLEMENTED
**File**: `src/renderer/services/feed.service.ts`

**API Integration**:
- ✅ All backend endpoints properly mapped
- ✅ Type-safe interfaces
- ✅ Pagination support
- ✅ Error handling

#### 3. **Frontend Components** ✅ FULLY IMPLEMENTED

**Feed Page** (`src/renderer/pages/Feed.tsx`):
- ✅ Post creation
- ✅ Feed display with pagination
- ✅ Refresh functionality
- ✅ Load more
- ✅ Empty states
- ✅ Loading skeletons

**FeedPost Component** (`src/renderer/components/FeedPost/FeedPost.tsx`):
- ✅ Like/Unlike
- ✅ Comment toggle
- ✅ Save/Unsave
- ✅ Share modal
- ✅ Reaction picker
- ✅ Who reacted modal
- ✅ Message author button ✅ (Already implemented!)
- ✅ Delete own posts
- ✅ Media display
- ✅ Rich text rendering
- ✅ Hashtag support
- ✅ Mention support

### ❌ What's Missing (Phase 6 Requirements)

#### 1. **Feed Algorithm** ❌ NOT IMPLEMENTED
**Current**: Simple chronological feed (newest first)
**Required**: Intelligent prioritization

**Missing Logic**:
```typescript
// Phase 6 Requirements:
1. Posts from connections (highest priority)
2. Posts from high-compatibility matches
3. Industry-relevant content
4. Engagement signals (likes, comments)
5. Recency
```

#### 2. **Connection-Based Filtering** ❌ NOT IMPLEMENTED
**Issue**: Feed shows ALL posts from ALL users
**Required**: Prioritize posts from:
- Direct connections
- High-compatibility matches (score >= 75)
- Same niche/industry

#### 3. **Profile Actions from Posts** ⚠️ PARTIALLY IMPLEMENTED
**Already Working**:
- ✅ Message author from post (Line 189-210 in FeedPost.tsx)
- ✅ View profile (click on avatar/name)

**Missing**:
- ❌ "Request Collaboration" button on posts
- ❌ Quick compatibility score display
- ❌ Connection status indicator

#### 4. **Post Type Enhancements** ⚠️ PARTIALLY IMPLEMENTED
**Already Supported** (PostType enum):
- ✅ update
- ✅ collaboration_story
- ✅ campaign_announcement
- ✅ portfolio

**Missing**:
- ❌ Video posts (future)
- ❌ Sponsored content (future)
- ❌ Better visual distinction between post types

## 📊 Data Flow Analysis

### Current Flow ✅ WORKING
```
User Action → Frontend Service → Backend API → Database
                                      ↓
                              TypeORM Entities
                                      ↓
                              PostgreSQL Tables
                                      ↓
                              Response Data
                                      ↓
                              Frontend Display
```

**Verification**:
- ✅ Posts are created and stored in `feed_posts` table
- ✅ Likes stored in `post_likes` table
- ✅ Comments stored in `post_comments` table
- ✅ Reactions stored in `reactions` table
- ✅ Saves stored in `post_saves` table
- ✅ Shares tracked in `shares` table
- ✅ Hashtags stored in `hashtags` and `post_hashtags` tables
- ✅ Mentions stored in `mentions` table

### Missing Data Flow ❌
```
Feed Request → Check User Connections → Filter by Connections
                                              ↓
                                    Check Match Compatibility
                                              ↓
                                    Apply Algorithm Scoring
                                              ↓
                                    Sort by Priority
                                              ↓
                                    Return Personalized Feed
```

## 🎯 Phase 6 Enhancement Plan

### Priority 1: Intelligent Feed Algorithm ⚡ HIGH PRIORITY

#### 1.1 Backend: Enhanced Feed Service

**File**: `backend/src/modules/feed/feed.service.ts`

**Add new method**:
```typescript
async getPersonalizedFeed(userId: string, query: FeedQueryDto) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  // Step 1: Get user's connections
  const connections = await this.connectionRepo.find({
    where: [
      { userId, status: ConnectionStatus.ACCEPTED },
      { connectedUserId: userId, status: ConnectionStatus.ACCEPTED }
    ]
  });

  const connectionIds = connections.map(c => 
    c.userId === userId ? c.connectedUserId : c.userId
  );

  // Step 2: Get user's high-compatibility matches (score >= 75)
  const matches = await this.matchingService.getMatches(userId);
  const highCompatibilityIds = matches
    .filter(m => m.score >= 75)
    .map(m => m.profile.id);

  // Step 3: Get user's niche/industry for content relevance
  const currentUser = await this.userRepo.findOne({ 
    where: { id: userId },
    relations: ['influencerProfile', 'companyProfile']
  });

  const userNiche = currentUser.role === 'INFLUENCER' 
    ? currentUser.influencerProfile?.niche 
    : currentUser.companyProfile?.industry;

  // Step 4: Build prioritized query
  const posts = await this.feedPostRepo
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')
    .leftJoinAndSelect('author.influencerProfile', 'influencerProfile')
    .leftJoinAndSelect('author.companyProfile', 'companyProfile')
    .addSelect(
      // Priority scoring
      `CASE
        WHEN post.author_id IN (:...connectionIds) THEN 100
        WHEN post.author_id IN (:...highCompatibilityIds) THEN 75
        WHEN (influencerProfile.niche = :userNiche OR companyProfile.industry = :userNiche) THEN 50
        ELSE 25
      END + 
      (post.like_count * 0.5) + 
      (post.comment_count * 1.0) +
      (EXTRACT(EPOCH FROM (NOW() - post.created_at)) / 3600 * -0.1)`,
      'priority_score'
    )
    .where('post.author_id != :userId', { userId })
    .setParameters({
      connectionIds: connectionIds.length > 0 ? connectionIds : [''],
      highCompatibilityIds: highCompatibilityIds.length > 0 ? highCompatibilityIds : [''],
      userNiche: userNiche || '',
    })
    .orderBy('priority_score', 'DESC')
    .addOrderBy('post.createdAt', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data: posts[0],
    meta: {
      total: posts[1],
      page,
      limit,
      totalPages: Math.ceil(posts[1] / limit),
    },
  };
}
```

**Priority Scoring Breakdown**:
- Connection posts: 100 points (highest priority)
- High-compatibility matches: 75 points
- Same niche/industry: 50 points
- Other posts: 25 points
- Engagement boost: +0.5 per like, +1.0 per comment
- Recency decay: -0.1 per hour old

#### 1.2 Backend: Add Controller Endpoint

**File**: `backend/src/modules/feed/feed.controller.ts`

**Add endpoint**:
```typescript
@Get('personalized')
async getPersonalizedFeed(
  @CurrentUser() user: any,
  @Query() query: FeedQueryDto,
) {
  return this.feedService.getPersonalizedFeed(user.sub, query);
}
```

#### 1.3 Frontend: Update Feed Service

**File**: `src/renderer/services/feed.service.ts`

**Add method**:
```typescript
async getPersonalizedFeed(query?: FeedQuery): Promise<PaginatedResponse<FeedPost>> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());

  const queryString = params.toString();
  return apiClient.get<PaginatedResponse<FeedPost>>(
    `/feed/personalized${queryString ? `?${queryString}` : ''}`
  );
}
```

#### 1.4 Frontend: Update Feed Page

**File**: `src/renderer/pages/Feed.tsx`

**Change line 36**:
```typescript
// OLD:
const response = await feedService.getFeed({ page: pageNum, limit: 20 });

// NEW:
const response = await feedService.getPersonalizedFeed({ page: pageNum, limit: 20 });
```

### Priority 2: Collaboration Request from Posts ⚡ HIGH PRIORITY

#### 2.1 Frontend: Add Collaboration Button to FeedPost

**File**: `src/renderer/components/FeedPost/FeedPost.tsx`

**Add to actionBarItems** (after line 189):
```typescript
{
  id: 'collaborate',
  icon: <HiUserAdd />,
  label: 'Collaborate',
  onClick: () => {
    if (!user) {
      showToast('Please log in to request collaboration', 'error');
      return;
    }
    
    if (isOwnPost) {
      showToast("You can't collaborate with yourself", 'info');
      return;
    }
    
    // Open collaboration request modal
    setShowCollaborationModal(true);
  },
  disabled: isOwnPost || !user,
  disabledTooltip: isOwnPost ? "You can't collaborate with yourself" : !user ? "Please log in" : undefined,
},
```

**Add state and modal**:
```typescript
const [showCollaborationModal, setShowCollaborationModal] = useState(false);

// At the end of component, before closing tag:
{showCollaborationModal && (
  <CollaborationRequestModal
    recipientId={post.authorId}
    recipientName={getAuthorName()}
    isOpen={showCollaborationModal}
    onClose={() => setShowCollaborationModal(false)}
    onSuccess={() => {
      setShowCollaborationModal(false);
      showToast('Collaboration request sent!', 'success');
    }}
  />
)}
```

### Priority 3: Post Type Visual Enhancements 🎨 MEDIUM PRIORITY

#### 3.1 Enhanced Post Type Badges

**File**: `src/renderer/components/FeedPost/FeedPost.css`

**Add styles**:
```css
.feed-post-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.feed-post-type-badge.update {
  background: #E3F2FD;
  color: #1976D2;
}

.feed-post-type-badge.collaboration_story {
  background: #E8F5E9;
  color: #388E3C;
}

.feed-post-type-badge.portfolio {
  background: #F3E5F5;
  color: #7B1FA2;
}

.feed-post-type-badge.campaign_announcement {
  background: #FFF3E0;
  color: #F57C00;
}
```

#### 3.2 Update Post Type Display

**File**: `src/renderer/components/FeedPost/FeedPost.tsx`

**Replace getPostTypeLabel** (line 155):
```typescript
const getPostTypeBadge = (type: string) => {
  const badges: Record<string, { icon: string; label: string; className: string }> = {
    update: { icon: '📝', label: 'Update', className: 'update' },
    collaboration_story: { icon: '🤝', label: 'Collaboration', className: 'collaboration_story' },
    campaign_announcement: { icon: '📢', label: 'Campaign', className: 'campaign_announcement' },
    portfolio: { icon: '🎨', label: 'Portfolio', className: 'portfolio' },
  };
  
  const badge = badges[type] || { icon: '', label: type, className: 'update' };
  
  return (
    <span className={`feed-post-type-badge ${badge.className}`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
};
```

### Priority 4: Connection Status Indicator 🔧 MEDIUM PRIORITY

#### 4.1 Add Connection Status to Posts

**File**: `src/renderer/components/FeedPost/FeedPost.tsx`

**Add state and effect**:
```typescript
const [connectionStatus, setConnectionStatus] = useState<string>('none');
const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);

useEffect(() => {
  const loadConnectionInfo = async () => {
    if (!user || isOwnPost) return;
    
    try {
      // Check connection status
      const status = await matchingService.getConnectionStatus(post.authorId);
      setConnectionStatus(status);
      
      // Get compatibility score if not connected
      if (status === 'none') {
        const match = await matchingService.getMatch(user.id, post.authorId);
        setCompatibilityScore(match.score);
      }
    } catch (error) {
      console.error('Failed to load connection info:', error);
    }
  };
  
  loadConnectionInfo();
}, [post.authorId, user, isOwnPost]);
```

**Add indicator to header** (after author info):
```typescript
{!isOwnPost && connectionStatus === 'accepted' && (
  <span className="connection-badge">
    <HiCheckCircle size={16} />
    Connected
  </span>
)}

{!isOwnPost && connectionStatus === 'none' && compatibilityScore && compatibilityScore >= 75 && (
  <span className="compatibility-badge">
    🔥 {compatibilityScore}% Match
  </span>
)}
```

### Priority 5: Feed Filters & Tabs 🎨 LOW PRIORITY

#### 5.1 Add Feed Tabs

**File**: `src/renderer/pages/Feed.tsx`

**Add tabs**:
```typescript
const [activeTab, setActiveTab] = useState<'all' | 'connections' | 'matches'>('all');

// In the header section:
<div className="feed-tabs">
  <button 
    className={`feed-tab ${activeTab === 'all' ? 'active' : ''}`}
    onClick={() => setActiveTab('all')}
  >
    All Posts
  </button>
  <button 
    className={`feed-tab ${activeTab === 'connections' ? 'active' : ''}`}
    onClick={() => setActiveTab('connections')}
  >
    Connections
  </button>
  <button 
    className={`feed-tab ${activeTab === 'matches' ? 'active' : ''}`}
    onClick={() => setActiveTab('matches')}
  >
    Top Matches
  </button>
</div>
```

## 📋 Implementation Checklist

### Phase 6.1: Feed Algorithm ⚡ IMMEDIATE

- [ ] Add `getPersonalizedFeed` method to backend service
- [ ] Add connection repository injection
- [ ] Add matching service injection
- [ ] Implement priority scoring logic
- [ ] Add `/feed/personalized` endpoint
- [ ] Update frontend service with new method
- [ ] Update Feed page to use personalized feed
- [ ] Test with multiple users and connections

**Estimated Time**: 4-6 hours
**Impact**: HIGH - Transforms feed from chronological to intelligent

### Phase 6.2: Post Interactions ⚡ IMMEDIATE

- [ ] Add "Request Collaboration" button to FeedPost
- [ ] Import CollaborationRequestModal
- [ ] Add modal state management
- [ ] Test collaboration request from post
- [ ] Add connection status indicator
- [ ] Add compatibility score badge
- [ ] Test with different connection states

**Estimated Time**: 2-3 hours
**Impact**: HIGH - Enables direct collaboration from feed

### Phase 6.3: Visual Enhancements 🎨 SHORT TERM

- [ ] Create post type badge styles
- [ ] Update post type display component
- [ ] Add connection status badges
- [ ] Add compatibility score indicators
- [ ] Test visual consistency
- [ ] Mobile responsive check

**Estimated Time**: 2-3 hours
**Impact**: MEDIUM - Improves UX and visual hierarchy

### Phase 6.4: Feed Filters 🎨 MEDIUM TERM

- [ ] Add feed tabs (All, Connections, Matches)
- [ ] Implement tab filtering logic
- [ ] Add post type filters
- [ ] Add date range filters
- [ ] Test filter combinations
- [ ] Add filter persistence

**Estimated Time**: 3-4 hours
**Impact**: MEDIUM - Improves content discovery

## 🧪 Testing Plan

### Test 1: Personalized Feed Algorithm
1. Create User A with connections
2. Create User B (connected to A)
3. Create User C (high compatibility with A, not connected)
4. Create User D (low compatibility, not connected)
5. Post from each user
6. Login as User A
7. **Expected**: See posts in order: B (connection), C (high match), D (other)

### Test 2: Collaboration from Post
1. Login as User A
2. View feed
3. See post from User B
4. Click "Collaborate" button
5. Fill collaboration request modal
6. Submit
7. **Expected**: Request sent, notification created, modal closes

### Test 3: Connection Status Display
1. Login as User A
2. View feed
3. **Expected**: 
   - Connected users show "Connected" badge
   - High-compatibility non-connected users show "🔥 85% Match"
   - Own posts show no badge

## 📊 Success Metrics

### Feed Engagement
- **Target**: 30% increase in post interactions
- **Measure**: Likes, comments, shares per session

### Collaboration Requests
- **Target**: 50% of requests initiated from feed
- **Measure**: Request source tracking

### Feed Relevance
- **Target**: 80% of viewed posts from connections or high matches
- **Measure**: Post source analytics

## 🚀 Future Enhancements (Post-Phase 6)

### Video Posts
- Add video upload support
- Video player component
- Video thumbnails
- Auto-play on scroll

### Sponsored Content
- Sponsored post type
- Sponsored badge
- Targeting options
- Analytics tracking

### Advanced Algorithm
- Machine learning recommendations
- User behavior tracking
- A/B testing framework
- Personalization engine

## 📝 Summary

### Current Status ✅
- **Backend**: Fully implemented, database synced
- **Frontend**: Fully implemented, all interactions working
- **Data Flow**: Complete and functional
- **Missing**: Intelligent algorithm, connection-based filtering

### Phase 6 Requirements
- ✅ Post interactions (like, comment, share, save) - DONE
- ✅ Reactions system - DONE
- ✅ Message from post - DONE
- ❌ Feed algorithm - TO IMPLEMENT
- ❌ Collaboration from post - TO IMPLEMENT
- ⚠️ Post type enhancements - PARTIAL

### Quick Win 🎯
**Implement personalized feed algorithm first** - This single change will transform the feed from a generic timeline into an intelligent, relationship-focused experience. Estimated 4-6 hours, HIGH impact.

### Total Implementation Time
- **Phase 6.1** (Algorithm): 4-6 hours
- **Phase 6.2** (Interactions): 2-3 hours
- **Phase 6.3** (Visual): 2-3 hours
- **Phase 6.4** (Filters): 3-4 hours
- **Total**: 11-16 hours

**Status**: ✅ READY TO IMPLEMENT - All infrastructure in place, just need algorithm logic
