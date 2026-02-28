# Quick Start Guide

Get the Influencer-Company Matching Platform running in 5 minutes.

---

## Prerequisites

- Node.js 20+ installed
- Docker Desktop installed (for database)
- Git installed

---

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd ..
npm install
```

---

## Step 2: Start Database Services

```bash
cd backend
docker-compose up -d postgres redis
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

---

## Step 3: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` if needed (default values work for local development).

---

## Step 4: Start Backend API

```bash
cd backend
npm run start:dev
```

Backend runs on `http://localhost:3000/api`

---

## Step 5: Start Frontend

In a new terminal:

```bash
npm run dev:renderer
```

Frontend runs on `http://localhost:5173`

---

## Step 6: Test the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "influencer@example.com",
    "password": "password123",
    "role": "INFLUENCER"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "influencer@example.com",
    "password": "password123"
  }'
```

You'll receive a JWT token in the response.

---

## Troubleshooting

### Database Connection Error
- Ensure Docker is running
- Check PostgreSQL is on port 5432: `docker ps`
- Verify `.env` has correct DB credentials

### Redis Connection Error
- Ensure Redis container is running
- Check Redis is on port 6379: `docker ps`

### Port Already in Use
- Backend (3000): Change `PORT` in `.env`
- Frontend (5173): Change port in `vite.config.ts`

### Module Not Found
- Run `npm install` in both root and backend directories
- Delete `node_modules` and reinstall if issues persist

---

## Next Steps

1. **View the app**: Open `http://localhost:5173` in your browser
2. **Test API**: Use Postman or curl to test endpoints
3. **Read docs**: Check `README.md` for full documentation
4. **Implement features**: See `PHASE1-IMPLEMENTATION.md` for what's next

---

## Useful Commands

### Backend
```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

### Frontend
```bash
npm run dev:renderer  # Start Vite dev server
npm run dev:electron  # Start Electron app
npm run build         # Build for production
npm run test          # Run tests
```

### Docker
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs backend   # View backend logs
docker-compose ps             # List running services
```

---

## Default Credentials

No default users exist. Register via API or implement registration UI.

---

## Support

- Check `README.md` for detailed documentation
- Review `PHASE1-IMPLEMENTATION.md` for architecture details
- See `.kiro/steering/` for coding standards and guidelines

---

**You're all set!** 🚀
