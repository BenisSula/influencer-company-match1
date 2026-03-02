# Connect-to-Message Flow - Complete Investigation & Fix Plan

**Date:** February 10, 2026  
**Status:** 🔍 INVESTIGATION COMPLETE - FIX PLAN READY

---

## Complete Flow Trace

### Step-by-Step User Journey

```
1. User on Matches Page
   ↓
2. Clicks "Connect" button on MatchCard
   ↓
3. MatchCard.handleConnect() executes
   ↓
4. ConnectionContext.connect() called
   ↓
5. POST /api/connections { recipientId }
   ↓
6. Backend creates connection (status: PENDING)
   ↓
7. Navigate to /messages with state
   ↓
8. Messages page loads
   ↓
9. useEffect detects recipientId in state
   ↓
10. createNewConversation() called
   ↓
11. Send initial message via HTTP
   ↓
12. Backend updates connection (status: CONNECTED)
   ↓
13. Conversation created
   ↓
14. Display conversation
```

---

## Issues Identified

### Issue #1: Race Condition in Messages Page ❌
**Location:** `src/renderer/pages/Messages.tsx` line 104-122

**Problem:**
```typescript
// Handle creating new conversation or opening by recipient ID
if (state?.recipientId && !creatingConversation) {
  const existingConvo = conversations.find(c => 
    c.user1Id === state.recipientId || c.user2Id === state.recipientId
  );

  if (existingConvo && !selectedConversation) {
    handleSelectConversation(existingConvo);
  } else if (!existingConvo && !selectedConversation) {
    createNewConversation(state.recipientId, state.recipientName);
  }
}
```

**Issues:**
1. `conversations` array is empty on first render
2. useEffect runs before conversations are loaded
3. Creates new conversation even if one exists
4. Dependency array includes `conversations` causing infinite loops

### Issue #2: Connection Status Not Refreshing ❌
**Location:** `src/renderer/components/MatchCard/MatchCard.tsx`

**Problem:**
- Button shows "Pending..." after message sent
- ConnectionContext not refreshing from backend
- Custom event not triggering refresh
- useEffect dependencies causing stale closures

### Issue #3: Database Migration Not Run ❌
**Location:** Database

**Problem:**
- 'connected' status added to enum in code
- But database still has old enum values
- INSERT/UPDATE fails silently or uses wrong value
- Connection status never actually updates to 'connected'

### Issue #4: Messaging Service Token Not Set ❌
**Location:** `src/renderer/services/messaging.service.ts`

**Problem:**
```typescript
async sendMessageHTTP(recipientId: string, content: string): Promise<Message> {
  const response = await fetch(`${API_URL}/api/messaging/messages`, {
    headers: {
      'Authorization': `Bearer ${this.token}`,  // ← this.token might be null
    },
    body: JSON.stringify({ recipientId, content }),
  });
}
```

**Issue:** Token set in `connect()` but `sendMessageHTTP` might be called before connection

### Issue #5: Error Handling Swallows Errors ❌
**Location:** Multiple places

**Problem:**
- Errors caught but not properly displayed
- User sees generic "Failed to send message"
- No indication of what actually failed
- Hard to debug

---

## Root Cause Analysis

### Primary Issue: Async State Management

The main problem is **asynchronous state management** across multiple systems:

1. **Connection Creation** (async)
2. **Navigation** (sync)
3. **Conversations Loading** (async)
4. **Message Sending** (async)
5. **Status Update** (async)
6. **UI Refresh** (async)

These all happen in sequence but without proper coordination, leading to race conditions.

### Secondary Issue: Database Schema Mismatch

The code expects 'connected' status but database doesn't have it yet.

---

## Comprehensive Fix Plan

### Phase 1: Database Migration (CRITICAL) 🔴

**Priority:** HIGHEST - Must run first

**Action:**
```bash
cd backend
npm run migration:run
```

**Verification:**
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'connections_status_enum');
-- Should show: pending, connected, accepted, rejected
```

**Why Critical:** Without this, connection status can never be 'connected'

---

### Phase 2: Fix Messages Page Race Condition 🟡

**File:** `src/renderer/pages/Messages.tsx`

**Current Code (BROKEN):**
```typescript
useEffect(() => {
  if (state?.recipientId && !creatingConversation) {
    const existingConvo = conversations.find(c => 
      c.user1Id === state.recipientId || c.user2Id === state.recipientId
    );
    // ... creates conversation immediately
  }
}, [location.state, conversations, selectedConversation, creatingConversation]);
```

**Fixed Code:**
```typescript
// Separate effect for loading conversations
useEffect(() => {
  if (!user) return;
  loadConversations();
}, [user]);

// Separate effect for handling navigation state
useEffect(() => {
  if (!state?.recipientId || creatingConversation || !user) return;
  
  // Wait for conversations to load first
  if (conversations.length === 0 && loading) {
    return; // Still loading, wait
  }
  
  const existingConvo = conversations.find(c => 
    c.user1Id === state.recipientId || c.user2Id === state.recipientId
  );

  if (existingConvo) {
    // Conversation exists, just select it
    if (selectedConversation?.id !== existingConvo.id) {
      handleSelectConversation(existingConvo);
      // Clear state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  } else {
    // No conversation exists, create new one
    if (!selectedConversation) {
      createNewConversation(state.recipientId, state.recipientName);
      // Clear state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }
}, [state?.recipientId, conversations, loading, selectedConversation, creatingConversation, user]);
```

**Key Changes:**
1. Check if conversations are still loading
2. Clear navigation state after handling
3. Prevent duplicate conversation creation
4. Better dependency management

---

### Phase 3: Fix Messaging Service Token 🟡

**File:** `src/renderer/services/messaging.service.ts`

**Current Code (BROKEN):**
```typescript
async sendMessageHTTP(recipientId: string, content: string): Promise<Message> {
  const response = await fetch(`${API_URL}/api/messaging/messages`, {
    headers: {
      'Authorization': `Bearer ${this.token}`,  // ← might be null
    },
  });
}
```

**Fixed Code:**
```typescript
async sendMessageHTTP(recipientId: string, content: string, attachmentUrl?: string): Promise<Message> {
  // Ensure token is set
  if (!this.token) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    this.token = token;
  }
  
  const response = await fetch(`${API_URL}/api/messaging/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    },
    body: JSON.stringify({ recipientId, content, attachmentUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to send message: ${response.statusText}`);
  }

  return response.json();
}
```

**Key Changes:**
1. Check and set token if missing
2. Better error messages
3. Parse error response from backend

---

### Phase 4: Fix Connection Status Refresh 🟡

**File:** `src/renderer/components/MatchCard/MatchCard.tsx`

**Current Code (BROKEN):**
```typescript
useEffect(() => {
  if (currentUserId && profile.id) {
    const checkConnectionStatus = async () => {
      try {
        await refreshConnectionStatus(currentUserId, profile.id);
      } catch (error) {
        console.error('Failed to refresh connection status:', error);
      }
    };
    
    checkConnectionStatus();
    
    const handleConnectionChange = (event: CustomEvent) => {
      // ... refresh logic
    };
    
    window.addEventListener('connectionStatusChanged', handleConnectionChange as EventListener);
    
    return () => {
      window.removeEventListener('connectionStatusChanged', handleConnectionChange as EventListener);
    };
  }
}, [currentUserId, profile.id, refreshConnectionStatus]);
```

**Issues:**
- `refreshConnectionStatus` in dependencies causes re-renders
- Event listener might not fire
- Stale closure issues

**Fixed Code:**
```typescript
useEffect(() => {
  if (!currentUserId || !profile.id) return;
  
  let mounted = true;
  
  const checkConnectionStatus = async () => {
    try {
      if (mounted) {
        await refreshConnectionStatus(currentUserId, profile.id);
      }
    } catch (error) {
      console.error('Failed to refresh connection status:', error);
    }
  };
  
  // Initial check
  checkConnectionStatus();
  
  // Listen for connection status changes
  const handleConnectionChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { userId, otherUserId } = customEvent.detail;
    
    if ((userId === currentUserId && otherUserId === profile.id) ||
        (userId === profile.id && otherUserId === currentUserId)) {
      checkConnectionStatus();
    }
  };
  
  window.addEventListener('connectionStatusChanged', handleConnectionChange);
  
  // Also refresh when window regains focus (user returns from messages)
  window.addEventListener('focus', checkConnectionStatus);
  
  return () => {
    mounted = false;
    window.removeEventListener('connectionStatusChanged', handleConnectionChange);
    window.removeEventListener('focus', checkConnectionStatus);
  };
}, [currentUserId, profile.id]); // Remove refreshConnectionStatus from deps
```

**Key Changes:**
1. Remove function from dependencies
2. Add mounted flag to prevent state updates after unmount
3. Add focus listener for when user returns
4. Better event typing

---

### Phase 5: Improve Error Handling 🟢

**File:** `src/renderer/pages/Messages.tsx`

**Current Code (BROKEN):**
```typescript
} catch (error) {
  console.error('[Messages] Failed to create conversation:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  alert(`Failed to start conversation: ${errorMessage}`);
}
```

**Fixed Code:**
```typescript
} catch (error) {
  console.error('[Messages] Failed to create conversation:', error);
  
  let errorMessage = 'Unknown error';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    errorMessage = axiosError.response?.data?.message || axiosError.message || 'Network error';
  }
  
  // Show user-friendly error
  showToast(`Failed to start conversation: ${errorMessage}`, 'error');
  
  // Log detailed error for debugging
  console.error('[Messages] Detailed error:', {
    error,
    recipientId,
    recipientName,
    hasToken: !!localStorage.getItem('auth_token'),
    userId: user?.id
  });
}
```

**Key Changes:**
1. Use toast instead of alert
2. Better error message extraction
3. Detailed logging for debugging
4. User-friendly messages

---

### Phase 6: Add Comprehensive Logging 🟢

**Add to all critical points:**

```typescript
// In MatchCard.handleConnect
console.log('[MatchCard] Connect clicked:', {
  currentUserId,
  profileId: profile.id,
  profileName: profile.name,
  connectionStatus
});

// In ConnectionContext.connect
console.log('[ConnectionContext] Creating connection:', {
  userId,
  recipientId,
  timestamp: new Date().toISOString()
});

// In Messages.createNewConversation
console.log('[Messages] Starting conversation creation:', {
  recipientId,
  recipientName,
  userId: user?.id,
  hasToken: !!localStorage.getItem('auth_token'),
  conversationsCount: conversations.length
});

// In backend messaging.service
console.log('[MessagingService] Creating message:', {
  senderId,
  recipientId: createMessageDto.recipientId,
  timestamp: new Date().toISOString()
});

// In backend messaging.service.updateConnectionStatus
console.log('[MessagingService] Updating connection status:', {
  user1Id,
  user2Id,
  connectionFound: !!connection,
  currentStatus: connection?.status,
  newStatus: ConnectionStatus.CONNECTED
});
```

---

## Implementation Order

### Step 1: Run Database Migration (5 minutes)
```bash
cd backend
npm run migration:run
# Verify with SQL query
```

### Step 2: Fix Messaging Service Token (10 minutes)
- Update `sendMessageHTTP` method
- Add token check
- Improve error handling

### Step 3: Fix Messages Page Race Condition (20 minutes)
- Separate useEffects
- Add loading checks
- Clear navigation state
- Test thoroughly

### Step 4: Fix MatchCard Status Refresh (15 minutes)
- Remove function from dependencies
- Add mounted flag
- Add focus listener
- Test status updates

### Step 5: Add Comprehensive Logging (15 minutes)
- Add logs to all critical points
- Test and verify logs appear
- Document log format

### Step 6: Test Complete Flow (30 minutes)
- Test connect → message flow
- Test existing conversation flow
- Test error scenarios
- Test status updates

**Total Time:** ~2 hours

---

## Testing Checklist

### Test 1: Fresh Connection
- [ ] Click "Connect" on new match
- [ ] Verify connection created (check database)
- [ ] Verify redirected to Messages
- [ ] Verify initial message sent
- [ ] Verify conversation appears
- [ ] Return to Matches
- [ ] Verify button shows "Message" (not "Pending")

### Test 2: Existing Connection
- [ ] Click "Connect" on already-connected match
- [ ] Verify opens existing conversation
- [ ] Verify no duplicate conversation created
- [ ] Verify can send messages

### Test 3: Error Scenarios
- [ ] Disconnect network, try to connect
- [ ] Verify error message shown
- [ ] Verify no stuck state
- [ ] Reconnect network, try again
- [ ] Verify works after reconnection

### Test 4: Status Updates
- [ ] Connect with user A
- [ ] Send message
- [ ] Open new tab, log in as same user
- [ ] Verify both tabs show "Message" button
- [ ] Test status sync across tabs

---

## Success Criteria

✅ User can click "Connect" and reach Messages page  
✅ Initial message sends successfully  
✅ Conversation appears in list  
✅ Connection status updates to 'connected'  
✅ Button changes from "Pending" to "Message"  
✅ No duplicate conversations created  
✅ Error messages are clear and helpful  
✅ Status syncs across tabs/windows  
✅ No console errors  
✅ Smooth user experience  

---

## Rollback Plan

If issues occur after deployment:

1. **Revert Code Changes**
   ```bash
   git revert <commit-hash>
   ```

2. **Database Cannot Be Rolled Back**
   - Adding enum value is safe
   - Cannot remove enum value easily
   - Old code will still work with new enum

3. **Clear User Cache**
   - Instruct users to clear browser cache
   - Or increment app version to force refresh

---

## Monitoring After Deployment

### Metrics to Track
1. Connection creation success rate
2. Message send success rate
3. Time from connect to first message
4. Error rate by type
5. Status update latency

### Logs to Monitor
1. Connection creation failures
2. Message send failures
3. Status update failures
4. Race condition occurrences
5. Token missing errors

### Alerts to Set Up
1. Error rate > 5%
2. Message send failure > 2%
3. Status update failure > 2%
4. Average time to message > 10s

---

## Conclusion

The connect-to-message flow has multiple issues related to:
1. **Database schema** (missing 'connected' status)
2. **Race conditions** (async state management)
3. **Token management** (not set before use)
4. **Status refresh** (not updating properly)
5. **Error handling** (swallowing errors)

All issues have been identified and fixes are ready to implement.

**Estimated Fix Time:** 2 hours  
**Risk Level:** Medium (requires database migration)  
**Impact:** High (critical user flow)

---

**Investigation By:** Kiro AI Assistant  
**Date:** February 10, 2026  
**Status:** READY FOR IMPLEMENTATION
