# Testing Guide - Influencer-Company Matching Platform

## 🎯 Quick Start Testing

### Prerequisites
- Docker installed (for PostgreSQL and Redis)
- Node.js installed
- Backend and frontend dependencies installed

### Step 1: Start Backend Services

```bash
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API will connect to these

### Step 2: Seed Mock Data

```bash
cd backend
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

### Step 3: Start Backend API

```bash
cd backend
npm run start:dev
```

Backend should start on `http://localhost:3000`

### Step 4: Start Frontend (Already Running)

The Vite dev server is already running on `http://localhost:5175`

Now rebuild and start Electron:

```bash
# In root directory
npm run build:electron
npm run dev:electron
```

## 🧪 Test Scenarios

### Test 1: Login as Influencer

1. Open the Electron app
2. Login with:
   - Email: `sarah.johnson@example.com`
   - Password: `password123`
3. Expected Results:
   - Dashboard shows 5 total matches
   - Should see 1 Perfect match (StyleCo)
   - Should see company profiles with match scores
   - Stats show: Total Matches: 5, Perfect Matches: 1

### Test 2: Login as Company

1. Logout (if logged in)
2. Login with:
   - Email: `contact@styleco.com`
   - Password: `password123`
3. Expected Results:
   - Dashboard shows 5 total matches
   - Should see 1 Perfect match (Sarah Johnson)
   - Should see influencer profiles with match scores
   - Stats show audience size, engagement rate, budget range

### Test 3: Verify Match Scores

**Perfect Matches (Score ~95):**
- Sarah Johnson ↔ StyleCo (Fashion, NYC, budget aligned)
- Mike Chen ↔ TechGear (Tech, SF, budget aligned)
- Emma Davis ↔ GlowBeauty (Beauty, LA, budget aligned)
- Alex Rodriguez ↔ FitLife (Fitness, Miami, budget aligned)
- Lisa Park ↔ TastyBites (Food, Chicago, budget aligned)

**Match Card Should Display:**
- Profile name
- Niche/Industry
- Location
- Match score (number)
- Match tier (Perfect/Excellent/Good/Fair)
- Audience size or budget
- Platform tags
- Bio/description
- Connect and View Profile buttons

### Test 4: API Endpoints (Using Postman/curl)

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@example.com","password":"password123"}'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "sarah.johnson@example.com",
    "role": "INFLUENCER"
  }
}
```

#### Get Matches (with token)
```bash
curl -X GET http://localhost:3000/api/matches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
[
  {
    "id": "influencer-id-company-id",
    "profile": {
      "id": "company-id",
      "name": "StyleCo",
      "type": "company",
      "industry": "Fashion",
      "budget": 12000,
      "location": "New York",
      "platforms": ["Instagram", "TikTok"],
      "description": "Sustainable fashion brand...",
      "website": "https://styleco.example.com"
    },
    "score": 95.5,
    "tier": "Perfect",
    "breakdown": {
      "nicheCompatibility": 100,
      "locationCompatibility": 100,
      "budgetAlignment": 100,
      "platformOverlap": 100,
      "audienceSizeMatch": 100,
      "engagementTierMatch": 75
    }
  }
]
```

#### Get All Influencers
```bash
curl -X GET http://localhost:3000/api/profiles/influencers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get All Companies
```bash
curl -X GET http://localhost:3000/api/profiles/companies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Issue: "Failed to load matches"

**Possible Causes:**
1. Backend not running
2. Not logged in
3. No profile created for user

**Solutions:**
1. Check backend is running on port 3000
2. Login with one of the seeded accounts
3. Run `npm run seed` again

### Issue: "Cannot connect to database"

**Solution:**
```bash
cd backend
docker-compose down
docker-compose up -d
# Wait 10 seconds for PostgreSQL to start
npm run seed
npm run start:dev
```

### Issue: "Port 5173 already in use"

**Solution:**
The Vite dev server is using port 5175 instead. Update `src/main/main.ts` if needed (already done).

### Issue: "Electron window is blank"

**Solutions:**
1. Check browser console in Electron (View → Toggle Developer Tools)
2. Verify Vite dev server is running
3. Check for CORS errors
4. Rebuild Electron: `npm run build:electron`

## 📊 Expected Match Scores Breakdown

### Sarah Johnson (Influencer) vs StyleCo (Company)

| Factor | Score | Weight | Contribution |
|--------|-------|--------|--------------|
| Niche Compatibility | 100 | 30% | 30.0 |
| Location Compatibility | 100 | 15% | 15.0 |
| Budget Alignment | 100 | 20% | 20.0 |
| Platform Overlap | 100 | 15% | 15.0 |
| Audience Size Match | 100 | 10% | 10.0 |
| Engagement Tier Match | 75 | 10% | 7.5 |
| **Total** | | | **97.5** |

**Tier: Perfect** (90-100)

### Mike Chen (Influencer) vs StyleCo (Company)

| Factor | Score | Weight | Contribution |
|--------|-------|--------|--------------|
| Niche Compatibility | 50 | 30% | 15.0 |
| Location Compatibility | 0 | 15% | 0.0 |
| Budget Alignment | 0 | 20% | 0.0 |
| Platform Overlap | 0 | 15% | 0.0 |
| Audience Size Match | 0 | 10% | 0.0 |
| Engagement Tier Match | 50 | 10% | 5.0 |
| **Total** | | | **20.0** |

**Tier: Fair** (0-59)

## ✅ Success Criteria

- [ ] Backend starts without errors
- [ ] Seeder creates 10 users (5 influencers + 5 companies)
- [ ] Login works for all seeded accounts
- [ ] Influencers see 5 company matches
- [ ] Companies see 5 influencer matches
- [ ] Match scores are calculated correctly
- [ ] Perfect matches show ~95+ score
- [ ] Match cards display all information
- [ ] Stats show correct counts
- [ ] No console errors in Electron

## 🎉 Demo Flow

1. Start with influencer login (Sarah Johnson)
2. Show dashboard with 5 matches
3. Point out the Perfect match with StyleCo
4. Show match score breakdown
5. Logout and login as company (StyleCo)
6. Show dashboard with 5 influencer matches
7. Point out the Perfect match with Sarah Johnson
8. Demonstrate bidirectional matching

## 📝 Notes

- All passwords are `password123` for testing
- Mock data is designed for perfect matches (same niche + location + budget)
- Real-world matches would have more variation in scores
- The matching algorithm is deterministic (same inputs = same output)
