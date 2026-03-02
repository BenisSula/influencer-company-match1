# Render Deployment Fix Guide

## Issues Fixed

1. ✅ Added health check endpoint at `/health`
2. ✅ Fixed `render.yaml` configuration with `rootDir: backend`
3. ✅ Updated CORS configuration for production
4. ✅ Added missing environment variables
5. ✅ Changed PORT to 10000 (Render's default)

## Next Steps to Deploy

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix backend deployment configuration for Render"
git push origin main
```

### 2. In Render Dashboard

Go to your **influencer-match-backend** service and:

#### A. Check Environment Variables

Make sure these are set:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `DATABASE_URL` = (auto-set from database)
- `JWT_SECRET` = (auto-generated or set manually)
- `CORS_ORIGIN` = `https://influencer-match-frontend.onrender.com`
- `FRONTEND_URL` = `https://influencer-match-frontend.onrender.com`

Optional (for full functionality):
- `STRIPE_SECRET_KEY` = your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` = your Stripe webhook secret
- `REDIS_URL` = `redis://localhost:6379` (or external Redis if needed)

#### B. Manual Deploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch the build logs for any errors

### 3. Common Deployment Issues & Solutions

#### Issue: "Cannot find module"
**Solution:** The build command will install all dependencies. If this fails, check that `package.json` is in the `backend` folder.

#### Issue: "Database connection failed"
**Solution:** 
- Ensure the PostgreSQL database is created and running
- Check that `DATABASE_URL` is properly linked
- The database should be in the same region (oregon)

#### Issue: "Port already in use"
**Solution:** Render automatically assigns the PORT. Make sure your code uses `process.env.PORT`.

#### Issue: "Health check failing"
**Solution:** The `/health` endpoint is now added. It should return `{"status":"ok"}`.

### 4. After Successful Deployment

#### Test the Backend
```bash
# Test health endpoint
curl https://influencer-match-backend.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

#### Test API endpoint
```bash
curl https://influencer-match-backend.onrender.com/api

# Should return API response or 404 (which is fine, means server is running)
```

### 5. Database Migrations

After the backend is running, you need to run migrations:

**Option A: Using Render Shell**
1. Go to your backend service in Render
2. Click **"Shell"** tab
3. Run:
```bash
npm run migration:run
```

**Option B: Add to Build Command (Automatic)**
Update the `buildCommand` in `render.yaml`:
```yaml
buildCommand: npm install && npm run build && npm run migration:run
```

### 6. Troubleshooting Logs

If deployment fails:
1. Go to **Logs** tab in Render dashboard
2. Look for red error messages
3. Common errors:
   - **TypeScript errors**: Fix in your code and redeploy
   - **Missing dependencies**: Check `package.json`
   - **Database connection**: Verify `DATABASE_URL`
   - **Port binding**: Should use `process.env.PORT`

## What Changed in Files

### `render.yaml`
- Changed from `cd backend &&` to `rootDir: backend`
- Updated PORT to 10000
- Added CORS_ORIGIN and other env vars
- Added STRIPE and REDIS placeholders

### `backend/src/main.ts`
- Added `/health` endpoint for Render health checks
- Updated CORS to include FRONTEND_URL

## Need More Help?

If you're still seeing errors, share:
1. The exact error message from Render logs
2. Which step is failing (build or deploy)
3. Any red error text

I can help debug further!
