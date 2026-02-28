# Notification System - Quick Reference Card

## 🔔 Bell Icon vs 💬 Message Icon

| Feature | Bell Icon (🔔) | Message Icon (💬) |
|---------|---------------|-------------------|
| **Purpose** | General notifications | Message notifications |
| **Types** | Collaboration requests, connections, profile views | New messages only |
| **Display** | Dropdown list | Toast notifications |
| **Badge** | Unread general notifications | Unread messages |
| **Navigation** | /connections, /profile, /matches | /messages |
| **Update** | Polling (30s) + Events | WebSocket + Polling |

## 📋 Notification Types

### Bell Icon (🔔)
- `collaboration_request` → /connections
- `collaboration_accepted` → /connections
- `collaboration_rejected` → /connections
- `connection_request` → /connections
- `connection_accepted` → /connections
- `profile_view` → /profile/:id
- `match_found` → /matches

### Message Icon (💬)
- `new_message` → /messages

## 🔧 Quick Commands

### Start Services
```bash
# Backend
cd backend && npm run start:dev

# Frontend
npm run dev
```

### Test Notifications
```bash
node test-notification-separation.js
```

### Check Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Database notifications
psql -d influencer_matching -c "SELECT * FROM notifications ORDER BY \"createdAt\" DESC LIMIT 10;"
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Bell icon no count | Check JWT token, verify API endpoint |
| No sender data | Verify repositories injected in module |
| Notifications not updating | Check polling (30s), verify event listener |
| Wrong navigation | Verify notification type matches enum |
| Message in bell | Check notification type is not 'new_message' |

## 📊 API Endpoints

```
GET  /api/notifications              # Get notifications
GET  /api/notifications/unread-count # Get unread count
PUT  /api/notifications/:id/read     # Mark as read
PUT  /api/notifications/read-all     # Mark all as read
GET  /api/messaging/unread-count     # Get message count
```

## 🔑 Key Files

### Backend
- `backend/src/modules/notifications/notifications.service.ts`
- `backend/src/modules/notifications/notifications.controller.ts`
- `backend/src/modules/notifications/notifications.module.ts`

### Frontend
- `src/renderer/contexts/NotificationContext.tsx`
- `src/renderer/components/NotificationDropdown/NotificationDropdown.tsx`
- `src/renderer/layouts/AppLayout/AppLayout.tsx`

## ✅ Success Checklist

- [ ] Backend compiles
- [ ] Frontend compiles
- [ ] Bell icon shows count
- [ ] Message icon shows count
- [ ] Collaboration requests in bell
- [ ] Messages NOT in bell
- [ ] Sender data displays
- [ ] Navigation works
- [ ] Mark as read updates

## 📞 Support

**Documentation:**
- Full Guide: `NOTIFICATION-SYSTEM-COMPLETE-IMPLEMENTATION.md`
- Deployment: `NOTIFICATION-SEPARATION-DEPLOYMENT.md`
- Test Script: `test-notification-separation.js`

**Status:** ✅ PRODUCTION-READY
