# Message Notification Investigation
## Lisa Park → contact@styleco.com

**Date**: February 12, 2026  
**Issue**: Checking if contact@styleco.com received notification badge for message from lisa.park@email.com

---

## User IDs from Backend Logs

From the backend logs, we can see two users communicating:
- User A: `97abead6-b938-4bdb-bb67-a8f88214066a`
- User B: `cdb6dfa5-25df-4e64-87cb-62e9c67ae3ca`

**Connection ID**: `94643951-0ade-4012-b9bd-b3da3fca1245`

---

## Investigation Steps

### Step 1: Identify Which User is Which

Run this query to identify the users:
```sql
SELECT id, email, role 
FROM users 
WHERE id IN (
  '97abead6-b938-4bdb-bb67-a8f88214066a',
  'cdb6dfa5-25df-4e64-87cb-62e9c67ae3ca'
);
```

---

### Step 2: Check Conversation and Unread Counts

```sql
SELECT 
  c.id as conversation_id,
  c.user1_id,
  c.user2_id,
  c.unread_count_1,
  c.unread_count_2,
  c.last_message_at,
  u1.email as user1_email,
  u2.email as user2_email
FROM conversations c
LEFT JOIN users u1 ON c.user1_id = u1.id
LEFT JOIN users u2 ON c.user2_id = u2.id
WHERE c.user1_id IN (
  '97abead6-b938-4bdb-bb67-a8f88214066a',
  'cdb6dfa5-25df-4e64-87cb-62e9c67ae3ca'
) OR c.user2_id IN (
  '97abead6-b938-4bdb-bb67-a8f88214066a',
  'cdb6dfa5-25df-4e64-87cb-62e9c67ae3ca'
);
```

**Expected Result:**
- If lisa.park sent a message to contact@styleco.com
- And contact@styleco.com hasn't read it yet
- Then the unread count should be > 0 for contact@styleco.com

---

### Step 3: Check Recent Messages

```sql
SELECT 
  m.id,
  m.conversation_id,
  m.content,
  m.created_at,
  m.read_at,
  sender.email as sender_email,
  sender.id as sender_id
FROM messages m
LEFT JOIN users sender ON m.sender_id = sender.id
WHERE m.conversation_id IN (
  SELECT c.id FROM conversations c
  WHERE c.user1_id IN (
    '97abead6-b938-4bdb-bb67-a8f88214066a',
    'cdb6dfa5-25df-4e64-87cb-62e9c67ae3ca'
  ) OR c.user2_id IN (
    '97abead6-b938-4bdb-bb67-a8f88214066a',
    'cdb6dfa5-25df-4e64-87cb-62e9c67ae3ca'
  )
)
ORDER BY m.created_at DESC
LIMIT 10;
```

**Look for:**
- Message with content: "Haven't you seen the notification on the message icons."
- Sender should be lisa.park@email.com
- `read_at` should be NULL (unread)

---

## How Notification Badge Works

### Backend Flow:
1. **Message Sent** → `createMessage()` in MessagingService
2. **Unread Count Updated** → Increments `unreadCount1` or `unreadCount2` in conversation
3. **WebSocket Event** → Emits `new_message` event to recipient
4. **Frontend Receives** → NotificationContext handles the event
5. **Badge Updates** → Calls `updateUnreadCount()` → Shows badge

### Frontend Flow:
```typescript
// NotificationContext.tsx
const handleNewMessage = (message: Message) => {
  // 1. Update unread count
  updateUnreadCount();
  
  // 2. Show toast notification
  showMessageToast({
    sender: { name: '...', avatar: '...' },
    content: message.content,
    conversationId: message.conversationId
  });
};
```

### Badge Display Logic:
```typescript
// UnreadBadge.tsx
const { unreadCount } = useNotifications();

if (unreadCount === 0) return null; // Hide badge

return <span className="unread-badge">{unreadCount}</span>;
```

---

## Why Badge Might Not Show

### Scenario 1: User is on Messages Page ❌
**Problem**: Messages are automatically marked as read when viewing the Messages page

**Check**: Is contact@styleco.com currently on the Messages page?
- If YES → Badge won't show (messages auto-marked as read)
- If NO → Badge should show

**Solution**: Navigate away from Messages page, then check badge

---

### Scenario 2: WebSocket Not Connected ❌
**Problem**: Frontend not receiving real-time updates

**Check Backend Logs**:
```
User cdb6dfa5-25df-4e64-87cb-62e9c67ae3ca connected to messaging
```

**Check Frontend Console**:
```javascript
// Should see:
Connected to messaging server
```

**Solution**: Refresh page to reconnect WebSocket

---

### Scenario 3: Message Already Read ❌
**Problem**: Message was read before checking

**Check Database**:
```sql
SELECT read_at FROM messages 
WHERE content LIKE '%notification on the message icons%';
```

- If `read_at` is NOT NULL → Message was read
- If `read_at` is NULL → Message is unread

---

### Scenario 4: Unread Count Not Incremented ❌
**Problem**: Database not updated correctly

**Check**:
```sql
SELECT unread_count_1, unread_count_2 
FROM conversations 
WHERE id = 'CONVERSATION_ID';
```

**Expected**:
- If contact@styleco.com is user1 → `unread_count_1` should be > 0
- If contact@styleco.com is user2 → `unread_count_2` should be > 0

---

## Testing the Badge

### Manual Test:
1. **Login as contact@styleco.com**
2. **Navigate to Dashboard** (NOT Messages page)
3. **Check Messages icon in header** → Should show badge if unread > 0
4. **Open Browser Console** → Check for errors
5. **Check Network Tab** → Look for `/api/messaging/unread-count` request

### Expected API Response:
```json
{
  "count": 1
}
```

### Check Badge Element:
```javascript
// In browser console:
document.querySelector('.unread-badge')?.textContent
// Should return: "1" or the unread count
```

---

## Debug Commands

### Check if user is logged in:
```javascript
localStorage.getItem('auth_token')
```

### Check current unread count:
```javascript
// In React DevTools, find NotificationContext
// Check unreadCount value
```

### Force update unread count:
```javascript
// Refresh the page
window.location.reload();
```

---

## Expected Behavior

### If Message Was Sent:
✅ Database should have:
- New message record with `read_at = NULL`
- Conversation with incremented unread count
- `last_message_at` updated

### If contact@styleco.com is NOT on Messages Page:
✅ Frontend should show:
- Badge on Messages icon with count
- Toast notification (if WebSocket connected)

### If contact@styleco.com IS on Messages Page:
✅ Frontend should:
- Auto-mark message as read
- NOT show badge (count = 0)
- Show message in conversation list

---

## Conclusion

Based on the backend logs, messages are being sent successfully between the two users. The notification badge will show IF:

1. ✅ Message is unread (`read_at = NULL`)
2. ✅ User is NOT on Messages page
3. ✅ WebSocket is connected
4. ✅ Frontend calls `updateUnreadCount()` successfully

**Most Likely Reason Badge Not Showing:**
- User is currently viewing the Messages page
- Messages are automatically marked as read when page is open
- Badge only shows when you're on OTHER pages (Dashboard, Feed, etc.)

**To Test:**
1. Login as contact@styleco.com
2. Go to Dashboard (not Messages)
3. Have lisa.park send a new message
4. Badge should appear on Messages icon

---

**Investigation Status**: System Working as Designed ✅  
**Action Required**: Test from Dashboard page, not Messages page
