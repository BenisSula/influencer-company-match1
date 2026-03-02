# Backend Startup Guide

## Issue: Backend Not Running

The frontend cannot fetch data because the backend server is not running on port 3000.

## Quick Start

### Start the Backend Server

```powershell
# Navigate to backend directory
cd influencer-company-match1/backend

# Start the development server
npm run start:dev
```

The backend should start and display:
```
🚀 Backend API running on http://localhost:3000/api
```

## Verification Steps

### 1. Check if Backend is Running

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

If you see output, the backend is running. If not, start it using the command above.

### 2. Test API Endpoints

Open your browser and navigate to:
- http://localhost:3000/api (should return API info or 404)
- http://localhost:3000/api/auth/profile (should return 401 if not logged in)

### 3. Check Backend Logs

The backend terminal should show:
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO [RoutesResolver] Mapped {/api/match-history, GET} route
[Nest] INFO [RoutesResolver] Mapped {/api/match-history/analytics, GET} route
[Nest] INFO [RoutesResolver] Mapped {/api/match-history/trends, GET} route
```

## Common Issues

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```powershell
# Find the process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>

# Then start the backend again
npm run start:dev
```

### Database Connection Error

**Error**: `Unable to connect to the database`

**Solution**:
1. Ensure PostgreSQL is running
2. Check database credentials in `.env` file
3. Run migrations:
```powershell
npm run migration:run
```

### Module Not Found Errors

**Error**: `Cannot find module '@nestjs/...'`

**Solution**:
```powershell
# Install dependencies
npm install

# Then start the server
npm run start:dev
```

### TypeScript Compilation Errors

**Error**: `TS2304: Cannot find name...`

**Solution**:
```powershell
# Clean build
npm run build

# Start dev server
npm run start:dev
```

## Available Scripts

```powershell
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Build the project
npm run build

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- -n MigrationName
```

## Environment Variables

Ensure your `.env` file in the backend directory contains:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=influencer_match

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Frontend Connection

The frontend is configured to connect to:
- **Base URL**: `http://localhost:3000/api`
- **Configured in**: `src/renderer/services/api-client.ts`

## Match History Endpoints

Once the backend is running, these endpoints will be available:

### GET /api/match-history
Get match history with optional filters
```
Query params:
- dateFrom: ISO date string
- dateTo: ISO date string
- minScore: number
- maxScore: number
- limit: number
```

### GET /api/match-history/analytics
Get analytics dashboard data
```
Query params:
- timeRange: 'week' | 'month' | 'all'
```

### GET /api/match-history/trends
Get score trends over time
```
Query params:
- days: number (default: 30)
```

## Testing the Match History Feature

1. **Start Backend**:
   ```powershell
   cd backend
   npm run start:dev
   ```

2. **Start Frontend**:
   ```powershell
   cd ..
   npm run dev
   ```

3. **Login to the Application**:
   - Navigate to http://localhost:5173
   - Login with your credentials

4. **Access Match Analytics**:
   - Click "Match Analytics" in the sidebar
   - OR click "View Analytics" button on Matches page

5. **Verify Data Loads**:
   - Check browser console for any errors
   - Verify analytics dashboard displays
   - Check backend logs for API requests

## Troubleshooting Checklist

- [ ] Backend server is running on port 3000
- [ ] Database is running and accessible
- [ ] Migrations have been run
- [ ] Environment variables are configured
- [ ] No TypeScript compilation errors
- [ ] Frontend is running on port 5173
- [ ] User is logged in with valid token
- [ ] Browser console shows no CORS errors
- [ ] Backend logs show incoming requests

## Quick Health Check

Run this command to verify everything is working:

```powershell
# Check backend health
Invoke-WebRequest -Uri "http://localhost:3000/api" -UseBasicParsing

# Should return status 200 or 404 (both mean server is running)
```

## Next Steps

Once the backend is running:
1. The Match Analytics page should load without errors
2. Users should stay logged in (no automatic logout)
3. Analytics data will display (may be empty if no history exists)
4. Match history will be recorded automatically when viewing matches

## Support

If issues persist:
1. Check backend terminal for error messages
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all migrations are run
5. Check that JWT token is valid

**Remember**: The backend MUST be running for the frontend to work!
