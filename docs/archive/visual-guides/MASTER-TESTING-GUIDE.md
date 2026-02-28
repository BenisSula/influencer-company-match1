# Master Testing Guide

Complete testing guide for all platform features.

---

## Test Accounts

### Influencer Account
```
Email: sarah.johnson@email.com
Password: Password123!
Role: influencer
Profile: Complete with portfolio
```

### Company Account
```
Email: mike.chen@techcorp.com
Password: Password123!
Role: company
Profile: Complete with company info
```

### Admin Account
```
Email: admin@platform.com
Password: Admin123!@#
Role: super_admin
Access: Full admin dashboard
```

---

## 1. Authentication Testing

### Registration Flow
```
1. Visit http://localhost:5173/
2. Click "Get Started" or "Sign Up"
3. Fill registration form:
   - Full name
   - Email
   - Password (min 8 chars, 1 uppercase, 1 number, 1 special)
   - Select role (Influencer/Company)
4. Complete role-specific fields
5. Submit registration
6. Verify redirect to /profile-setup
```

**Expected Result:** ✅ User created, logged in, redirected to profile setup

### Login Flow
```
1. Visit http://localhost:5173/
2. Click "Sign In"
3. Enter credentials
4. Click "Sign In"
5. Verify redirect to /dashboard
```

**Expected Result:** ✅ User logged in, token saved, dashboard loads

### Admin Login
```
1. Visit http://localhost:5173/admin/login
2. Enter admin credentials
3. Click "Sign In"
4. Verify redirect to /admin/dashboard
```

**Expected Result:** ✅ Admin logged in, admin dashboard loads

---

## 2. Profile Testing

### Profile Setup Wizard
```
1. Login as new user
2. Should auto-redirect to /profile-setup
3. Complete Step 1: Basic Info
   - Name, location, bio
4. Complete Step 2: Role-Specific
   - Influencer: Platforms, followers, niches
   - Company: Industry, budget, goals
5. Complete Step 3: Bio & Portfolio
   - Detailed bio
   - Portfolio links
6. Complete Step 4: Preferences
   - Match preferences
   - Collaboration preferences
7. Submit wizard
8. Verify redirect to /dashboard
```

**Expected Result:** ✅ Profile completed, dashboard shows matches

### Profile Edit
```
1. Visit /profile/edit
2. Update any field
3. Upload avatar image
4. Click "Save Changes"
5. Verify success message
6. Check /profile to see updates
```

**Expected Result:** ✅ Profile updated, changes visible

---

## 3. Matching System Testing

### Browse Matches
```
1. Login as influencer
2. Visit /matches
3. Verify match cards display
4. Check compatibility scores
5. Click "View Details" on a match
6. Verify profile view opens
```

**Expected Result:** ✅ Matches load, scores display, profiles viewable

### Filter Matches
```
1. On /matches page
2. Open filter panel (left sidebar)
3. Apply filters:
   - Budget range
   - Location
   - Industry/Niche
   - Follower count
4. Verify matches update
5. Clear filters
6. Verify all matches return
```

**Expected Result:** ✅ Filters work, matches update dynamically

### Match Comparison
```
1. On /matches page
2. Select 2-3 matches (checkboxes)
3. Click "Compare" button
4. Verify comparison page opens
5. Check comparison table
6. Check comparison charts
7. Remove a match from comparison
8. Verify updates
```

**Expected Result:** ✅ Comparison works, charts display, dynamic updates

### Send Connection Request
```
1. On match card, click "Connect"
2. Fill collaboration request modal:
   - Project title
   - Description
   - Budget
   - Timeline
3. Submit request
4. Verify success message
5. Check button changes to "Pending"
```

**Expected Result:** ✅ Request sent, button state updates

---

## 4. Messaging Testing

### Start Conversation
```
1. Login as user A
2. Visit /matches or /connections
3. Click "Message" on a connected user
4. Verify redirect to /messages
5. Verify conversation opens
6. Type message and send
7. Verify message appears
```

**Expected Result:** ✅ Conversation created, message sent

### Real-time Messaging
```
1. Open two browser windows
2. Login as user A in window 1
3. Login as user B in window 2
4. User A sends message to user B
5. Verify message appears in user B's window (real-time)
6. User B replies
7. Verify reply appears in user A's window
```

**Expected Result:** ✅ Real-time updates work, no refresh needed

### Message Notifications
```
1. User A on /dashboard
2. User B sends message to user A
3. Verify notification badge appears (header)
4. Verify toast notification appears
5. Click notification
6. Verify redirect to /messages
```

**Expected Result:** ✅ Notifications work, navigation works

---

## 5. Connection Management Testing

### Accept Connection Request
```
1. Login as user B (receiver)
2. Visit /connections
3. Find pending request from user A
4. Click "Accept"
5. Verify status changes to "Connected"
6. Verify "Message" button appears
7. Click "Message"
8. Verify redirect to /messages
```

**Expected Result:** ✅ Connection accepted, messaging enabled

### Collaboration Feedback
```
1. Login as user with completed collaboration
2. Visit /connections
3. Find completed collaboration
4. Click "Leave Feedback"
5. Fill feedback form:
   - Rating (1-5 stars)
   - Success level
   - Comments
6. Submit feedback
7. Verify success message
```

**Expected Result:** ✅ Feedback submitted, AI learns from data

---

## 6. Social Feed Testing

### Create Post
```
1. Login as any user
2. Visit /feed
3. Click "What's on your mind?"
4. Type post content
5. Add image (optional)
6. Add hashtags (optional)
7. Click "Post"
8. Verify post appears at top of feed
```

**Expected Result:** ✅ Post created, appears in feed

### Interact with Posts
```
1. On /feed page
2. Like a post (click heart icon)
3. Verify like count increases
4. Comment on post
5. Verify comment appears
6. Share post
7. Verify share modal opens
8. Save post
9. Verify saved to /saved
```

**Expected Result:** ✅ All interactions work, counts update

---

## 7. Campaign System Testing

### Create Campaign (Company)
```
1. Login as company user
2. Visit /campaigns
3. Click "Create Campaign"
4. Fill campaign form:
   - Title
   - Description
   - Budget
   - Requirements
   - Timeline
5. Submit campaign
6. Verify campaign appears in list
```

**Expected Result:** ✅ Campaign created, visible in list

### Apply to Campaign (Influencer)
```
1. Login as influencer
2. Visit /campaigns
3. Browse campaigns
4. Click "View Details" on a campaign
5. Click "Apply"
6. Fill application form
7. Submit application
8. Verify success message
```

**Expected Result:** ✅ Application submitted, status tracked

---

## 8. Payment System Testing

### Payment Flow
```
1. Login as company
2. Accept collaboration request
3. Click "Pay Now"
4. Verify redirect to /payments/checkout/:id
5. Fill Stripe payment form:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
6. Submit payment
7. Verify redirect to /payments/success
8. Check wallet balance updated
```

**Expected Result:** ✅ Payment processed, wallet updated

### Stripe Onboarding
```
1. Login as influencer
2. Visit /onboarding/influencer
3. Complete Stripe Connect onboarding
4. Verify redirect to /onboarding/complete
5. Check Stripe account linked
```

**Expected Result:** ✅ Stripe account connected, can receive payouts

---

## 9. Admin Dashboard Testing

### User Management
```
1. Login as admin
2. Visit /admin/users
3. View user list
4. Search for user
5. Click user to view details
6. Edit user (if needed)
7. Verify pagination works
```

**Expected Result:** ✅ User list loads, search works, pagination works

### Analytics Dashboard
```
1. Visit /admin/analytics
2. Verify charts load
3. Check metrics:
   - Total users
   - Active users
   - Revenue
   - Matches created
4. Change date range
5. Verify data updates
```

**Expected Result:** ✅ Analytics load, charts display, filters work

### Content Moderation
```
1. Visit /admin/moderation
2. View flagged content
3. Review content
4. Take action (approve/remove)
5. Verify action applied
```

**Expected Result:** ✅ Moderation tools work, actions apply

---

## 10. AI/ML Testing

### AI Match Scoring
```
1. Login as any user
2. Visit /matches
3. Check compatibility scores on match cards
4. Click "View Breakdown"
5. Verify AI score breakdown shows:
   - Overall score
   - Factor scores (budget, niche, etc.)
   - Explanation
```

**Expected Result:** ✅ AI scores display, breakdown detailed

### Smart Recommendations
```
1. On /dashboard
2. Check right sidebar
3. Verify "Suggested Matches" widget
4. Check recommended matches
5. Click "View Profile"
6. Verify profile opens
```

**Expected Result:** ✅ Recommendations load, based on AI

### AI Chatbot
```
1. On any page (except /admin, /messages)
2. Click chatbot icon (bottom right)
3. Type message: "How does matching work?"
4. Verify AI response
5. Ask follow-up question
6. Verify context-aware response
```

**Expected Result:** ✅ Chatbot responds, understands context

---

## 11. Landing Page Testing

### Real-time Statistics
```
1. Visit http://localhost:5173/
2. Check statistics section
3. Verify numbers display
4. Wait 5 seconds
5. Verify numbers update (WebSocket)
```

**Expected Result:** ✅ Stats display, update in real-time

### ROI Calculator
```
1. On landing page
2. Scroll to ROI Calculator
3. Enter follower count: 50000
4. Select platform: Instagram
5. Select niche: Fashion
6. Verify calculation shows:
   - Estimated earnings
   - ROI projection
   - Comparison chart
```

**Expected Result:** ✅ Calculator works, shows realistic numbers

### Live Activity Feed
```
1. On landing page
2. Check "Recent Activity" section
3. Verify activities display
4. Wait for updates
5. Verify new activities appear
```

**Expected Result:** ✅ Activities display, update in real-time

---

## 12. Mobile Testing

### Responsive Design
```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test breakpoints:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1024px+
4. Verify layouts adapt
5. Test navigation
6. Test forms
```

**Expected Result:** ✅ All layouts responsive, no overflow

### Touch Interactions
```
1. Test on actual mobile device
2. Test swipe gestures
3. Test tap interactions
4. Test mobile navigation
5. Test form inputs
```

**Expected Result:** ✅ Touch events work, no lag

---

## Automated Testing

### Run Frontend Tests
```bash
npm test
```

### Run Backend Tests
```bash
cd backend
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

---

## Performance Testing

### Lighthouse Audit
```
1. Open DevTools
2. Go to Lighthouse tab
3. Run audit
4. Check scores:
   - Performance: >80
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >90
```

### Bundle Size Check
```bash
npm run build
# Check output for chunk sizes
# Admin chunk should be separate
# Landing chunk should be separate
```

---

## Load Testing

### Concurrent Users
```bash
# Use load testing tool
cd backend/test/load
node payment-load-test.js
```

### API Performance
```bash
# Test API response times
# Use Postman or similar tool
# Target: <200ms for most endpoints
```

---

## Verification Checklist

### Core Functionality
- [ ] Registration works
- [ ] Login works
- [ ] Profile setup works
- [ ] Matches display
- [ ] Messaging works
- [ ] Connections work
- [ ] Feed works
- [ ] Payments work (test mode)
- [ ] Admin dashboard accessible

### Real-time Features
- [ ] WebSocket connects
- [ ] Messages arrive in real-time
- [ ] Notifications appear
- [ ] Landing stats update
- [ ] Activity feed updates

### Performance
- [ ] Initial load <3s
- [ ] Route transitions smooth
- [ ] No console errors
- [ ] No memory leaks
- [ ] Mobile responsive

### Security
- [ ] Protected routes work
- [ ] Admin routes protected
- [ ] JWT authentication works
- [ ] CORS configured
- [ ] SQL injection prevented

---

## Common Test Scenarios

### Scenario 1: Complete User Journey
```
1. Register as influencer
2. Complete profile setup
3. Browse matches
4. Send connection request
5. Receive acceptance
6. Start conversation
7. Complete collaboration
8. Leave feedback
```

### Scenario 2: Company Campaign Flow
```
1. Register as company
2. Complete profile setup
3. Create campaign
4. Receive applications
5. Review applications
6. Accept application
7. Process payment
8. Track collaboration
```

### Scenario 3: Admin Management
```
1. Login as admin
2. View user analytics
3. Moderate content
4. Manage tenants
5. Configure system settings
6. Review payments
7. Check audit logs
```

---

## Test Scripts

### Quick Test Scripts (JavaScript)
Located in project root:
- `test-admin-login.js` - Test admin authentication
- `test-messaging-system.js` - Test messaging
- `test-collaboration-request.js` - Test collaboration
- `test-payment-confirm.js` - Test payments
- `test-suggested-matches.js` - Test AI matching

### Run Test Script
```bash
node test-admin-login.js
```

---

## Browser Testing

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Test Each Browser
```
1. Open in browser
2. Test core features
3. Check console for errors
4. Verify styling
5. Test responsive design
```

---

## API Testing

### Using Postman/Insomnia

#### Test Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "sarah.johnson@email.com",
  "password": "Password123!"
}

Expected: 200 OK with token
```

#### Test Get Matches
```
GET http://localhost:3000/api/matches
Authorization: Bearer <token>

Expected: 200 OK with matches array
```

#### Test Send Message
```
POST http://localhost:3000/api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": 2,
  "content": "Hello!"
}

Expected: 201 Created with message object
```

---

## Database Testing

### Verify Data
```sql
-- Check users
SELECT id, email, role, profile_completed FROM users;

-- Check profiles
SELECT * FROM influencer_profiles;
SELECT * FROM company_profiles;

-- Check matches
SELECT * FROM matches LIMIT 10;

-- Check connections
SELECT * FROM connections WHERE status = 'accepted';

-- Check messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

---

## WebSocket Testing

### Test Real-time Updates
```javascript
// Browser console
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('message', (data) => {
  console.log('Message received:', data);
});

// Send test message
socket.emit('sendMessage', {
  conversationId: 1,
  content: 'Test message'
});
```

---

## Performance Testing

### Measure Load Time
```javascript
// Browser console
performance.timing.loadEventEnd - performance.timing.navigationStart
// Should be <3000ms
```

### Check Bundle Sizes
```bash
npm run build
# Check dist/renderer/assets/
# Verify chunks are properly split
```

---

## Regression Testing

### After Code Changes
```
1. Run build: npm run build
2. Check for errors
3. Test core features:
   - Login
   - Matches
   - Messaging
   - Connections
4. Check console for errors
5. Verify no broken functionality
```

---

## Test Data

### Seed Database
```bash
cd backend
npm run seed
```

**Creates:**
- 10 influencer users
- 10 company users
- 50+ matches
- Sample connections
- Sample messages
- Sample feed posts
- Sample campaigns

---

## Continuous Testing

### Pre-commit Checks
```bash
# Run before committing
npm run type-check
npm run lint
npm test
```

### Pre-deployment Checks
```bash
# Run before deploying
npm run build
cd backend & npm run build
npm run test:e2e
```

---

## Known Issues & Workarounds

### Issue: WebSocket Disconnects
**Workaround:** Refresh page, connection auto-reconnects

### Issue: Image Upload Slow
**Workaround:** Compress images before upload, use WebP format

### Issue: Admin Dashboard Slow Load
**Workaround:** Admin pages are lazy-loaded, first load may be slower

---

## Test Coverage Goals

### Target Coverage
- Unit Tests: >80%
- Integration Tests: >70%
- E2E Tests: Critical paths covered

### Priority Areas
1. Authentication (100%)
2. Matching algorithm (90%)
3. Payment processing (100%)
4. Messaging (90%)
5. Admin functions (80%)

---

**Last Updated:** 2024  
**Platform Version:** 1.0  
**Test Status:** Comprehensive ✅
