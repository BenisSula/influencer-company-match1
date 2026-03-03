# 🚀 VERCEL DEPLOYMENT GUIDE

## Step 1: Push Code to GitHub (If Not Already Done)

### Check if you have Git initialized:
```bash
cd influencer-company-match1
git status
```

### If not initialized, run:
```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### Create a new repository on GitHub:
1. Go to https://github.com/new
2. Name it: `influencer-match-app`
3. Make it **Private** (recommended)
4. Don't initialize with README (we already have code)
5. Click "Create repository"

### Push to GitHub:
```bash
git remote add origin https://github.com/YOUR-USERNAME/influencer-match-app.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Vercel

### Go to Vercel:
1. Open https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Import Backend Project:
1. Click "Add New..." → "Project"
2. Find your `influencer-match-app` repository
3. Click "Import"
4. **IMPORTANT:** Set Root Directory to `backend`
5. Framework Preset: **Other**
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Install Command: `npm install`

### Add Environment Variables:
Click "Environment Variables" and add these:

```
DATABASE_URL=postgresql://postgres:IfluMatch2026!@db.rplqqhfdfreglczwftcc.supabase.co:5432/postgres

NODE_ENV=production

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

PORT=3000
```

### Deploy:
1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy the deployment URL (e.g., `https://your-backend.vercel.app`)

---

## Step 3: Deploy Frontend to Vercel

### Import Frontend Project:
1. Go back to Vercel dashboard
2. Click "Add New..." → "Project"
3. Find your `influencer-match-app` repository again
4. Click "Import"
5. **IMPORTANT:** Leave Root Directory as `.` (root)
6. Framework Preset: **Vite**
7. Build Command: `npm run build`
8. Output Directory: `dist`
9. Install Command: `npm install`

### Add Environment Variables:
Click "Environment Variables" and add:

```
VITE_API_URL=https://your-backend.vercel.app

VITE_SUPABASE_URL=https://rplqqhfdfreglczwftcc.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbHFxaGZkZnJlZ2xjendmdGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTYzNTUsImV4cCI6MjA4ODAzMjM1NX0.k99quYVUoJ_Z04QCcW7BVNzswJD6bHrHyqXieNWcH2s
```

### Deploy:
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app will be live!

---

## Step 4: Test Your App

1. Open your frontend URL (e.g., `https://your-app.vercel.app`)
2. Try to register a new account
3. Try to login
4. Check if everything works!

---

## 🎉 YOU'RE DONE!

Your app is now live on the internet!

**Frontend URL:** https://your-app.vercel.app  
**Backend URL:** https://your-backend.vercel.app  
**Database:** Supabase (already running)

---

## ⚠️ IMPORTANT NOTES

1. **Keep SUPABASE-CREDENTIALS.md private** - Never commit it to GitHub
2. **Change JWT_SECRET** to something more secure
3. **Free tier limits:**
   - Vercel: 100GB bandwidth/month
   - Supabase: 500MB database, 2GB bandwidth

---

## 🆘 TROUBLESHOOTING

**If backend deployment fails:**
- Check that `backend/package.json` has a `build` script
- Make sure Root Directory is set to `backend`

**If frontend deployment fails:**
- Check that `package.json` has a `build` script
- Make sure VITE_API_URL points to your backend URL

**If database connection fails:**
- Double-check DATABASE_URL in backend environment variables
- Make sure Supabase project is running (check dashboard)

---

**Need help? Tell me what error you're seeing!**
