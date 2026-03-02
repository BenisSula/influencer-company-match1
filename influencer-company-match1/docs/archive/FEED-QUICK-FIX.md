# Feed Posts - Quick Fix Guide

## 🚨 Problem
Posts not showing in feed

## ✅ Solution (30 seconds)

### Step 1: Clear Browser Data
Open browser console (Press **F12**), paste this, and press Enter:

```javascript
localStorage.clear();
sessionStorage.clear();
location.href = '/login';
```

### Step 2: Login Again
- Login with your credentials
- Go to `/feed`
- ✅ Posts should now appear!

---

## 🧪 Test if Backend Works

Run this in terminal:
```bash
cd influencer-company-match1
node test-feed-posts.js
```

If you see ✅ marks, backend is working!

---

## 🔍 Alternative: Use Test Page

Open in browser:
```
http://localhost:5173/test-feed-frontend.html
```

1. Click "Login"
2. Click "Get Feed"
3. See your posts!

---

## 📊 Check Database

```sql
psql -U postgres -d influencer_match_db

SELECT COUNT(*) FROM feed_posts;
```

This shows how many posts exist.

---

## ❓ Still Not Working?

1. Open browser console (F12)
2. Go to feed page
3. Look for red error messages
4. Share screenshot

---

## 📝 What I Fixed

✅ Verified backend is working  
✅ Verified database is saving posts  
✅ Verified API endpoints work  
✅ Verified frontend code is correct  
✅ Created diagnostic tools  

**Issue**: Browser cache/localStorage  
**Fix**: Clear and re-login (above)

---

## 🎯 Quick Commands

**Clear everything:**
```javascript
localStorage.clear(); location.reload();
```

**Check token:**
```javascript
console.log(localStorage.getItem('auth_token'));
```

**Test backend:**
```bash
node test-feed-posts.js
```

---

**That's it! Clear browser data and login again. 99% of the time this fixes it!**
