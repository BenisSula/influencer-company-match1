# Admin Dashboard Access Guide

## 🚀 Quick Access

The admin dashboard is now accessible at:

**URL:** http://localhost:5173/admin/login

---

## 🔐 Login Credentials

### Super Admin Account
- **Email:** `admin@platform.com`
- **Password:** `Admin123!@#`

---

## 📍 Available Admin Routes

Once logged in, you can access:

1. **Dashboard** - http://localhost:5173/admin/dashboard
   - User statistics
   - Role breakdown
   - Quick actions

2. **Branding** - http://localhost:5173/admin/branding
   - Customize colors (6 color pickers)
   - Upload logo & favicon
   - Edit platform name, tagline, footer
   - Custom CSS editor

3. **Feature Flags** - http://localhost:5173/admin/features
   - Toggle 9 platform features
   - Real-time enable/disable
   - Auto-save

---

## 🎨 What You Can Customize

### Colors Tab
- Primary Color (#E1306C)
- Secondary Color (#5B51D8)
- Accent Color (#FD8D32)
- Success Color (#00D95F)
- Warning Color (#FFCC00)
- Info Color (#0095F6)

### Content Tab
- Platform Name
- Tagline
- Footer Text
- Font Family (6 options)

### Assets Tab
- Logo upload
- Favicon upload

### Custom CSS Tab
- Add custom CSS code
- Override default styles

---

## 🎯 Feature Flags You Can Toggle

1. **Campaigns** - Campaign management system
2. **Messaging** - Direct messaging
3. **Social Feed** - Posts and interactions
4. **AI Matching** - AI-powered matching
5. **Analytics** - Dashboard analytics
6. **Reviews & Ratings** - User reviews
7. **Global Search** - Platform-wide search
8. **Notifications** - Real-time notifications
9. **Collaborations** - Collaboration tracking

---

## 🔧 Setup Steps (If Not Already Done)

### 1. Ensure Servers Are Running

Both servers should be running:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:5173

### 2. Create Super Admin (If Needed)

If you haven't created a super admin yet:

```bash
cd backend
node create-super-admin.js
```

This creates the default admin account with credentials above.

### 3. Run Database Migrations (If Needed)

```bash
cd backend
npm run migration:run
```

---

## 🎬 How to Use

### Step 1: Login
1. Navigate to http://localhost:5173/admin/login
2. Enter email: `admin@platform.com`
3. Enter password: `Admin123!@#`
4. Click "Sign In"

### Step 2: View Dashboard
- See user statistics
- View role breakdown
- Access quick actions

### Step 3: Customize Branding
1. Click "Branding" in navigation
2. Choose a tab (Colors, Content, Assets, CSS)
3. Make your changes
4. Click "Save Changes"

### Step 4: Toggle Features
1. Click "Feature Flags" in navigation
2. Toggle any feature on/off
3. Changes save automatically

---

## 🎨 Design Preview

The admin dashboard features:
- **Professional gradient design**
- **Fully responsive** (desktop, tablet, mobile)
- **Smooth animations**
- **Consistent brand colors**
- **Real-time updates**

---

## 🔍 Troubleshooting

### Can't Access Admin Login?
- Check if frontend is running: http://localhost:5173
- Check browser console for errors
- Clear browser cache and reload

### Login Not Working?
- Verify super admin was created
- Check backend is running: http://localhost:3000
- Check backend console for errors

### Changes Not Saving?
- Check backend connection
- Check browser console for API errors
- Verify JWT token is valid

---

## 📊 Current Implementation Status

✅ **Phase 1:** Core Admin Infrastructure (100%)
✅ **Phase 2:** Payment & Subscription (100%)
✅ **Phase 3:** User Management (100%)
✅ **Phase 4:** Platform Configuration (100%)
⏳ **Phase 5:** Analytics & Reporting (0%)
⏳ **Phase 6:** Content Moderation (0%)
⏳ **Phase 7:** System Settings (0%)

**Overall Progress:** 57% Complete (4/7 Phases)

---

## 🎯 Next Steps

After exploring the admin dashboard:

1. **Customize Your Brand**
   - Change colors to match your brand
   - Upload your logo
   - Update platform name

2. **Configure Features**
   - Enable/disable features based on your needs
   - Test feature toggles

3. **Explore User Management**
   - View user statistics
   - Filter and search users

4. **Plan Phase 5**
   - Analytics dashboard
   - Custom reports
   - Revenue tracking

---

## 📞 Need Help?

Check these documents:
- `ADMIN-DASHBOARD-CURRENT-STATUS.md` - Full status overview
- `ADMIN-DASHBOARD-SETUP-COMPLETE-GUIDE.md` - Detailed setup
- `ADMIN-CREDENTIALS.md` - All credentials
- `WHITE-LABEL-ADMIN-DASHBOARD-MASTER-PLAN.md` - Complete plan

---

**Ready to go!** Open http://localhost:5173/admin/login in your browser now! 🚀
