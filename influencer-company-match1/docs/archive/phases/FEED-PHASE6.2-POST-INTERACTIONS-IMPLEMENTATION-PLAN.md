# Feed Phase 6.2: Post Interactions Implementation Plan

## Overview
Phase 6.2 adds collaboration buttons and connection indicators to feed posts, making it easy for users to collaborate directly from the feed.

## Status: ⚠️ IN PROGRESS

## Implementation Steps

### Step 1: Backend - Add Connection/Compatibility Endpoints ✅
Already exists in matching service:
- `GET /matching/connections/status/:userId` - Get connection status
- `GET /matching/connections/user/:userId` - Get connection details
- `POST /matching/collaboration-requests` - Create collaboration request

### Step 2: Frontend Service Updates ✅
The matching service already has:
- `getConnectionStatus(userId)` - Returns connection status
- `getConnectionByUserId(userId)` - Returns connection with compatibility score
- `createCollaborationRequest(data)` - Creates collaboration request

### Step 3: FeedPost Component Updates 🚧 IN PROGRESS

#### Required Changes:

1. **Add State Variables**
```typescript
const [showCollaborationModal, setShowCollaborationModal] = useState(false);
const [connectionStatus, setConnectionStatus] = useState<string>('none');
const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);
```

2. **Add useEffect to Load Connection Info**
```typescript
useEffect(() => {
  const loadConnectionInfo = async () => {
    if (!user || isOwnPost) return;
    
    try {
      const statusResponse = await matchingService.getConnectionStatus(post.authorId);
      setConnectionStatus(statusResponse?.status || 'none');
      
      // If not connected, try to get compatibility score
      if (statusResponse?.status === 'none') {
        const connection = await matchingService.getConnectionByUserId(post.authorId);
        if (connection?.compatibilityScore) {
          setCompatibilityScore(connection.compatibilityScore);
        }
      }
    } catch (error) {
      console.error('Failed to load connection info:', error);
    }
  };
  
  loadConnectionInfo();
}, [post.authorId, user, isOwnPost]);
```

3. **Add Collaborate Button to Action Bar**
```typescript
// Add to action bar items (only show if not own post)
{!isOwnPost && connectionStatus === 'none' && (
  <ActionBarItem
    icon={<HiUserAdd />}
    label="Collaborate"
    onClick={() => setShowCollaborationModal(true)}
    variant="primary"
  />
)}

{!isOwnPost && connectionStatus === 'pending' && (
  <ActionBarItem
    icon={<HiClock />}
    label="Pending"
    disabled
  />
)}

{!isOwnPost && connectionStatus === 'connected' && (
  <ActionBarItem
    icon={<HiMail />}
    label="Message"
    onClick={() => navigate(`/messages?userId=${post.authorId}`)}
  />
)}
```

4. **Add Connection/Compatibility Badges to Post Header**
```typescript
// Add after author name in post header
{!isOwnPost && connectionStatus === 'connected' && (
  <span className="connection-badge connected">
    <HiCheckCircle /> Connected
  </span>
)}

{!isOwnPost && compatibilityScore && compatibilityScore >= 75 && (
  <span className="compatibility-badge high">
    {compatibilityScore}% Match
  </span>
)}
```

5. **Add CollaborationRequestModal**
```typescript
{showCollaborationModal && (
  <CollaborationRequestModal
    recipientId={post.authorId}
    recipientName={post.author.name}
    onClose={() => setShowCollaborationModal(false)}
    onSuccess={() => {
      setShowCollaborationModal(false);
      setConnectionStatus('pending');
      showToast('Collaboration request sent!', 'success');
    }}
  />
)}
```

### Step 4: CSS Styles 🚧 IN PROGRESS

Add to `FeedPost.css`:
```css
/* Connection and Compatibility Badges */
.connection-badge,
.compatibility-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
}

.connection-badge.connected {
  background: var(--success-light);
  color: var(--success);
}

.compatibility-badge.high {
  background: var(--primary-light);
  color: var(--primary);
}

.compatibility-badge.medium {
  background: var(--warning-light);
  color: var(--warning);
}
```

## Issues to Resolve

### Issue 1: Missing getMatch Method
The matching service doesn't have a `getMatch(userId1, userId2)` method. We need to either:
- Add this method to the backend and frontend service
- OR use the existing `getMatches()` and filter for the specific user
- OR remove compatibility score display for non-connected users

**Recommended Solution**: Use connection status only, don't show compatibility score for non-connected users to keep it simple.

### Issue 2: Type Safety
Need to add proper TypeScript types for connection status response:
```typescript
interface ConnectionStatusResponse {
  status: 'none' | 'pending' | 'connected' | 'rejected';
  connectionId?: string;
  compatibilityScore?: number;
}
```

## Testing Plan

1. **Test as Influencer viewing Company post**
   - Should see "Collaborate" button
   - Clicking should open collaboration modal
   - After sending request, should show "Pending"

2. **Test as Company viewing Influencer post**
   - Should see "Collaborate" button
   - Should work same as above

3. **Test with existing connection**
   - Should see "Connected" badge
   - Should see "Message" button instead of "Collaborate"
   - Clicking "Message" should navigate to messages

4. **Test own posts**
   - Should NOT see any collaboration buttons
   - Should NOT see connection badges

## Next Steps

1. Fix TypeScript errors in FeedPost component
2. Simplify connection info loading (remove compatibility score for now)
3. Add proper CSS styles
4. Test all scenarios
5. Document completion

## Files Modified
- ✅ `src/renderer/services/matching.service.ts` (already has needed methods)
- 🚧 `src/renderer/components/FeedPost/FeedPost.tsx` (in progress)
- 🚧 `src/renderer/components/FeedPost/FeedPost.css` (needs styles)

## Estimated Time
- Remaining: 15-20 minutes
- Total: 45-50 minutes

## Priority
HIGH - This is a key feature for user engagement and collaboration discovery
