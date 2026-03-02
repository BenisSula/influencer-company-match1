# Quick Fix Guide - Database Errors

## The Problem
You're seeing these errors:
- ❌ `relation "ml_models" does not exist`
- ❌ `relation "reactions" does not exist`  
- ❌ `GET /api/connections/status/:id 404 (Not Found)`
- ❌ `GET /api/feed/posts/:id/reactions 500 (Internal Server Error)`

## The Solution (3 Easy Steps)

### Step 1: Apply Database Fixes
Open a terminal in the `backend` folder and run:

```bash
# Option A: Run the SQL fix script
psql -U postgres -d influencer_match_db -f fix-missing-tables.sql

# Option B: Or use the batch file (Windows)
fix-and-start.bat
```

### Step 2: Restart Backend
```bash
cd backend
npm run start:dev
```

### Step 3: Refresh Frontend
- Press `Ctrl+Shift+R` in your browser to hard refresh
- Or just `F5` to normal refresh

## What Was Fixed?

### ✅ Backend Changes
1. **ML Model Service** - Now checks if table exists before initializing
2. **Feed Service** - Returns safe defaults instead of crashing
3. **Connections API** - New `/api/connections/status/:id` endpoint added
4. **Error Handling** - All database queries wrapped with try-catch

### ✅ Database Changes
1. **ml_models table** - Created with proper schema
2. **reactions table** - Created with indexes and constraints
3. **match_training_data table** - Created for ML features
4. **recommendations table** - Created for AI matching

## Verify It Works

### Check Backend Console
You should see:
```
✅ Backend API running on http://localhost:3000/api
✅ ML Model Service initialized successfully (or warning if table missing)
✅ No errors about missing relations
```

### Check Browser Console
You should see:
```
✅ No 404 errors for /api/connections/status
✅ No 500 errors for /api/feed/posts/*/reactions
✅ Matches and feed posts load successfully
```

## Still Having Issues?

### If backend won't start:
```bash
# Check if PostgreSQL is running
psql -U postgres -l

# Check if database exists
psql -U postgres -c "\l influencer_match_db"

# Recreate database if needed
npm run db:reset
```

### If tables still missing:
```bash
# Run all migrations
npm run migration:run

# Or manually create tables
psql -U postgres -d influencer_match_db -f fix-missing-tables.sql
```

### If frontend still shows errors:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check backend is running on port 3000
4. Check CORS is enabled in backend

## Prevention

These fixes ensure:
- ✅ Backend starts even if some tables are missing
- ✅ Features degrade gracefully instead of crashing
- ✅ Safe defaults returned for missing data
- ✅ Proper error logging for debugging
- ✅ No more 404/500 errors flooding console

## Need More Help?

Check these files for details:
- `DATABASE-ERRORS-FIXED.md` - Complete technical documentation
- `backend/fix-missing-tables.sql` - SQL script that fixes tables
- `backend/src/modules/connections/` - New connections module
