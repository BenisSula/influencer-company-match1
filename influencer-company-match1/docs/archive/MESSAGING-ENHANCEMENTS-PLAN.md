# Messaging System Enhancements - Implementation Plan 📋

## Current System Analysis

### ✅ What's Already Working:

**Database Schema:**
- `conversations` table: Stores 1-on-1 conversations between users
- `messages` table: Stores individual messages
- Proper foreign keys to `users` table
- Unread counts tracked per user (`unread_count_1`, `unread_count_2`)
- Read receipts (`read_at` timestamp)
- Last message timestamp for sorting

**Backend Logic:**
- `getOrCreateConversation()`: Creates conversation with consistent user ordering
- `createMessage()`: Saves message, updates conversation, increments unread count
- `markConversationAsRead()`: Resets unread count, marks messages as read
- WebSocket gateway for real-time messaging
- JWT authentication for WebSocket connections

**Real-Time Features:**
- WebSocket events: `send_message`, `new_message`, `typing_start`, `typing_stop`
- User socket mapping for online status
- Message delivery to online users

### 🎯 Requested Enhancements:

## 1. Message Notifications

### Requirements:
- Show notification when new message arrives
- Display sender name and message preview
- Click notification to open conversation
- Show unread count badge in navigation
- Browser notifications (if permitted)
- Sound notification (optional)

### Implementation Plan:

#### A. Backend Changes (Minimal - Already Supported)
**Current:** Unread counts already tracked in database
**Action:** No changes needed - already working!

#### B. Frontend Notification System

**1. Create Notification Component**
```typescript
// src/renderer/components/MessageNotification/MessageNotification.tsx
- Toast-style notification
- Shows sender avatar, name, message preview
- Auto-dismiss after 5 seconds
- Click to navigate to conversation
```

**2. Update AppLayout Navigation**
```typescript
// Add unread count badge to Messages icon
- Fetch total unread count
- Display red badge with number
- Update in real-time via WebSocket
```

**3. Browser Notifications**
```typescript
// Request permission on first load
- Use Notification API
- Show when app is in background
- Include sender name and preview
```

**4. Sound Notification**
```typescript
// Play sound on new message
- Use Audio API
- Subtle notification sound
- User can toggle in settings
```

#### C. WebSocket Integration
```typescript
// Listen for new_message event
messagingService.onNewMessage((message) => {
  // If not on Messages page or different conversation
  if (!isCurrentConversation(message.conversationId)) {
    showNotification(message);
    playSound();
    updateUnreadCount();
  }
});
```

## 2. Hover-to-Show Collapse Button

### Requirements:
- Collapse button only visible on hover
- Smooth fade-in/fade-out animation
- When collapsed, show only avatars
- Maintain state across sessions

### Implementation Plan:

#### A. CSS Changes
```css
/* Hide button by default */
.sidebar-toggle {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Show on hover */
.conversations-panel:hover .sidebar-toggle {
  opacity: 1;
}

/* Always show when sidebar is collapsed (for expanding) */
.messages-container.sidebar-collapsed .sidebar-toggle {
  opacity: 1;
}
```

#### B. Collapsed State Improvements
```css
/* When collapsed, show only avatars */
.conversation-list.collapsed .conversation-item {
  padding: 12px;
  justify-content: center;
}

.conversation-list.collapsed .conversation-content {
  display: none;
}

.conversation-list.collapsed .conversation-avatar {
  margin-right: 0;
}

/* Add tooltip on hover to show name */
.conversation-list.collapsed .conversation-item {
  position: relative;
}

.conversation-list.collapsed .conversation-item:hover::after {
  content: attr(data-name);
  position: absolute;
  left: 100%;
  background: #262626;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  white-space: nowrap;
  margin-left: 8px;
  z-index: 100;
}
```

#### C. LocalStorage Persistence
```typescript
// Save collapsed state
const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  return localStorage.getItem('sidebar-collapsed') === 'true';
});

// Update on toggle
const toggleSidebar = () => {
  const newState = !sidebarCollapsed;
  setSidebarCollapsed(newState);
  localStorage.setItem('sidebar-collapsed', String(newState));
};
```

## 3. Enhanced Conversation Display

### When Collapsed:
- Show only circular avatars (40px)
- Stack vertically with 8px gap
- Unread badge on avatar (small red dot)
- Tooltip with name on hover
- Selected conversation highlighted

### When Expanded:
- Full conversation details
- Avatar + name + last message
- Timestamp
- Unread count badge

## Implementation Steps

### Step 1: Notification System (Priority: High)

**Files to Create:**
1. `src/renderer/components/MessageNotification/MessageNotification.tsx`
2. `src/renderer/components/MessageNotification/MessageNotification.css`
3. `src/renderer/hooks/useNotifications.ts`
4. `src/renderer/contexts/NotificationContext.tsx`

**Files to Modify:**
1. `src/renderer/layouts/AppLayout/AppLayout.tsx` - Add unread badge
2. `src/renderer/pages/Messages.tsx` - Integrate notifications
3. `src/renderer/services/messaging.service.ts` - Add unread count method

**Implementation:**
```typescript
// 1. Create NotificationContext
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const showNotification = (message) => {
    // Add to notifications array
    // Show browser notification
    // Play sound
  };
  
  return (
    <NotificationContext.Provider value={{ showNotification, unreadCount }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};

// 2. Update AppLayout
<NavLink to="/messages">
  <HiChatAlt2 size={24} />
  {unreadCount > 0 && (
    <span className="unread-badge">{unreadCount}</span>
  )}
</NavLink>

// 3. Listen for messages
useEffect(() => {
  messagingService.onNewMessage((message) => {
    if (!isCurrentConversation(message.conversationId)) {
      showNotification({
        sender: message.sender.profile?.fullName || message.sender.email,
        content: message.content,
        conversationId: message.conversationId,
      });
    }
  });
}, []);
```

### Step 2: Hover-to-Show Collapse Button (Priority: Medium)

**Files to Modify:**
1. `src/renderer/pages/Messages.css` - Add hover styles
2. `src/renderer/components/ConversationList/ConversationList.css` - Collapsed styles
3. `src/renderer/components/ConversationList/ConversationList.tsx` - Add tooltips

**Implementation:**
```css
/* Messages.css */
.sidebar-toggle {
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.conversations-panel:hover .sidebar-toggle,
.messages-container.sidebar-collapsed .sidebar-toggle {
  opacity: 1;
  pointer-events: auto;
}

/* ConversationList.css */
.conversation-list.collapsed .conversation-item {
  width: 60px;
  padding: 10px;
  justify-content: center;
}

.conversation-list.collapsed .conversation-item[data-name]:hover::after {
  content: attr(data-name);
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: #262626;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  white-space: nowrap;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
```

### Step 3: Unread Count Badge (Priority: High)

**Backend Endpoint:**
```typescript
// messaging.controller.ts
@Get('unread-count')
async getUnreadCount(@Request() req) {
  return this.messagingService.getTotalUnreadCount(req.user.userId);
}

// messaging.service.ts
async getTotalUnreadCount(userId: string): Promise<number> {
  const conversations = await this.conversationRepository
    .createQueryBuilder('conversation')
    .where('conversation.user1Id = :userId OR conversation.user2Id = :userId', { userId })
    .getMany();

  let total = 0;
  for (const conv of conversations) {
    if (conv.user1Id === userId) {
      total += conv.unreadCount1;
    } else {
      total += conv.unreadCount2;
    }
  }
  
  return total;
}
```

**Frontend Integration:**
```typescript
// AppLayout.tsx
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  loadUnreadCount();
  
  // Update on new message
  messagingService.onNewMessage(() => {
    loadUnreadCount();
  });
}, []);

const loadUnreadCount = async () => {
  const count = await messagingService.getUnreadCount();
  setUnreadCount(count);
};
```

## Testing Checklist

### Notifications:
- [ ] New message shows toast notification
- [ ] Notification includes sender name and preview
- [ ] Click notification opens conversation
- [ ] Unread badge shows in navigation
- [ ] Badge updates in real-time
- [ ] Browser notification works (if permitted)
- [ ] Sound plays on new message
- [ ] No notification for own messages
- [ ] No notification when conversation is open

### Collapse Button:
- [ ] Button hidden by default
- [ ] Button appears on hover
- [ ] Button always visible when collapsed
- [ ] Smooth fade-in/fade-out animation
- [ ] State persists across page reloads
- [ ] Collapsed view shows only avatars
- [ ] Tooltip shows name on hover
- [ ] Unread dot visible on avatar

### Responsive:
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] Touch-friendly on mobile

## File Structure

```
src/renderer/
├── components/
│   ├── MessageNotification/
│   │   ├── MessageNotification.tsx
│   │   └── MessageNotification.css
│   └── UnreadBadge/
│       ├── UnreadBadge.tsx
│       └── UnreadBadge.css
├── contexts/
│   └── NotificationContext.tsx
├── hooks/
│   ├── useNotifications.ts
│   └── useUnreadCount.ts
└── services/
    └── messaging.service.ts (update)

backend/src/modules/messaging/
├── messaging.controller.ts (add unread-count endpoint)
├── messaging.service.ts (add getTotalUnreadCount method)
└── messaging.gateway.ts (emit unread_count_updated event)
```

## Timeline Estimate

- **Step 1 (Notifications):** 4-6 hours
- **Step 2 (Hover Button):** 1-2 hours
- **Step 3 (Unread Badge):** 2-3 hours
- **Testing & Polish:** 2-3 hours

**Total:** 9-14 hours

## Success Criteria

✅ Users receive notifications for new messages
✅ Unread count badge visible in navigation
✅ Collapse button only shows on hover
✅ Collapsed sidebar shows only avatars with tooltips
✅ All features work across devices
✅ Smooth animations and transitions
✅ State persists across sessions
✅ Real-time updates via WebSocket

---

**Status:** 📋 PLAN READY FOR IMPLEMENTATION
**Priority:** High - Improves user engagement significantly
**Complexity:** Medium - Mostly frontend work with minor backend additions
