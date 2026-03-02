# 🚨 URGENT: Fix Database Tables Not Created

## Problem
Error: `relation "users" does not exist`

This means the database tables were NOT created despite DB_SYNCHRONIZE=true.

## Solution Options

### Option 1: Force Synchronize on Render (RECOMMENDED)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click on `influencer-match-backend`

2. **Add Environment Variable**
   - Click "Environment" tab
   - Add new variable:
     ```
     TYPEORM_SYNCHRONIZE=true
     ```
   - Click "Save Changes"

3. **Manual Deploy**
   - Click "Manual Deploy" button
   - Select "Deploy latest commit"
   - Wait for deployment to complete

4. **Check Logs**
   - Go to "Logs" tab
   - Look for: "Database synchronize enabled: true"
   - Look for table creation messages

### Option 2: Run Migration Script

1. **Create Migration Runner**
   Already created at: `backend/run-migrations.js`

2. **Add to Render Build Command**
   - Go to Render Dashboard
   - Click `influencer-match-backend`
   - Click "Settings"
   - Find "Build Command"
   - Change to:
     ```
     npm install && npm run build && node run-migrations.js
     ```
   - Save and redeploy

### Option 3: Direct Database Access (Advanced)

1. **Get Database URL from Render**
   - Go to Render Dashboard
   - Click on your database
   - Copy "External Database URL"

2. **Connect with psql**
   ```bash
   psql <DATABASE_URL>
   ```

3. **Run SQL Script**
   ```sql
   -- Check if tables exist
   \dt

   -- If no tables, you need to create them manually
   -- Or use TypeORM CLI
   ```

## Quick Fix Script

Run this locally to test database connection:
