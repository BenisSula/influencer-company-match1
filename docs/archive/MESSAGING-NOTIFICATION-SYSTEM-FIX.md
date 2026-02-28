# Messaging & Notification System - Investigation & Fix

## Investigation Summary

I've thoroughly investigated the messaging and notification system. Here's what I found:

### Current System Architecture

**Backend (NestJS + WebSocket)**
- ✅ MessagingService: Handles conversations, messages, unread counts
- ✅ MessagingGateway: WebSocket server for real-time messaging
- ✅ MessagingController: REST API endpoints
- ✅ Database entities: Conversation, Message with proper relations

**Frontend (React + Socket.IO)**
- ✅ MessagingService: WebSocket client + HTTP API calls
- ✅ NotificationContext: Manages notifications and message toasts
- ✅ Messages page: Full messaging UI with conversations and threads

### Issues Identified

#### 1. **WebSocket Connection Issues**
- **Problem**: WebSocket may not be connecting properly or reconnecting after disconnection
- **Impact**: Real-time messages not received, notifications not working
- **Location**: `messaging.service.ts` connection logic

#### 2. **Unread Count Sync Issues**
- **Problem**: Unread count may not update correctly when:
  - New messages arrive
  - User reads messages
  - User switches conversations
- **Impact**: Badge shows incorrect count
- **Location**: `NotificationContext.tsx` and `Messages.tsx`

#### 3. **Message Notification Flow**
- **Problem**: Notifications may not show when:
  - User is on different page
  - WebSocket disconnects
  - Multiple messages arrive quickly
- **Impact**: Users miss messages
- **Location**: `NotificationContext.tsx` message handling

#### 4. **Profile Data Loading**
- **Problem**: User profiles (name, avatar) may not load in conversations
- **Impact**: Shows "Partner" or email instead of names
- **Location**: `messaging.service.ts` getUserProfile method

#### 5. **Backend Unread Count Calculation**
- **Problem**: Unread count increment uses raw SQL which may fail
- **Impact**: Unread counts become inaccurate
- **Location**: `messaging.service.ts` createMessage method

## Fixes to Implement

### Fix 1: Improve WebSocket Connection Reliability


**File**: `src/renderer/services/messaging.service.ts`

```typescript
// Add reconnection logic and better error handling
connect(token: string) {
  this.token = token;
  
  if (this.socket?.connected) {
    console.log('[MessagingService] Already connected');
    return this.socket;
  }

  // Disconnect old socket if exists
  if (this.socket) {
    this.socket.disconnect();
  }

  this.socket = io(`${API_URL}/messaging`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  this.socket.on('connect', () => {
    console.log('[MessagingService] Connected to messaging server');
  });

  this.socket.on('disconnect', (reason) => {
    console.log('[MessagingService] Disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server disconnected, manually reconnect
      this.socket?.connect();
    }
  });

  this.socket.on('connect_error', (error) => {
    console.error('[MessagingService] Connection error:', error);
  });

  this.socket.on('reconnect', (attemptNumber) => {
    console.log('[MessagingService] Reconnected after', attemptNumber, 'attempts');
  });

  this.socket.on('reconnect_error', (error) => {
    console.error('[MessagingService] Reconnection error:', error);
  });

  this.socket.on('reconnect_failed', () => {
    console.error('[MessagingService] Reconnection failed');
  });

  return this.socket;
}

// Add method to check connection status
isConnected(): boolean {
  return this.socket?.connected || false;
}

// Add method to force reconnect
reconnect() {
  if (this.token) {
    this.disconnect();
    this.connect(this.token);
  }
}
```

### Fix 2: Fix Backend Unread Count Increment

**File**: `backend/src/modules/messaging/messaging.service.ts`

```typescript
async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
  // Check permission first
  const permission = await this.checkMessagePermission(senderId, createMessageDto.recipientId);
  
  if (!permission.allowed) {
    throw new ForbiddenException(permission.reason || 'Cannot send message to this user');
  }
  
  const conversation = await this.getOrCreateConversation(senderId, createMessageDto.recipientId);

  const message = this.messageRepository.create({
    conversationId: conversation.id,
    senderId,
    content: createMessageDto.content,
    attachmentUrl: createMessageDto.attachmentUrl,
  });

  await this.messageRepository.save(message);

  // Update conversation - FIX: Use proper TypeORM update
  const isUser1 = conversation.user1Id === senderId;
  const updateData: any = {
    lastMessageAt: new Date(),
  };
  
  // Increment unread count for the recipient
  if (isUser1) {
    updateData.unreadCount2 = conversation.unreadCount2 + 1;
  } else {
    updateData.unreadCount1 = conversation.unreadCount1 + 1;
  }
  
  await this.conversationRepository.update(conversation.id, updateData);

  // Automatically mark connection as "connected" when first message is sent
  await this.updateConnectionStatus(senderId, createMessageDto.recipientId);

  // Load sender relation
  const savedMessage = await this.messageRepository.findOne({
    where: { id: message.id },
    relations: ['sender'],
  });

  if (!savedMessage) {
    throw new NotFoundException('Message not found');
  }

  return savedMessage;
}
```

### Fix 3: Improve Profile Data Loading

**File**: `backend/src/modules/messaging/messaging.service.ts`

```typescript
private async getUserProfile(userId: string, role: string): Promise<any> {
  try {
    if (role === 'INFLUENCER') {
      const profile = await this.conversationRepository.manager
        .createQueryBuilder()
        .select([
          'profile.name as fullName',
          'profile.avatarUrl as avatarUrl',
          'profile.bio as bio'
        ])
        .from('influencer_profiles', 'profile')
        .where('profile.userId = :userId', { userId })
        .getRawOne();
      
      if (profile) {
        return {
          fullName: profile.fullName || 'Influencer',
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
        };
      }
    } else if (role === 'COMPANY') {
      const profile = await this.conversationRepository.manager
        .createQueryBuilder()
        .select([
          'profile.companyName as fullName',
          'profile.avatarUrl as avatarUrl',
          'profile.description as bio'
        ])
        .from('company_profiles', 'profile')
        .where('profile.userId = :userId', { userId })
        .getRawOne();
      
      if (profile) {
        return {
          fullName: profile.fullName || 'Company',
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
        };
      }
    }
  } catch (error) {
    console.error('[MessagingService] Failed to load user profile:', error);
  }
  
  // Fallback
  return {
    fullName: role === 'INFLUENCER' ? 'Influencer' : 'Company',
    avatarUrl: null,
    bio: null,
  };
}
```

### Fix 4: Improve Notification Context Message Handling

**File**: `src/renderer/contexts/NotificationContext.tsx`

```typescript
// Connect to messaging service and listen for new messages
useEffect(() => {
  if (!user) return;

  const token = localStorage.getItem('auth_token');
  if (!token) return;

  // Connect to WebSocket with retry
  const connectWithRetry = () => {
    try {
      messagingService.connect(token);
    } catch (error) {
      console.error('[NotificationContext] Failed to connect, retrying in 3s:', error);
      setTimeout(connectWithRetry, 3000);
    }
  };
  
  connectWithRetry();

  // Handle new messages - show toast and update unread count
  const handleNewMessage = (message: Message) => {
    console.log('[NotificationContext] New message received:', message);
    
    // Only show notification if sender is not current user
    if (message.senderId === user.id) {
      return;
    }
    
    // Optimistically increment unread count for instant feedback
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification near Messages icon
    showMessageToast({
      sender: {
        name: message.sender?.profile?.fullName || message.sender?.email || 'Someone',
        avatar: message.sender?.profile?.avatarUrl,
      },
      content: message.content,
      conversationId: message.conversationId,
    });
    
    // Sync with backend in background (debounced)
    setTimeout(() => updateUnreadCount(), 1000);
  };

  messagingService.onNewMessage(handleNewMessage);

  // Periodically check connection and reconnect if needed
  const connectionCheckInterval = setInterval(() => {
    if (!messagingService.isConnected()) {
      console.log('[NotificationContext] Connection lost, reconnecting...');
      connectWithRetry();
    }
  }, 30000); // Check every 30 seconds

  return () => {
    messagingService.offNewMessage(handleNewMessage);
    clearInterval(connectionCheckInterval);
    // Keep connection alive - don't disconnect
  };
}, [user]);
```

### Fix 5: Add Connection Status Indicator

**File**: `src/renderer/components/MessageThread/MessageThread.tsx`

Add a connection status indicator at the top of the message thread:

```typescript
// Add to component state
const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

// Add useEffect to monitor connection
useEffect(() => {
  const checkConnection = () => {
    if (messagingService.isConnected()) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  };
  
  checkConnection();
  const interval = setInterval(checkConnection, 5000);
  
  return () => clearInterval(interval);
}, []);

// Add to JSX (at top of message thread)
{connectionStatus === 'disconnected' && (
  <div style={{
    padding: '0.5rem',
    backgroundColor: '#FEE',
    color: '#C00',
    textAlign: 'center',
    fontSize: '0.875rem'
  }}>
    ⚠️ Connection lost. Messages may not send. <button onClick={() => messagingService.reconnect()}>Reconnect</button>
  </div>
)}
```

### Fix 6: Add Debugging Tools

**File**: `src/renderer/pages/Messages.tsx`

Add debugging information in development mode:

```typescript
// Add to component (only in development)
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Messages] Debug Info:', {
      user: user?.id,
      conversationsCount: conversations.length,
      selectedConversation: selectedConversation?.id,
      messagesCount: messages.length,
      unreadCount,
      isConnected: messagingService.isConnected(),
    });
  }
}, [user, conversations, selectedConversation, messages, unreadCount]);
```

## Testing Checklist

After implementing fixes, test the following scenarios:

### Basic Messaging
- [ ] Send message from User A to User B
- [ ] User B receives message in real-time
- [ ] User B sees notification toast
- [ ] Unread count increments for User B
- [ ] User B clicks conversation, unread count decreases
- [ ] Messages display correctly with avatars and names

### WebSocket Reliability
- [ ] Disconnect internet, reconnect - messages still work
- [ ] Close tab, reopen - connection re-establishes
- [ ] Leave page idle for 5 minutes - still receives messages
- [ ] Send multiple messages quickly - all delivered

### Notification System
- [ ] Message notification shows near Messages icon
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Clicking toast opens correct conversation
- [ ] Badge count matches actual unread messages
- [ ] Badge clears when all conversations read

### Edge Cases
- [ ] Send message to user with no profile - shows fallback name
- [ ] Send message while offline - shows error
- [ ] Receive message while on Messages page - updates instantly
- [ ] Receive message while on different page - shows notification
- [ ] Multiple users send messages simultaneously - all handled

## Implementation Priority

1. **HIGH**: Fix 2 (Backend unread count) - Critical for data integrity
2. **HIGH**: Fix 1 (WebSocket reliability) - Critical for real-time messaging
3. **MEDIUM**: Fix 3 (Profile loading) - Improves UX
4. **MEDIUM**: Fix 4 (Notification handling) - Improves reliability
5. **LOW**: Fix 5 (Connection indicator) - Nice to have
6. **LOW**: Fix 6 (Debugging tools) - Development only

## Next Steps

1. Implement fixes in order of priority
2. Test each fix individually
3. Run full integration test
4. Monitor production logs for errors
5. Gather user feedback

---

**Status**: Ready for implementation
**Estimated Time**: 2-3 hours
**Risk Level**: Low (mostly improvements to existing code)
