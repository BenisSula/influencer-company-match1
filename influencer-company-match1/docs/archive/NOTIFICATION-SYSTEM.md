# Notification System - Complete Documentation

## Overview

The notification system provides real-time notifications for users, with clear separation between message notifications and general notifications (likes, comments, follows, etc.).

## Architecture

### Two Types of Notifications

#### 1. Message Notifications 💬
- **Display:** Badge on Messages icon (center navigation)
- **Component:** `UnreadBadge`
- **Data Source:** `messagingService.getUnreadCount()`
- **Updates:** Real-time via WebSocket
- **Behavior:** Shows count, clicking navigates to Messages page

#### 2. General Notifications 🔔
- **Display:** Badge + dropdown on Bell icon (right header)
- **Component:** `NotificationDropdown`
- **Data Source:** `NotificationContext.notifications`
- **Updates:** Real-time via context
- **Behavior:** Shows list, clicking opens specific content

### Component Hierarchy

```
AppComponent
└── NotificationProvider
    ├── AppLayout
    │   ├── Header
    │   │   ├── Messages Icon + UnreadBadge
    │   │   └── Bell Icon + NotificationDropdown
    │   └── Content
    └── Other Routes
```

## Components

### 1. NotificationContext

**Location:** `src/renderer/contexts/NotificationContext.tsx`

**Purpose:** Manages notification state globally

**Provides:**
```typescript
{
  // General notifications
  notifications: NotificationData[];
  showNotification: (data) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Message notifications
  unreadCount: number;
  updateUnreadCount: () => void;
}
```

**Usage:**
```tsx
import { useNotifications } from './contexts/NotificationContext';

function MyComponent() {
  const { notifications, showNotification, unreadCount } = useNotifications();
  
  // Show a like notification
  showNotification({
    sender: { name: 'John Doe', avatar: '/avatar.jpg' },
    content: 'liked your post',
    type: 'like',
    postId: 'post-123'
  });
}
```

### 2. UnreadBadge

**Location:** `src/renderer/components/UnreadBadge/`

**Purpose:** Displays unread message count on Messages icon

**Features:**
- Gradient background (pink to orange)
- Pulse animation
- Auto-hides when count is 0
- Positioned at bottom-right of icon

**Usage:**
```tsx
<NavLink to="/messages">
  <HiChatAlt2 size={24} />
  <UnreadBadge />
</NavLink>
```

### 3. NotificationDropdown

**Location:** `src/renderer/components/NotificationDropdown/`

**Purpose:** Displays list of general notifications

**Features:**
- Slide-down animation
- Arrow pointer to bell icon
- Notification items with avatars
- "Clear all" button
- Empty state message

**Usage:**
```tsx
<NotificationDropdown
  notifications={notifications}
  onNotificationClick={handleClick}
  onClearAll={clearAllNotifications}
/>
```

## Type Definitions

**Location:** `src/renderer/types/notification.types.ts`

```typescript
interface NotificationData {
  id: string;
  sender: {
    name: string;
    avatar?: string;
  };
  content: string;
  conversationId?: string; // For messages
  postId?: string; // For posts
  timestamp: Date;
  type?: 'message' | 'like' | 'comment' | 'follow' | 'mention';
}
```

## Styling

### UnreadBadge
- Position: `bottom: 4px, right: 8px`
- Background: Gradient (pink to orange)
- Size: 20px × 20px
- Border: 2px solid white
- Animation: Pulse (2s infinite)

### NotificationDropdown
- Position: Absolute, below bell icon
- Width: 380px
- Max height: 500px
- Shadow: Enhanced depth
- Animation: Slide down (0.2s)

### Bell Icon Badge
- Position: `top: -4px, right: -4px`
- Background: Gradient (pink to orange)
- Size: 20px × 20px
- Border: 2px solid white
- Animation: Pulse (2s infinite)

## User Flows

### Receiving a Message

1. User A sends message to User B
2. WebSocket delivers message to User B's client
3. `NotificationContext` receives message event
4. `updateUnreadCount()` is called
5. `UnreadBadge` updates to show new count
6. User B sees badge on Messages icon
7. User B clicks Messages icon → Opens Messages page

### Receiving a Like (Future)

1. User A likes User B's post
2. Backend sends notification event
3. `NotificationContext.showNotification()` is called
4. Notification added to `notifications` array
5. Bell icon badge shows count
6. User B clicks bell icon → Dropdown opens
7. User B clicks notification → Opens post

## WebSocket Connection

### Connection Management

- **Initiated by:** NotificationContext on user login
- **Maintained by:** NotificationContext throughout session
- **Disconnected by:** AuthContext on user logout
- **Shared by:** Messages page and NotificationContext

### Event Listeners

```typescript
// NotificationContext
messagingService.onNewMessage(() => {
  updateUnreadCount();
});

// Messages Page
messagingService.onNewMessage((message) => {
  // Add to conversation
  // Mark as read if viewing
});
```

### Cleanup

```typescript
useEffect(() => {
  const handleNewMessage = () => { /* ... */ };
  messagingService.onNewMessage(handleNewMessage);
  
  return () => {
    messagingService.offNewMessage(handleNewMessage);
    // Don't disconnect - keep connection alive
  };
}, []);
```

## Future Enhancements

### 1. Like Notifications

```typescript
// In FeedPost component
const handleLike = async () => {
  await feedService.likePost(postId);
  
  // Notify post author
  if (post.authorId !== currentUserId) {
    notificationService.sendLikeNotification({
      recipientId: post.authorId,
      postId: post.id,
      likerId: currentUserId
    });
  }
};
```

### 2. Comment Notifications

```typescript
// In CommentSection component
const handleComment = async (content: string) => {
  await feedService.createComment(postId, content);
  
  // Notify post author
  notificationService.sendCommentNotification({
    recipientId: post.authorId,
    postId: post.id,
    commenterId: currentUserId,
    commentPreview: content.substring(0, 50)
  });
};
```

### 3. Follow Notifications

```typescript
// In ProfileView component
const handleFollow = async () => {
  await connectionService.follow(profileId);
  
  // Notify user
  notificationService.sendFollowNotification({
    recipientId: profileId,
    followerId: currentUserId
  });
};
```

## Troubleshooting

### Badge Not Showing

**Problem:** Unread count badge doesn't appear

**Solutions:**
1. Check WebSocket connection: Open DevTools → Network → WS
2. Verify backend is running: `http://localhost:3000/api`
3. Check console for errors
4. Verify user is logged in
5. Check `unreadCount` in React DevTools

### Notifications Not Updating

**Problem:** Notifications don't update in real-time

**Solutions:**
1. Check WebSocket connection status
2. Verify `NotificationProvider` wraps app
3. Check for console errors
4. Verify event listeners are registered
5. Check if cleanup is removing listeners prematurely

### Duplicate Badges

**Problem:** Multiple badges showing in different places

**Solutions:**
1. Verify `UnreadBadge` only used in header
2. Check for duplicate `NotificationProvider`
3. Remove badges from sidebar
4. Check CSS for duplicate badge elements

## Testing

### Manual Testing

1. **Message Notification:**
   - Login as User A
   - Have User B send a message
   - Verify badge appears on Messages icon
   - Click Messages icon
   - Verify conversation opens

2. **Bell Notification (Future):**
   - Login as User A
   - Have User B like a post
   - Verify badge appears on Bell icon
   - Click Bell icon
   - Verify dropdown shows notification

3. **Multiple Notifications:**
   - Receive 2 messages and 3 likes
   - Verify Messages badge shows "2"
   - Verify Bell badge shows "3"

### Automated Testing (Future)

```typescript
describe('NotificationContext', () => {
  it('should update unread count when message received', () => {
    // Test implementation
  });
  
  it('should add notification to list', () => {
    // Test implementation
  });
  
  it('should remove notification when clicked', () => {
    // Test implementation
  });
});
```

## Performance

### Optimizations

1. **Memoization:** Components use React.memo where appropriate
2. **Debouncing:** Updates are debounced to prevent excessive re-renders
3. **Lazy Loading:** Dropdown only renders when open
4. **Event Cleanup:** Listeners properly removed on unmount

### Monitoring

- WebSocket connection status
- Notification count
- Re-render frequency
- Memory usage

## Accessibility

### ARIA Labels

- Bell icon: `aria-label="Notifications"`
- Messages icon: `aria-label="Messages"`
- Badge: `aria-label="X notifications"`
- Dropdown: `role="menu"`

### Keyboard Navigation

- Tab to bell icon
- Enter/Space to open dropdown
- Arrow keys to navigate notifications
- Escape to close dropdown

### Screen Readers

- Announce notification count
- Announce new notifications
- Describe notification content

## Browser Compatibility

- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support

## Summary

The notification system provides:
- ✅ Real-time message notifications via WebSocket
- ✅ Unread message count badge
- ✅ General notification dropdown (ready for likes, comments, etc.)
- ✅ Clean separation of notification types
- ✅ Consistent UX for all user types
- ✅ Accessible and performant
- ✅ Well-documented and maintainable
