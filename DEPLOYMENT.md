# Deployment Guide - Render

## Quick Deploy to Render

### Option 1: One-Click Deploy (Blueprint)
1. Push this code to GitHub
2. Go to: https://dashboard.render.com
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and deploy everything

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `influencer-match-db`
   - Database: `influencer_match`
   - Plan: **Free**
4. Copy the **Internal Database URL**

#### Step 2: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - Name: `influencer-match-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Plan: **Free**
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[your database URL from Step 1]
   JWT_SECRET=[generate random string]
   STRIPE_SECRET_KEY=[your Stripe key]
   FRONTEND_URL=[will add after Step 3]
   ```

#### Step 3: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect GitHub repository
3. Configure:
   - Name: `influencer-match-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://influencer-match-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=[your Stripe key]
   ```

#### Step 4: Update Backend FRONTEND_URL
1. Go back to backend service
2. Update `FRONTEND_URL` with your frontend URL
3. Save (will trigger redeploy)

#### Step 5: Run Migrations
1. In backend service, click "Shell"
2. Run:
   ```bash
   npm run migration:run
   npm run seed
   ```

## Environment Variables Needed

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Important Notes

- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- PostgreSQL: 1GB storage, 97 connection limit
- WebSocket support is included (for real-time messaging)

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify DATABASE_URL is correct (use Internal URL)
- Ensure migrations ran successfully

### Frontend can't connect
- Verify VITE_API_URL in frontend environment
- Check CORS settings in backend
- Ensure backend is running

### Database connection errors
- Use Internal Database URL (not external)
- Check connection limit (97 max on free tier)

## Keep Services Awake (Optional)

Use UptimeRobot (free): https://uptimerobot.com
- Add monitor for backend URL
- Ping every 5-10 minutes
- Prevents cold starts

## Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Free Tier Info: https://render.com/docs/free
