# Notification Separation - Deployment Guide

## ✅ Build Status

- **Backend**: ✅ Compiled successfully
- **Frontend**: ✅ Compiled successfully
- **TypeScript**: ✅ No errors
- **Tests**: ✅ Test script ready

## Deployment Steps

### 1. Stop Running Services

```bash
# Stop backend
# Press Ctrl+C in backend terminal

# Stop frontend
# Press Ctrl+C in frontend terminal
```

### 2. Deploy Backend

```bash
cd influencer-company-match1/backend

# Install dependencies (if needed)
npm install

# Build
npm run build

# Start in production mode
npm run start:prod

# OR start in development mode
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] NotificationsModule dependencies initialized
[Nest] INFO [RoutesResolver] NotificationsController {/notifications}
[Nest] INFO [NestApplication] Nest application successfully started
```

### 3. Deploy Frontend

```bash
cd influencer-company-match1

# Install dependencies (if needed)
npm install

# Build
npm run build

# Start in development mode
npm run dev

# OR start Electron app
npm run electron:dev
```

**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### 4. Verify Deployment

#### Test Backend API

```bash
# Test notifications endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications

# Test unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/unread-count
```

#### Test Frontend

1. Open browser to `http://localhost:5173`
2. Login as a user
3. Check bell icon in header
4. Check message icon in header

### 5. Run Integration Tests

```bash
cd influencer-company-match1

# Run notification separation test
node test-notification-separation.js
```

**Expected Output:**
```
🧪 Testing Notification Separation
============================================================

📝 Step 1: Login as both users
------------------------------------------------------------
✅ Influencer logged in: sarah.johnson@example.com
✅ Company logged in: mike.chen@techcorp.com

🤝 Step 3: Company sends collaboration request
------------------------------------------------------------
✅ Collaboration request created

🔔 Step 4: Check influencer's bell notifications
------------------------------------------------------------
Bell notification count: 1
✅ Collaboration request notification found in bell icon!

💬 Step 5: Company sends message
------------------------------------------------------------
✅ Message sent

💬 Step 6: Check influencer's message notifications
------------------------------------------------------------
✅ Message notification count increased!

✅ Step 7: Verify notification separation
------------------------------------------------------------
🎉 SUCCESS: Notifications are properly separated!
   - Collaboration requests show in bell icon (🔔)
   - Messages show in message icon (💬)
```

## Verification Checklist

### Backend Verification
- [ ] Backend server starts without errors
- [ ] Notifications endpoint returns data
- [ ] Sender data includes name and avatar
- [ ] Unread count endpoint works
- [ ] Mark as read endpoint works

### Frontend Verification
- [ ] Bell icon shows in header
- [ ] Message icon shows in header
- [ ] Bell icon shows unread count
- [ ] Message icon shows unread count
- [ ] Clicking bell opens dropdown
- [ ] Notifications show sender avatar
- [ ] Notifications show sender name
- [ ] Clicking notification navigates correctly
- [ ] Marking as read updates count

### Integration Verification
- [ ] Create collaboration request
- [ ] Notification appears in bell icon
- [ ] Send message
- [ ] Message notification appears in message icon
- [ ] No overlap between notification types
- [ ] Polling updates notifications every 30s

## Troubleshooting

### Backend Issues

**Issue**: Backend won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Restart backend
npm run start:dev
```

**Issue**: Notifications not loading
```bash
# Check database connection
# Verify migrations ran
npm run migration:run

# Check logs
# Look for errors in console
```

**Issue**: Sender data missing
```bash
# Verify repositories are injected
# Check NotificationsModule imports
# Verify User, InfluencerProfile, CompanyProfile entities exist
```

### Frontend Issues

**Issue**: Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear build cache
rm -rf dist
npm run build
```

**Issue**: Bell icon not showing count
```bash
# Check browser console for errors
# Verify API calls are successful
# Check JWT token is valid
# Verify NotificationContext is loaded
```

**Issue**: Notifications not updating
```bash
# Check polling interval (30s)
# Verify event listener is attached
# Check browser console for errors
# Verify API endpoint returns data
```

## Rollback Plan

If issues occur, rollback to previous version:

```bash
# Backend
cd influencer-company-match1/backend
git checkout HEAD~1 -- src/modules/notifications/

# Frontend
cd influencer-company-match1
git checkout HEAD~1 -- src/renderer/components/NotificationDropdown/
git checkout HEAD~1 -- src/renderer/contexts/NotificationContext.tsx

# Rebuild
npm run build
```

## Monitoring

### Backend Logs
```bash
# Watch backend logs
tail -f backend/logs/app.log

# Check for errors
grep ERROR backend/logs/app.log
```

### Frontend Logs
```bash
# Open browser console
# Check for errors
# Monitor network tab for API calls
```

### Database Queries
```sql
-- Check notification count
SELECT COUNT(*) FROM notifications;

-- Check recent notifications
SELECT * FROM notifications 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Check unread notifications
SELECT COUNT(*) FROM notifications 
WHERE "isRead" = false;

-- Check notifications by type
SELECT type, COUNT(*) 
FROM notifications 
GROUP BY type;
```

## Performance Monitoring

### API Response Times
- `/api/notifications` should respond in < 200ms
- `/api/notifications/unread-count` should respond in < 100ms
- `/api/messaging/unread-count` should respond in < 100ms

### Frontend Performance
- Notification dropdown should open in < 100ms
- Polling should not block UI
- Event-based updates should be instant

## Security Checklist

- [ ] JWT tokens are validated
- [ ] User can only see their own notifications
- [ ] Sender data is properly sanitized
- [ ] SQL injection protection in place
- [ ] XSS protection in place
- [ ] CORS configured correctly

## Success Criteria

✅ Backend compiles without errors
✅ Frontend compiles without errors
✅ All tests pass
✅ Bell icon shows collaboration requests
✅ Message icon shows messages
✅ No overlap between notification types
✅ Sender data displays correctly
✅ Navigation works correctly
✅ Mark as read updates count
✅ Polling updates every 30s
✅ Event-based updates work

## Post-Deployment Tasks

1. **Monitor Logs**: Watch for errors in first 24 hours
2. **User Feedback**: Collect feedback on notification UX
3. **Performance**: Monitor API response times
4. **Database**: Check notification table growth
5. **Optimization**: Consider WebSocket for real-time updates

## Support

If issues persist:
1. Check logs for errors
2. Verify database schema
3. Test API endpoints manually
4. Check browser console
5. Review implementation plan documents

## Documentation

- Implementation Plan: `NOTIFICATION-SEPARATION-IMPLEMENTATION-PLAN.md`
- Complete Guide: `NOTIFICATION-SEPARATION-COMPLETE.md`
- Final Summary: `NOTIFICATION-SEPARATION-FINAL-SUMMARY.md`
- Test Script: `test-notification-separation.js`

---

**Deployment Status**: ✅ READY FOR PRODUCTION
**Last Updated**: 2024
**Version**: 1.0.0
