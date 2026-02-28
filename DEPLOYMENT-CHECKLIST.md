# Render Deployment Checklist

## ✅ Changes Made

- [x] Added `/health` endpoint to backend
- [x] Fixed `render.yaml` with `rootDir` instead of `cd` commands
- [x] Updated PORT to 10000 (Render default)
- [x] Added CORS configuration for production
- [x] Added all required environment variables

## 📋 Your Action Items

### Step 1: Commit & Push
```bash
cd influencer-company-match1
git add .
git commit -m "Fix Render deployment configuration"
git push origin main
```

### Step 2: Render Dashboard Actions

#### For Backend Service (influencer-match-backend):

1. **Go to the service** in Render dashboard
2. **Click "Manual Deploy"** → "Deploy latest commit"
3. **Watch the logs** - look for:
   - ✅ "npm install" completing
   - ✅ "npm run build" completing
   - ✅ "Backend API running on..." message

4. **If it fails**, check the **Logs** tab and look for:
   - Red error messages
   - "Cannot find module" errors
   - Database connection errors
   - Port binding errors

### Step 3: Verify Environment Variables

In the backend service, go to **Environment** tab and verify:

**Required:**
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `DATABASE_URL` = (should be auto-linked)
- `JWT_SECRET` = (should be auto-generated)

**Recommended:**
- `CORS_ORIGIN` = `https://influencer-match-frontend.onrender.com`
- `FRONTEND_URL` = `https://influencer-match-frontend.onrender.com`

**Optional (add later):**
- `STRIPE_SECRET_KEY` = (your Stripe key)
- `STRIPE_WEBHOOK_SECRET` = (your Stripe webhook)

### Step 4: Test Deployment

Once deployed successfully:

```bash
# Test health endpoint
curl https://influencer-match-backend.onrender.com/health

# Expected: {"status":"ok","timestamp":"2026-02-28T..."}
```

### Step 5: Run Database Migrations

**Option A - Via Render Shell:**
1. Go to backend service
2. Click **Shell** tab
3. Run: `npm run migration:run`

**Option B - Automatic (recommended):**
Update backend service settings:
- Build Command: `npm install && npm run build && npm run migration:run`

## 🚨 Common Issues & Quick Fixes

### Issue: "Build failed - Cannot find package.json"
**Fix:** Make sure `rootDir: backend` is set in render.yaml

### Issue: "Health check failing"
**Fix:** The `/health` endpoint is now added. Wait for deployment to complete.

### Issue: "Database connection error"
**Fix:** 
- Ensure database is created and running
- Check DATABASE_URL is linked correctly
- Database must be in same region (oregon)

### Issue: "Port 3000 already in use"
**Fix:** Changed to PORT 10000 in render.yaml. Render will use this automatically.

### Issue: "CORS error from frontend"
**Fix:** Added CORS_ORIGIN env var. Make sure it matches your frontend URL.

## 📊 Deployment Order

Deploy in this order for best results:

1. **Database** (should already be created)
2. **Backend** (deploy now with fixes)
3. **ML Services** (can deploy after backend works)
4. **Frontend** (deploy last, after backend is confirmed working)

## 🔍 Where to Find Logs

If something fails:
1. Go to your service in Render
2. Click **"Logs"** tab
3. Look for the most recent red error messages
4. Copy the error and share it if you need help

## ✨ Success Indicators

You'll know it's working when:
- ✅ Build completes without errors
- ✅ "Backend API running on..." appears in logs
- ✅ Health check returns 200 OK
- ✅ Service shows "Live" status (green)

## 🆘 Still Having Issues?

Share these details:
1. Screenshot of the error in Render logs
2. Which step is failing (build or deploy)
3. Any red error messages

Good luck! 🚀
