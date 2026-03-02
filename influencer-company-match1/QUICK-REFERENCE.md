# 🚀 Quick Reference Guide

## Live URLs
```
Frontend:  https://influencer-match-frontend.onrender.com
Backend:   https://influencer-match-backend.onrender.com
Health:    https://influencer-match-backend.onrender.com/health
```

## Test Credentials
```
Influencer: influencer@test.com / Test@123456
Company:    company@test.com / Test@123456
```

## Common Tasks

### Check Backend Status
```bash
curl https://influencer-match-backend.onrender.com/health
```

### View Render Logs
1. Go to https://dashboard.render.com
2. Click `influencer-match-backend`
3. Click "Logs" tab

### Manual Deploy
1. Go to https://dashboard.render.com
2. Click `influencer-match-backend`
3. Click "Manual Deploy"
4. Wait for deployment to complete

### Push Code Changes
```bash
git add .
git commit -m "Your message"
git push origin main
```
(Render will auto-deploy)

### Test Deployment
```bash
node test-deployment.js
```

## Environment Variables (Render)

| Variable | Value | Status |
|----------|-------|--------|
| NODE_ENV | production | ✅ Set |
| PORT | 10000 | ✅ Set |
| DATABASE_URL | PostgreSQL URL | ✅ Set |
| DB_SYNCHRONIZE | true | ✅ Set |
| JWT_SECRET | auto-generated | ✅ Set |
| CORS_ORIGIN | frontend URL | ✅ Set |
| FRONTEND_URL | frontend URL | ✅ Set |

## Database Info

| Property | Value |
|----------|-------|
| Type | PostgreSQL |
| Name | influencer_match |
| Host | Render managed |
| Synchronize | Enabled |
| Tables | 50+ auto-created |

## Troubleshooting

### Issue: Login fails
**Solution:**
1. Check backend logs
2. Verify DATABASE_URL
3. Try manual deploy

### Issue: Service spinning down
**Solution:**
1. This is normal on free tier
2. First request wakes it up
3. Takes ~30 seconds

### Issue: Tables not created
**Solution:**
1. Check logs for errors
2. Try manual deploy
3. Verify DB_SYNCHRONIZE=true

### Issue: CORS errors
**Solution:**
1. Check CORS_ORIGIN env var
2. Should match frontend URL
3. Restart backend if changed

## Key Files

| File | Purpose |
|------|---------|
| `render.yaml` | Render deployment config |
| `backend/src/config/database.config.ts` | Database configuration |
| `backend/src/main.ts` | Backend entry point |
| `DEPLOYMENT-SUCCESS.md` | Full deployment guide |
| `DEPLOYMENT-VERIFICATION.md` | Verification checklist |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/profiles/influencer/me` | GET | Get influencer profile |
| `/api/profiles/company/me` | GET | Get company profile |
| `/api/matching/matches` | GET | Get matches |
| `/api/messaging/conversations` | GET | Get conversations |

## Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **GitHub Repo:** https://github.com/BenisSula/influencer-company-match1
- **Frontend:** https://influencer-match-frontend.onrender.com
- **Backend:** https://influencer-match-backend.onrender.com

## Status Indicators

✅ = Working
⚠️ = Warning/Check logs
❌ = Error/Not working

## Next Actions

1. **Test the app:**
   - Visit frontend URL
   - Login with test credentials
   - Create profile
   - Browse matches

2. **Monitor:**
   - Check Render logs
   - Watch for errors
   - Monitor performance

3. **Configure (Optional):**
   - Add Stripe keys for payments
   - Configure email service
   - Set up ML services

4. **Scale (Future):**
   - Upgrade Render plan
   - Add monitoring
   - Set up backups
   - Configure CDN

---

**Everything is ready! Start testing now! 🎉**
