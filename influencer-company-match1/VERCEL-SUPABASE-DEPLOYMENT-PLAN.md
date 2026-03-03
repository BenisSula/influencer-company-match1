# 🚀 VERCEL + SUPABASE DEPLOYMENT PLAN

## 📊 CURRENT ARCHITECTURE ANALYSIS

Your app has:
- **Frontend**: React + Vite (in `src/renderer/`)
- **Backend**: NestJS API (in `backend/`)
- **Database**: PostgreSQL (currently trying Render)
- **ML Services**: Python FastAPI services

## 🎯 NEW ARCHITECTURE (Vercel + Supabase)

### What Changes:
1. **Frontend** → Vercel (Static Site)
2. **Backend** → Keep NestJS but deploy to Vercel Serverless Functions
3. **Database** → Supabase PostgreSQL (free 500MB)
4. **Auth** → Can use Supabase Auth (optional, or keep your NestJS auth)
5. **ML Services** → Keep on Render (they work fine)

### Why This Works Better:
- ✅ Vercel handles frontend perfectly (zero config)
- ✅ Supabase gives you reliable PostgreSQL + real-time features
- ✅ No more "root directory" issues
- ✅ All FREE tier, no credit card needed
- ✅ Better performance with CDN

---

## 📝 STEP-BY-STEP IMPLEMENTATION

### PHASE 1: Setup Supabase Database (10 minutes)

#### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up (free, no credit card)
3. Click "New Project"
4. Name: `influencer-match`
5. Database Password: (save this!)
6. Region: Choose closest to you
7. Click "Create Project" (takes 2 minutes)

#### 1.2 Get Database Connection String
1. In Supabase dashboard, click "Project Settings" (gear icon)
2. Click "Database" in sidebar
3. Scroll to "Connection string"
4. Copy the "URI" format (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual password

#### 1.3 Run Migrations on Supabase
You'll run your existing TypeORM migrations against Supabase.

---

### PHASE 2: Prepare Backend for Vercel (15 minutes)

Your NestJS backend needs minor adjustments to work as Vercel serverless functions.

#### 2.1 Create Vercel Configuration

**File: `backend/vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 2.2 Update Backend Package.json

Add to `backend/package.json`:
```json
{
  "scripts": {
    "vercel-build": "npm run build",
    "start:vercel": "node dist/main.js"
  }
}
```

#### 2.3 Update Database Config

**File: `backend/src/config/database.config.ts`**

Make sure it reads from `DATABASE_URL` environment variable (it already does).

---

### PHASE 3: Prepare Frontend for Vercel (5 minutes)

#### 3.1 Create Vercel Configuration

**File: `vercel.json` (in root)**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 3.2 Update Environment Variables

**File: `.env.production`** (create this)
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

### PHASE 4: Deploy to Vercel (10 minutes)

#### 4.1 Deploy Frontend

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repo
5. Vercel auto-detects Vite
6. **Root Directory**: Leave as `.` (root)
7. **Framework Preset**: Vite
8. **Build Command**: `npm run build`
9. **Output Directory**: `dist`
10. Add Environment Variable:
    - Key: `VITE_API_URL`
    - Value: (we'll add this after backend deploy)
11. Click "Deploy"

#### 4.2 Deploy Backend

1. In Vercel dashboard, click "Add New" → "Project"
2. Import SAME GitHub repo
3. **Root Directory**: `backend`
4. **Framework Preset**: Other
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Add Environment Variables:
    - `DATABASE_URL`: (your Supabase connection string)
    - `JWT_SECRET`: (your secret)
    - `NODE_ENV`: `production`
    - `CORS_ORIGIN`: (your frontend Vercel URL)
8. Click "Deploy"

#### 4.3 Update Frontend API URL

1. Go to frontend project in Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` with your backend URL
4. Redeploy frontend

---

### PHASE 5: Run Database Migrations (5 minutes)

#### Option A: Using Supabase SQL Editor
1. In Supabase dashboard, click "SQL Editor"
2. Copy your migration SQL files
3. Run them one by one

#### Option B: Using Local TypeORM CLI
```bash
cd backend
DATABASE_URL="your-supabase-url" npm run typeorm migration:run
```

---

## 🔧 CODE CHANGES NEEDED

### 1. Update CORS Configuration

**File: `backend/src/main.ts`**

```typescript
// Update CORS to allow Vercel frontend
app.enableCors({
  origin: [
    process.env.CORS_ORIGIN,
    'https://your-frontend.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true,
});
```

### 2. Update API Base URL

**File: `src/renderer/services/api-client.ts`**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 3. Handle Serverless Cold Starts

**File: `backend/src/main.ts`**

Add at the top:
```typescript
// Keep connection alive for serverless
if (process.env.VERCEL) {
  setInterval(() => {
    console.log('Keep-alive ping');
  }, 5 * 60 * 1000); // Every 5 minutes
}
```

---

## 🎯 MIGRATION CHECKLIST

### Before Deployment:
- [ ] Create Supabase account
- [ ] Create Supabase project
- [ ] Get database connection string
- [ ] Create Vercel account
- [ ] Link GitHub repo to Vercel

### Backend Deployment:
- [ ] Create `backend/vercel.json`
- [ ] Update `backend/package.json` scripts
- [ ] Deploy backend to Vercel
- [ ] Add environment variables in Vercel
- [ ] Test backend health endpoint

### Frontend Deployment:
- [ ] Create root `vercel.json`
- [ ] Create `.env.production`
- [ ] Deploy frontend to Vercel
- [ ] Update API URL environment variable
- [ ] Test frontend loads

### Database Setup:
- [ ] Run migrations on Supabase
- [ ] Verify tables created
- [ ] Test database connection from backend
- [ ] Seed initial data (if needed)

### Final Testing:
- [ ] Test user registration
- [ ] Test user login
- [ ] Test API endpoints
- [ ] Test real-time features
- [ ] Check CORS working

---

## 🚨 POTENTIAL ISSUES & SOLUTIONS

### Issue 1: Serverless Function Timeout
**Problem**: Vercel free tier has 10s timeout
**Solution**: Optimize slow queries, use background jobs for long tasks

### Issue 2: Cold Starts
**Problem**: First request after inactivity is slow
**Solution**: Use Vercel's "Serverless Function Warming" or accept it

### Issue 3: File Uploads
**Problem**: Serverless functions can't store files permanently
**Solution**: Use Supabase Storage for file uploads

### Issue 4: WebSockets
**Problem**: Vercel doesn't support WebSockets well
**Solution**: Use Supabase Realtime or keep Socket.io on Render

---

## 💰 COST COMPARISON

| Service | Render (Current) | Vercel + Supabase (New) |
|---------|------------------|-------------------------|
| Frontend | Free (750hrs) | Free (Unlimited) |
| Backend | Free (750hrs) | Free (100GB bandwidth) |
| Database | Free (90 days) | Free (500MB, permanent) |
| **Total** | **Free but limited** | **Free forever** |

---

## 🎉 EXPECTED RESULT

After completion:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend: `https://your-api.vercel.app`
- ✅ Database: Supabase (reliable, fast)
- ✅ No more deployment headaches
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs

---

## 📞 NEXT STEPS

Ready to proceed? I'll:
1. Create all necessary config files
2. Update your code with required changes
3. Guide you through Vercel + Supabase setup
4. Help you deploy and test

**Let me know when you're ready to start!**
