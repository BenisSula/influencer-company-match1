# Messaging & Notification System Investigation

## Investigation Date: February 13, 2026

---

## Current Status Analysis

### Messaging System Components

#### Frontend Components:
1. **Messages.tsx** - Main messaging page
2. **ConversationList.tsx** - List of conversations
3. **MessageThread.tsx** - Message display and input
4. **messagingService.ts** - WebSocket and HTTP service

#### Backend Components:
1. **messaging.gateway.ts** - WebSocket gateway
2. **messaging.controller.ts** - REST API endpoints
3. **messaging.service.ts** - Business logic
4. **messaging.module.ts** - Module configuration

#### Notification Components:
1. **NotificationContext.tsx** - Notification state management
2. **NotificationDropdown.tsx** - Bell icon dropdown
3. **MessageToastNotification.tsx** - Message toast near Messages icon

---

## Messaging Flow Analysis

### 1. Connection Flow
```
User clicks "Message" button
  └─> navigate('/messages', { state: { recipientId } })
      └─> Messages.tsx useEffect detects recipientId
          └─> createNewConversation(recipientId)
              └─> messagingService.sendMessageHTTP(recipientId, "Hi!")
                  └─> POST /api/messaging/messages
                      └─> Backend creates conversation + message
                          └─> WebSocket broadcasts to recipient
                              └─> Frontend updates UI
```

### 2. Message Sending Flow
```
User types message and hits send
  └─> handleSendMessage(content)
      └─> messagingService.sendMessageHTTP(recipientId, content)
          └─> POST /api/messaging/messages
              └─> Backend creates message
                  └─> WebSocket broadcasts
                      └─> Frontend adds to messages array
```

### 3. Notification Flow
```
New message arrives via WebSocket
  └─> messagingService.onNewMessage(callback)
      └─> NotificationContext.handleNewMessage()
          ├─> Increment unreadCount
          ├─> Show message toast
          └─> Update conversation list
```

---

## Potential Issues Identified

### Issue 1: WebSocket Connection
**Symptom:** Messages not sending/receiving in real-time

**Possible Causes:**
- WebSocket not connecting properly
- Token authentication failing
- CORS issues
- Port mismatch

**Check:**
```typescript
// Frontend: messaging.service.ts
this.socket = io(`${API_URL}/messaging`, {
  auth: { token },
  transports: ['websocket', 'polling'],
});

// Backend: messaging.gateway.ts
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/messaging',
})
```

**Status:** ✅ Configuration looks correct

---

### Issue 2: API Endpoint Mismatch
**Symptom:** HTTP requests failing

**Problem Found:**
Frontend uses `/api/messaging/*` but backend might be at `/messaging/*`

**Frontend:**
```typescript
const response = await fetch(`${API_URL}/api/messaging/conversations`, {
  headers: { 'Authorization': `Bearer ${this.token}` },
});
```

**Backend:**
```typescript
@Controller('messaging')  // This creates /messaging/* not /api/messaging/*
```

**Fix Needed:** ✅ IDENTIFIED - Path mismatch

---

### Issue 3: Token Management
**Symptom:** Authentication errors

**Check:**
```typescript
// Frontend stores token
localStorage.setItem('auth_token', token);

// Messaging service retrieves it
const token = localStorage.getItem('auth_token');
messagingService.connect(token);

// Backend verifies it
const payload = this.jwtService.verify(token);
```

**Status:** ✅ Token flow looks correct

---

### Issue 4: Unread Count Updates
**Symptom:** Badge not updating

**Current Implementation:**
```typescript
// NotificationContext updates count
const handleNewMessage = (message: Message) => {
  setUnreadCount(prev => prev + 1);  // Optimistic update
  setTimeout(() => updateUnreadCount(), 1000);  // Backend sync
};

// Backend endpoint
@Get('unread-count')
async getUnreadCount(@Request() req: any) {
  const count = await this.messagingService.getTotalUnreadCount(req.user.sub);
  return { count };
}
```

**Status:** ✅ Implementation looks correct

---

## Critical Fix Required

### API Path Mismatch

The frontend is calling `/api/messaging/*` but the backend controller is at `/messaging/*`.

**Option 1: Fix Frontend (Recommended)**
Change frontend to use `/messaging/*` instead of `/api/messaging/*`

**Option 2: Fix Backend**
Add `/api` prefix to backend routes

**Recommendation:** Fix frontend to match backend convention

---

## Implementation Plan

### Step 1: Fix API Paths in messaging.service.ts
```typescript
// Change from:
const response = await fetch(`${API_URL}/api/messaging/conversations`

// To:
const response = await fetch(`${API_URL}/messaging/conversations`
```

### Step 2: Verify WebSocket Connection
- Check browser console for connection errors
- Verify token is being passed correctly
- Test WebSocket handshake

### Step 3: Test Message Flow
1. Send message from User A to User B
2. Verify WebSocket receives message
3. Verify HTTP fallback works
4. Check unread count updates

### Step 4: Test Notification System
1. Verify toast appears for new messages
2. Check badge count updates
3. Test clearing notifications
4. Verify bell dropdown works

---

## Files to Modify

1. **src/renderer/services/messaging.service.ts**
   - Fix API paths from `/api/messaging/*` to `/messaging/*`

2. **Verify backend is running:**
   - Check `http://localhost:3000/messaging/conversations` endpoint
   - Verify WebSocket at `ws://localhost:3000/messaging`

---

## Next Steps

1. Fix API path mismatch
2. Test messaging flow end-to-end
3. Verify notifications work
4. Check WebSocket connection
5. Test unread count updates
