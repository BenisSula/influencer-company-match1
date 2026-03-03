# Vercel Environment Variables Required

Go to your **Vercel backend project** → **Settings** → **Environment Variables** and add these exact values:

## Required Environment Variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:IfluMatch2026!@db.rplqqhfdfreglczwftcc.supabase.co:5432/postgres` |
| `JWT_SECRET` | (generate a secure secret - see below) |
| `ADMIN_JWT_SECRET` | (generate a secure secret - see below) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` (replace with your actual frontend URL) |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` (replace with your actual frontend URL) |
| `FORCE_SYNC` | `true` |

## How to Generate JWT Secrets

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }) )
```

**Mac/Linux:**
```bash
openssl rand -base64 64
```

## Important Notes

1. **DATABASE_URL** -!` which may The password contains ` need URL encoding as `%21`. Try both:
   - With special char: `postgresql://postgres:IfluMatch2026!@db.rplqqhfdfreglczwftcc.supabase.co:5432/postgres`
   - URL encoded: `postgresql://postgres:IfluMatch2026%21@db.rplqqhfdfreglczwftcc.supabase.co:5432/postgres`

2. **FORCE_SYNC=true** - This ensures database tables are created automatically on first deploy

3. Replace `your-frontend.vercel.app` with your actual frontend URL
