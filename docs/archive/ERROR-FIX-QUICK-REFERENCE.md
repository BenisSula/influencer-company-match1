# Error Fix Quick Reference Card

## 🚨 If You See These Errors

| Error | Quick Fix |
|-------|-----------|
| `relation "ml_models" does not exist` | Run: `psql -U postgres -d influencer_match_db -f backend/fix-missing-tables.sql` |
| `relation "reactions" does not exist` | Same as above ⬆️ |
| `404 /api/connections/status/:id` | Restart backend: `cd backend && npm run start:dev` |
| `500 /api/feed/posts/:id/reactions` | Same as above ⬆️ |

## ⚡ One-Command Fix

```bash
cd backend && psql -U postgres -d influencer_match_db -f fix-missing-tables.sql && npm run start:dev
```

## 🎯 What Each Fix Does

### ML Models Error
- **Problem:** Table missing
- **Fix:** Creates `ml_models` table
- **Fallback:** Service warns and continues

### Reactions Error
- **Problem:** Table missing
- **Fix:** Creates `reactions` table
- **Fallback:** Returns empty reactions

### Connection 404 Error
- **Problem:** Wrong API route
- **Fix:** Added `/api/connections` endpoint
- **Fallback:** Returns `{ status: 'none' }`

### Feed 500 Errors
- **Problem:** Missing tables crash queries
- **Fix:** Added try-catch to all methods
- **Fallback:** Returns safe defaults (0, [], false)

## 📝 Files Changed

```
✅ backend/src/app.module.ts
✅ backend/src/modules/connections/ (NEW)
✅ backend/src/modules/ai-matching/ml-model.service.ts
✅ backend/src/modules/feed/feed.service.ts
✅ backend/fix-missing-tables.sql (NEW)
```

## 🔄 Restart Checklist

1. ✅ Run SQL fix script
2. ✅ Restart backend server
3. ✅ Hard refresh browser (Ctrl+Shift+R)
4. ✅ Check console for errors
5. ✅ Test matches page
6. ✅ Test feed page

## 🎉 Success Indicators

### Backend Console
```
✅ Backend API running on http://localhost:3000/api
✅ Nest application successfully started
✅ No "relation does not exist" errors
```

### Browser Console
```
✅ No 404 errors
✅ No 500 errors
✅ Matches load
✅ Feed loads
```

## 🆘 Emergency Commands

### Reset Everything
```bash
cd backend
npm run db:reset
npm run migration:run
npm run start:dev
```

### Check Database
```bash
psql -U postgres -d influencer_match_db -c "\dt"
```

### Check Backend
```bash
curl http://localhost:3000/api/feed/posts
```

## 📞 Need Help?

1. Check `QUICK-FIX-GUIDE.md` for detailed steps
2. Check `DATABASE-ERRORS-FIXED.md` for technical details
3. Check `ALL-ERRORS-FIXED-SUMMARY.md` for complete overview

---

**TL;DR:** Run `backend/fix-and-start.bat` and refresh browser. Done! ✨
