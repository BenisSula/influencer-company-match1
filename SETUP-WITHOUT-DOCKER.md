# Setup Guide - Without Docker

Since Docker is not installed, here's how to run the backend with local PostgreSQL and Redis installations.

## Option 1: Install Docker Desktop (Recommended)

1. Download Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Open Docker Desktop
4. Then run:
```bash
cd backend
docker compose up -d
npm run seed
npm run start:dev
```

## Option 2: Install PostgreSQL and Redis Locally

### Step 1: Install PostgreSQL

1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. Create a database:
```bash
psql -U postgres
CREATE DATABASE influencer_matching_db;
\q
```

### Step 2: Install Redis

1. Download Redis for Windows: https://github.com/microsoftarchive/redis/releases
2. Or use Memurai (Redis alternative): https://www.memurai.com/
3. Install and start the service

### Step 3: Update Backend Configuration

Create `backend/.env` file:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=influencer_matching_db

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1d
```

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5: Run Database Migrations (if needed)

```bash
npm run migration:run
```

### Step 6: Seed Mock Data

```bash
npm run seed
```

Expected output:
```
🌱 Seeding database...
✅ Created influencer: sarah.johnson@example.com
✅ Created influencer: mike.chen@example.com
✅ Created influencer: emma.davis@example.com
✅ Created influencer: alex.rodriguez@example.com
✅ Created influencer: lisa.park@example.com
✅ Created company: contact@styleco.com
✅ Created company: marketing@techgear.com
✅ Created company: hello@glowbeauty.com
✅ Created company: team@fitlife.com
✅ Created company: info@tastybites.com
🎉 Seeding completed!
```

### Step 7: Start Backend

```bash
npm run start:dev
```

Backend should start on http://localhost:3000

## Option 3: Use Mock Data in Frontend (Quick Test)

If you don't want to set up the backend right now, you can modify the frontend to use mock data:

### Create Mock Data File

Create `src/renderer/services/mock-data.ts`:
```typescript
export const mockMatches = [
  {
    id: '1',
    profile: {
      id: '1',
      name: 'StyleCo',
      type: 'company' as const,
      industry: 'Fashion',
      budget: 12000,
      location: 'New York',
      platforms: ['Instagram', 'TikTok'],
      description: 'Sustainable fashion brand focused on ethical manufacturing.',
      website: 'https://styleco.example.com',
    },
    score: 95.5,
    tier: 'Perfect',
    breakdown: {
      nicheCompatibility: 100,
      locationCompatibility: 100,
      budgetAlignment: 100,
      platformOverlap: 100,
      audienceSizeMatch: 100,
      engagementTierMatch: 75,
    },
  },
  // Add more mock matches...
];
```

### Update App.tsx to Use Mock Data

```typescript
// Comment out the API call
// const data = await matchingService.getMatches();

// Use mock data instead
import { mockMatches } from './services/mock-data';
setMatches(mockMatches);
```

## Verification

### Test Backend is Running

```bash
curl http://localhost:3000/api/auth/login
```

Should return: `{"statusCode":400,"message":"Bad Request"}`

### Test Database Connection

```bash
curl http://localhost:3000/api/profiles/influencers
```

Should return: `{"statusCode":401,"message":"Unauthorized"}`

## Troubleshooting

### PostgreSQL Connection Error

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Check port: `netstat -an | findstr 5432`
3. Verify credentials in `.env` file

### Redis Connection Error

**Error:** `ECONNREFUSED 127.0.0.1:6379`

**Solution:**
1. Check Redis is running
2. For Memurai: Check Windows Services
3. Restart Redis service

### Seeder Error

**Error:** `relation "users" does not exist`

**Solution:**
1. Make sure database is created
2. Run migrations if available
3. Check database connection in `.env`

## Next Steps

Once backend is running:

1. Open http://localhost:5175 in browser
2. Open DevTools Console (F12)
3. Run login script:
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'sarah.johnson@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('auth_token', data.access_token);
  location.reload();
});
```

4. Page should reload and show 5 matches!

## Summary

**Easiest Option:** Install Docker Desktop (Option 1)
**Most Control:** Install PostgreSQL + Redis locally (Option 2)
**Quick Test:** Use mock data in frontend (Option 3)

Choose the option that works best for your setup!
