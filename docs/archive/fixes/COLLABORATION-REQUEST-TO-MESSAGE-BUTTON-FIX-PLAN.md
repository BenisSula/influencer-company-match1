# Collaboration Request to Message Button - Dynamic Behavior Fix Plan

## Problem Statement

When a user clicks "Request Collaboration" on a match card in the dashboard and the collaboration is established (accepted), the button should dynamically change to "Message" button which leads to the conversation on the messages page. Currently, this dynamic behavior is not working correctly.

## Current Implementation Analysis

### 1. **Frontend Components**

#### MatchCard Component (`src/renderer/components/MatchCard/MatchCard.tsx`)
- ✅ Has logic to show different buttons based on `connectionStatus`
- ✅ Uses `getActionItems()` to determine which buttons to show
- ✅ Shows "Request Collaboration" when `connectionStatus === 'none'`
- ✅ Shows "Message" when `connectionStatus === 'connected' || 'pending'`
- ⚠️ **ISSUE**: Uses `connectionStatus === 'connected'` but backend uses `ConnectionStatus.ACCEPTED`

#### ConnectionContext (`src/renderer/contexts/ConnectionContext.tsx`)
- ✅ Manages connection state across the app
- ✅ Has `refreshConnectionStatus()` method
- ✅ Has `updateConnectionStatus()` method
- ⚠️ **ISSUE**: Type definition uses `'connected'` but backend returns `'accepted'`

### 2. **Backend Services**

#### Connection Entity (`backend/src/modules/matching/entities/connection.entity.ts`)
- ✅ Defines `ConnectionStatus` enum with: `PENDING`, `ACCEPTED`, `REJECTED`
- ✅ Has `collaborationStatus` field for tracking collaboration state
- ⚠️ **CRITICAL**: No `CONNECTED` status - uses `ACCEPTED` instead

#### Matching Service (`backend/src/modules/matching/matching.service.ts`)
- ✅ `createCollaborationRequest()` creates connection with `status: PENDING`
- ✅ `acceptCollaborationRequest()` updates to `status: ACCEPTED`
- ✅ Returns connection with proper status
- ⚠️ **ISSUE**: Frontend expects 'connected' but backend returns 'accepted'

#### Messaging Service (`backend/src/modules/messaging/messaging.service.ts`)
- ✅ `createMessage()` automatically updates connection to `ACCEPTED`
- ✅ `updateConnectionStatus()` sets `status: ConnectionStatus.ACCEPTED`
- ⚠️ **ISSUE**: Comments still reference old `CONNECTED` status

### 3. **Data Flow Issues**

```
User clicks "Request Collaboration"
  ↓
CollaborationRequestModal opens
  ↓
matchingService.createCollaborationRequest()
  ↓
Backend creates Connection with status: PENDING
  ↓
Modal closes, calls onSuccess()
  ↓
MatchCard.handleCollaborationSuccess() calls refreshConnectionStatus()
  ↓
⚠️ PROBLEM: Frontend expects 'connected' but gets 'accepted'
  ↓
❌ Button doesn't update because condition checks for 'connected'
```

## Root Causes

### 1. **Status Mismatch**
- **Frontend**: Uses `'connected'` in type definitions and logic
- **Backend**: Uses `'accepted'` (ConnectionStatus.ACCEPTED)
- **Impact**: Button logic fails because `'accepted' !== 'connected'`

### 2. **Missing Status Sync After Collaboration Request**
- When collaboration request is sent, connection status is `PENDING`
- When recipient accepts, status becomes `ACCEPTED`
- Frontend doesn't automatically refresh to detect this change
- MatchCard doesn't re-check connection status after modal closes

### 3. **Type Definition Inconsistency**
```typescript
// Frontend (ConnectionContext.tsx)
type ConnectionStatus = 'none' | 'pending' | 'connected';

// Backend (connection.entity.ts)
enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',  // ← Not 'connected'!
  REJECTED = 'rejected'
}
```

## Solution Plan

### Phase 1: Fix Status Type Mismatch (CRITICAL)

#### 1.1 Update Frontend Type Definition
**File**: `src/renderer/contexts/ConnectionContext.tsx`

```typescript
// Change from:
type ConnectionStatus = 'none' | 'pending' | 'connected';

// To:
type ConnectionStatus = 'none' | 'pending' | 'accepted' | 'rejected';
```

#### 1.2 Update MatchCard Logic
**File**: `src/renderer/components/MatchCard/MatchCard.tsx`

```typescript
// Change from:
const hasConnection = connectionStatus === 'connected' || connectionStatus === 'pending';

// To:
const hasConnection = connectionStatus === 'accepted' || connectionStatus === 'pending';
```

### Phase 2: Improve Status Refresh After Collaboration Request

#### 2.1 Update CollaborationRequestModal Success Handler
**File**: `src/renderer/components/CollaborationRequestModal/CollaborationRequestModal.tsx`

Add immediate status update after successful request:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing code ...
  
  const response = await matchingService.createCollaborationRequest(requestData);
  
  // ✅ NEW: Update connection status immediately
  if (response && response.id) {
    // Dispatch event to notify all components
    window.dispatchEvent(new CustomEvent('connectionStatusChanged', {
      detail: { 
        userId: currentUserId, 
        otherUserId: recipientId, 
        status: 'pending',
        connectionId: response.id
      }
    }));
  }
  
  showToast(`Collaboration request sent to ${recipientName}!`, 'success');
  onSuccess?.();
  onClose();
};
```

#### 2.2 Enhance MatchCard Status Refresh
**File**: `src/renderer/components/MatchCard/MatchCard.tsx`

```typescript
const handleCollaborationSuccess = async () => {
  setShowCollaborationModal(false);
  showToast(`Collaboration request sent to ${profile.name}!`, 'success');
  
  // ✅ Force immediate refresh with retry
  try {
    await refreshConnectionStatus(currentUserId, profile.id);
    
    // ✅ Dispatch event for other components
    window.dispatchEvent(new CustomEvent('connectionStatusChanged', {
      detail: { 
        userId: currentUserId, 
        otherUserId: profile.id, 
        status: 'pending'
      }
    }));
  } catch (error) {
    console.error('Failed to refresh connection status:', error);
  }
};
```

### Phase 3: Add Real-time Status Updates

#### 3.1 Listen for Collaboration Acceptance
**File**: `src/renderer/components/MatchCard/MatchCard.tsx`

Add listener for when collaboration is accepted:

```typescript
useEffect(() => {
  const handleCollaborationAccepted = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { connectionId, recipientId } = customEvent.detail;
    
    // If this is about our connection, refresh status
    if (recipientId === profile.id) {
      console.log('[MatchCard] Collaboration accepted, refreshing status...');
      refreshConnectionStatus(currentUserId, profile.id);
    }
  };
  
  window.addEventListener('collaborationAccepted', handleCollaborationAccepted);
  
  return () => {
    window.removeEventListener('collaborationAccepted', handleCollaborationAccepted);
  };
}, [currentUserId, profile.id]);
```

### Phase 4: Backend Consistency Updates

#### 4.1 Ensure Consistent Status Returns
**File**: `backend/src/modules/matching/matching.service.ts`

Verify all methods return consistent status format:

```typescript
async getConnectionStatus(userId: string, otherUserId: string) {
  // ... existing code ...
  
  return { 
    status: connection.status, // ✅ Returns 'accepted', 'pending', or 'rejected'
    collaborationStatus: connection.collaborationStatus,
    connection 
  };
}
```

#### 4.2 Add Connection Status Endpoint
**File**: `backend/src/modules/matching/matching.controller.ts`

Ensure endpoint exists:

```typescript
@Get('connections/status/:otherUserId')
@UseGuards(JwtAuthGuard)
async getConnectionStatus(
  @Request() req,
  @Param('otherUserId') otherUserId: string,
) {
  return this.matchingService.getConnectionStatus(req.user.id, otherUserId);
}
```

### Phase 5: Dashboard Integration

#### 5.1 Refresh Connections After Collaboration
**File**: `src/renderer/pages/Dashboard.tsx`

Add listener for collaboration events:

```typescript
useEffect(() => {
  const handleConnectionChange = () => {
    // Reload connections and matches
    loadConnections();
    loadConnectionStatuses(matches);
  };
  
  window.addEventListener('connectionStatusChanged', handleConnectionChange);
  window.addEventListener('collaborationAccepted', handleConnectionChange);
  
  return () => {
    window.removeEventListener('connectionStatusChanged', handleConnectionChange);
    window.removeEventListener('collaborationAccepted', handleConnectionChange);
  };
}, [matches]);
```

## Testing Plan

### Test Case 1: Collaboration Request Flow
1. ✅ Login as Company user
2. ✅ Go to Dashboard
3. ✅ Find a match card
4. ✅ Click "Request Collaboration"
5. ✅ Fill form and submit
6. ✅ **VERIFY**: Button changes to "Message" (or shows pending state)
7. ✅ **VERIFY**: Connection status is 'pending'

### Test Case 2: Collaboration Acceptance Flow
1. ✅ Login as Influencer user (recipient)
2. ✅ Go to Connections page
3. ✅ Accept collaboration request
4. ✅ **VERIFY**: Connection status becomes 'accepted'
5. ✅ Login as Company user (requester)
6. ✅ Go to Dashboard
7. ✅ **VERIFY**: Button shows "Message" for that match
8. ✅ Click "Message"
9. ✅ **VERIFY**: Navigates to Messages page with conversation

### Test Case 3: Message Button Navigation
1. ✅ Click "Message" button on match card
2. ✅ **VERIFY**: Navigates to `/messages`
3. ✅ **VERIFY**: Opens conversation with correct recipient
4. ✅ **VERIFY**: Can send messages

### Test Case 4: Status Persistence
1. ✅ Establish collaboration
2. ✅ Refresh page
3. ✅ **VERIFY**: Button still shows "Message"
4. ✅ **VERIFY**: Connection status persists

## Implementation Priority

### 🔴 CRITICAL (Must Fix Immediately)
1. Fix status type mismatch (`'connected'` → `'accepted'`)
2. Update MatchCard button logic
3. Update ConnectionContext type definition

### 🟡 HIGH (Fix Soon)
4. Add immediate status refresh after collaboration request
5. Add event dispatching for status changes
6. Test collaboration flow end-to-end

### 🟢 MEDIUM (Enhancement)
7. Add real-time status updates
8. Add loading states during status refresh
9. Add error handling for failed status updates

## Files to Modify

### Frontend
1. ✅ `src/renderer/contexts/ConnectionContext.tsx` - Fix type definition
2. ✅ `src/renderer/components/MatchCard/MatchCard.tsx` - Fix button logic
3. ✅ `src/renderer/components/CollaborationRequestModal/CollaborationRequestModal.tsx` - Add status update
4. ✅ `src/renderer/pages/Dashboard.tsx` - Add event listeners

### Backend (Verification Only)
5. ✅ `backend/src/modules/matching/entities/connection.entity.ts` - Verify enum
6. ✅ `backend/src/modules/matching/matching.service.ts` - Verify status returns
7. ✅ `backend/src/modules/matching/matching.controller.ts` - Verify endpoints

## Expected Outcome

After implementing these fixes:

1. ✅ When user clicks "Request Collaboration", connection is created with status `'pending'`
2. ✅ Button immediately updates to show pending state or "Message" option
3. ✅ When recipient accepts, status becomes `'accepted'`
4. ✅ Requester's dashboard automatically updates to show "Message" button
5. ✅ Clicking "Message" navigates to conversation
6. ✅ Status persists across page refreshes
7. ✅ All components stay in sync with connection status

## Notes

- The core issue is the mismatch between frontend expecting `'connected'` and backend returning `'accepted'`
- Backend is correct (uses `ACCEPTED` enum value)
- Frontend needs to be updated to match backend
- This is a simple but critical fix that affects the entire collaboration flow
