# Complete Data Flow Investigation
## Login/Register → Profile → Matching Pages

**Date**: 2026-02-13  
**Investigator**: Senior Full Stack Developer  
**Status**: ✅ Complete

---

## Table of Contents

1. [Login/Register Flow](#1-loginregister-flow)
2. [Profile Pages Flow](#2-profile-pages-flow)
3. [Matching Pages Flow](#3-matching-pages-flow)
4. [Database Schema Overview](#4-database-schema-overview)
5. [API Endpoints Summary](#5-api-endpoints-summary)
6. [Data Transformation Patterns](#6-data-transformation-patterns)
7. [Issues & Recommendations](#7-issues--recommendations)

---

## 1. Login/Register Flow

### 1.1 Frontend Pages

**Login.tsx**:
- Form fields: email, password
- Client validation: required fields
- Calls: `AuthContext.login(email, password)`
- Success: Navigate to `/` (dashboard)
- Error: Show toast notification

**Register.tsx**:
- Form fields: email, password, confirmPassword, role
- Client validation: 
  - All fields required
  - Password >= 8 chars with complexity
  - Passwords match
  - Password strength meter
- Calls: `AuthContext.register(email, password, role)`
- Success: Navigate to `/` (dashboard)
- Error: Show toast with detailed message

### 1.2 Frontend Services

**AuthContext**:
```typescript
login(email, password) →
  authService.login() →
  Store token in localStorage →
  authService.getProfile() →
  Set user state →
  Navigate to dashboard

register(email, password, role) →
  authService.register() →
  Store token in localStorage →
  authService.getProfile() →
  Set user state →
  Navigate to dashboard
```

**AuthService**:
- `login()`: POST `/auth/login` → Returns `{ user, token }`
- `register()`: POST `/auth/register` → Returns `{ user, token }`
- `getProfile()`: GET `/auth/me` → Returns UserProfile
- Token management via `apiClient.setToken()`

### 1.3 Backend Controllers

**AuthController** (`/auth`):
- `POST /register` → No auth required
- `POST /login` → No auth required
- `GET /me` → Protected (JwtAuthGuard)
- `PUT /profile` → Protected
- `POST /complete-profile` → Protected

**Rate Limiting**:
- Login: 5 attempts / 15 minutes
- Register: 3 attempts / hour

### 1.4 Backend Services

**AuthService**:

**register()**:
1. Check email uniqueness
2. Hash password (bcrypt, 10 rounds)
3. Create user record
4. Create profile (InfluencerProfile or CompanyProfile)
5. Generate JWT (7-day expiry)
6. Fetch unified profile data
7. Return `{ user, token }`

**login()**:
1. Check account lockout status
2. Find user by email
3. Compare password with bcrypt
4. Record failed attempts (5 max → 30 min lockout)
5. Generate JWT on success
6. Clear lockout on success
7. Fetch unified profile data
8. Return `{ user, token }`

**getUnifiedProfileData()** - KEY METHOD:
- Returns consistent structure for both roles
- Merges user + profile data
- Calculates profile completion %
- Returns nested `profile` object for compatibility

### 1.5 Database Schema

**users** table:
```sql
id (uuid, PK)
email (varchar, unique)
password (varchar, hashed)
role (enum: INFLUENCER, COMPANY, ADMIN)
isActive (boolean)
profileCompleted (boolean)
profileCompletionPercentage (integer)
avatarUrl (varchar)
createdAt, updatedAt (timestamp)
```

**influencer_profiles** table:
```sql
id (uuid, PK)
userId (uuid, FK → users.id, unique)
name, niche, bio (varchar/text)
audienceSize (integer)
engagementRate (decimal)
platforms (jsonb)
location, portfolioUrl (varchar)
minBudget, maxBudget (integer)
collaborationPreference (varchar)
avatarUrl (varchar)
createdAt, updatedAt (timestamp)
```

**company_profiles** table:
```sql
id (uuid, PK)
userId (uuid, FK → users.id, unique)
name (varchar) -- ✅ Fixed from companyName
industry, bio, description (varchar/text)
budget (integer)
platforms (jsonb)
location, website (varchar)
companySize (varchar)
campaignType (jsonb)
preferredInfluencerNiches (text)
collaborationDuration (varchar)
minAudienceSize, maxAudienceSize (integer)
verificationStatus (boolean)
avatarUrl (varchar)
createdAt, updatedAt (timestamp)
```

---

## 2. Profile Pages Flow

### 2.1 Frontend Pages

**Profile.tsx** (Own Profile View):
- Reads: `user` from AuthContext
- Displays: Avatar, name, stats, platforms, bio
- Shows: CollaborationStats widget
- Action: Navigate to `/profile/edit`
- Handles: Both nested profile and flat user structure

**ProfileEdit.tsx** (Edit Own Profile):
- Tabs: Basic Info, Details, Bio & Links, Preferences
- Components:
  - AvatarUpload
  - BasicInfoStep
  - RoleSpecificStep
  - BioPortfolioStep
  - PreferencesStep
- Validation: Name, bio (min 20 chars), role-specific fields
- API: PUT `/auth/profile` with updateData
- Success: `refreshProfile()` → Navigate to `/profile`

**ProfileView.tsx** (View Other's Profile):
- URL: `/profile/:id`
- Loads: `profileService.getProfile(id)`
- Displays:
  - Profile tabs (About, Analytics, Portfolio, Activity, Network)
  - Compatibility score
  - Save profile button
  - Collaboration stats
  - Connection status
- Actions:
  - Send message
  - Request collaboration
  - Rate collaboration (if connected)
  - Save/unsave profile
- Real-time: Listens for profile updates via WebSocket

### 2.2 Frontend Services

**ProfileService**:
```typescript
getProfile(userId) → GET /profiles/user/{userId}
saveProfile(profileId, notes, tags) → POST /profiles/{profileId}/save
unsaveProfile(profileId) → DELETE /profiles/{profileId}/save
getSavedProfiles() → GET /profiles/saved
isProfileSaved(profileId) → GET /profiles/{profileId}/saved-status
```

### 2.3 Backend Controllers

**ProfilesController** (`/profiles`):
- `GET /user/:userId` → Get profile by user ID
- `GET /influencer/:id` → Get influencer by profile ID
- `GET /company/:id` → Get company by profile ID
- `PATCH /influencer/:id` → Update influencer profile
- `PATCH /company/:id` → Update company profile
- `POST /:profileId/save` → Save profile
- `DELETE /:profileId/save` → Unsave profile
- `GET /saved` → Get saved profiles
- `GET /:profileId/saved-status` → Check if saved
- `POST /:profileId/reviews` → Create review
- `GET /:profileId/reviews` → Get reviews
- `GET /:profileId/ratings` → Get ratings

### 2.4 Backend Services

**ProfilesService**:

**getProfileByUserId(userId)**:
1. Try to find influencer_profile by userId
2. If found, return transformed influencer data
3. Else try to find company_profile by userId
4. If found, return transformed company data
5. Throw NotFoundException if neither found

**Transformation**:
```typescript
// Influencer
{
  id: userId,  // ✅ Returns user ID, not profile ID
  profileId: influencerProfile.id,
  name, type: 'influencer',
  niche, audienceSize, engagementRate,
  platforms, location, bio, avatarUrl,
  portfolioUrl, budgetRange, contentType,
  collaborationPreference, verificationStatus
}

// Company
{
  id: userId,  // ✅ Returns user ID, not profile ID
  profileId: companyProfile.id,
  name,  // ✅ Changed from companyName
  type: 'company',
  industry, budget, location, platforms,
  bio, description, avatarUrl, website,
  budgetRange, verificationStatus,
  companySize, campaignType,
  preferredInfluencerNiches,
  collaborationDuration
}
```

**saveProfile(userId, profileId, notes, tags)**:
1. Check if already saved
2. If exists, update notes/tags
3. Else create new SavedProfile record
4. Return saved profile

**createReview(reviewerId, profileId, dto)**:
1. Validate not self-review
2. Check for duplicate review (same connection)
3. Create ProfileReview record
4. Return review

**getProfileRatings(profileId)**:
1. Find all reviews for profile
2. Calculate averages for each rating category
3. Calculate rating distribution (1-5 stars)
4. Return aggregated ratings

### 2.5 Database Schema

**saved_profiles** table:
```sql
id (uuid, PK)
userId (uuid, FK → users.id)
savedProfileId (uuid, FK → users.id)
notes (text)
tags (jsonb)
createdAt (timestamp)
```

**profile_reviews** table:
```sql
id (uuid, PK)
profileId (uuid, FK → users.id)
reviewerId (uuid, FK → users.id)
connectionId (uuid, FK → connections.id)
overallRating (integer, 1-5)
communicationRating (integer, 1-5)
professionalismRating (integer, 1-5)
qualityRating (integer, 1-5)
timelinessRating (integer, 1-5)
reviewText (text)
helpfulCount (integer)
createdAt, updatedAt (timestamp)
```

---

## 3. Matching Pages Flow

### 3.1 Frontend Pages

**Matches.tsx**:
- Displays: List of match cards with scores
- Features:
  - FilterPanel (niche, location, budget, platforms, etc.)
  - ComparisonBar (compare selected matches)
  - Pagination
  - Sort options
- Loads: `matchingService.getMatches(filters)`
- Actions:
  - View profile
  - Send message
  - Request collaboration
  - Rate collaboration
  - Add to comparison
- Real-time: Debounced filter updates

### 3.2 Frontend Services

**MatchingService**:

**getMatches(filters)**:
1. Build query params from filters
2. GET `/matching/matches?{params}`
3. Transform backend response
4. Apply client-side minScore filter
5. Apply client-side sorting
6. Return paginated response

**Transformation**:
```typescript
// Backend format
{
  id, user, score, factors
}

// Frontend format
{
  id,
  profile: { ...user data },
  score,
  tier: calculateTier(score),
  breakdown: { ...factors }
}
```

**Other Methods**:
- `createCollaborationRequest()` → POST `/matching/collaboration-requests`
- `getMyConnections()` → GET `/matching/connections`
- `getConnectionStatus(userId)` → GET `/matching/connections/status/:id`

### 3.3 Backend Controllers

**MatchingController** (`/matching`):
- `GET /matches` → Get all matches for user
- `GET /matches/:id` → Get single match
- `POST /connections` → Create connection
- `DELETE /connections/:id` → Delete connection
- `GET /connections/status/:id` → Get connection status
- `GET /connections` → Get my connections
- `POST /collaboration-requests` → Create request
- `GET /collaboration-requests/received` → Get received
- `GET /collaboration-requests/sent` → Get sent
- `PUT /collaboration-requests/:id` → Update request
- `GET /match-history` → Get match history
- `GET /match-history/analytics` → Get analytics
- `GET /match-history/trends` → Get score trends

### 3.4 Backend Services

**MatchingService**:

**getMatches(userId)**:
1. Find user by ID
2. Determine opposite role (INFLUENCER ↔ COMPANY)
3. Find all active users with opposite role
4. For each potential match:
   - Load profile data (influencer or company)
   - Calculate match score
   - Get match factors breakdown
   - Record match history (async)
5. Sort by score (descending)
6. Return matches with profiles

**calculateMatchScore(user1, user2)**:
- Weighted average of 6 factors:
  - nicheCompatibility: 25%
  - budgetAlignment: 20%
  - platformOverlap: 15%
  - engagementTierMatch: 15%
  - audienceSizeMatch: 15%
  - locationCompatibility: 10%
- Returns score 0-100

**Factor Calculations**:

**nicheCompatibility**:
- Exact match: 100
- Partial match (contains): 80
- Related industries: 65
- No match: 40

**budgetAlignment**:
- Estimate influencer rate: (audienceSize / 1000) * $30
- Perfect (1-2x rate): 100
- Good (0.7-3x): 80
- Fair (0.4-5x): 60
- Poor: 35-45

**platformOverlap**:
- Jaccard similarity of platform sets
- Any overlap: min 50
- No overlap: 30

**audienceSizeMatch**:
- Estimate target from budget
- Within 30%: 100
- Within 50%: 80
- Within 2x: 60
- Outside: 40-45

**engagementTierMatch**:
- >5%: 100
- 3-5%: 85
- 1.5-3%: 70
- 0.5-1.5%: 55
- <0.5%: 40

**locationCompatibility**:
- Same city: 100
- Same state: 80
- Same country: 60
- Different: 40

**createCollaborationRequest(requesterId, dto)**:
1. Check if connection exists
2. If exists, update with new request data
3. Else create new connection with PENDING status
4. Set collaborationStatus to 'requested'
5. Store collaboration request data (budget, timeline, deliverables)
6. Send message to recipient via MessagingService
7. Return connection

**getMyConnections(userId)**:
1. Find all connections where user is requester or recipient
2. For each connection:
   - Determine other user
   - Load other user's profile
   - Attach profile data
3. Return connections with details

### 3.5 Database Schema

**matches** table:
```sql
id (uuid, PK)
influencerId (uuid, FK → users.id)
companyId (uuid, FK → users.id)
score (decimal 5,2)
factors (jsonb)
createdAt (timestamp)
```

**connections** table:
```sql
id (uuid, PK)
requesterId (uuid, FK → users.id)
recipientId (uuid, FK → users.id)
status (enum: pending, accepted, rejected)
collaborationRequestData (jsonb)
collaborationStatus (varchar)
collaborationType (varchar)
createdAt, updatedAt (timestamp)
```

**CollaborationRequestData structure**:
```typescript
{
  message?: string
  budgetMin?: number
  budgetMax?: number
  timeline?: string
  deliverables?: string[]
  platforms?: string[]
  collaborationType?: 'one-time' | 'ongoing' | 'project-based'
  startDate?: string
  endDate?: string
  additionalNotes?: string
}
```

**match_history** table:
```sql
id (uuid, PK)
userId (uuid, FK → users.id)
matchUserId (uuid, FK → users.id)
score (decimal 5,2)
factors (jsonb)
action (varchar: viewed, connected, messaged, etc.)
createdAt (timestamp)
```

---

## 4. Database Schema Overview

### 4.1 Core Tables

```
users (authentication)
  ├── influencer_profiles (1:1)
  ├── company_profiles (1:1)
  ├── saved_profiles (1:many, as saver)
  ├── profile_reviews (1:many, as reviewer)
  ├── connections (1:many, as requester)
  ├── connections (1:many, as recipient)
  ├── matches (1:many, as influencer)
  ├── matches (1:many, as company)
  ├── match_history (1:many)
  ├── messages (1:many, as sender)
  ├── conversations (1:many, as participant)
  └── feed_posts (1:many, as author)
```

### 4.2 Relationship Diagram

```
┌─────────┐
│  users  │
└────┬────┘
     │
     ├─1:1─► influencer_profiles
     ├─1:1─► company_profiles
     │
     ├─1:M─► saved_profiles (userId)
     ├─1:M─► profile_reviews (reviewerId)
     │
     ├─1:M─► connections (requesterId)
     ├─1:M─► connections (recipientId)
     │
     ├─1:M─► matches (influencerId)
     ├─1:M─► matches (companyId)
     │
     ├─1:M─► match_history
     │
     ├─1:M─► messages (senderId)
     ├─M:M─► conversations (participants)
     │
     └─1:M─► feed_posts (authorId)
```

### 4.3 Key Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_influencer_profiles_userId ON influencer_profiles(userId);
CREATE INDEX idx_company_profiles_userId ON company_profiles(userId);
CREATE INDEX idx_connections_requester ON connections(requesterId);
CREATE INDEX idx_connections_recipient ON connections(recipientId);
CREATE INDEX idx_matches_influencer ON matches(influencerId);
CREATE INDEX idx_matches_company ON matches(companyId);
CREATE INDEX idx_match_history_userId ON match_history(userId);
CREATE INDEX idx_saved_profiles_userId ON saved_profiles(userId);
```

---

## 5. API Endpoints Summary

### 5.1 Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Create account |
| POST | /login | No | Login |
| GET | /me | Yes | Get current user |
| PUT | /profile | Yes | Update profile |
| POST | /complete-profile | Yes | Mark complete |
| POST | /logout | Yes | Logout |

### 5.2 Profiles (`/profiles`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /user/:userId | Yes | Get profile by user ID |
| GET | /influencer/:id | Yes | Get influencer by profile ID |
| GET | /company/:id | Yes | Get company by profile ID |
| PATCH | /influencer/:id | Yes | Update influencer |
| PATCH | /company/:id | Yes | Update company |
| POST | /:profileId/save | Yes | Save profile |
| DELETE | /:profileId/save | Yes | Unsave profile |
| GET | /saved | Yes | Get saved profiles |
| GET | /:profileId/saved-status | Yes | Check if saved |
| POST | /:profileId/reviews | Yes | Create review |
| GET | /:profileId/reviews | Yes | Get reviews |
| GET | /:profileId/ratings | Yes | Get ratings |

### 5.3 Matching (`/matching`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /matches | Yes | Get all matches |
| GET | /matches/:id | Yes | Get single match |
| POST | /connections | Yes | Create connection |
| DELETE | /connections/:id | Yes | Delete connection |
| GET | /connections/status/:id | Yes | Get connection status |
| GET | /connections | Yes | Get my connections |
| POST | /collaboration-requests | Yes | Create request |
| GET | /collaboration-requests/received | Yes | Get received |
| GET | /collaboration-requests/sent | Yes | Get sent |
| PUT | /collaboration-requests/:id | Yes | Update request |
| GET | /match-history | Yes | Get history |
| GET | /match-history/analytics | Yes | Get analytics |
| GET | /match-history/trends | Yes | Get trends |

---

## 6. Data Transformation Patterns

### 6.1 Backend → Frontend

**User Profile**:
```typescript
// Backend (AuthService.getUnifiedProfileData)
{
  name, bio, avatarUrl,
  niche/industry, audienceSize/budget,
  platforms, location,
  profileCompletionPercentage,
  profileCompleted,
  profile: { nested structure }
}

// Frontend (AuthContext.user)
Same structure, consumed directly
```

**Match Data**:
```typescript
// Backend (MatchingService.getMatches)
{
  id, user, score, factors
}

// Frontend (MatchingService.transformMatch)
{
  id,
  profile: { ...user },
  score,
  tier: 'Perfect' | 'Excellent' | 'Good' | 'Fair',
  breakdown: { ...factors }
}
```

### 6.2 Frontend → Backend

**Profile Update**:
```typescript
// Frontend (ProfileEdit.tsx)
{
  name, bio, location, avatarUrl,
  // Role-specific fields
  niche?, audienceSize?, platforms?,
  industry?, budget?, companySize?
}

// Backend (AuthService.updateProfile)
Updates appropriate profile table
Syncs avatarUrl across all tables
```

**Collaboration Request**:
```typescript
// Frontend (CollaborationRequestModal)
{
  recipientId, message,
  projectTitle, budget, timeline,
  deliverables, projectDescription
}

// Backend (MatchingService.createCollaborationRequest)
{
  requesterId, recipientId,
  collaborationRequestData: {
    message, budgetMin, budgetMax,
    timeline, deliverables,
    additionalNotes
  }
}
```

---

## 7. Issues & Recommendations

### 7.1 Fixed Issues ✅

1. **Database Field Mismatch**: `companyName` → `name` (migration created)
2. **JWT Secret Security**: Removed fallback, now required
3. **Password Strength**: Added validation and strength meter
4. **Rate Limiting**: Implemented for login/register
5. **Account Lockout**: 5 attempts → 30 min lockout

### 7.2 Current Issues ⚠️

1. **Profile ID vs User ID Confusion**:
   - Some endpoints use profileId, others use userId
   - Frontend sometimes confuses the two
   - **Fix**: Consistently use userId for user-facing operations

2. **Match History Recording**:
   - Async recording may fail silently
   - No retry mechanism
   - **Fix**: Add error handling and retry logic

3. **Connection Status Enum**:
   - Uses both 'accepted' and 'connected'
   - Inconsistent across codebase
   - **Fix**: Standardize on 'accepted'

4. **Profile Transformation**:
   - Multiple transformation points
   - Inconsistent field mapping
   - **Fix**: Create single source of truth for transformations

### 7.3 Performance Recommendations 🚀

1. **Caching**:
   - Cache match calculations (expensive)
   - Cache profile data (frequently accessed)
   - Use Redis for session storage

2. **Database Optimization**:
   - Add composite indexes for common queries
   - Denormalize frequently accessed data
   - Use materialized views for analytics

3. **API Optimization**:
   - Implement GraphQL for flexible queries
   - Add pagination to all list endpoints
   - Use cursor-based pagination for large datasets

4. **Frontend Optimization**:
   - Implement virtual scrolling for match lists
   - Lazy load profile tabs
   - Prefetch likely next pages

### 7.4 Security Recommendations 🔒

1. **Email Verification**: Add verification flow
2. **Password Reset**: Implement secure reset mechanism
3. **Refresh Tokens**: Add for better security
4. **2FA**: Implement two-factor authentication
5. **Rate Limiting**: Add to more endpoints
6. **Input Sanitization**: Add XSS protection
7. **CSRF Protection**: Implement CSRF tokens

### 7.5 Feature Recommendations ✨

1. **Real-time Updates**:
   - WebSocket for live match updates
   - Real-time collaboration status
   - Live messaging notifications

2. **Advanced Matching**:
   - ML-based score improvements
   - User feedback integration
   - A/B testing for algorithms

3. **Analytics**:
   - Match success tracking
   - Conversion funnel analysis
   - User behavior insights

4. **Social Features**:
   - Profile endorsements
   - Skill verification
   - Portfolio showcases

---

## Conclusion

The platform has a well-structured data flow from frontend to backend to database. The authentication system is secure with recent improvements. The profile system handles both roles effectively with unified data structures. The matching algorithm is sophisticated with multiple factors.

**Key Strengths**:
- Clean separation of concerns
- Type-safe TypeScript throughout
- Comprehensive API coverage
- Flexible matching algorithm
- Real-time capabilities

**Areas for Improvement**:
- Consistency in ID usage (profile vs user)
- Error handling and retry logic
- Performance optimization
- Additional security features
- Enhanced analytics

**Overall Grade**: A-

The system is production-ready with the implemented security fixes and has a solid foundation for future enhancements.

---

**Investigation Complete** ✅  
**Date**: 2026-02-13  
**Total Pages Analyzed**: 3 (Login/Register, Profile, Matching)  
**Total Endpoints Documented**: 30+  
**Total Database Tables**: 10+

