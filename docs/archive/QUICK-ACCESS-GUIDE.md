# 🚀 Quick Access Guide

## System URLs

### Frontend Application
**URL:** http://localhost:5173

#### Main Pages
- **Landing Page:** http://localhost:5173/
- **Login:** http://localhost:5173/auth (click Login)
- **Register:** http://localhost:5173/auth (click Register)
- **Dashboard:** http://localhost:5173/dashboard (after login)
- **Profile:** http://localhost:5173/profile (after login)
- **Matches:** http://localhost:5173/matches (after login)
- **Messages:** http://localhost:5173/messages (after login)
- **Feed:** http://localhost:5173/feed (after login)
- **Connections:** http://localhost:5173/connections (after login)
- **Settings:** http://localhost:5173/settings (after login)

#### Admin Dashboard
- **Admin Login:** http://localhost:5173/admin
- **Admin Dashboard:** http://localhost:5173/admin/dashboard (after admin login)
- **User Management:** http://localhost:5173/admin/users
- **Analytics:** http://localhost:5173/admin/analytics
- **Moderation:** http://localhost:5173/admin/moderation
- **Platform Config:** http://localhost:5173/admin/branding
- **System Settings:** http://localhost:5173/admin/system-settings

### Backend API
**Base URL:** http://localhost:3000/api

#### API Endpoints
- **Auth:** http://localhost:3000/api/auth/*
- **Users:** http://localhost:3000/api/users/*
- **Profiles:** http://localhost:3000/api/profiles/*
- **Matching:** http://localhost:3000/api/matching/*
- **Messages:** http://localhost:3000/api/messages/*
- **Feed:** http://localhost:3000/api/feed/*
- **Campaigns:** http://localhost:3000/api/campaigns/*
- **Admin:** http://localhost:3000/api/admin/*

---

## Test Credentials

### Regular Users

#### Influencer Account
- **Email:** sarah.johnson@example.com
- **Password:** password123
- **Role:** Influencer
- **Name:** Sarah Johnson

#### Company Account
- **Email:** mike.chen@techstartup.com
- **Password:** password123
- **Role:** Company
- **Name:** Mike Chen
- **Company:** TechStartup Inc.

### Admin Account
- **Email:** admin@platform.com
- **Password:** Admin123!@#
- **Role:** Super Admin

---

## Server Management

### Check Server Status
Both servers are currently running as background processes:
- **Backend:** Process #4 (port 3000)
- **Frontend:** Process #5 (port 5173)

### Stop Servers
To stop the servers, you can:
1. Use Ctrl+C in the terminal where they're running
2. Or stop the background processes using the process management tools

### Restart Servers

#### Backend
```bash
cd backend
npm run start:dev
```

#### Frontend
```bash
npm run dev
```

---

## Development Workflow

### Making Changes

#### Backend Changes
1. Edit files in `backend/src/`
2. Server auto-restarts (ts-node-dev)
3. Changes reflect immediately

#### Frontend Changes
1. Edit files in `src/renderer/`
2. Vite hot-reloads automatically
3. Browser updates instantly

### Database Changes
```bash
cd backend

# Create new migration
npm run migration:create -- src/database/migrations/YourMigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

---

## Testing the Application

### 1. Open Frontend
Navigate to: http://localhost:5173

### 2. Register New Account
- Click "Get Started" or "Sign Up"
- Choose role (Influencer or Company)
- Fill in registration form
- Complete profile setup

### 3. Test Features
- ✅ Browse matches
- ✅ Send connection requests
- ✅ Exchange messages
- ✅ Create feed posts
- ✅ View analytics
- ✅ Update profile

### 4. Test Admin Dashboard
- Navigate to: http://localhost:5173/admin
- Login with admin credentials
- Explore admin features

---

## API Testing

### Using cURL

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "INFLUENCER"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@example.com",
    "password": "password123"
  }'
```

#### Get Matches (with auth token)
```bash
curl -X GET http://localhost:3000/api/matching/matches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Frontend Not Loading
1. Check if Vite server is running (port 5173)
2. Check browser console for errors
3. Clear browser cache
4. Restart frontend server

### Backend Not Responding
1. Check if backend server is running (port 3000)
2. Check backend console for errors
3. Verify database connection
4. Restart backend server

### Database Issues
1. Ensure PostgreSQL is running
2. Check connection settings in `.env`
3. Run migrations: `npm run migration:run`
4. Check database logs

### Build Errors
1. Clear node_modules: `rm -rf node_modules`
2. Reinstall: `npm install`
3. Clear TypeScript cache: `rm -rf dist`
4. Rebuild: `npm run build`

---

## Quick Commands

### Backend
```bash
cd backend

# Start dev server
npm run start:dev

# Run migrations
npm run migration:run

# Create migration
npm run migration:create

# Seed database
npm run seed

# Build for production
npm run build
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

---

## System Status

✅ **Backend:** Running on port 3000  
✅ **Frontend:** Running on port 5173  
✅ **Database:** Connected and migrated  
✅ **WebSocket:** Active for real-time features  

**All systems operational!**
