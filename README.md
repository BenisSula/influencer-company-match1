# Influencer-Company Matching Platform

Professional B2B collaboration SaaS connecting influencers with companies through intelligent matching.

## 🏗 Architecture

```
Electron Desktop Client (React + TypeScript)
           ↓
    NestJS Backend API
           ↓
    PostgreSQL Database
           ↓
    Redis Cache Layer
```

## 📦 Project Structure

```
├── frontend/              # Electron + React Desktop App
│   └── src/
│       ├── main/         # Electron main process
│       ├── renderer/     # React UI
│       ├── services/     # API clients
│       └── store/        # Zustand state management
│
├── backend/              # NestJS API Server
│   └── src/
│       ├── modules/      # Feature modules
│       │   ├── auth/
│       │   ├── users/
│       │   ├── profiles/
│       │   └── matching/
│       ├── cache/        # Redis service
│       ├── config/       # Configuration
│       └── common/       # Shared utilities
│
└── shared/               # Shared TypeScript types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start PostgreSQL and Redis:**

Using Docker:
```bash
docker-compose up -d postgres redis
```

Or install locally and start services.

5. **Run backend:**
```bash
npm run start:dev
```

Backend will run on `http://localhost:3000/api`

### Frontend Setup

1. **Navigate to root directory:**
```bash
cd ..
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev:renderer
```

Frontend will run on `http://localhost:5173`

4. **Run Electron (in another terminal):**
```bash
npm run dev:electron
```

## 🐳 Docker Deployment

Run the entire stack with Docker:

```bash
cd backend
docker-compose up
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Profiles
- `POST /api/profiles/influencer` - Create influencer profile
- `POST /api/profiles/company` - Create company profile
- `GET /api/profiles/:id` - Get profile
- `PATCH /api/profiles/:id` - Update profile

### Matching
- `GET /api/matches` - Get matches with filters
- `GET /api/matches/:id` - Get specific match
- `POST /api/matches/calculate` - Recalculate matches

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Input validation on all endpoints
- CORS configuration
- Secure Electron IPC (contextIsolation enabled)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
npm run test:cov
```

### Frontend Tests
```bash
npm run test
```

## 🛠 Tech Stack

### Frontend
- Electron
- React 18
- TypeScript
- Zustand (state management)
- Vite (build tool)

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Redis
- JWT/Passport

## 📖 Development Guidelines

- Follow SOLID principles
- Use repository pattern for data access
- Keep business logic in service layer
- Validate all inputs with DTOs
- Write tests for critical paths
- Use TypeScript strict mode

## 🔄 Matching Algorithm

Weighted scoring system:
- Niche Compatibility: 30%
- Budget Alignment: 20%
- Location Compatibility: 15%
- Platform Overlap: 15%
- Audience Size Match: 10%
- Engagement Tier: 10%

Results cached in Redis for 1 hour.

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=influencer_matching
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
CORS_ORIGIN=http://localhost:5173
```

## 🤝 Contributing

1. Follow the coding standards in `.kiro/steering/coding-standards.md`
2. Write tests for new features
3. Update documentation
4. Submit pull request

## 📄 License

MIT
