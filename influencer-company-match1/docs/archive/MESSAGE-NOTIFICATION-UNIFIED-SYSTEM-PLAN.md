# Message Notification Unified System - Implementation Plan

## Investigation Summary

### Current Architecture Analysis

**1. Notification System Structure:**
- **NotificationContext**: Manages two separate notification types:
  - General notifications (likes, comments, follows) → Bell icon dropdown
  - Message notifications → Unread count badge on Messages icon
- **UnreadBadge**: Displays unread message count on Messages icon in header
- **NotificationDropdown**: Shows general notifications from bell icon
- **MessageNotification**: Toast-style notification component (currently unused)

**2. Current Message Flow:**
```
New Message Received (WebSocket)
    ↓
NotificationContext.handleNewMessage()
    ↓
updateUnreadCount() → Fetches total unread from backend
    ↓
UnreadBadge displays count on Messages icon
```

**3. Current Issues Identified:**

❌ **Issue 1: No Visual Notification for New Messages**
- When a new message arrives, only the badge count updates
- No toast/popup notification appears at the message icon location
- Users may miss new messages if not looking at the badge

❌ **Issue 2: Badge Doesn't Clear Immediately**
- When user opens Messages page, badge clears only after API call
- No immediate visual feedback when viewing messages
- Delay between viewing and badge clearing

❌ **Issue 3: Mixed Notification Types**
- Bell icon notifications include message notifications (see NotificationDropdown code)
- Message notifications should ONLY appear at Messages icon, not bell icon
- Current system has confusion between notification types

❌ **Issue 4: No Auto-Clear on Navigation**
- Badge doesn't clear when navigating to Messages page by other means
- Only clears when conversation is explicitly marked as read
- Should clear immediately when Messages page is viewed

### Backend Support Analysis

**Available Backend Endpoints:**
- ✅ `GET /api/messaging/unread-count` - Returns total unread count
- ✅ `PATCH /api/messaging/conversations/:id/read` - Marks conversation as read
- ✅ WebSocket event `new_message` - Emitted when new message arrives
- ✅ `getTotalUnreadCount(userId)` - Service method for unread count

**Backend Capabilities:**
- ✅ Tracks unread count per conversation (unreadCount1, unreadCount2)
- ✅ Updates unread count when message is sent
- ✅ Clears unread count when conversation is marked as read
- ✅ WebSocket emits new_message event to recipient

---

## Implementation Plan

### Phase 1: Create Message-Specific Notification System

**Goal:** Display toast notifications at the Messages icon location when new messages arrive

**1.1 Create MessageToastNotification Component**

Location: `src/renderer/components/MessageToastNotification/MessageToastNotification.tsx`

```typescript
interface MessageToastProps {
  message: {
    id: string;
    sender: {
      name: string;
      avatar?: string;
    };
    content: string;
    conversationId: string;
    timestamp: Date;
  };
  onClose: () => void;
  onClick: () => void;
}
```

Features:
- Appears near Messages icon in header (absolute positioning)
- Auto-dismisses after 5 seconds
- Click to navigate to conversation
- Slide-in animation from top
- Shows sender avatar, name, and message preview
- Multiple notifications stack vertically

**1.2 Update NotificationContext**

Add message toast management:
```typescript
interface NotificationContextType {
  // Existing...
  notifications: NotificationData[];
  unreadCount: number;
  
  // NEW: Message toast notifications
  messageToasts: MessageToastData[];
  showMessageToast: (data: MessageToastData) => void;
  removeMessageToast: (id: string) => void;
}
```

Update WebSocket handler:
```typescript
const handleNewMessage = (message: Message) => {
  // Update unread count
  updateUnreadCount();
  
  // Show toast notification at Messages icon
  showMessageToast({
    id: message.id,
    sender: {
      name: message.sender.profile?.fullName || message.sender.email,
      avatar: message.sender.profile?.avatarUrl
    },
    content: message.content,
    conversationId: message.conversationId,
    timestamp: new Date(message.createdAt)
  });
};
```

**1.3 Add Toast Container to AppLayout**

Position near Messages icon:
```tsx
<div className="header-center">
  <NavLink to="/messages">
    <HiChatAlt2 size={24} />
    <UnreadBadge />
  </NavLink>
  
  {/* NEW: Message toast notifications */}
  <MessageToastContainer
    toasts={messageToasts}
    onToastClick={handleToastClick}
    onToastClose={removeMessageToast}
  />
</div>
```

---

### Phase 2: Implement Auto-Clear on View

**Goal:** Automatically clear unread badge when Messages page is viewed

**2.1 Add Page Visibility Tracking**

Create hook: `src/renderer/hooks/usePageVisibility.ts`
```typescript
export const usePageVisibility = (callback: () => void) => {
  useEffect(() => {
    callback();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        callback();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [callback]);
};
```

**2.2 Update Messages Page**

Add auto-clear on mount and visibility:
```typescript
export const Messages: React.FC = () => {
  const { updateUnreadCount } = useNotifications();
  
  // Clear all unread when page is viewed
  useEffect(() => {
    if (user) {
      // Mark all conversations as read
      clearAllUnread();
      // Update badge immediately
      updateUnreadCount();
    }
  }, [user]);
  
  // Re-clear when page becomes visible
  usePageVisibility(() => {
    if (user) {
      clearAllUnread();
      updateUnreadCount();
    }
  });
  
  const clearAllUnread = async () => {
    try {
      // Mark all conversations as read
      const convos = await messagingService.getConversations();
      await Promise.all(
        convos.map(c => messagingService.markConversationAsRead(c.id))
      );
    } catch (error) {
      console.error('Failed to clear unread:', error);
    }
  };
};
```

**2.3 Add Optimistic Badge Update**

Update NotificationContext:
```typescript
const clearMessageNotifications = () => {
  setUnreadCount(0);
  setMessageToasts([]);
};

// Expose to consumers
return {
  // ...existing
  clearMessageNotifications,
};
```

Call from Messages page:
```typescript
useEffect(() => {
  // Immediately clear badge (optimistic)
  clearMessageNotifications();
  
  // Then sync with backend
  clearAllUnread().then(() => updateUnreadCount());
}, []);
```

---

### Phase 3: Separate Message from General Notifications

**Goal:** Ensure message notifications ONLY appear at Messages icon, never in bell dropdown

**3.1 Update NotificationContext**

Remove message handling from general notifications:
```typescript
const showNotification = (data: Omit<NotificationData, 'id' | 'timestamp'>) => {
  // ONLY for non-message notifications
  if (data.type === 'message') {
    console.warn('Message notifications should use showMessageToast instead');
    return;
  }
  
  const notification: NotificationData = {
    ...data,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  
  setNotifications(prev => [...prev, notification]);
};
```

**3.2 Update NotificationDropdown**

Filter out any message notifications:
```typescript
export const NotificationDropdown: React.FC<Props> = ({ notifications, ... }) => {
  // Filter to only show non-message notifications
  const generalNotifications = notifications.filter(n => n.type !== 'message');
  
  return (
    <div className="notification-dropdown">
      {/* ... render generalNotifications only ... */}
    </div>
  );
};
```

**3.3 Update AppLayout**

Ensure bell icon only shows general notification count:
```tsx
<button className="header-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
  <HiBell size={20} />
  {/* Only show count for non-message notifications */}
  {notifications.filter(n => n.type !== 'message').length > 0 && (
    <span className="notification-badge">
      {notifications.filter(n => n.type !== 'message').length}
    </span>
  )}
</button>
```

---

### Phase 4: Enhanced User Experience

**Goal:** Improve notification UX with better feedback and interactions

**4.1 Add Sound Notification (Optional)**

```typescript
const playNotificationSound = () => {
  const audio = new Audio('/notification-sound.mp3');
  audio.volume = 0.3;
  audio.play().catch(e => console.log('Sound play failed:', e));
};

// In handleNewMessage
showMessageToast(messageData);
playNotificationSound();
```

**4.2 Add Desktop Notification (Optional)**

```typescript
const showDesktopNotification = (message: MessageToastData) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`New message from ${message.sender.name}`, {
      body: message.content.substring(0, 100),
      icon: message.sender.avatar || '/default-avatar.png',
      tag: message.conversationId, // Prevents duplicates
    });
  }
};
```

**4.3 Add Badge Animation**

When new message arrives, animate the badge:
```css
@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.unread-badge.new-message {
  animation: badge-pulse 0.5s ease-in-out 2;
}
```

**4.4 Add Toast Grouping**

Group multiple messages from same sender:
```typescript
// If multiple messages from same sender, show count
"John Doe sent 3 messages"
```

---

## File Structure

```
src/renderer/
├── components/
│   ├── MessageToastNotification/
│   │   ├── MessageToastNotification.tsx      [NEW]
│   │   ├── MessageToastNotification.css      [NEW]
│   │   └── MessageToastContainer.tsx         [NEW]
│   ├── UnreadBadge/
│   │   ├── UnreadBadge.tsx                   [UPDATE]
│   │   └── UnreadBadge.css                   [UPDATE]
│   └── NotificationDropdown/
│       └── NotificationDropdown.tsx          [UPDATE]
├── contexts/
│   └── NotificationContext.tsx               [UPDATE]
├── hooks/
│   └── usePageVisibility.ts                  [NEW]
├── layouts/
│   └── AppLayout/
│       ├── AppLayout.tsx                     [UPDATE]
│       └── AppLayout.css                     [UPDATE]
├── pages/
│   └── Messages.tsx                          [UPDATE]
└── types/
    └── notification.types.ts                 [UPDATE]
```

---

## Implementation Steps

### Step 1: Create Message Toast Component
- [ ] Create MessageToastNotification.tsx
- [ ] Create MessageToastNotification.css
- [ ] Create MessageToastContainer.tsx
- [ ] Add positioning styles for header location

### Step 2: Update NotificationContext
- [ ] Add messageToasts state
- [ ] Add showMessageToast function
- [ ] Add removeMessageToast function
- [ ] Add clearMessageNotifications function
- [ ] Update handleNewMessage to show toast
- [ ] Update type definitions

### Step 3: Integrate Toast in AppLayout
- [ ] Import MessageToastContainer
- [ ] Position near Messages icon
- [ ] Add click handlers
- [ ] Test positioning on mobile/desktop

### Step 4: Implement Auto-Clear
- [ ] Create usePageVisibility hook
- [ ] Update Messages page with auto-clear
- [ ] Add optimistic badge clearing
- [ ] Test navigation scenarios

### Step 5: Separate Notification Types
- [ ] Update showNotification to reject messages
- [ ] Filter messages from NotificationDropdown
- [ ] Update bell badge count logic
- [ ] Remove message handling from bell icon

### Step 6: Polish & Test
- [ ] Add animations
- [ ] Test WebSocket events
- [ ] Test badge clearing
- [ ] Test toast stacking
- [ ] Test mobile responsiveness
- [ ] Add sound (optional)
- [ ] Add desktop notifications (optional)

---

## Testing Checklist

### Functional Tests
- [ ] New message shows toast at Messages icon location
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Click toast navigates to conversation
- [ ] Badge updates when new message arrives
- [ ] Badge clears when Messages page is opened
- [ ] Badge clears when conversation is viewed
- [ ] Multiple toasts stack properly
- [ ] No message notifications in bell dropdown
- [ ] Bell icon only shows general notifications

### Edge Cases
- [ ] Multiple messages from same sender
- [ ] Messages while on Messages page
- [ ] Messages while conversation is open
- [ ] Page refresh with unread messages
- [ ] Navigation to Messages via different routes
- [ ] WebSocket disconnect/reconnect
- [ ] User logs out with unread messages

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Responsive
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Success Criteria

✅ **Message notifications appear ONLY at Messages icon location**
✅ **Toast notifications show sender, message preview, and timestamp**
✅ **Badge clears immediately when Messages page is viewed**
✅ **Badge clears when navigating to Messages by any method**
✅ **No message notifications appear in bell dropdown**
✅ **Multiple notifications stack without overlapping**
✅ **Smooth animations and transitions**
✅ **Works on all screen sizes**
✅ **No performance issues with multiple notifications**

---

## Timeline Estimate

- **Phase 1**: 3-4 hours (Toast component + integration)
- **Phase 2**: 2-3 hours (Auto-clear functionality)
- **Phase 3**: 1-2 hours (Notification separation)
- **Phase 4**: 2-3 hours (Polish + optional features)
- **Testing**: 2-3 hours

**Total**: 10-15 hours

---

## Notes

1. **Positioning Strategy**: Toast notifications will use absolute positioning relative to the Messages icon in the header center section
2. **Z-Index Management**: Ensure toasts appear above other content but below modals
3. **Performance**: Limit toast stack to 3 notifications max, auto-dismiss oldest
4. **Accessibility**: Add ARIA labels and keyboard navigation support
5. **Mobile**: On mobile, toasts may need different positioning due to header layout
