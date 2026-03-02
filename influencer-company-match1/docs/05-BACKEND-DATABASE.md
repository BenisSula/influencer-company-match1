# Backend & Database Documentation

## Backend Architecture

### Technology Stack

**Core Framework:**
- **NestJS 10.3** - Progressive Node.js framework
- **TypeScript 5.3** - Type-safe development
- **Node.js 20+** - Runtime environment

**Database:**
- **PostgreSQL 14+** - Primary database
- **TypeORM 0.3.19** - ORM and migrations
- **Redis 4.6** (Optional) - Caching layer

**Authentication:**
- **Passport.js** - Authentication middleware
- **JWT (jsonwebtoken)** - Token-based auth
- **bcrypt** - Password hashing

**Real-Time:**
- **Socket.io 4.8** - WebSocket server
- **@nestjs/websockets** - NestJS WebSocket integration

**Payment Processing:**
- **Stripe 20.3** - Payment and payout processing
- **Stripe Connect** - Marketplace payments

**Background Jobs:**
- **Bull 4.16** - Job queue
- **@nestjs/bull** - NestJS Bull integration

**Email:**
- **Nodemailer 8.0** - Email sending
- **Email templates** - HTML email templates

**File Storage:**
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Local storage** (development)
- **AWS S3** (production, planned)

**Validation:**
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

**API Documentation:**
- **Swagger/OpenAPI** (planned)

---

## Project Structure

```
backend/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── profiles/        # User profiles
│   │   ├── matching/        # Matching algorithm
│   │   ├── messaging/       # Real-time messaging
│   │   ├── feed/            # Social feed
│   │   ├── campaigns/       # Campaign management
│   │   ├── payments/        # Payment processing
│   │   ├── wallet/          # User wallets
│   │   ├── notifications/   # Notification system
│   │   ├── admin/           # Admin dashboard
│   │   ├── landing/         # Landing page API
│   │   ├── chatbot/         # AI chatbot
│   │   ├── ai-matching/     # AI/ML matching
│   │   ├── analytics/       # Analytics tracking
│   │   ├── search/          # Global search
│   │   ├── settings/        # User settings
│   │   ├── email/           # Email service
│   │   ├── media/           # Media upload
│   │   └── experiments/     # A/B testing
│   │
│   ├── database/            # Database related
│   │   ├── migrations/      # TypeORM migrations
│   │   └── seeds/           # Database seeders
│   │
│   ├── common/              # Shared code
│   │   ├── decorators/      # Custom decorators
│   │   ├── guards/          # Auth guards
│   │   ├── middleware/      # Middleware
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Interceptors
│   │   ├── pipes/           # Validation pipes
│   │   └── utils/           # Utility functions
│   │
│   ├── config/              # Configuration
│   │   ├── database.config.ts
│   │   ├── stripe.config.ts
│   │   └── ...
│   │
│   ├── cache/               # Caching service
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry
│
├── test/                    # Tests
│   ├── e2e/                # End-to-end tests
│   └── load/               # Load tests
│
├── ormconfig.ts            # TypeORM configuration
├── package.json
└── tsconfig.json
```

---

## Module Architecture

### Module Pattern

Each feature is organized as a NestJS module:

```typescript
// Example: Matching Module
@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Connection]),
    CacheModule,
  ],
  controllers: [MatchingController],
  providers: [MatchingService, MatchAnalyticsService],
  exports: [MatchingService],
})
export class MatchingModule {}
```

### Layered Architecture

**Controller Layer:**
- Handle HTTP requests
- Validate input (DTOs)
- Return responses
- Route definitions

**Service Layer:**
- Business logic
- Data manipulation
- External service calls
- Transaction management

**Repository Layer:**
- Database operations
- TypeORM repositories
- Query building

**Entity Layer:**
- Database models
- Relationships
- Validation rules

---

## Core Modules

### 1. Authentication Module

**Location:** `src/modules/auth/`

**Entities:**
- `User` - Base user account
- `InfluencerProfile` - Influencer-specific data
- `CompanyProfile` - Company-specific data

**Controllers:**
- `AuthController` - Registration, login, logout

**Services:**
- `AuthService` - Authentication logic
- `JwtStrategy` - JWT validation
- `LocalStrategy` - Local authentication

**Endpoints:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

**Authentication Flow:**
1. User registers with email/password
2. Password hashed with bcrypt (10 rounds)
3. JWT token generated and returned
4. Token stored in client localStorage
5. Token sent in Authorization header for protected routes
6. Token validated by JwtAuthGuard

**Security Features:**
- Password strength validation
- Rate limiting on login attempts
- Account lockout after failed attempts
- Email verification
- Password reset with secure tokens

---

### 2. Profiles Module

**Location:** `src/modules/profiles/`

**Entities:**
- `InfluencerProfile`
- `CompanyProfile`
- `SavedProfile`
- `ProfileReview`

**Controllers:**
- `ProfilesController` - Profile CRUD operations

**Services:**
- `ProfilesService` - Profile management

**Endpoints:**
```
GET    /api/profiles/me
PUT    /api/profiles/me
GET    /api/profiles/:id
GET    /api/profiles/:id/reviews
POST   /api/profiles/:id/reviews
GET    /api/profiles/saved
POST   /api/profiles/:id/save
DELETE /api/profiles/:id/save
```

**Profile Fields:**

**Influencer:**
- Basic info (name, bio, location)
- Niches/industries
- Platform accounts (Instagram, YouTube, TikTok, etc.)
- Follower counts
- Engagement rates
- Content categories
- Collaboration preferences
- Portfolio/media

**Company:**
- Company name and description
- Industry
- Company size
- Budget range
- Target audience
- Campaign types
- Collaboration goals

---

### 3. Matching Module

**Location:** `src/modules/matching/`

**Entities:**
- `Match` - Generated matches
- `Connection` - Accepted connections
- `MatchHistory` - Historical match data

**Controllers:**
- `MatchingController` - Match operations

**Services:**
- `MatchingService` - Core matching logic
- `MatchAnalyticsService` - Match analytics
- `MatchHistoryService` - Match history

**Endpoints:**
```
GET  /api/matching/matches
GET  /api/matching/matches/:id
POST /api/matching/matches/:id/view
GET  /api/matching/compatibility/:id
POST /api/matching/requests
GET  /api/matching/requests
PUT  /api/matching/requests/:id/accept
PUT  /api/matching/requests/:id/decline
POST /api/matching/compare
GET  /api/matching/history
GET  /api/matching/analytics
```

**Matching Algorithm:**

Weighted compatibility scoring:
```typescript
const calculateCompatibility = (influencer, company) => {
  const scores = {
    nicheMatch: calculateNicheMatch(influencer, company) * 0.30,
    budgetAlign: calculateBudgetAlignment(influencer, company) * 0.20,
    locationMatch: calculateLocationMatch(influencer, company) * 0.15,
    platformOverlap: calculatePlatformOverlap(influencer, company) * 0.15,
    audienceSize: calculateAudienceSizeMatch(influencer, company) * 0.10,
    engagementTier: calculateEngagementTier(influencer) * 0.10,
  };
  
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
};
```

**Caching:**
- Match results cached for 1 hour
- Compatibility scores cached
- Invalidated on profile updates

---

### 4. Messaging Module

**Location:** `src/modules/messaging/`

**Entities:**
- `Conversation` - Chat conversations
- `Message` - Individual messages

**Controllers:**
- `MessagingController` - REST endpoints

**Gateways:**
- `MessagingGateway` - WebSocket gateway

**Services:**
- `MessagingService` - Message management

**Endpoints:**
```
GET  /api/messaging/conversations
GET  /api/messaging/conversations/:id
POST /api/messaging/conversations
GET  /api/messaging/conversations/:id/messages
POST /api/messaging/conversations/:id/messages
PUT  /api/messaging/messages/:id/read
```

**WebSocket Events:**
```
// Client -> Server
message:send
message:typing
message:read

// Server -> Client
message:new
message:typing
message:read
conversation:updated
```

**Real-Time Features:**
- Instant message delivery
- Typing indicators
- Read receipts
- Online status
- Message notifications

---

### 5. Feed Module

**Location:** `src/modules/feed/`

**Entities:**
- `FeedPost` - Posts
- `PostComment` - Comments
- `Reaction` - Likes/reactions
- `Share` - Post shares
- `Hashtag` - Hashtags
- `Mention` - User mentions

**Controllers:**
- `FeedController` - Feed operations

**Services:**
- `FeedService` - Feed management

**Endpoints:**
```
GET    /api/feed/posts
POST   /api/feed/posts
GET    /api/feed/posts/:id
PUT    /api/feed/posts/:id
DELETE /api/feed/posts/:id
POST   /api/feed/posts/:id/react
DELETE /api/feed/posts/:id/react
POST   /api/feed/posts/:id/comment
GET    /api/feed/posts/:id/comments
POST   /api/feed/posts/:id/share
GET    /api/feed/hashtags/:tag
```

**Feed Algorithm:**
- Chronological by default
- Filter by connections
- Filter by hashtags
- Search functionality

---

### 6. Campaigns Module

**Location:** `src/modules/campaigns/`

**Entities:**
- `Campaign` - Campaign details
- `CampaignApplication` - Applications
- `Collaboration` - Active collaborations
- `CampaignMilestone` - Milestones

**Controllers:**
- `CampaignsController` - Campaign operations

**Services:**
- `CampaignsService` - Campaign management

**Endpoints:**
```
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
POST   /api/campaigns/:id/apply
GET    /api/campaigns/:id/applications
PUT    /api/campaigns/:id/applications/:appId/accept
PUT    /api/campaigns/:id/applications/:appId/reject
```

**Campaign Workflow:**
1. Company creates campaign
2. Influencers browse and apply
3. Company reviews applications
4. Company selects influencers
5. Collaboration begins
6. Milestones tracked
7. Payment processed
8. Review and feedback

---

### 7. Payments Module

**Location:** `src/modules/payments/`

**Entities:**
- `Payment` - Payment transactions
- `PaymentMethod` - Saved payment methods
- `Payout` - Payout records
- `Invoice` - Generated invoices

**Controllers:**
- `PaymentsController` - Payment operations
- `PaymentsWebhookController` - Stripe webhooks
- `InvoiceController` - Invoice management

**Services:**
- `PaymentsService` - Payment processing
- `StripeConnectService` - Stripe Connect
- `InvoiceService` - Invoice generation
- `PaymentsWebhookService` - Webhook handling

**Endpoints:**
```
POST /api/payments/create-intent
POST /api/payments/confirm
GET  /api/payments
GET  /api/payments/:id
POST /api/payments/:id/refund
GET  /api/payments/methods
POST /api/payments/methods
DELETE /api/payments/methods/:id
POST /api/payments/connect/onboard
GET  /api/payments/connect/status
POST /api/payments/webhooks/stripe
GET  /api/invoices
GET  /api/invoices/:id
GET  /api/invoices/:id/pdf
```

**Stripe Integration:**
- Stripe Checkout for payments
- Stripe Connect for payouts
- Automatic invoice generation
- Webhook handling for events
- Payment method storage
- Refund processing

**Payment Flow:**
1. Company initiates payment for collaboration
2. Payment intent created via Stripe
3. Client confirms payment with Stripe.js
4. Webhook confirms payment success
5. Funds held in platform account
6. Collaboration completed
7. Payout to influencer via Stripe Connect
8. Invoice generated and emailed

---

### 8. Admin Module

**Location:** `src/modules/admin/`

**Entities:**
- `AdminUser` - Admin accounts
- `Tenant` - Multi-tenant instances
- `AuditLog` - Admin action logs
- `PlatformConfig` - Branding config
- `EmailTemplate` - Email templates
- `SystemConfig` - System settings
- `ContentFlag` - Flagged content
- `UserBan` - User bans

**Controllers:**
- `AdminAuthController` - Admin authentication
- `UserManagementController` - User management
- `TenantController` - Tenant management
- `PaymentController` - Payment management
- `AnalyticsController` - Analytics
- `ModerationController` - Content moderation
- `BrandingController` - Branding config
- `SystemSettingsController` - System settings
- `ReviewsController` - Review management

**Services:**
- `AdminAuthService` - Admin authentication
- `UserManagementService` - User CRUD
- `TenantService` - Tenant management
- `StripeService` - Payment admin
- `AnalyticsService` - Analytics data
- `ModerationService` - Content moderation
- `BrandingService` - Branding management
- `SystemSettingsService` - Settings management
- `ReviewsService` - Review management

**Gateways:**
- `SettingsGateway` - Real-time settings updates

**Guards:**
- `AdminAuthGuard` - Admin authentication
- `RolesGuard` - Role-based access

**Endpoints:** See [Admin Dashboard Documentation](./02-ADMIN-DASHBOARD.md)

---

### 9. AI Matching Module

**Location:** `src/modules/ai-matching/`

**Entities:**
- `Recommendation` - AI recommendations
- `MLModel` - ML model metadata
- `MatchTrainingData` - Training data
- `CollaborationOutcome` - Feedback data

**Controllers:**
- `AIMatchingController` - AI operations

**Services:**
- `AIMatchingService` - AI matching logic
- `MLServiceClient` - ML service integration
- `RecommendationService` - Recommendations
- `AnalyticsService` - AI analytics
- `CollaborationOutcomeService` - Feedback processing
- `FeatureEngineeringService` - Feature extraction
- `MLModelService` - Model management

**Endpoints:**
```
GET  /api/ai-matching/recommendations
POST /api/ai-matching/feedback
GET  /api/ai-matching/analytics
POST /api/ai-matching/train
```

**ML Service Integration:**
- External Python ML service (FastAPI)
- HTTP client for ML predictions
- Feature engineering pipeline
- Continuous learning from feedback

---

### 10. Chatbot Module

**Location:** `src/modules/chatbot/`

**Entities:**
- `ChatbotConversation` - Chat sessions
- `ChatbotMessage` - Messages
- `ChatbotIntent` - Intent definitions

**Controllers:**
- `ChatbotController` - REST endpoints

**Gateways:**
- `ChatbotGateway` - WebSocket gateway

**Services:**
- `ChatbotService` - Chat management
- `ChatbotAIService` - AI integration

**Endpoints:**
```
POST /api/chatbot/message
GET  /api/chatbot/conversations
GET  /api/chatbot/conversations/:id
```

**WebSocket Events:**
```
chatbot:message
chatbot:response
chatbot:typing
```

**ML Service Integration:**
- Intent classification
- Entity extraction
- Response generation
- Sentiment analysis

---

## Database Schema

### Core Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'influencer' | 'company'
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  stripe_customer_id VARCHAR(255),
  stripe_account_id VARCHAR(255)
);
```

**influencer_profiles**
```sql
CREATE TABLE influencer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  location VARCHAR(255),
  niches TEXT[], -- Array of niches
  platforms JSONB, -- {instagram: {...}, youtube: {...}}
  follower_count INTEGER,
  engagement_rate DECIMAL(5,2),
  content_categories TEXT[],
  collaboration_preferences JSONB,
  portfolio_items JSONB[],
  avatar_url VARCHAR(500),
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**company_profiles**
```sql
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(255),
  company_size VARCHAR(50),
  budget_range VARCHAR(50),
  target_audience TEXT,
  campaign_types TEXT[],
  collaboration_goals TEXT,
  location VARCHAR(255),
  website VARCHAR(500),
  avatar_url VARCHAR(500),
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**matches**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES users(id),
  company_id UUID REFERENCES users(id),
  compatibility_score DECIMAL(5,2) NOT NULL,
  score_breakdown JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(influencer_id, company_id)
);
```

**connections**
```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  message TEXT,
  collaboration_details JSONB,
  connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**conversations**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1_id UUID REFERENCES users(id),
  participant_2_id UUID REFERENCES users(id),
  last_message TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id)
);
```

**messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  attachments JSONB[],
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**feed_posts**
```sql
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  media JSONB[],
  visibility VARCHAR(50) DEFAULT 'public',
  reaction_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**campaigns**
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  duration_days INTEGER,
  application_deadline TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payer_id UUID REFERENCES users(id),
  payee_id UUID REFERENCES users(id),
  collaboration_id UUID REFERENCES connections(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### Indexes

**Performance Indexes:**
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Profile lookups
CREATE INDEX idx_influencer_profiles_user_id ON influencer_profiles(user_id);
CREATE INDEX idx_company_profiles_user_id ON company_profiles(user_id);

-- Match queries
CREATE INDEX idx_matches_influencer_id ON matches(influencer_id);
CREATE INDEX idx_matches_company_id ON matches(company_id);
CREATE INDEX idx_matches_score ON matches(compatibility_score DESC);

-- Connection queries
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);

-- Message queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Feed queries
CREATE INDEX idx_feed_posts_author ON feed_posts(author_id);
CREATE INDEX idx_feed_posts_created_at ON feed_posts(created_at DESC);
```

---

## API Conventions

### Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Pagination

**Query Parameters:**
```
?page=1&limit=20&sort=created_at&order=DESC
```

**Response:**
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Filtering

**Query Parameters:**
```
?filter[status]=active&filter[role]=influencer
```

---

## Security

### Authentication
- JWT tokens with 24-hour expiration
- Refresh tokens (planned)
- Password hashing with bcrypt (10 rounds)
- Rate limiting on auth endpoints

### Authorization
- Role-based access control (RBAC)
- Resource ownership validation
- Admin-only endpoints protected

### Data Protection
- SQL injection prevention (TypeORM parameterized queries)
- XSS protection (input sanitization)
- CORS configuration
- Helmet.js security headers

### API Security
- Rate limiting (100 requests/15 minutes)
- Request validation (DTOs)
- Error message sanitization
- Audit logging

---

## Performance

### Caching Strategy
- Redis for session storage
- Query result caching
- Match result caching (1 hour)
- Profile data caching

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Pagination for large datasets

### Background Jobs
- Email sending (Bull queue)
- Analytics processing
- Report generation
- Data cleanup

---

## Monitoring & Logging

### Logging
- Winston logger
- Log levels (error, warn, info, debug)
- Structured logging
- Log rotation

### Error Tracking
- Exception filters
- Error logging
- Stack traces
- User context

### Performance Monitoring
- Request duration tracking
- Database query performance
- Memory usage
- CPU usage

---

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Load Tests
```bash
npm run test:load
```

---

## Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=secret
STRIPE_SECRET_KEY=sk_live_...
REDIS_URL=redis://localhost:6379
```

### Database Migrations
```bash
npm run migration:run
```

### Seeding
```bash
npm run seed
```

---

## Related Documentation
- [Frontend Architecture](./04-FRONTEND-ARCHITECTURE.md)
- [Admin Dashboard](./02-ADMIN-DASHBOARD.md)
- [Matching Pages](./03-MATCHING-PAGES.md)
