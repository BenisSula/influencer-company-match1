# Feed Post Own Post Message Button Fix

## Issue Description

User reports: "I cannot create a post and then visit the post again and try to send a message to myself"

**Expected Behavior:** When viewing your own post, the message button should be disabled with a tooltip saying "You can't message yourself"

**Current Behavior:** The message button may not be properly disabled on own posts

## Investigation

### Current Implementation

**File:** `src/renderer/components/FeedPost/FeedPost.tsx`

```typescript
const isOwnPost = user?.id === post.authorId;

// Message button configuration
{
  id: 'message',
  icon: <HiMail />,
  label: 'Message',
  onClick: () => {
    if (isOwnPost) return; // Don't message yourself
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
  disabled: isOwnPost,
  disabledTooltip: "You can't message yourself",
}
```

### Data Structure

**Backend Entity:** `backend/src/modules/feed/entities/feed-post.entity.ts`
```typescript
@Column({ name: 'author_id' })
authorId: string;

@ManyToOne(() => User, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'author_id' })
author: User;
```

**Frontend Type:** `src/renderer/services/feed.service.ts`
```typescript
export interface FeedPost {
  id: string;
  authorId: string;  // ← This should match user.id
  author: {
    id: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  // ...
}
```

## Root Cause Analysis

The issue could be one of several problems:

1. **User ID Mismatch:** `user.id` might not match `post.authorId` due to type differences (string vs UUID)
2. **Null/Undefined User:** `user` might be null when the component renders
3. **Author Data Not Loaded:** The post might not have `authorId` populated correctly
4. **Timing Issue:** The user data might not be loaded when `isOwnPost` is calculated

## Solution

### Fix 1: Add Defensive Checks and Logging

Update the FeedPost component to add better debugging and fallback logic:

```typescript
// Enhanced isOwnPost check with logging
const isOwnPost = React.useMemo(() => {
  if (!user || !post) {
    console.log('[FeedPost] Missing user or post data', { user: !!user, post: !!post });
    return false;
  }
  
  const isOwn = user.id === post.authorId || user.id === post.author?.id;
  
  console.log('[FeedPost] Ownership check:', {
    userId: user.id,
    postAuthorId: post.authorId,
    postAuthorObjId: post.author?.id,
    isOwn,
    postId: post.id
  });
  
  return isOwn;
}, [user?.id, post?.authorId, post?.author?.id, post?.id]);
```

### Fix 2: Ensure Consistent ID Comparison

Check both `post.authorId` and `post.author.id` for maximum compatibility:

```typescript
const isOwnPost = user?.id === post.authorId || user?.id === post.author?.id;
```

### Fix 3: Add Visual Indicator for Own Posts

Add a visual badge to make it obvious when viewing your own post:

```typescript
{isOwnPost && (
  <span className="own-post-badge">Your Post</span>
)}
```

### Fix 4: Improve Error Handling in Message Button

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
  disabledTooltip: isOwnPost ? "You can't message yourself" : !user ? "Please log in" : undefined,
}
```

## Implementation Plan

### Step 1: Add Comprehensive Logging
Add console logs to understand what's happening

### Step 2: Check Both ID Fields
Use both `post.authorId` and `post.author.id` for comparison

### Step 3: Add User Null Check
Ensure user is loaded before enabling message button

### Step 4: Add Toast Feedback
Show user-friendly messages when button is clicked but disabled

### Step 5: Test Scenarios
- Create a post while logged in
- Refresh the page
- View your own post
- Try to click message button
- Verify it's disabled with tooltip

## Testing Checklist

- [ ] Create a new post
- [ ] Verify message button is disabled on your own post
- [ ] Hover over disabled button - tooltip shows "You can't message yourself"
- [ ] Refresh page and view same post
- [ ] Message button still disabled
- [ ] View another user's post
- [ ] Message button is enabled
- [ ] Click message button on other user's post
- [ ] Successfully navigates to messages
- [ ] Console logs show correct user IDs

## Files to Modify

1. `src/renderer/components/FeedPost/FeedPost.tsx` - Add enhanced checks
2. `src/renderer/components/FeedPost/FeedPost.css` - Add own-post-badge styling (optional)

## Expected Outcome

After implementation:
- ✅ Message button is always disabled on own posts
- ✅ Clear tooltip explains why button is disabled
- ✅ No errors in console
- ✅ Works after page refresh
- ✅ Works for newly created posts
- ✅ Works for posts loaded from feed
