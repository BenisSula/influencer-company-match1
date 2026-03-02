# Messaging System - Quick Fix Guide

## What Was Fixed

### 1. ✅ WebSocket Connection Reliability
- Added automatic reconnection with exponential backoff
- Added connection status monitoring
- Added manual reconnect capability
- Better error handling and logging

### 2. ✅ Backend Unread Count
- Fixed unread count increment (was using raw SQL, now uses proper TypeORM)
- Ensures accurate unread counts in database

### 3. ✅ Profile Data Loading
- Improved query to properly load influencer/company profiles
- Added fallback names when profile data is missing
- Better error handling

### 4. ✅ Notification System
- Added check to prevent self-notifications
- Added connection monitoring (checks every 30 seconds)
- Auto-reconnect on connection loss
- Better message handling

## How to Test

### Quick Test (Manual)
1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `npm run dev`
3. Open two browser windows (or use incognito)
4. Login as different users in each window
5. Send messages between them
6. Verify:
   - Messages appear in real-time
   - Unread count updates
   - Notifications show
   - Profile names/avatars display

### Automated Test
```bash
# Install dependencies if needed
npm install axios socket.io-client

# Run test script
node test-messaging-system.js
```

## Common Issues & Solutions

### Issue: Messages not sending
**Symptoms**: Click send, nothing happens
**Solution**:
1. Check browser console for errors
2. Verify backend is running on port 3000
3. Check authentication token exists: `localStorage.getItem('auth_token')`
4. Try manual reconnect: Open console, run `messagingService.reconnect()`

### Issue: Messages not received in real-time
**Symptoms**: Need to refresh to see new messages
**Solution**:
1. Check WebSocket connection: Look for "Connected to messaging server" in console
2. Check if connection indicator shows "disconnected"
3. Try reconnecting: Click reconnect button or refresh page
4. Verify backend WebSocket is running: Check backend logs for "User X connected to messaging"

### Issue: Unread count wrong
**Symptoms**: Badge shows wrong number
**Solution**:
1. Click on the conversation to mark as read
2. Refresh the page
3. Check backend logs for errors in unread count calculation
4. Verify database: `SELECT * FROM conversations WHERE user1_id = 'YOUR_USER_ID' OR user2_id = 'YOUR_USER_ID'`

### Issue: Profile names not showing
**Symptoms**: Shows "Partner" or email instead of name
**Solution**:
1. Verify user has completed profile setup
2. Check database: `SELECT * FROM influencer_profiles` or `SELECT * FROM company_profiles`
3. Check backend logs for profile loading errors
4. Fallback names should still work (Influencer/Company)

### Issue: Connection keeps dropping
**Symptoms**: Frequent "Connection lost" messages
**Solution**:
1. Check network stability
2. Check backend server health
3. Increase reconnection attempts in `messaging.service.ts`
4. Check firewall/proxy settings

## Debugging Tools

### Browser Console Commands
```javascript
// Check connection status
messagingService.isConnected()

// Force reconnect
messagingService.reconnect()

// Check auth token
localStorage.getItem('auth_token')

// Enable verbose logging (add to NotificationContext.tsx)
localStorage.setItem('debug_messaging', 'true')
```

### Backend Logs to Watch
```bash
# In backend directory
npm run start:dev

# Look for these log messages:
# - "User X connected to messaging"
# - "User X disconnected from messaging"
# - "[MessagingService] Updating connection status"
# - "[MessagingService] Failed to load user profile"
```

### Database Queries
```sql
-- Check conversations
SELECT * FROM conversations 
WHERE user1_id = 'YOUR_USER_ID' OR user2_id = 'YOUR_USER_ID'
ORDER BY last_message_at DESC;

-- Check messages
SELECT m.*, u.email as sender_email 
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE conversation_id = 'CONVERSATION_ID'
ORDER BY created_at DESC
LIMIT 20;

-- Check unread counts
SELECT 
  c.id,
  c.unread_count_1,
  c.unread_count_2,
  u1.email as user1_email,
  u2.email as user2_email
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id;
```

## Performance Tips

### For Better Real-Time Performance
1. Keep WebSocket connection alive (don't disconnect unnecessarily)
2. Use optimistic updates (update UI immediately, sync with backend later)
3. Debounce unread count updates (don't call API on every message)
4. Limit conversation list to recent conversations

### For Better Reliability
1. Always handle connection errors gracefully
2. Show connection status to users
3. Queue messages when offline, send when reconnected
4. Implement retry logic for failed sends

## Next Steps

### Recommended Enhancements
1. Add typing indicators (already implemented, just needs testing)
2. Add message read receipts (show when message was read)
3. Add message delivery status (sent, delivered, read)
4. Add offline message queue
5. Add push notifications for mobile
6. Add message search functionality
7. Add file/image attachments
8. Add emoji reactions to messages

### Monitoring in Production
1. Track WebSocket connection success rate
2. Monitor message delivery latency
3. Track unread count accuracy
4. Monitor profile loading errors
5. Set up alerts for connection failures

## Files Modified

### Frontend
- `src/renderer/services/messaging.service.ts` - Added reconnection logic
- `src/renderer/contexts/NotificationContext.tsx` - Improved message handling

### Backend
- `backend/src/modules/messaging/messaging.service.ts` - Fixed unread count and profile loading

### Documentation
- `MESSAGING-NOTIFICATION-SYSTEM-FIX.md` - Detailed investigation and fixes
- `test-messaging-system.js` - Automated test script
- `MESSAGING-QUICK-FIX-GUIDE.md` - This file

## Support

If you encounter issues not covered here:
1. Check browser console for errors
2. Check backend logs for errors
3. Run the automated test script
4. Check the detailed investigation document
5. Review the code changes in the modified files

---

**Status**: ✅ Fixes Implemented
**Last Updated**: 2026-02-13
**Tested**: Pending user testing
