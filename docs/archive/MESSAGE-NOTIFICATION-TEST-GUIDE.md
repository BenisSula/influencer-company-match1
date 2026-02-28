# Message Notification System - Testing Guide

## Quick Test Scenarios

### Scenario 1: New Message Toast Notification

**Steps:**
1. Login as User A
2. Open a second browser/incognito window
3. Login as User B
4. User B sends a message to User A
5. **Expected Result:**
   - User A sees a toast notification slide in from the right
   - Toast shows User B's avatar, name, and message preview
   - Badge on Messages icon updates with count
   - Badge pulses with animation

**Visual Check:**
```
┌─────────────────────────────────────┐
│  Header                             │
│  [Home] [Feed] [Matches] [Messages]│
│                            ↑        │
│                         Badge (1)   │
└─────────────────────────────────────┘
                                    ┌──────────────────┐
                                    │ 👤 John Doe      │
                                    │ Hey, how are...  │
                                    │ Just now      [×]│
                                    └──────────────────┘
                                    Toast appears here →
```

---

### Scenario 2: Multiple Toast Stacking

**Steps:**
1. User B sends 3 messages quickly to User A
2. **Expected Result:**
   - 3 toasts stack vertically
   - Each toast is offset by 80px
   - Oldest toast auto-dismisses first

**Visual Check:**
```
                                    ┌──────────────────┐
                                    │ 👤 John Doe      │
                                    │ Message 1...  [×]│
                                    └──────────────────┘
                                    ┌──────────────────┐
                                    │ 👤 John Doe      │
                                    │ Message 2...  [×]│
                                    └──────────────────┘
                                    ┌──────────────────┐
                                    │ 👤 John Doe      │
                                    │ Message 3...  [×]│
                                    └──────────────────┘
```

---

### Scenario 3: Click Toast to Navigate

**Steps:**
1. User A receives a message (toast appears)
2. User A clicks on the toast
3. **Expected Result:**
   - Navigates to Messages page
   - Opens the conversation with User B
   - Toast disappears
   - Badge clears to 0

---

### Scenario 4: Auto-Clear on Messages Page

**Steps:**
1. User A has 3 unread messages (badge shows "3")
2. User A clicks Messages icon in header
3. **Expected Result:**
   - Badge immediately clears to 0 (optimistic)
   - All toasts disappear
   - Messages page loads
   - Backend marks all conversations as read

**Visual Check:**
```
Before:                          After:
[Messages] (3) ←badge           [Messages] ←no badge
```

---

### Scenario 5: Badge Pulse Animation

**Steps:**
1. User A is on Dashboard
2. User B sends a message
3. **Expected Result:**
   - Badge appears with count
   - Badge pulses 2 times (scale 1.0 → 1.2 → 1.0)
   - Animation lasts ~1 second

---

### Scenario 6: Bell Icon Separation

**Steps:**
1. User A receives a message
2. User A clicks bell icon (🔔)
3. **Expected Result:**
   - Bell dropdown opens
   - NO message notifications shown
   - Only general notifications (likes, comments, etc.)
   - Message count NOT shown on bell icon

**Visual Check:**
```
Bell Dropdown:
┌─────────────────────────┐
│ Notifications           │
├─────────────────────────┤
│ 🔔 No new notifications │
│                         │
│ Likes, comments, and    │
│ updates will appear here│
└─────────────────────────┘

Messages should NOT appear here ✓
```

---

### Scenario 7: Mobile Responsive

**Steps:**
1. Resize browser to mobile width (< 768px)
2. User receives a message
3. **Expected Result:**
   - Toast appears from top (not right)
   - Toast is full width with margins
   - Still shows avatar, name, message

**Visual Check (Mobile):**
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │ 👤 John Doe             │ │
│ │ Hey, how are you?    [×]│ │
│ │ Just now                │ │
│ └─────────────────────────┘ │
│                             │
│  [Header]                   │
│  [Content]                  │
└─────────────────────────────┘
```

---

### Scenario 8: Page Visibility Auto-Clear

**Steps:**
1. User A is on Messages page
2. User A switches to another tab
3. User B sends messages (badge updates in background)
4. User A switches back to Messages tab
5. **Expected Result:**
   - Badge clears automatically
   - Toasts clear automatically
   - Conversations marked as read

---

## Console Checks

### Expected Console Logs

When new message arrives:
```
[NotificationContext] New message received: {id: "...", content: "..."}
[Messages] Clearing all unread messages
```

When Messages page opens:
```
[Messages] Loading conversations...
[Messages] Loaded conversations: 5
[Messages] Clearing all unread messages
```

### No Errors Expected

✅ No TypeScript errors
✅ No WebSocket connection errors
✅ No 404 or 500 API errors
✅ No React warnings

---

## Performance Checks

### Animation Smoothness
- Toast slide-in: Should be smooth 60fps
- Badge pulse: Should be smooth, no jank
- Multiple toasts: Should not lag

### Memory Leaks
- Open/close Messages page 10 times
- Check browser memory usage
- Should not continuously increase

### Network Efficiency
- WebSocket should stay connected
- Only necessary API calls made
- No polling or excessive requests

---

## Accessibility Checks

### Keyboard Navigation
1. Tab to Messages icon
2. Press Enter
3. **Expected**: Navigates to Messages page

### Screen Reader
1. Enable screen reader
2. Focus on Messages icon with badge
3. **Expected**: Announces "Messages, 3 unread messages"

### ARIA Labels
- Toast close button: "Close notification"
- Messages icon: "Messages"
- Badge: "3 notifications"

---

## Edge Cases to Test

### 1. Rapid Messages
- Send 10 messages in 1 second
- **Expected**: Only 3 toasts shown, others queued

### 2. Long Message Content
- Send a message with 500 characters
- **Expected**: Toast truncates to 50 chars + "..."

### 3. No Avatar
- Send message from user without avatar
- **Expected**: Shows initials in placeholder

### 4. WebSocket Disconnect
- Disconnect internet
- Reconnect
- **Expected**: WebSocket reconnects, messages sync

### 5. Page Refresh
- Have 5 unread messages
- Refresh page
- **Expected**: Badge shows 5, no toasts

---

## Browser Testing

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile Firefox

---

## Common Issues & Fixes

### Issue: Toast doesn't appear
**Check:**
- WebSocket connected? (Console: "Connected to messaging server")
- NotificationContext mounted?
- MessageToastContainer rendered?

**Fix:**
- Verify WebSocket connection
- Check NotificationContext provider wraps app
- Check AppLayout includes MessageToastContainer

---

### Issue: Badge doesn't clear
**Check:**
- clearMessageNotifications called?
- Backend API responding?
- updateUnreadCount called after clear?

**Fix:**
- Add console.log in clearAllUnread
- Check network tab for API calls
- Verify backend marks conversations as read

---

### Issue: Animations stuttering
**Check:**
- Browser performance
- Too many toasts?
- CSS conflicts?

**Fix:**
- Limit toasts to 3
- Check for conflicting animations
- Use Chrome DevTools Performance tab

---

## Success Criteria Checklist

- [ ] Toast appears on new message
- [ ] Toast shows correct sender info
- [ ] Toast auto-dismisses after 5s
- [ ] Click toast navigates to conversation
- [ ] Badge updates on new message
- [ ] Badge pulses on new message
- [ ] Badge clears when Messages opened
- [ ] No messages in bell dropdown
- [ ] Multiple toasts stack correctly
- [ ] Mobile responsive works
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] No console errors
- [ ] Smooth animations
- [ ] WebSocket stays connected

---

## Quick Start Testing

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Start frontend
cd ..
npm run dev

# Open two browsers:
# Browser 1: http://localhost:5173 (User A)
# Browser 2: http://localhost:5173 (Incognito, User B)

# Test flow:
# 1. Login both users
# 2. User B sends message to User A
# 3. Verify toast appears for User A
# 4. Verify badge updates
# 5. Click toast or Messages icon
# 6. Verify badge clears
```

---

## Video Recording Checklist

If recording demo:
1. Show toast appearing on new message
2. Show badge updating
3. Show badge pulse animation
4. Show multiple toasts stacking
5. Show clicking toast to navigate
6. Show badge clearing on Messages page
7. Show bell dropdown (no messages)
8. Show mobile responsive view

---

**Testing Status**: Ready for QA ✅
**Estimated Testing Time**: 30-45 minutes
**Priority**: High - Core messaging feature
