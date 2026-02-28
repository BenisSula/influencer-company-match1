# Connections Page - Full Button Functionality Implementation Plan

## 🎯 Objective

Implement full backend and frontend functionality for all buttons on the Connections page, ensuring perfect sync with database and proper data flow.

---

## 📋 Current Button Status

### Collaboration Request Card Buttons

1. **✓ Accept Collaboration** 
   - Status: ❌ Placeholder (shows alert)
   - Needs: Backend endpoint + Frontend integration

2. **✕ Decline**
   - Status: ❌ Placeholder (shows alert)
   - Needs: Backend endpoint + Frontend integration

3. **View Profile**
   - Status: ⚠️ Partial (navigates but needs verification)
   - Needs: Verification + Error handling

4. **Send Message**
   - Status: ⚠️ Partial (navigates but needs conversation creation)
   - Needs: Conversation creation + Navigation fix

### Regular Connection Card Buttons

5. **View Profile**
   - Status: ⚠️ Partial
   - Needs: Same as above

6. **Message**
   - Status: ⚠️ Partial
   - Needs: Same as above

7. **⭐ Rate Collaboration**
   - Status: ✅ Functional (has modal)
   - Needs: Verification only

### NEW Button to Add

8. **⭐ Rate Partner** (next to Send Message in collab request card)
   - Status: ❌ Not implemented
   - Needs: Full implementation

---

## 🔧 Implementation Plan

### Phase 1: Backend - Accept/Reject Collaboration

#### 1.1 Add Service Methods

**File**: `backend/src/modules/matching/matching.service.ts`

```typescript
async acceptCollaborationRequest(userId: string, connectionId: string) {
  // Find connection where user is recipient
  const connection = await this.connectionRepository.findOne({
    where: { 
      id: connectionId,
      recipientId: userId,
      collaborationStatus: CollaborationStatus.REQUESTED
    }
  });

  if (!connection) {
    throw new NotFoundException('Collaboration request not found or already processed');
  }

  // Update status to active
  connection.collaborationStatus = CollaborationStatus.ACTIVE;
  await this.connectionRepository.save(connection);

  // Create/ensure conversation exists
  const conversation = await this.ensureConversation(
    connection.requesterId,
    connection.recipientId
  );

  // TODO: Send notification to requester
  // await this.notificationService.sendCollaborationAccepted(connection);

  return {
    connection,
    conversationId: conversation.id,
    message: 'Collaboration request accepted successfully'
  };
}

async rejectCollaborationRequest(userId: string, connectionId: string) {
  // Find connection where user is recipient
  const connection = await this.connectionRepository.findOne({
    where: { 
      id: connectionId,
      recipientId: userId,
      collaborationStatus: CollaborationStatus.REQUESTED
    }
  });

  if (!connection) {
    throw new NotFoundException('Collaboration request not found or already processed');
  }

  // Update status to cancelled
  connection.collaborationStatus = CollaborationStatus.CANCELLED;
  await this.connectionRepository.save(connection);

  // TODO: Send notification to requester
  // await this.notificationService.sendCollaborationRejected(connection);

  return {
    connection,
    message: 'Collaboration request declined'
  };
}

private async ensureConversation(user1Id: string, user2Id: string) {
  // Check if conversation already exists
  let conversation = await this.conversationRepository
    .createQueryBuilder('conversation')
    .where(
      '(conversation.participant1Id = :user1 AND conversation.participant2Id = :user2) OR ' +
      '(conversation.participant1Id = :user2 AND conversation.participant2Id = :user1)',
      { user1: user1Id, user2: user2Id }
    )
    .getOne();

  // Create if doesn't exist
  if (!conversation) {
    conversation = this.conversationRepository.create({
      participant1Id: user1Id,
      participant2Id: user2Id,
    });
    await this.conversationRepository.save(conversation);
  }

  return conversation;
}

async updateCollaborationRequest(userId: string, connectionId: string, dto: any) {
  const connection = await this.connectionRepository.findOne({
    where: { id: connectionId }
  });

  if (!connection) {
    throw new NotFoundException('Connection not found');
  }

  // Verify user is part of this connection
  if (connection.requesterId !== userId && connection.recipientId !== userId) {
    throw new ForbiddenException('Not authorized to update this collaboration');
  }

  // Update collaboration data
  if (dto.collaborationRequestData) {
    connection.collaborationRequestData = {
      ...connection.collaborationRequestData,
      ...dto.collaborationRequestData
    };
  }

  if (dto.collaborationStatus) {
    connection.collaborationStatus = dto.collaborationStatus;
  }

  await this.connectionRepository.save(connection);

  return connection;
}
```

#### 1.2 Update Controller

**File**: `backend/src/modules/matching/matching.controller.ts`

```typescript
@Put('collaboration-requests/:id/accept')
async acceptCollaborationRequest(
  @Request() req: any,
  @Param('id') connectionId: string
) {
  return this.matchingService.acceptCollaborationRequest(req.user.sub, connectionId);
}

@Put('collaboration-requests/:id/reject')
async rejectCollaborationRequest(
  @Request() req: any,
  @Param('id') connectionId: string
) {
  return this.matchingService.rejectCollaborationRequest(req.user.sub, connectionId);
}
```

---

### Phase 2: Frontend - Service Layer

#### 2.1 Update Matching Service

**File**: `src/renderer/services/matching.service.ts`

```typescript
async acceptCollaborationRequest(connectionId: string) {
  const response = await apiClient.put(
    `/matching/collaboration-requests/${connectionId}/accept`
  );
  return response.data;
}

async rejectCollaborationRequest(connectionId: string) {
  const response = await apiClient.put(
    `/matching/collaboration-requests/${connectionId}/reject`
  );
  return response.data;
}
```

---

### Phase 3: Frontend - Connections Page

#### 3.1 Update Accept/Reject Handlers

**File**: `src/renderer/pages/Connections.tsx`

```typescript
const handleAcceptCollaboration = async (connectionId: string) => {
  try {
    setLoading(true);
    const result = await matchingService.acceptCollaborationRequest(connectionId);
    
    // Reload connections to show updated status
    await loadConnections();
    
    // Show success message
    alert(`Collaboration accepted! You can now message ${result.connection.partner?.name}`);
    
    // Optionally navigate to messages
    if (result.conversationId) {
      navigate(`/messages?conversation=${result.conversationId}`);
    }
  } catch (error) {
    console.error('Failed to accept collaboration:', error);
    alert('Failed to accept collaboration request. Please try again.');
  } finally {
    setLoading(false);
  }
};

const handleRejectCollaboration = async (connectionId: string) => {
  if (!confirm('Are you sure you want to decline this collaboration request?')) {
    return;
  }

  try {
    setLoading(true);
    await matchingService.rejectCollaborationRequest(connectionId);
    
    // Reload connections to remove from pending
    await loadConnections();
    
    alert('Collaboration request declined');
  } catch (error) {
    console.error('Failed to reject collaboration:', error);
    alert('Failed to decline collaboration request. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

#### 3.2 Fix Send Message Handler

```typescript
const handleSendMessage = async (connection: any) => {
  try {
    const partner = connection.requester || connection.recipient;
    
    // If conversation exists, navigate to it
    if (connection.conversationId) {
      navigate(`/messages?conversation=${connection.conversationId}`);
      return;
    }

    // Otherwise, create conversation first
    // This should be handled by backend when accepting collaboration
    // For now, just navigate to messages page
    navigate(`/messages`);
  } catch (error) {
    console.error('Failed to open messages:', error);
    alert('Failed to open messages. Please try again.');
  }
};
```

#### 3.3 Add Rate Button to Collaboration Request Card

```typescript
<div className="collaboration-request-footer">
  <Button
    variant="secondary"
    size="sm"
    onClick={() => handleViewProfile(partner.id)}
  >
    View Profile
  </Button>
  <Button
    variant="secondary"
    size="sm"
    onClick={() => handleSendMessage(request)}
  >
    Send Message
  </Button>
  <Button
    variant="secondary"
    size="sm"
    onClick={() => handleRateConnection(request)}
    style={{ 
      background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
      color: '#FFFFFF',
      border: 'none'
    }}
  >
    ⭐ Rate Partner
  </Button>
</div>
```

---

### Phase 4: Database Verification

#### 4.1 Verify Conversation Table

Ensure conversations table exists and has proper structure:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'conversations'
);

-- Check structure
\d conversations
```

#### 4.2 Add Conversation Repository

**File**: `backend/src/modules/matching/matching.service.ts`

Add to constructor:
```typescript
@InjectRepository(Conversation)
private conversationRepository: Repository<Conversation>,
```

---

### Phase 5: UI/UX Enhancements

#### 5.1 Loading States

Add loading indicators to buttons:

```typescript
<Button
  variant="primary"
  onClick={() => handleAcceptCollaboration(request.id)}
  disabled={loading}
  style={{ flex: 1 }}
>
  {loading ? 'Processing...' : '✓ Accept Collaboration'}
</Button>
```

#### 5.2 Success/Error Feedback

Replace alerts with toast notifications:

```typescript
// Install react-hot-toast if not already
import toast from 'react-hot-toast';

// In handlers
toast.success('Collaboration accepted!');
toast.error('Failed to accept collaboration');
```

#### 5.3 Optimistic Updates

Update UI immediately before API call:

```typescript
const handleAcceptCollaboration = async (connectionId: string) => {
  // Optimistically update UI
  setConnections(prev => prev.map(conn => 
    conn.id === connectionId 
      ? { ...conn, collaboration_status: 'active' }
      : conn
  ));

  try {
    await matchingService.acceptCollaborationRequest(connectionId);
    // Success - UI already updated
  } catch (error) {
    // Revert on error
    await loadConnections();
    toast.error('Failed to accept collaboration');
  }
};
```

---

## 📊 Button Functionality Matrix

| Button | Location | Current Status | Backend Endpoint | Frontend Handler | Data Flow |
|--------|----------|----------------|------------------|------------------|-----------|
| Accept Collaboration | Collab Request Card | ❌ Placeholder | ❌ Missing | ❌ Placeholder | ❌ Not implemented |
| Decline | Collab Request Card | ❌ Placeholder | ❌ Missing | ❌ Placeholder | ❌ Not implemented |
| View Profile | Both Cards | ⚠️ Partial | ✅ Exists | ⚠️ Needs fix | ⚠️ Partial |
| Send Message | Both Cards | ⚠️ Partial | ⚠️ Needs conversation | ⚠️ Needs fix | ⚠️ Partial |
| Rate Collaboration | Regular Card | ✅ Works | ✅ Exists | ✅ Works | ✅ Complete |
| Rate Partner | NEW | ❌ Not added | ✅ Exists (same) | ❌ Not added | ❌ Not implemented |

---

## 🔄 Complete Data Flow

### Accept Collaboration Flow

```
User clicks "Accept Collaboration"
  ↓
Frontend: handleAcceptCollaboration(connectionId)
  ↓
API Call: PUT /matching/collaboration-requests/:id/accept
  ↓
Backend: matchingService.acceptCollaborationRequest()
  ↓
Database: UPDATE connections SET collaboration_status = 'active'
  ↓
Database: INSERT/SELECT conversation
  ↓
Backend: Return { connection, conversationId, message }
  ↓
Frontend: Update UI, show success message
  ↓
Frontend: Optionally navigate to messages
```

### Decline Collaboration Flow

```
User clicks "Decline"
  ↓
Frontend: Confirm dialog
  ↓
Frontend: handleRejectCollaboration(connectionId)
  ↓
API Call: PUT /matching/collaboration-requests/:id/reject
  ↓
Backend: matchingService.rejectCollaborationRequest()
  ↓
Database: UPDATE connections SET collaboration_status = 'cancelled'
  ↓
Backend: Return { connection, message }
  ↓
Frontend: Remove from pending list, show message
```

### Send Message Flow

```
User clicks "Send Message"
  ↓
Frontend: handleSendMessage(connection)
  ↓
Check if conversationId exists
  ↓
If yes: Navigate to /messages?conversation={id}
  ↓
If no: Navigate to /messages (conversation created on first message)
```

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Accept collaboration updates status to 'active'
- [ ] Accept creates conversation if not exists
- [ ] Accept returns conversation ID
- [ ] Reject updates status to 'cancelled'
- [ ] Only recipient can accept/reject
- [ ] Cannot accept already processed request
- [ ] Error handling for invalid connection ID

### Frontend Tests

- [ ] Accept button shows loading state
- [ ] Accept success updates UI immediately
- [ ] Accept navigates to messages (optional)
- [ ] Decline shows confirmation dialog
- [ ] Decline removes from pending list
- [ ] View Profile navigates correctly
- [ ] Send Message opens conversation
- [ ] Rate button opens modal
- [ ] All buttons disabled during loading

### Integration Tests

- [ ] Full accept flow end-to-end
- [ ] Full reject flow end-to-end
- [ ] Message flow after acceptance
- [ ] Rating flow works
- [ ] Multiple requests handled correctly
- [ ] Concurrent actions handled properly

---

## 📝 Implementation Order

1. ✅ **Backend Service Methods** (30 min)
   - acceptCollaborationRequest
   - rejectCollaborationRequest
   - updateCollaborationRequest
   - ensureConversation

2. ✅ **Backend Controller Endpoints** (10 min)
   - PUT /collaboration-requests/:id/accept
   - PUT /collaboration-requests/:id/reject

3. ✅ **Frontend Service Methods** (10 min)
   - acceptCollaborationRequest
   - rejectCollaborationRequest

4. ✅ **Frontend Handlers** (20 min)
   - handleAcceptCollaboration
   - handleRejectCollaboration
   - handleSendMessage (fix)

5. ✅ **UI Enhancements** (15 min)
   - Loading states
   - Success/error feedback
   - Add Rate button

6. ✅ **Testing** (20 min)
   - Manual testing
   - Fix any issues

**Total Estimated Time**: ~2 hours

---

## 🎯 Success Criteria

- [x] All buttons have real functionality
- [ ] Backend endpoints implemented and tested
- [ ] Frontend handlers call correct APIs
- [ ] Database updates correctly
- [ ] UI provides proper feedback
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Navigation works correctly
- [ ] Conversations created properly
- [ ] No placeholder alerts remain

---

**Status**: 📋 PLAN COMPLETE - Ready for Implementation  
**Next**: Implement Phase 1 (Backend Service Methods)
