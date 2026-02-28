# Influencer-Company Matching Platform

Professional B2B collaboration SaaS connecting influencers with companies through AI-powered intelligent matching.

## 📚 Documentation

**Complete documentation is available in the `/docs` folder:**

1. **[Landing Page](./docs/01-LANDING-PAGE.md)** - Public-facing marketing page with conversion optimization
2. **[Admin Dashboard](./docs/02-ADMIN-DASHBOARD.md)** - White-label multi-tenant administration system
3. **[Matching Pages](./docs/03-MATCHING-PAGES.md)** - Core user features: matches, messaging, profiles, campaigns
4. **[Frontend Architecture](./docs/04-FRONTEND-ARCHITECTURE.md)** - React/TypeScript frontend structure and patterns
5. **[Backend & Database](./docs/05-BACKEND-DATABASE.md)** - NestJS API and PostgreSQL schema
6. **[User Manual](./docs/06-USER-MANUAL.md)** - End-user guide for influencers and companies

## 🚀 Quick Start

**New to the project?** Follow these steps:

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb influencer_match_db

# Run migrations
cd backend
npm run migration:run

# Seed database with test data
npm run seed
cd ..
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/influencer_match_db
JWT_SECRET=your-secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 4. Start Services

**Option A: Use the batch file (Windows)**
```bash
START-ALL-SERVERS.bat
```

**Option B: Manual start**
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```

### 5. Access the Platform

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Admin Dashboard:** http://localhost:5173/admin/login

### Test Accounts

**Influencer:**
- Email: sarah.johnson@email.com
- Password: Password123!

**Company:**
- Email: mike.chen@techcorp.com
- Password: Password123!

**Admin:**
- Email: admin@platform.com
- Password: Admin123!@#

---

## 🏗 Architecture

```
React Web App (TypeScript + Vite)
           ↓
    NestJS Backend API
           ↓
    PostgreSQL Database
           ↓
    Redis Cache (Optional)
           ↓
    ML Services (Python - Optional)
```

**See [Frontend Architecture](./docs/04-FRONTEND-ARCHITECTURE.md) and [Backend & Database](./docs/05-BACKEND-DATABASE.md) for detailed documentation.**

## 📦 Project Structure

```
├── docs/                     # 📚 Complete Documentation
│   ├── 01-LANDING-PAGE.md
│   ├── 02-ADMIN-DASHBOARD.md
│   ├── 03-MATCHING-PAGES.md
│   ├── 04-FRONTEND-ARCHITECTURE.md
│   ├── 05-BACKEND-DATABASE.md
│   └── 06-USER-MANUAL.md
│
├── src/renderer/             # React Frontend
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin dashboard pages
│   │   └── Landing/         # Landing page
│   ├── components/          # Reusable components
│   ├── services/            # API clients
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   └── utils/               # Utility functions
│
├── backend/                 # NestJS API Server
│   └── src/
│       ├── modules/         # Feature modules
│       │   ├── auth/        # Authentication
│       │   ├── profiles/    # User profiles
│       │   ├── matching/    # Matching algorithm
│       │   ├── messaging/   # Real-time messaging
│       │   ├── feed/        # Social feed
│       │   ├── payments/    # Stripe integration
│       │   ├── admin/       # Admin dashboard
│       │   ├── campaigns/   # Campaign system
│       │   ├── chatbot/     # AI chatbot
│       │   └── landing/     # Landing page API
│       ├── database/        # Migrations & seeds
│       └── common/          # Shared utilities
│
├── ml-service/              # Python ML Chatbot (Optional)
└── ml-matching-service/     # Python ML Matching (Optional)
```

**See [Frontend Architecture](./docs/04-FRONTEND-ARCHITECTURE.md) for detailed frontend structure.**  
**See [Backend & Database](./docs/05-BACKEND-DATABASE.md) for detailed backend structure.**

## 🚀 Getting Started

**For detailed setup instructions, see the Quick Start section above.**

For specific use cases:
- **End Users:** See [User Manual](./docs/06-USER-MANUAL.md)
- **Developers:** See [Frontend Architecture](./docs/04-FRONTEND-ARCHITECTURE.md) and [Backend & Database](./docs/05-BACKEND-DATABASE.md)
- **Admins:** See [Admin Dashboard](./docs/02-ADMIN-DASHBOARD.md)

### Quick Setup

1. **Install dependencies:**
```bash
npm install
cd backend && npm install
```

2. **Setup database:**
```bash
createdb influencer_match_db
cd backend
npm run migration:run
npm run seed
```

3. **Start services:**
```bash
# Use the batch file (Windows)
START-ALL-SERVERS.bat

# Or manually:
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
npm run dev
```

4. **Access the platform:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Admin Dashboard: http://localhost:5173/admin/login

### Test Accounts
- **Influencer:** sarah.johnson@email.com / Password123!
- **Company:** mike.chen@techcorp.com / Password123!
- **Admin:** admin@platform.com / Admin123!@#

## 🎯 Key Features

### Core Platform
- ✅ **AI-Powered Matching** - Intelligent compatibility scoring (see [Matching Pages](./docs/03-MATCHING-PAGES.md))
- ✅ **Real-time Messaging** - WebSocket-based chat
- ✅ **Social Feed** - Posts, comments, reactions, shares
- ✅ **Connection Management** - Request, accept, collaborate
- ✅ **Campaign System** - Create and manage campaigns
- ✅ **Payment Integration** - Stripe Connect for payments (see [Backend & Database](./docs/05-BACKEND-DATABASE.md))
- ✅ **Admin Dashboard** - White-label multi-tenant system (see [Admin Dashboard](./docs/02-ADMIN-DASHBOARD.md))
- ✅ **AI Chatbot** - ML-powered customer support
- ✅ **Landing Page** - Real-time statistics and conversions (see [Landing Page](./docs/01-LANDING-PAGE.md))
- ✅ **Mobile Responsive** - PWA support

### Advanced Features
- Smart recommendations
- Match history and analytics
- Profile reviews and ratings
- Global search
- Notification system
- A/B testing framework
- Invoice generation
- Content moderation
- System analytics

**For complete feature documentation, see [Matching Pages](./docs/03-MATCHING-PAGES.md) and [Admin Dashboard](./docs/02-ADMIN-DASHBOARD.md).**

## 📚 Documentation

### Essential Guides
- **[Landing Page](./docs/01-LANDING-PAGE.md)** - Public-facing page structure and features
- **[Admin Dashboard](./docs/02-ADMIN-DASHBOARD.md)** - Complete admin system documentation
- **[Matching Pages](./docs/03-MATCHING-PAGES.md)** - Core user features and workflows
- **[Frontend Architecture](./docs/04-FRONTEND-ARCHITECTURE.md)** - React/TypeScript structure and patterns
- **[Backend & Database](./docs/05-BACKEND-DATABASE.md)** - NestJS API and PostgreSQL schema
- **[User Manual](./docs/06-USER-MANUAL.md)** - End-user guide for influencers and companies

### Legacy Documentation (Archived)
The following files contain historical implementation details and are kept for reference:
- `MASTER-QUICK-START.md` - Original setup guide
- `MASTER-FEATURE-REFERENCE.md` - Original feature list
- `MASTER-TROUBLESHOOTING.md` - Original troubleshooting guide
- `ADMIN-QUICK-START.md` - Original admin guide
- `AI-QUICK-START.md` - ML services setup
- `PRODUCTION-DEPLOYMENT-GUIDE.md` - Deployment instructions

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Routing
- **React Query** - Data fetching & caching
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **Stripe.js** - Payment processing

**See [Frontend Architecture](./docs/04-FRONTEND-ARCHITECTURE.md) for complete details.**

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching (optional)
- **Socket.io** - WebSocket for real-time
- **Stripe** - Payment processing
- **JWT** - Authentication

**See [Backend & Database](./docs/05-BACKEND-DATABASE.md) for complete details.**

### ML Services (Optional)
- **Python 3.9+** - ML runtime
- **FastAPI** - ML service API
- **scikit-learn** - Machine learning
- **NLTK** - Natural language processing

## 🎨 Code Splitting & Performance

### Bundle Optimization
- Route-based lazy loading (all routes)
- Manual chunks for vendors and features
- Admin dashboard: Separate 81 KB chunk
- Landing page: Separate 116 KB chunk
- Initial bundle: ~1.1 MB (341 KB gzipped)

### Performance Features
- React Query caching (5-minute stale time)
- Image lazy loading
- Virtual scrolling for large lists
- Database indexing
- API response caching
- Service worker for PWA

## 🔐 Security Features

- JWT authentication with secure tokens
- Password hashing (bcrypt, 10 rounds)
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- Account lockout after failed attempts
- CORS protection
- SQL injection prevention (TypeORM)
- XSS protection
- CSRF protection
- Input validation on all endpoints

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Unit Tests: >80%
- Integration Tests: >70%
- E2E Tests: Critical paths covered

## 📖 Development Guidelines

- Follow TypeScript strict mode
- Use repository pattern for data access
- Keep business logic in service layer
- Validate all inputs with DTOs
- Write tests for critical paths
- Use React hooks for state management
- Implement error boundaries
- Handle loading and error states

## 🔄 Matching Algorithm

AI-powered weighted scoring system:
- **Niche Compatibility:** 30%
- **Budget Alignment:** 20%
- **Location Compatibility:** 15%
- **Platform Overlap:** 15%
- **Audience Size Match:** 10%
- **Engagement Tier:** 10%

Results cached and updated with ML feedback loop.

**See [Matching Pages](./docs/03-MATCHING-PAGES.md) for detailed algorithm documentation.**

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/influencer_match_db
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
REDIS_URL=redis://localhost:6379 (optional)
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🚢 Deployment

**See [Backend & Database](./docs/05-BACKEND-DATABASE.md) for detailed deployment instructions.**

### Build for Production
```bash
npm run build
cd backend && npm run build
```

### Recommended Hosting
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Backend:** AWS EC2, DigitalOcean, Heroku
- **Database:** AWS RDS, DigitalOcean Managed PostgreSQL
- **ML Services:** AWS EC2, Google Cloud Run (optional)

## 📊 Platform Statistics

- **Users:** Influencers and Companies
- **Matching:** AI-powered compatibility scoring
- **Messaging:** Real-time WebSocket communication
- **Payments:** Stripe Connect integration
- **Admin:** Multi-tenant white-label system

## 🤝 Contributing

1. Follow coding standards
2. Write tests for new features
3. Update documentation
4. Submit pull request

## 📄 License

MIT

---

**For detailed documentation, see the `/docs` folder:**
- [Landing Page](./docs/01-LANDING-PAGE.md)
- [Admin Dashboard](./docs/02-ADMIN-DASHBOARD.md)
- [Matching Pages](./docs/03-MATCHING-PAGES.md)
- [Frontend Architecture](./docs/04-FRONTEND-ARCHITECTURE.md)
- [Backend & Database](./docs/05-BACKEND-DATABASE.md)
- [User Manual](./docs/06-USER-MANUAL.md)
