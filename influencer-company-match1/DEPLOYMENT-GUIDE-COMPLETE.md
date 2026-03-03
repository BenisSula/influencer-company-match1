# 🚀 COMPLETE DEPLOYMENT GUIDE - VERCEL + SUPABASE

## ✅ FILES CREATED

I've created these files for you:
1. `backend/vercel.json` - Backend Vercel configuration
2. `vercel.json` - Frontend Vercel configuration  
3. `.env.production` - Production environment variables

---

## 📋 STEP 1: SETUP SUPABASE (10 minutes)

### 1.1 Create Account & Project

1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub (free, no credit card)
4. Click "New Project"
5. Fill in:
   - **Name**: `influencer-match`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `US East`)
   - **Pricing Plan**: Free
6. Click "Create new project"
7. Wait 2-3 minutes for setup

### 1.2 Get Database Connection String

1. In Supabase dashboard, click **"Project Settings"** (gear icon bottom left)
2. Click **"Database"** in left sidebar
3. Scroll down to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual database password
7. **SAVE THIS STRING** - you'll need it for Vercel

### 1.3 Run Database Migrations

**Option A: Using Supabase SQL Editor (Recommended)**

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Open your local file: `backend/setup-database.sql`
4. Copy ALL the SQL content
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

**Option B: Using Command Line**

```bash
cd backend
set DATABASE_URL=your-supabase-connection-string
npm run typeorm migration:run
```

### 1.4 Verify Tables Created

1. In Supabase dashboard, click **"Table Editor"**
2. You should see tables like: `users`, `influencer_profiles`, `company_profiles`, etc.
3. If you see tables, SUCCESS! ✅

---

## 📋 STEP 2: DEPLOY BACKEND TO VERCEL (10 minutes)

### 2.1 Create Vercel Account

1. Go to **https://vercel.com**
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### 2.2 Deploy Backend

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `influencer-company-match1` repository
3. Click **"Import"**
4. **IMPORTANT SETTINGS:**
   - **Project Name**: `influencer-match-backend` (or your choice)
   - **Framework Preset**: Other
   - **Root Directory**: Click "Edit" → Select `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables** - Click "Environment Variables" and add:

   ```
   NODE_ENV=production
   ```

   ```
   DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
   (Use your Supabase connection string from Step 1.2)

   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

   ```
   CORS_ORIGIN=*
   ```
   (We'll update this after frontend deployment)

   ```
   FORCE_SYNC=false
   ```
   (Set to false since we already ran migrations)

   ```
   PORT=3000
   ```

6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment
8. Once done, you'll see "Congratulations!" 🎉
9. **COPY YOUR BACKEND URL**: It will be like `https://influencer-match-backend.vercel.app`
10. **SAVE THIS URL** - you need it for frontend

### 2.3 Test Backend

1. Open your backend URL in browser: `https://your-backend.vercel.app`
2. You should see a response (might be 404 or "Cannot GET /", that's OK)
3. Try: `https://your-backend.vercel.app/api/health` or `https://your-backend.vercel.app/health`
4. If you see any response, backend is working! ✅

---

## 📋 STEP 3: DEPLOY FRONTEND TO VERCEL (10 minutes)

### 3.1 Update Environment Variable

1. Open `.env.production` file in your project root
2. Replace `https://your-backend-name.vercel.app` with your actual backend URL from Step 2.2
3. Save the file
4. Commit and push to GitHub:
   ```bash
   git add .env.production
   git commit -m "Add production environment variables"
   git push origin master
   ```

### 3.2 Deploy Frontend

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `influencer-company-match1` repository again
3. Click **"Import"**
4. **IMPORTANT SETTINGS:**
   - **Project Name**: `influencer-match` (or your choice)
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables** - Add:

   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```
   (Use your backend URL from Step 2.2)

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Once done, you'll see your live site! 🎉
9. **COPY YOUR FRONTEND URL**: Like `https://influencer-match.vercel.app`

### 3.3 Update Backend CORS

1. Go back to your **backend project** in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Find `CORS_ORIGIN` variable
4. Click **"Edit"**
5. Change value to your frontend URL: `https://your-frontend.vercel.app`
6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click **"..."** on latest deployment → **"Redeploy"**
9. Wait for redeployment

---

## 📋 STEP 4: FINAL TESTING (5 minutes)

### 4.1 Test Frontend

1. Open your frontend URL: `https://your-frontend.vercel.app`
2. You should see your landing page ✅

### 4.2 Test Registration

1. Click "Sign Up" or "Register"
2. Fill in the form
3. Submit
4. If successful, you're DONE! 🎉

### 4.3 Test Login

1. Try logging in with the account you just created
2. If it works, EVERYTHING IS WORKING! ✅

### 4.4 Check Database

1. Go to Supabase dashboard
2. Click "Table Editor"
3. Click "users" table
4. You should see your new user! ✅

---

## 🔧 TROUBLESHOOTING

### Problem 1: "Network Error" on Frontend

**Solution:**
1. Check browser console (F12)
2. Look for CORS errors
3. Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly
4. Redeploy backend after changing CORS

### Problem 2: "Cannot connect to database"

**Solution:**
1. Check Supabase connection string is correct
2. Make sure password has no special characters that need URL encoding
3. Test connection string locally first
4. Check Supabase project is not paused

### Problem 3: "Module not found" errors

**Solution:**
1. Check `package.json` has all dependencies
2. In Vercel, go to Deployments → View Build Logs
3. Look for npm install errors
4. Make sure `node_modules` is in `.gitignore`

### Problem 4: Backend returns 404 for all routes

**Solution:**
1. Check `backend/vercel.json` routes configuration
2. Make sure `dist/main.js` exists after build
3. Check build logs in Vercel

### Problem 5: "Function execution timed out"

**Solution:**
1. Optimize slow database queries
2. Add indexes to frequently queried columns
3. Consider upgrading Vercel plan (or accept 10s limit)

---

## 🎯 POST-DEPLOYMENT CHECKLIST

- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Vercel URL
- [ ] Can register new user
- [ ] Can login
- [ ] Can see dashboard
- [ ] Database shows new users in Supabase
- [ ] No CORS errors in browser console
- [ ] All API calls work

---

## 🚀 AUTOMATIC DEPLOYMENTS

Now that everything is set up:

1. **Every time you push to GitHub**, Vercel automatically deploys
2. **Preview deployments** for every pull request
3. **Production deployment** for pushes to `main`/`master` branch

To deploy changes:
```bash
git add .
git commit -m "Your changes"
git push origin master
```

Vercel will automatically build and deploy! 🎉

---

## 📊 MONITORING & LOGS

### View Backend Logs:
1. Go to Vercel dashboard
2. Click your backend project
3. Click "Deployments"
4. Click latest deployment
5. Click "View Function Logs"

### View Frontend Logs:
1. Same process as backend
2. Or use browser console (F12)

### View Database:
1. Go to Supabase dashboard
2. Click "Table Editor" to see data
3. Click "SQL Editor" to run queries
4. Click "Database" → "Logs" for database logs

---

## 💡 NEXT STEPS

### Optional Improvements:

1. **Custom Domain**:
   - In Vercel project settings → Domains
   - Add your custom domain
   - Update DNS records

2. **Environment Secrets**:
   - Never commit `.env` files
   - Always use Vercel Environment Variables
   - Use different values for preview vs production

3. **Database Backups**:
   - Supabase free tier includes daily backups
   - Check Settings → Database → Backups

4. **Performance Monitoring**:
   - Vercel Analytics (free tier available)
   - Supabase has built-in monitoring

5. **ML Services**:
   - Keep ML services on Render (they work fine)
   - Or deploy to Vercel as separate projects

---

## 🎉 SUCCESS!

Your app is now live on:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-api.vercel.app`
- **Database**: Supabase (reliable & fast)

**No more deployment headaches!** 🚀

Every git push automatically deploys. You can focus on building features instead of fighting with infrastructure.

---

## 📞 NEED HELP?

If you encounter issues:
1. Check the Troubleshooting section above
2. Check Vercel deployment logs
3. Check Supabase logs
4. Check browser console for frontend errors
5. Let me know the specific error message

**You've got this!** 💪
