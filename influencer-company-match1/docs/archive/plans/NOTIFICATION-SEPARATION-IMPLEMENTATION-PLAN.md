# Notification Separation Implementation Plan
## Bell Icon (General Notifications) vs Message Icon (Message Notifications)

## Current State Analysis

### ✅ What's Working
1. **Message notifications** already show in message icon with toast notifications
2. **Backend notification system** exists with proper entity and service
3. **NotificationContext** manages both general and message notifications separately
4. **NotificationDropdown** displays general notifications in bell dropdown

### ❌ What's Missing
1. **Collaboration request notifications** are created but NOT being loaded/displayed
2. **Backend notifications** (collaboration requests, accepts, rejects) don't show in bell icon
3. **Notification polling** exists but notifications aren't being fetched with sender data

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                                │
├──────────────────────────────┬──────────────────────────────┤
│   🔔 Bell Icon               │   💬 Message Icon            │
│   (General Notifications)    │   (Message Notifications)    │
├──────────────────────────────┼──────────────────────────────┤
│ - Collaboration Requests     │ - New Messages               │
│ - Collaboration Accepted     │ - Message Toasts             │
│ - Collaboration Rejected     │ - Unread Count               │
│ - Connection Requests        │                              │
│ - Profile Views              │                              │
│ - Match Found                │                              │
└──────────────────────────────┴──────────────────────────────┘
```

## Data Flow

### Current Flow (Partially Working)
```
1. Collaboration Request Created
   ↓
2. Backend: notificationsService.createNotification() ✅
   ↓
3. Notification saved to database ✅
   ↓
4. Frontend: NotificationContext polls every 30s ✅
   ↓
5. Frontend: loadGeneralNotifications() ❌ (not loading sender data)
   ↓
6. Bell icon shows count ❌ (not working)
   ↓
7. Dropdown shows notifications ❌ (sender data missing)
```

### Target Flow (What We Need)
```
1. Collaboration Request Created
   ↓
2. Backend: notificationsService.createNotification()
   - type: COLLABORATION_REQUEST
   - recipientId: target user
   - senderId: requesting user
   - content: "sent you a collaboration request"
   ↓
3. Notification saved with proper metadata
   ↓
4. Frontend: NotificationContext polls
   ↓
5. Backend: Load notifications WITH sender profile data
   ↓
6. Bell icon shows unread count
   ↓
7. Dropdown shows notifications with avatars
   ↓
8. Click notification → Navigate to /connections
```

## Implementation Plan

### Phase 1: Fix Backend Notification Loading ✅ (Already Exists)

**File:** `backend/src/modules/notifications/notifications.service.ts`

The service already exists and works. We just need to ensure it loads sender data.

**Update needed:**
```typescript
async getNotifications(userId: string, limit = 20) {
  const notifications = await this.notificationRepository.find({
    where: { recipientId: userId },
    order: { createdAt: 'DESC' },
    take: limit,
  });

  // Load sender data for each notification
  const notificationsWithSender = await Promise.all(
    notifications.map(async (notification) => {
      const sender = await this.userRepository.findOne({
        where: { id: notification.senderId },
      });

      if (!sender) {
        return { ...notification, sender: null };
      }

      // Load profile based on role
      let profile = null;
      if (sender.role === 'INFLUENCER') {
        profile = await this.influencerProfileRepository.findOne({
          where: { userId: sender.id },
        });
      } else if (sender.role === 'COMPANY') {
        profile = await this.companyProfileRepository.findOne({
          where: { userId: sender.id },
        });
      }

      return {
        ...notification,
        sender: {
          id: sender.id,
          email: sender.email,
          role: sender.role,
          influencerProfile: sender.role === 'INFLUENCER' ? {
            name: profile?.name,
            avatarUrl: profile?.avatarUrl,
          } : undefined,
          companyProfile: sender.role === 'COMPANY' ? {
            name: profile?.name,
            logoUrl: profile?.avatarUrl,
          } : undefined,
        },
      };
    })
  );

  return notificationsWithSender;
}
```

### Phase 2: Ensure Notifications Are Created ✅ (Already Exists)

**File:** `backend/src/modules/matching/matching.service.ts`

The code already exists in lines 700-720 (createCollaborationRequest) and lines 900-920 (acceptCollaborationRequest).

**Verify these calls exist:**
```typescript
// In createCollaborationRequest
await this.notificationsService.createNotification({
  recipientId,
  senderId: requesterId,
  type: NotificationType.COLLABORATION_REQUEST,
  content: 'sent you a collaboration request',
  metadata: {
    connectionId: savedConnection.id,
    collaborationType: dto.collaborationType,
    budgetRange: budgetMin && budgetMax ? `${budgetMin}-${budgetMax}` : undefined,
  },
});

// In acceptCollaborationRequest
await this.notificationsService.createNotification({
  recipientId: connection.requesterId,
  senderId: userId,
  type: NotificationType.COLLABORATION_ACCEPTED,
  content: 'accepted your collaboration request',
  metadata: {
    connectionId: connection.id,
    collaborationType: connection.collaborationRequestData?.collaborationType,
  },
});

// In rejectCollaborationRequest
await this.notificationsService.createNotification({
  recipientId: connection.requesterId,
  senderId: userId,
  type: NotificationType.COLLABORATION_REJECTED,
  content: 'declined your collaboration request',
  metadata: {
    connectionId: connection.id,
  },
});
```

### Phase 3: Fix Frontend Notification Display ✅ (Already Exists)

**File:** `src/renderer/contexts/NotificationContext.tsx`

The context already:
- Loads general notifications
- Polls every 30 seconds
- Manages unread count
- Separates message notifications from general notifications

**File:** `src/renderer/components/NotificationDropdown/NotificationDropdown.tsx`

The dropdown already:
- Displays backend notifications
- Shows sender avatar and name
- Handles click navigation
- Marks as read

### Phase 4: Verify Bell Icon Badge ✅ (Already Exists)

**File:** `src/renderer/layouts/AppLayout/AppLayout.tsx`

The bell icon already shows:
```tsx
<button className="header-icon-btn" aria-label="Notifications">
  <HiBell size={20} />
  {generalUnreadCount > 0 && (
    <span className="notification-badge">
      {generalUnreadCount > 9 ? '9+' : generalUnreadCount}
    </span>
  )}
</button>
```

## Issues Found

### Issue 1: Backend Notification Service Missing User Repository

**Problem:** The notifications service doesn't have access to User, InfluencerProfile, and CompanyProfile repositories to load sender data.

**Solution:** Inject repositories into NotificationsService

### Issue 2: Notifications Controller Uses Wrong User ID Field

**Problem:** Controller uses `req.user.userId` but JWT might use `req.user.sub`

**Solution:** Verify JWT payload structure and use correct field

## Implementation Steps

### Step 1: Update Notifications Service
- Add repository injections
- Load sender data with profiles
- Return complete notification objects

### Step 2: Update Notifications Controller
- Fix user ID extraction from JWT
- Ensure proper authentication

### Step 3: Test Notification Flow
- Create collaboration request
- Verify notification appears in bell icon
- Click notification and verify navigation
- Mark as read and verify count updates

### Step 4: Add WebSocket Support (Optional Enhancement)
- Real-time notification delivery
- Instant bell icon updates
- No polling delay

## Database Schema

**notifications table** (Already exists):
```sql
- id (uuid, PK)
- recipientId (uuid, FK → users.id)
- senderId (uuid, FK → users.id)
- type (enum: collaboration_request, collaboration_accepted, etc.)
- content (text)
- metadata (jsonb)
- isRead (boolean, default: false)
- createdAt (timestamp)
```

## Testing Checklist

- [ ] Create collaboration request
- [ ] Verify notification created in database
- [ ] Verify bell icon shows unread count
- [ ] Click bell icon and see notification
- [ ] Verify sender name and avatar display
- [ ] Click notification and navigate to /connections
- [ ] Verify notification marked as read
- [ ] Verify unread count decreases
- [ ] Accept collaboration request
- [ ] Verify acceptance notification sent to requester
- [ ] Reject collaboration request
- [ ] Verify rejection notification sent to requester
- [ ] Verify message notifications still show in message icon
- [ ] Verify no overlap between bell and message notifications

## Files to Modify

1. **backend/src/modules/notifications/notifications.service.ts** - Add sender data loading
2. **backend/src/modules/notifications/notifications.controller.ts** - Fix user ID extraction
3. **backend/src/modules/notifications/notifications.module.ts** - Add repository imports

## Success Criteria

✅ Collaboration requests show in bell icon dropdown
✅ Bell icon shows correct unread count
✅ Sender name and avatar display correctly
✅ Clicking notification navigates to correct page
✅ Marking as read updates count
✅ Message notifications remain in message icon
✅ No overlap between notification types
✅ Real-time updates via polling (30s interval)

## Notes

- Message notifications are already working correctly via MessageToastContainer
- General notifications (bell icon) need sender data loading
- Polling interval is 30 seconds (can be reduced if needed)
- WebSocket support can be added later for real-time updates
- Current implementation uses HTTP polling which is sufficient for MVP
