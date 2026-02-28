# Database Connection Fix for Render Deployment

## 🔴 CRITICAL ISSUE: Database Connection Refused

The error `ECONNREFUSED` means your backend cannot connect to the PostgreSQL database.

## Root Cause

Your `DATABASE_URL` is using the **internal** hostname:
```
postgresql://admin:x8aBysTHjCWDmcMfvMTBW7bLXBQq816P@dpg-d6hid73uibrs739vrud0-a/influencer_match
```

This internal hostname (`dpg-d6hid73uibrs739vrud0-a`) only works within Render's private network, but your backend service might not have access to it yet.

## ✅ SOLUTION: Use External Database URL

### Step 1: Get the Correct DATABASE_URL

1. Go to your Render Dashboard
2. Click on your **PostgreSQL database** (influencer-match-db)
3. Look for **"External Database URL"** or **"External Connection String"**
4. It should look like:
   ```
   postgresql://admin:PASSWORD@dpg-XXXXX.oregon-postgres.render.com/influencer_match
   ```
   
   Notice the difference:
   - ❌ Internal: `@dpg-d6hid73uibrs739vrud0-a/`
   - ✅ External: `@dpg-XXXXX.oregon-postgres.render.com/`

### Step 2: Update Environment Variable

In your backend service environment variables:

1. Go to **influencer-match-backend** service
2. Click **Environment** tab
3. Find `DATABASE_URL`
4. Replace with the **External Database URL** from Step 1
5. Click **Save Changes**

## 📋 Corrected Environment Variables

Here are your environment variables with notes:

```bash
# ✅ CORRECT - These are fine
CORS_ORIGIN=https://influencer-match-frontend.onrender.com
FRONTEND_URL=https://influencer-match-frontend.onrender.com
JWT_SECRET=D8BqyXGkbXSVUl3jPhhOfOio9XYbhC2jVV0TkjPLnTI=
ML_MATCHING_SERVICE_URL=https://influencer-match-ml-matching.onrender.com
ML_SERVICE_URL=https://influencer-match-ml-chatbot.onrender.com
NODE_ENV=production
PORT=10000

# ⚠️  NEEDS UPDATE - Use External URL
DATABASE_URL=postgresql://admin:PASSWORD@dpg-XXXXX.oregon-postgres.render.com/influencer_match

# ⚠️  OPTIONAL - Can be removed or set to external Redis
REDIS_URL=redis://localhost:6379
# Note: localhost Redis won't work in production. Either:
# - Remove this variable (app will use in-memory cache)
# - Set up external Redis service and use its URL
```

## 🔧 Alternative: Use Render's Auto-Link Feature

Instead of manually setting DATABASE_URL, you can use Render's Blueprint auto-link:

### In render.yaml (already configured):
```yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: influencer-match-db
      property: connectionString
```

This should automatically inject the correct DATABASE_URL. If it's not working:

1. Go to your backend service
2. Click **Environment** tab
3. Check if `DATABASE_URL` shows as "From Database: influencer-match-db"
4. If not, **delete** the manual DATABASE_URL entry
5. Render will auto-inject it from the database link

## 🚀 After Fixing

Once you update the DATABASE_URL:

1. The service will automatically redeploy
2. Watch the logs - you should see:
   ```
   [Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
   [Nest] LOG [RoutesResolver] ...
   🚀 Backend API running on http://localhost:10000/api
   ```

3. Test the health endpoint:
   ```bash
   curl https://influencer-match-backend.onrender.com/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

## 📝 Additional Notes

### Redis Warning (Non-Critical)
The warning about Redis is normal:
```
WARN [CacheService] Redis is disabled. Caching features will use in-memory fallback.
```

This is fine for now. The app will use in-memory caching instead. To fix later:
- Remove `REDIS_URL` environment variable, OR
- Set up an external Redis service (like Redis Labs or Upstash)

### ML Service Warning (Non-Critical)
```
WARN [ChatbotAIService] ❌ ML Service health check failed: Request failed with status code 502
```

This means your ML services aren't deployed yet. This is fine - the chatbot will use fallback responses.

### Stripe Warning (Non-Critical)
```
WARNING: Missing Stripe configuration
```

This is expected and fine. Payment features are disabled until you add Stripe keys later.

## 🎯 Quick Checklist

- [ ] Get External Database URL from Render dashboard
- [ ] Update DATABASE_URL environment variable
- [ ] Save changes (triggers automatic redeploy)
- [ ] Wait for deployment to complete
- [ ] Check logs for successful database connection
- [ ] Test health endpoint

## 🆘 Still Having Issues?

If you still see `ECONNREFUSED` after using the external URL:

1. **Check database status**: Make sure your PostgreSQL database is running (not suspended)
2. **Check region**: Both backend and database should be in the same region (oregon)
3. **Check firewall**: Render databases should allow connections from Render services by default
4. **Try manual connection**: In the backend service Shell tab, try:
   ```bash
   psql $DATABASE_URL
   ```
   If this fails, there's a network/permission issue.

Let me know the results after updating the DATABASE_URL!
