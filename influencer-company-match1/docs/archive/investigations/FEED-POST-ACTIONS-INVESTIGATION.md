# Feed Post Actions Investigation & Implementation Plan

## Investigation Date
February 15, 2026

## Objective
Investigate if the following features are implemented in feed posts:
1. **View profile from post** - Click on author name/avatar to view their profile
2. **Direct message from post** - Send a message directly from a post
3. **Request collaboration from post** - Request collaboration directly from a post

---

## Current Implementation Status

### ✅ 1. Direct Message from Post - **IMPLEMENTED**

**Location**: `src/renderer/components/FeedPost/FeedPost.tsx` (Lines 200-230)

**Implementation Details**:
```typescript
{
  id: 'message',
  icon: <HiMail />,
  label: 'Message',
  onClick: () => {
    if (!user) {
      showToast('Please log in to send messages', 'error');
      return;
    }
    
    if (isOwnPost) {
      showToast("You can't message yourself", 'info');
      return;
    }
    
    if (!post.authorId) {
      showToast('Unable to identify post author', 'error');
      return;
    }
    
    navigate('/messages', {
      state: {
        recipientId: post.authorId,
        recipientName: getAuthorName(),
        context: 'post',
        contextData: {
          postId: post.id,
          postType: post.postType
        }
      }
    });
  },
  disabled: isOwnPost || !user,
}
```

**Features**:
- ✅ Message button in action bar
- ✅ Navigates to Messages page with recipient info
- ✅ Passes post context (postId, postType)
- ✅ Disabled for own posts
- ✅ Requires authentication
- ✅ Error handling for missing data

---

### ✅ 2. Request Collaboration from Post - **IMPLEMENTED**

**Location**: `src/renderer/components/FeedPost/FeedPost.tsx` (Lines 231-255)

**Implementation Details**:
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
    
    setShowCollaborationModal(true);
  },
  disabled: isOwnPost || !user || connectionStatus === 'pending',
}
```

**Modal Implementation** (Lines 450-465):
```typescript
{showCollaborationModal && (
  <CollaborationRequestModal
    recipientId={post.authorId}
    recipientName={getAuthorName()}
    isOpen={showCollaborationModal}
    onClose={() => setShowCollaborationModal(false)}
    onSuccess={() => {
      setShowCollaborationModal(false);
      showToast('Collaboration request sent!', 'success');
      setConnectionStatus('pending');
    }}
  />
)}
```

**Features**:
- ✅ Collaborate button in action bar
- ✅ Opens CollaborationRequestModal
- ✅ Passes author info (recipientId, recipientName)
- ✅ Disabled for own posts
- ✅ Disabled when request is pending
- ✅ Updates connection status after success
- ✅ Requires authentication

---

### ❌ 3. View Profile from Post - **NOT IMPLEMENTED**

**Current State**:
- Author name and avatar are displayed but **NOT clickable**
- No navigation to profile view when clicking author info
- ProfileView route exists at `/profile/:id`
- ProfileView component is fully implemented

**Missing Implementation**:
```typescript
// Current code (Lines 380-395):
<div className="feed-post-author">
  <Avatar
    src={post.author.avatarUrl}
    name={getAuthorName()}
    email={post.author.email}
    size="md"
  />
  <div className="feed-post-author-info">
    <div className="feed-post-author-name">{getAuthorName()}</div>
    // ... meta info
  </div>
</div>
```

**What's Missing**:
- No onClick handler on avatar
- No onClick handler on author name
- No cursor pointer styling
- No navigation to `/profile/${post.authorId}`

---

## Data Flow Analysis

### Backend Data Structure

**FeedPost Entity** (`backend/src/modules/feed/entities/feed-post.entity.ts`):
```typescript
@Entity('feed_posts')
export class FeedPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;  // ✅ Author relation is loaded
  
  // ... other fields
}
```

**Feed Service** (`backend/src/modules/feed/feed.service.ts`):
```typescript
// Lines 80-85
const queryBuilder = this.feedPostRepo
  .createQueryBuilder('post')
  .leftJoinAndSelect('post.author', 'author')  // ✅ Author is joined
  .orderBy('post.createdAt', 'DESC')
```

**Data Available in Frontend**:
- ✅ `post.authorId` - User ID
- ✅ `post.author` - Full author object with email, avatarUrl
- ✅ `post.author.id` - Author's user ID
- ✅ `post.author.email` - Author's email

### Frontend Data Flow

**FeedPost Component** receives:
```typescript
interface FeedPostProps {
  post: FeedPostType;  // Contains author and authorId
  onDelete?: () => void;
  onLikeChange?: () => void;
}
```

**Available Data**:
- ✅ `post.authorId` - Used for messages and collaboration
- ✅ `post.author.email` - Used to generate display name
- ✅ `post.author.avatarUrl` - Used for avatar display

**ProfileView Route** (`src/renderer/AppComponent.tsx`):
```typescript
<Route
  path="/profile/:id"
  element={
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          <ProfileView />
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

---

## Implementation Plan

### Feature 3: View Profile from Post

#### Step 1: Add Click Handler Function

Add this function to `FeedPost.tsx`:

```typescript
const handleViewProfile = () => {
  if (!post.authorId) {
    showToast('Unable to view profile', 'error');
    return;
  }
  
  // Don't navigate if it's own post - could redirect to /profile instead
  if (isOwnPost) {
    navigate('/profile');
    return;
  }
  
  navigate(`/profile/${post.authorId}`);
};
```

#### Step 2: Make Avatar Clickable

Update Avatar component (Lines 380-386):

```typescript
<Avatar
  src={post.author.avatarUrl}
  name={getAuthorName()}
  email={post.author.email}
  size="md"
  onClick={handleViewProfile}
  style={{ cursor: 'pointer' }}
/>
```

#### Step 3: Make Author Name Clickable

Update author name div (Lines 388-390):

```typescript
<div 
  className="feed-post-author-name"
  onClick={handleViewProfile}
  style={{ cursor: 'pointer' }}
>
  {getAuthorName()}
</div>
```

#### Step 4: Add CSS Hover Effects

Add to `FeedPost.css`:

```css
.feed-post-author-name {
  cursor: pointer;
  transition: color 0.2s ease;
}

.feed-post-author-name:hover {
  color: #1877F2;
  text-decoration: underline;
}

.feed-post-author .avatar {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.feed-post-author .avatar:hover {
  opacity: 0.8;
}
```

#### Step 5: Add Analytics Tracking

Update the click handler to track profile views:

```typescript
const handleViewProfile = () => {
  if (!post.authorId) {
    showToast('Unable to view profile', 'error');
    return;
  }
  
  // Track that user viewed profile from feed post
  analyticsService.recordProfileView(post.authorId, 'feed_post');
  
  if (isOwnPost) {
    navigate('/profile');
    return;
  }
  
  navigate(`/profile/${post.authorId}`);
};
```

---

## Testing Plan

### Test Case 1: View Profile from Post
1. ✅ Click on author avatar → Should navigate to profile
2. ✅ Click on author name → Should navigate to profile
3. ✅ Hover over avatar → Should show pointer cursor
4. ✅ Hover over name → Should show pointer cursor and underline
5. ✅ Click on own post author → Should navigate to /profile (own profile)
6. ✅ Profile view should load with correct user data

### Test Case 2: Direct Message from Post (Already Implemented)
1. ✅ Click message button → Should navigate to messages
2. ✅ Recipient should be pre-selected
3. ✅ Post context should be passed
4. ✅ Button disabled for own posts
5. ✅ Button disabled when not logged in

### Test Case 3: Request Collaboration from Post (Already Implemented)
1. ✅ Click collaborate button → Should open modal
2. ✅ Modal should have recipient info
3. ✅ Submit should send collaboration request
4. ✅ Button disabled for own posts
5. ✅ Button disabled when request pending
6. ✅ Button disabled when not logged in

---

## Summary

### ✅ Already Implemented (2/3)
1. **Direct Message from Post** - Fully functional with context passing
2. **Request Collaboration from Post** - Fully functional with modal

### ❌ Missing Implementation (1/3)
1. **View Profile from Post** - Author name/avatar not clickable

### Required Changes
- Add `handleViewProfile` function
- Make Avatar clickable
- Make author name clickable
- Add hover CSS effects
- Add analytics tracking

### Estimated Implementation Time
- **15-20 minutes** for complete implementation
- **5 minutes** for testing

### Files to Modify
1. `src/renderer/components/FeedPost/FeedPost.tsx` - Add click handlers
2. `src/renderer/components/FeedPost/FeedPost.css` - Add hover styles

---

## Additional Recommendations

### 1. Consistent Profile Navigation
Ensure all components that display user info have clickable profiles:
- MatchCard
- ConversationList
- CommentSection
- WhoReactedModal
- NotificationDropdown

### 2. Profile Preview on Hover
Consider adding a profile preview card on hover (like LinkedIn):
- Show mini profile card
- Display key stats
- Quick action buttons

### 3. Context Tracking
Track where users view profiles from:
- Feed posts
- Match cards
- Messages
- Notifications
- Search results

This helps understand user behavior and improve UX.

---

## Conclusion

**Current Status**: 2 out of 3 features are fully implemented and working.

**Missing Feature**: View profile from post (author name/avatar not clickable)

**Next Steps**: Implement the profile navigation feature following the plan above.

**Priority**: HIGH - This is a fundamental social network feature that users expect.
