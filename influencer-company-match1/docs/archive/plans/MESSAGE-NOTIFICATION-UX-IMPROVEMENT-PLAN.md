# Message Notification UX Improvement Plan

## Current Behavior (Issues)

### Problem 1: Badge Disappears Too Early ❌
**Current**: Badge disappears when navigating to Messages page
**Issue**: User loses track of which conversations have unread messages

### Problem 2: No Visual Indicator in Conversation List ❌
**Current**: No way to see which conversations are unread once on Messages page
**Issue**: User must remember which conversation had the notification

### Problem 3: Unread Conversations Not Prioritized ❌
**Current**: Conversations sorted only by `lastMessageAt`
**Issue**: Unread conversations might be buried in the list

---

## Desired Behavior (Requirements)

### Requirement 1: Badge Persists Until Conversation Opened ✅
**New**: Badge should remain visible until user clicks on specific conversation
**Benefit**: User knows they have unread messages even on Messages page

### Requirement 2: Visual Indicator on Unread Conversations ✅
**New**: Unread conversations should have visual indicator (bold text, badge, etc.)
**Benefit**: User can easily identify which conversations need attention

### Requirement 3: Unread Conversations at Top ✅
**New**: Sort conversations with unread messages first
**Benefit**: User sees important conversations immediately

---

## Implementation Plan

### Step 1: Remove Auto-Clear on Page Visit ✅

**File**: `Messages.tsx`

**Current Code**:
```typescript
// Clear notifications when page is mounted or becomes visible
usePageVisibility(() => {
  if (user) {
    clearAllUnread(); // ❌ This clears ALL unread
  }
});
```

**New Code**:
```typescript
// Only clear toast notifications, keep badge and unread counts
usePageVisibility(() => {
  if (user) {
    clearMessageNotifications(); // ✅ Only clears toasts, not badge
  }
});
```

**Impact**: Badge will persist on Messages page

---

### Step 2: Clear Unread Only on Conversation Click ✅

**File**: `Messages.tsx`

**Current Code**:
```typescript
const handleSelectConversation = useCallback(async (conversation: Conversation) => {
  // ... existing code ...
  
  const [msgs] = await Promise.all([
    messagingService.getMessages(conversation.id),
    messagingService.markConversationAsRead(conversation.id)
  ]);
  
  // Update only this conversation in the list
  setConversations(prev => 
    (prev || []).map(c => 
      c.id === conversation.id 
        ? { ...c, unreadCount1: 0, unreadCount2: 0 }
        : c
    )
  );
  
  debouncedUpdateUnreadCount(); // ✅ Already updates badge
}, []);
```

**Status**: ✅ Already implemented correctly!

**Impact**: Badge updates when conversation is clicked

---

### Step 3: Add Visual Indicator to Unread Conversations ✅

**File**: `ConversationList.css`

**Add Styles**:
```css
/* Unread conversation styling */
.conversation-item.has-unread {
  background-color: #F0F8FF; /* Light blue background */
}

.conversation-item.has-unread .conversation-name {
  font-weight: 600; /* Bold name */
  color: #050505;
}

.conversation-item.has-unread .conversation-preview {
  font-weight: 500; /* Semi-bold preview */
  color: #262626;
}

/* Unread badge on conversation */
.conversation-unread-badge {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}
```

**File**: `ConversationList.tsx`

**Add Logic**:
```typescript
const hasUnread = unreadCount > 0;

return (
  <div
    className={`conversation-item ${
      isSelected ? 'selected' : ''
    } ${hasUnread ? 'has-unread' : ''}`}
    onClick={onClick}
  >
    {/* ... existing avatar ... */}
    
    <div className="conversation-content">
      {/* ... existing content ... */}
    </div>
    
    {/* Unread badge */}
    {hasUnread && (
      <div className="conversation-unread-badge">
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
    )}
  </div>
);
```

---

### Step 4: Sort Unread Conversations to Top ✅

**Option A: Frontend Sorting** (Recommended)

**File**: `Messages.tsx`

```typescript
const loadConversations = async () => {
  try {
    const convos = await messagingService.getConversations();
    
    // Sort: Unread first, then by lastMessageAt
    const sorted = convos.sort((a, b) => {
      const aUnread = a.user1Id === user?.id ? a.unreadCount1 : a.unreadCount2;
      const bUnread = b.user1Id === user?.id ? b.unreadCount1 : b.unreadCount2;
      
      // Unread conversations first
      if (aUnread > 0 && bUnread === 0) return -1;
      if (aUnread === 0 && bUnread > 0) return 1;
      
      // Then by last message time
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
    
    setConversations(sorted);
    setLoading(false);
  } catch (error) {
    console.error('[Messages] Failed to load conversations:', error);
    setLoading(false);
  }
};
```

**Option B: Backend Sorting** (More Efficient)

**File**: `messaging.service.ts` (Backend)

```typescript
async getUserConversations(userId: string): Promise<Conversation[]> {
  const conversations = await this.conversationRepository
    .createQueryBuilder('conversation')
    .leftJoinAndSelect('conversation.user1', 'user1')
    .leftJoinAndSelect('conversation.user2', 'user2')
    .leftJoinAndSelect('conversation.messages', 'lastMessage')
    .where('conversation.user1Id = :userId OR conversation.user2Id = :userId', { userId })
    // Sort by unread status first, then by time
    .addSelect(`
      CASE 
        WHEN conversation.user1Id = :userId THEN conversation.unread_count_1
        ELSE conversation.unread_count_2
      END
    `, 'user_unread_count')
    .orderBy('user_unread_count', 'DESC') // Unread first
    .addOrderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST')
    .addOrderBy('conversation.createdAt', 'DESC')
    .setParameter('userId', userId)
    .getMany();

  // ... rest of the code
}
```

---

## Visual Design

### Before (Current):
```
Messages Page
├── Conversation List
│   ├── John Doe (no indicator)
│   ├── Jane Smith (no indicator)
│   └── Bob Wilson (no indicator)
└── Badge: Hidden ❌
```

### After (Improved):
```
Messages Page
├── Conversation List
│   ├── Jane Smith [3] ← Unread badge, bold text, light blue bg
│   ├── Bob Wilson [1] ← Unread badge, bold text, light blue bg
│   └── John Doe (read)
└── Badge: Shows "4" ✅
```

---

## User Flow

### Scenario: User Receives New Message

1. **User on Dashboard**
   - Badge appears on Messages icon: "1"
   - Toast notification shows

2. **User Clicks Messages Icon**
   - Navigates to Messages page
   - Badge STILL shows "1" ✅
   - Conversation list shows:
     - Lisa Park [1] ← At top, highlighted, with badge

3. **User Clicks on Lisa Park Conversation**
   - Conversation opens
   - Messages load
   - Badge updates to "0" ✅
   - Lisa Park conversation no longer highlighted

4. **User Navigates Away**
   - Badge shows "0" (no unread)

---

## Benefits

### User Experience:
- ✅ Clear visual feedback of unread messages
- ✅ Easy to find conversations needing attention
- ✅ Badge persists until action taken
- ✅ No confusion about which conversation had notification

### Technical:
- ✅ Minimal code changes
- ✅ Maintains existing functionality
- ✅ Better UX without breaking changes

---

## Implementation Steps

1. ✅ Remove `clearAllUnread()` from `usePageVisibility`
2. ✅ Add unread styling to `ConversationList.css`
3. ✅ Add `has-unread` class logic to `ConversationList.tsx`
4. ✅ Add unread badge to conversation items
5. ✅ Implement frontend sorting in `loadConversations()`
6. ✅ Test with multiple conversations
7. ✅ Verify badge behavior

---

## Testing Checklist

- [ ] Badge persists when navigating to Messages page
- [ ] Badge updates when conversation is clicked
- [ ] Unread conversations show at top of list
- [ ] Unread conversations have visual indicator
- [ ] Badge shows correct count
- [ ] Clicking conversation marks it as read
- [ ] Multiple unread conversations work correctly
- [ ] Mobile responsive behavior maintained

---

**Status**: Ready for Implementation
**Priority**: High (UX Improvement)
**Estimated Time**: 30 minutes
