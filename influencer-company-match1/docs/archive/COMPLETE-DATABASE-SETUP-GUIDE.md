# 🗄️ Complete Database Setup Guide

## Current Situation

✅ **Frontend**: Running on http://localhost:5173  
✅ **ML Service**: Running on http://localhost:8000  
⚠️ **Backend**: Running but database not set up  

## Quick Fix (2 Steps)

### Step 1: Create Database

Open **Command Prompt** or **PowerShell** as Administrator and run:

```bash
psql -U postgres
```

Then in the PostgreSQL prompt:

```sql
CREATE DATABASE influencer_match_db;
\q
```

### Step 2: Setup Tables

```bash
cd influencer-company-match1\backend
psql -U postgres -d influencer_match_db -f setup-database.sql
```

**That's it!** Backend will auto-reload and everything will work.

---

## Alternative: Complete Reset

If you want to start fresh:

### 1. Drop and Recreate Database

```bash
psql -U postgres
```

```sql
DROP DATABASE IF EXISTS influencer_match_db;
CREATE DATABASE influencer_match_db;
\q
```

### 2. Run Setup

```bash
cd influencer-company-match1\backend
psql -U postgres -d influencer_match_db -f setup-database.sql
```

---

## Verify Database Setup

### Check if database exists:

```bash
psql -U postgres -l
```

Look for `influencer_match_db` in the list.

### Check tables:

```bash
psql -U postgres -d influencer_match_db
```

```sql
\dt
```

You should see tables like:
- users
- influencer_profiles
- company_profiles
- connections
- matches
- feed_posts
- messages
- conversations
- etc.

---

## Test After Setup

### 1. Check Backend Health

```bash
curl http://localhost:3000/api/auth/login
```

Should return JSON (not an error).

### 2. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"sarah.fashion@example.com\",\"password\":\"password123\"}"
```

Should return a token.

### 3. Test Feed

Open browser: http://localhost:5173
- Login with: `sarah.fashion@example.com` / `password123`
- Go to Feed page
- Create a post
- Post should appear!

---

## Troubleshooting

### Problem: "psql: command not found"

**Solution**: Add PostgreSQL to PATH

1. Find PostgreSQL bin folder (usually `C:\Program Files\PostgreSQL\16\bin`)
2. Add to System PATH
3. Restart terminal

Or use full path:
```bash
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

### Problem: "Password authentication failed"

**Solution**: Use correct PostgreSQL password

When prompted for password, enter your PostgreSQL password (set during installation).

### Problem: "Database already exists"

**Solution**: That's fine! Just run the setup:

```bash
psql -U postgres -d influencer_match_db -f setup-database.sql
```

### Problem: Backend still showing errors

**Solution**: Restart backend

The backend should auto-reload, but if not:
1. Stop backend (Ctrl+C)
2. Start again: `npm run start:dev`

---

## What the Setup Does

The `setup-database.sql` script:

1. ✅ Creates all tables
2. ✅ Sets up relationships
3. ✅ Creates indexes
4. ✅ Adds seed data (test users)
5. ✅ Configures constraints

### Test Users Created:

**Influencers:**
- sarah.fashion@example.com / password123
- mike.tech@example.com / password123
- emma.fitness@example.com / password123

**Companies:**
- contact@techstartup.com / password123
- marketing@fashionbrand.com / password123
- partnerships@fitnessapp.com / password123

---

## Quick Commands Reference

### Create Database:
```bash
psql -U postgres -c "CREATE DATABASE influencer_match_db;"
```

### Run Setup:
```bash
cd influencer-company-match1\backend
psql -U postgres -d influencer_match_db -f setup-database.sql
```

### Check Status:
```bash
psql -U postgres -d influencer_match_db -c "\dt"
```

### Count Posts:
```bash
psql -U postgres -d influencer_match_db -c "SELECT COUNT(*) FROM feed_posts;"
```

---

## After Setup Complete

You'll have:
- ✅ Database created
- ✅ All tables set up
- ✅ Test users ready
- ✅ Backend working
- ✅ Frontend working
- ✅ ML service working

**Full platform operational!** 🎉

---

## Need Help?

If you encounter issues:

1. Check PostgreSQL is running:
   ```bash
   # Windows Services
   services.msc
   # Look for "postgresql-x64-16" or similar
   ```

2. Check backend logs (in the terminal running backend)

3. Check database connection in backend/.env:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=influencer_match_db
   ```

---

**Ready to set up? Just run the two commands above!** 🚀
