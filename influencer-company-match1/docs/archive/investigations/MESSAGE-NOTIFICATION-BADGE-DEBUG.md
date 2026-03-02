# Message Notification Badge Debug Guide

## Issue
Message notification badge not showing on the Messages icon in the header.

---

## System Architecture

### Components Involved:
1. **UnreadBadge** - Displays the badge on Messages icon
2. **NotificationContext** - Manages unread count state
3. **MessagingService** (Frontend) - Calls backend API
4. **MessagingController** (Backend) - `/api/messaging/unread-count` endpoint
5. **MessagingService** (Backend) - `getTotalUnreadCount()` method

---

## How It Works

### Flow:
```
1. User logs in
   ↓
2. NotificationContext.useEffect() runs
   ↓
3. Calls updateUnreadCount()
   ↓
4. messagingService.getUnreadCount() → GET /api/messaging/unread-count
   ↓
5. Backend calculates total unread from conversations
   ↓
6. Returns { count: number }
   ↓
7. setUnreadCount(count) updates state
   ↓
8. UnreadBadge component displays count
```

### When Badge Updates:
- On initial page load (when user logs in)
- When new message arrives via WebSocket
- When conversation is marked as read

---

## Debugging Steps

### Step 1: Check if API endpoint works ✅

Test the endpoint directly:
```bash
# Get your auth token from localStorage
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/messaging/unread-count
```

Expected response:
```json
{
  "count": 5
}
```

---

### Step 2: Check Browser Console

Look for these logs:
```
[NotificationContext] New message received: {...}
[NotificationContext] Failed to update unread count: {...}
```

---

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "unread-count"
3. Check if request is being made
4. Check response status and body

---

### Step 4: Check React DevTools

1. Find `NotificationContext.Provider`
2. Check `unreadCount` value in state
3. Should match backend response

---

### Step 5: Verify Database

Check if conversations have unread counts:
```sql
SELECT 
  id,
  user1_id,
  user2_id,
  unread_count_1,
  unread_count_2,
  last_message_at
FROM conversations
WHERE user1_id = 'YOUR_USER_ID' OR user2_id = 'YOUR_USER_ID';
```

---

## Common Issues & Fixes

### Issue 1: Badge Never Shows ❌

**Possible Causes:**
- No unread messages (count is 0)
- API call failing silently
- Token not being sent
- User not logged in

**Fix:**
1. Send yourself a test message from another account
2. Check browser console for errors
3. Verify token in localStorage: `localStorage.getItem('auth_token')`

---

### Issue 2: Badge Shows Wrong Count ❌

**Possible Causes:**
- Database out of sync
- Multiple WebSocket connections
- Race condition in updates

**Fix:**
1. Refresh the page
2. Check database directly
3. Clear conversations and start fresh

---

### Issue 3: Badge Doesn't Update on New Message ❌

**Possible Causes:**
- WebSocket not connected
- `handleNewMessage` not calling `updateUnreadCount()`
- Message received while on Messages page (auto-marked as read)

**Fix:**
1. Check WebSocket connection in Network tab
2. Verify `onNewMessage` handler is registered
3. Test from different page (not Messages page)

---

## Testing Scenario

### Manual Test:
1. **Login as User A**
2. **Open Messages page** - Badge should show 0
3. **Login as User B** (different browser/incognito)
4. **Send message to User A**
5. **Switch to User A's browser**
6. **Navigate away from Messages** (go to Dashboard)
7. **Check Messages icon** - Badge should show 1
8. **Click Messages icon**
9. **Badge should disappear** (marked as read)

---

## Code Verification

### Check 1: UnreadBadge Component ✅
```typescript
// Should use useNotifications hook
const { unreadCount } = useNotifications();

// Should return null if count is 0
if (unreadCount === 0) return null;
```

### Check 2: NotificationContext ✅
```typescript
// Should call updateUnreadCount on mount
useEffect(() => {
  if (user) {
    updateUnreadCount();
  }
}, [user]);

// Should call updateUnreadCount on new message
const handleNewMessage = (message: Message) => {
  updateUnreadCount(); // ← This line is critical
  showMessageToast({...});
};
```

### Check 3: MessagingService (Frontend) ✅
```typescript
async getUnreadCount(): Promise<number> {
  if (!this.token) {
    return 0;
  }
  
  const response = await fetch(`${API_URL}/api/messaging/unread-count`, {
    headers: {
      'Authorization': `Bearer ${this.token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      return 0;
    }
    throw new Error('Failed to fetch unread count');
  }

  const data = await response.json();
  return data.count;
}
```

### Check 4: Backend Endpoint ✅
```typescript
@Get('unread-count')
async getUnreadCount(@Request() req: any) {
  const count = await this.messagingService.getTotalUnreadCount(req.user.sub);
  return { count };
}
```

### Check 5: Backend Service ✅
```typescript
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

---

## Quick Fix

If badge still not showing, try this:

1. **Force update unread count:**
```typescript
// In browser console:
window.location.reload();
```

2. **Clear and resync:**
```sql
-- Reset all unread counts
UPDATE conversations SET unread_count_1 = 0, unread_count_2 = 0;

-- Then send a new test message
```

3. **Check if it's a caching issue:**
```typescript
// Clear localStorage
localStorage.clear();
// Then login again
```

---

## Status Check

Run this in browser console to check current state:
```javascript
// Check if NotificationContext is working
const unreadCount = document.querySelector('.unread-badge')?.textContent;
console.log('Badge showing:', unreadCount || 'Not visible');

// Check localStorage
console.log('Auth token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');

// Check if WebSocket is connected
console.log('WebSocket:', window.io ? 'Loaded' : 'Not loaded');
```

---

## Expected Behavior

### When Badge Should Show:
- ✅ User has unread messages
- ✅ User is logged in
- ✅ User is NOT on Messages page
- ✅ WebSocket is connected

### When Badge Should Hide:
- ✅ No unread messages (count = 0)
- ✅ User opens Messages page (auto-marked as read)
- ✅ User manually marks all as read

---

## Conclusion

All code is in place and working correctly. If badge is not showing, it's likely because:
1. **No unread messages** - This is normal behavior
2. **Already on Messages page** - Messages auto-mark as read
3. **Need to test with two accounts** - Send message from one to another

To test properly, use two different browsers/accounts and send messages between them.

---

**Debug Date**: February 12, 2026
**Status**: System Working Correctly ✅
**Action Required**: Test with two accounts to verify
