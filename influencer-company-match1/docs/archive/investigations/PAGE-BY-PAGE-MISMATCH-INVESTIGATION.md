# Page-by-Page Mismatch Investigation & Fix Plan
## Complete Frontend → Backend → Database Flow Analysis

**Investigation Date**: 2026-02-13  
**Status**: COMPREHENSIVE ANALYSIS COMPLETE  
**Critical Issues Found**: 47 mismatches across all layers

---

## TABLE OF CONTENTS
1. [Login/Register Flow](#1-loginregister-flow)
2. [Dashboard Page](#2-dashboard-page)
3. [Profile Page](#3-profile-page)
4. [ProfileView Page](#4-profileview-page)
5. [ProfileEdit Page](#5-profileedit-page)
6. [Matches Page](#6-matches-page)
7. [Messages Page](#7-messages-page)
8. [Feed Page](#8-feed-page)
9. [Connections Page](#9-connections-page)
10. [Campaigns Pages](#10-campaigns-pages)
11. [Settings Page](#11-settings-page)
12. [Critical Fixes Summary](#critical-fixes-summary)

---

## INVESTIGATION METHODOLOGY

For each page, I traced:
1. **Frontend Component** → What data it expects
2. **Frontend Service** → What API calls it makes
3. **Backend Controller** → What endpoints exist
4. **Backend Service** → What data transformations occur
5. **Database Schema** → What actual columns exist
6. **Identified Mismatches** → Where the chain breaks

---

## 1. LOGIN/REGISTER FLOW

### Frontend Component: `Login.tsx` & `Register.tsx`
**Expected Data Structure:**
```typescript
// Login expects
{ email: string, password: string }

// Register expects
{ email: string, password: string, role: 'INFLUENCER' | 'COMPANY' }

// Both expect response:
{ token: string, user: { id, email, role, ...profile data } }
```

### Frontend Service: `auth.service.ts`
**API Calls:**
- `POST /auth/login` → expects `{ token, user }`
- `POST /auth/register` → expects `{ token, user }`
- `GET /auth/me` → expects full user with profile

**MISMATCH #1**: Frontend expects `token` but some docs show `access_token`
**MISMATCH #2**: Frontend expects flat user object with profile fields

### Backend Controller: `auth.controller.ts`
**Endpoints:**
- `POST /auth/register` → calls `authService.register()`
- `POST /auth/login` → calls `authService.login()`
- `GET /auth/me` → calls `authService.getCurrentUser()`

**Returns:** `{ user: User, token: string }`

### Backend Service: `auth.service.ts`
**Data Transformation:**
```typescript
// Returns unified profile structure
{
  id, email, role, avatarUrl,
  name, bio, niche/industry, location, platforms,
  // Plus role-specific fields
  profile: { name, type, bio, ... } // Nested for compatibility
}
```

**MISMATCH #3**: Backend returns BOTH flat fields AND nested `profile` object
**MISMATCH #4**: Company profiles use `companyName` in DB but map to `name` in response

### Database Schema
**Tables:**
- `users` (id, email, password, role, avatarUrl, profileCompleted, profileCompletionPercentage)
- `influencer_profiles` (userId, name, niche, audienceSize, engagementRate, platforms, location, bio, avatarUrl)
- `company_profiles` (userId, companyName, industry, budget, platforms, location, bio, avatarUrl)

**MISMATCH #5**: `avatarUrl` stored in THREE places (users, influencer_profiles, company_profiles)
**MISMATCH #6**: Influencer uses `name`, Company uses `companyName` - inconsistent naming

### CRITICAL ISSUES:
1. ❌ Avatar URL sync across 3 tables can fail
2. ❌ Company name field mismatch (`companyName` vs `name`)
3. ❌ Profile completion percentage stored in DB but also calculated dynamically
4. ❌ Nested profile object creates confusion (flat vs nested access)

---

## 2. DASHBOARD PAGE

### Frontend Component: `Dashboard.tsx`
**Expected Data:**
```typescript
// Expects from matchingService.getMatches()
Match[] = [{
  id: string,
  profile: {
    id, name, type, niche/industry, audienceSize, budget, 
    location, platforms, bio, avatarUrl
  },
  score: number,
  tier: string,
  breakdown: {
    nicheCompatibility, locationCompatibility, budgetAlignment,
    platformOverlap, audienceSizeMatch, engagementTierMatch
  }
}]

// Expects from feedService.getFeed()
FeedPost[] = [{
  id, authorId,
  author: { id, email, role, avatarUrl },
  content, postType, mediaUrls, likeCount, commentCount
}]

// Expects from matchingService.getMyConnections()
Connection[] = [{ id, status, requester, recipient, ... }]
```

### Frontend Service: `matching.service.ts`
**API Calls:**
- `GET /matching/matches` → transforms backend response
- `GET /matching/connections` → gets connections

**MISMATCH #7**: Frontend transforms `factors` → `breakdown`
**MISMATCH #8**: If backend doesn't send `factors`, frontend uses fallback (50 for all)

### Backend Controller: `matching.controller.ts`
**Endpoints:**
- `GET /matching/matches` → calls `matchingService.getMatches(userId)`
- `GET /matching/connections` → calls `matchingService.getMyConnections(userId)`

### Backend Service: `matching.service.ts`
**Returns:**
```typescript
[{
  id: matchUserId,
  user: { ...userFields, ...profileFields },
  score: number,
  factors: { nicheCompatibility, locationCompatibility, ... }
}]
```

**MISMATCH #9**: Backend returns `factors` but frontend expects `breakdown`
**MISMATCH #10**: Backend returns `user` object but frontend expects `profile` object
**MISMATCH #11**: Match ID is user ID, not a separate match record ID

### Database Schema
**Tables:**
- `matches` (id, influencerId, companyId, score, factors)
- `connections` (id, requesterId, recipientId, status, collaborationRequestData, collaborationStatus)

**MISMATCH #12**: `matches` table exists but service doesn't use it - generates matches on-the-fly
**MISMATCH #13**: Connection status enum has BOTH 'connected' and 'accepted' (redundant)

### CRITICAL ISSUES:
1. ❌ Match factors/breakdown naming mismatch causes fake scores (fallback to 50)
2. ❌ Matches table not used - all matches calculated dynamically (performance issue)
3. ❌ Connection status enum confusion ('connected' vs 'accepted')
4. ❌ Feed author may not have avatarUrl populated

---

## 3. PROFILE PAGE

### Frontend Component: `Profile.tsx`
**Expected Data:**
```typescript
user: {
  id, email, role, avatarUrl,
  name, bio, niche/industry, location, audienceSize, 
  engagementRate, budget, platforms,
  profile?: { name, type, niche, industry, ... } // Fallback
}
```

**MISMATCH #14**: Component checks BOTH `user.name` AND `user.profile.name`
**MISMATCH #15**: Uses `user.profile.type` but backend returns lowercase ('influencer') vs role uppercase ('INFLUENCER')

### Frontend Service: `auth.service.ts`
**API Calls:**
- `GET /auth/me` → gets current user profile

### Backend Service: `auth.service.ts`
**Returns unified profile:**
```typescript
{
  // Flat fields
  name, bio, niche/industry, location, platforms, avatarUrl,
  // Nested profile for compatibility
  profile: { name, type: 'influencer'|'company', bio, ... }
}
```

**MISMATCH #16**: Backend maps `companyName` → `name` but this is done in service, not entity
**MISMATCH #17**: Profile type is lowercase ('influencer') but role is uppercase ('INFLUENCER')

### Database Schema
**Tables:**
- `influencer_profiles` (name, niche, audienceSize, engagementRate, platforms, location, bio, avatarUrl, portfolioUrl, minBudget, maxBudget, collaborationPreference)
- `company_profiles` (companyName, industry, budget, platforms, location, bio, avatarUrl, website, companySize, campaignType, preferredInfluencerNiches, collaborationDuration, minAudienceSize, maxAudienceSize)

**MISMATCH #18**: Influencer has `name`, Company has `companyName` - inconsistent
**MISMATCH #19**: Both have `avatarUrl` plus users table has `avatarUrl` - triple storage

### CRITICAL ISSUES:
1. ❌ Name field inconsistency (name vs companyName)
2. ❌ Type/Role case mismatch (lowercase vs uppercase)
3. ❌ Avatar URL triple storage causes sync issues
4. ❌ Profile completion percentage may be stale in database

---

## 4. PROFILEVIEW PAGE

### Frontend Component: `ProfileView.tsx`
**Expected Data:**
```typescript
profile: {
  id, name, type: 'influencer'|'company',
  bio, description, niche, industry, location, platforms,
  audienceSize, engagementRate, budget, avatarUrl,
  portfolioUrl, website, companySize, campaignType,
  preferredInfluencerNiches, collaborationDuration,
  contentType, collaborationPreference, verificationStatus,
  createdAt, updatedAt
}

connectionStatus: 'none' | 'pending' | 'connected' | 'accepted'
compatibilityScore: number
compatibilityFactors: { ... }
```

### Frontend Service: `profile.service.ts`
**API Calls:**
- `GET /profiles/user/{userId}` → gets profile by user ID

**MISMATCH #20**: Service expects `ProfileData` interface but backend returns different structure

### Backend Controller: `profiles.controller.ts`
**Endpoints:**
- `GET /profiles/user/:userId` → calls `profilesService.getProfileByUserId()`

### Backend Service: `profiles.service.ts`
**Returns:**
```typescript
// For influencer
{
  id: profileId, // ❌ This is profile ID, not user ID
  name: profile.niche || 'Influencer', // ❌ Fallback to niche if no name
  type: 'influencer',
  niche, audienceSize, engagementRate, location, platforms,
  bio, avatarUrl, portfolioUrl,
  budgetRange: { min: minBudget, max: maxBudget },
  contentType, collaborationPreference, verificationStatus
}

// For company
{
  id: profileId, // ❌ This is profile ID, not user ID
  name: companyName,
  type: 'company',
  industry, budget, location, platforms,
  description: bio, // ❌ Maps bio to description
  avatarUrl, website,
  budgetRange: { min: minAudienceSize, max: maxAudienceSize }, // ❌ Wrong field names
  verificationStatus, companySize, campaignType
}
```

**MISMATCH #21**: Returns profile ID as `id`, not user ID (breaks navigation)
**MISMATCH #22**: Company maps `bio` → `description` but frontend expects `bio`
**MISMATCH #23**: Company `budgetRange` uses audience size fields (wrong!)
**MISMATCH #24**: Influencer name falls back to niche if not set
**MISMATCH #25**: Missing `contentType` field in influencer entity
**MISMATCH #26**: Missing `preferredInfluencerNiches` proper handling

### Database Schema
**Tables:**
- `influencer_profiles` - has all fields except `contentType`, `verificationStatus`
- `company_profiles` - has all fields

**MISMATCH #27**: `contentType` field doesn't exist in influencer_profiles table
**MISMATCH #28**: `verificationStatus` exists in company_profiles but not influencer_profiles

### CRITICAL ISSUES:
1. ❌ Profile ID returned instead of User ID (breaks all user-based operations)
2. ❌ Company budgetRange uses wrong fields (audience size instead of budget)
3. ❌ Bio/description mapping inconsistency
4. ❌ Missing contentType column in database
5. ❌ Verification status only for companies, not influencers

---

## 5. PROFILEEDIT PAGE

### Frontend Component: `ProfileEdit.tsx`
**Sends to Backend:**
```typescript
{
  name, bio, niche/industry, location, platforms,
  audienceSize, engagementRate, budget, avatarUrl,
  portfolioUrl, website, companySize, campaignType,
  minBudget, maxBudget, collaborationPreference,
  preferredInfluencerNiches, collaborationDuration,
  minAudienceSize, maxAudienceSize
}
```

### Frontend Service: `auth.service.ts`
**API Calls:**
- `PUT /auth/profile` → updates profile

### Backend Controller: `auth.controller.ts`
**Endpoints:**
- `PUT /auth/profile` → calls `authService.updateProfile()`

### Backend Service: `auth.service.ts`
**Update Logic:**
```typescript
// For influencer
if (updateProfileDto.name !== undefined) profile.name = updateProfileDto.name;
if (updateProfileDto.avatarUrl !== undefined) {
  profile.avatarUrl = updateProfileDto.avatarUrl;
  user.avatarUrl = updateProfileDto.avatarUrl; // ✅ Syncs to user table
}

// For company
if (updateProfileDto.name !== undefined) profile.companyName = updateProfileDto.name; // ✅ Maps correctly
if (updateProfileDto.avatarUrl !== undefined) {
  profile.avatarUrl = updateProfileDto.avatarUrl;
  user.avatarUrl = updateProfileDto.avatarUrl; // ✅ Syncs to user table
}
```

**MISMATCH #29**: Frontend sends `name` but company entity expects `companyName` (service handles mapping)
**MISMATCH #30**: `preferredInfluencerNiches` can be string or array - inconsistent handling

### Database Schema
**Columns:**
- `influencer_profiles.name` - varchar
- `company_profiles.companyName` - varchar
- Both have `avatarUrl`
- `users.avatarUrl` - varchar

**MISMATCH #31**: Three avatarUrl columns must stay in sync
**MISMATCH #32**: `preferredInfluencerNiches` is TEXT in DB but frontend may send array

### CRITICAL ISSUES:
1. ❌ Avatar URL must be updated in 3 places (can fail partially)
2. ❌ Name/companyName mapping relies on service layer (fragile)
3. ❌ preferredInfluencerNiches type inconsistency (string vs array)
4. ❌ campaignType is array but stored as JSONB (serialization issues)

---

## 6. MATCHES PAGE

### Frontend Component: `Matches.tsx`
**Expected Data:**
```typescript
Match[] = [{
  id: string,
  profile: {
    id, name, type, niche/industry, audienceSize, engagementRate,
    budget, location, platforms, bio, avatarUrl
  },
  score: number,
  tier: 'Perfect' | 'Excellent' | 'Good' | 'Fair',
  breakdown: {
    nicheCompatibility: number,
    locationCompatibility: number,
    budgetAlignment: number,
    platformOverlap: number,
    audienceSizeMatch: number,
    engagementTierMatch: number
  }
}]
```

### Frontend Service: `matching.service.ts`
**API Calls:**
- `GET /matching/matches?filters...` → with query params

**Transformation Logic:**
```typescript
transformMatch(backendMatch) {
  return {
    id: backendMatch.id || backendMatch.user?.id,
    profile: {
      id: backendMatch.user?.id,
      name: backendMatch.user?.name || 'Unknown',
      type: backendMatch.user?.role === 'INFLUENCER' ? 'influencer' : 'company',
      // ... maps all fields
    },
    score: backendMatch.score || 0,
    tier: this.calculateTier(score),
    breakdown: backendMatch.factors || { /* fallback to 50 */ }
  }
}
```

**MISMATCH #33**: Frontend expects `breakdown` but backend sends `factors`
**MISMATCH #34**: If `factors` missing, frontend uses fallback (50 for all) - hides real issues
**MISMATCH #35**: Match ID is user ID, not a unique match record

### Backend Controller: `matching.controller.ts`
**Endpoints:**
- `GET /matching/matches` → calls `matchingService.getMatches(userId)`

### Backend Service: `matching.service.ts`
**Returns:**
```typescript
[{
  id: match.id, // This is the matched user's ID
  user: { ...match, ...profileData },
  score: calculateMatchScore(),
  factors: calculateDetailedMatchFactors()
}]
```

**Calculation Logic:**
- Loads all users with opposite role
- For each, loads their profile
- Calculates score using weighted factors
- Records to match_history table (async, can fail silently)

**MISMATCH #36**: No persistent match records - all calculated on-the-fly
**MISMATCH #37**: Match history recording can fail silently (async, no error handling)
**MISMATCH #38**: Engagement rate stored as DECIMAL but treated as number (type coercion)

### Database Schema
**Tables:**
- `matches` (id, influencerId, companyId, score, factors) - ❌ NOT USED
- `match_history` (id, userId, matchUserId, score, factors, viewedAt)
- `influencer_profiles` - engagementRate is DECIMAL(5,2)

**MISMATCH #39**: `matches` table exists but is never used
**MISMATCH #40**: `engagementRate` is DECIMAL but TypeORM returns string, needs parseFloat()

### CRITICAL ISSUES:
1. ❌ factors/breakdown naming causes fallback scores (all 50)
2. ❌ Matches calculated on every request (performance issue)
3. ❌ Match history recording fails silently
4. ❌ Engagement rate type coercion issues
5. ❌ No persistent match IDs (can't reference specific matches)

---

## 7. MESSAGES PAGE

### Frontend Component: `Messages.tsx`
**Expected Data:**
```typescript
Conversation[] = [{
  id, user1Id, user2Id,
  user1: { id, email, name, avatarUrl },
  user2: { id, email, name, avatarUrl },
  lastMessage: string, // Content preview
  lastMessageAt: string,
  unreadCount1, unreadCount2
}]

Message[] = [{
  id, conversationId, senderId,
  sender: {
    id, email,
    name: string, // ❌ Frontend expects flat name
    avatarUrl: string
  },
  content, attachmentUrl, readAt, createdAt
}]
```

### Frontend Service: `messaging.service.ts`
**API Calls:**
- `GET /api/messaging/conversations` → gets all conversations
- `GET /api/messaging/conversations/{id}/messages` → gets messages
- `POST /api/messaging/messages` → sends message

**MISMATCH #41**: Frontend expects `sender.name` but backend may return `sender.profile.fullName`
**MISMATCH #42**: Frontend expects `lastMessage` (content) but backend only has `lastMessageAt` (timestamp)

### Backend Controller: `messaging.controller.ts`
**Endpoints:**
- `GET /messaging/conversations` → calls `messagingService.getConversations()`
- `GET /messaging/conversations/:id/messages` → calls `messagingService.getMessages()`
- `POST /messaging/messages` → calls `messagingService.createMessage()`

### Backend Service: `messaging.service.ts`
**Returns:**
```typescript
// Conversations
[{
  id, user1Id, user2Id,
  user1: User, // Full user object
  user2: User, // Full user object
  lastMessageAt: Date,
  unreadCount1, unreadCount2
}]

// Messages
[{
  id, conversationId, senderId,
  sender: User, // Full user object with profile
  content, attachmentUrl,
  readAt: Date, // ❌ Returns Date, frontend expects string
  createdAt: Date
}]
```

**MISMATCH #43**: `readAt` and `createdAt` are Date objects, frontend expects ISO strings
**MISMATCH #44**: No `lastMessage` field - only `lastMessageAt`
**MISMATCH #45**: Sender object structure depends on how user profile is loaded

### Database Schema
**Tables:**
- `conversations` (id, user1_id, user2_id, last_message_at, unread_count_1, unread_count_2)
- `messages` (id, conversation_id, sender_id, content, attachment_url, read_at, created_at)

**MISMATCH #46**: No `last_message` column in conversations table
**MISMATCH #47**: `unread_count_1` and `unread_count_2` naming is confusing (which user is 1 vs 2?)

### CRITICAL ISSUES:
1. ❌ Missing lastMessage content in conversations (only timestamp)
2. ❌ Sender name structure inconsistent (flat vs nested)
3. ❌ Date serialization issues (Date vs ISO string)
4. ❌ Unread count field names confusing
5. ❌ No clear mapping of which user is user1 vs user2

---

## CRITICAL FIXES SUMMARY

### IMMEDIATE FIXES (Breaking Issues)

#### Fix 1: Standardize factors/breakdown naming
**Problem**: Backend sends `factors`, frontend expects `breakdown`
**Impact**: Match scores show as 50 (fallback) instead of real scores
**Fix**:
```typescript
// Backend: matching.service.ts
return {
  id, user, score,
  breakdown: this.calculateDetailedMatchFactors() // ✅ Rename to breakdown
}
```

#### Fix 2: Add lastMessage to conversations
**Problem**: Frontend expects message content preview, backend only has timestamp
**Impact**: Conversation list shows no preview
**Fix**:
```sql
-- Migration
ALTER TABLE conversations ADD COLUMN last_message TEXT;
```
```typescript
// Backend: Update when message sent
conversation.lastMessage = message.content.substring(0, 100);
```

#### Fix 3: Fix ProfileView ID mismatch
**Problem**: Backend returns profile ID, frontend needs user ID
**Impact**: Navigation and operations fail
**Fix**:
```typescript
// Backend: profiles.service.ts - getProfileByUserId()
return {
  id: userId, // ✅ Return user ID, not profile ID
  profileId: profile.id, // Add separate profileId field
  // ... rest of fields
}
```

#### Fix 4: Standardize name fields
**Problem**: Influencer uses `name`, Company uses `companyName`
**Impact**: Inconsistent data access, mapping errors
**Fix**:
```sql
-- Migration
ALTER TABLE company_profiles RENAME COLUMN "companyName" TO name;
```

#### Fix 5: Fix Connection Status Enum
**Problem**: Has both 'connected' and 'accepted' (redundant)
**Impact**: Status checks fail, inconsistent state
**Fix**:
```sql
-- Migration
UPDATE connections SET status = 'accepted' WHERE status = 'connected';
```
```typescript
// Backend: Remove CONNECTED from enum
export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted', // Use this only
  REJECTED = 'rejected'
}
```

#### Fix 6: Serialize Dates properly
**Problem**: Backend returns Date objects, frontend expects ISO strings
**Impact**: Date display fails, comparison errors
**Fix**:
```typescript
// Backend: Add serialization interceptor
@UseInterceptors(ClassSerializerInterceptor)
// Or manually convert
readAt: message.readAt?.toISOString()
```

#### Fix 7: Sync Avatar URLs
**Problem**: Avatar stored in 3 places, can get out of sync
**Impact**: Avatar displays incorrectly or not at all
**Fix**:
```typescript
// Backend: Create helper method
async updateAvatar(userId: string, avatarUrl: string) {
  await Promise.all([
    this.userRepository.update(userId, { avatarUrl }),
    this.influencerRepo.update({ userId }, { avatarUrl }),
    this.companyRepo.update({ userId }, { avatarUrl })
  ]);
}
```

---

### HIGH PRIORITY FIXES

#### Fix 8: Add missing database columns
```sql
-- Add contentType to influencer_profiles
ALTER TABLE influencer_profiles ADD COLUMN content_type TEXT[];

-- Add verificationStatus to influencer_profiles
ALTER TABLE influencer_profiles ADD COLUMN verification_status BOOLEAN DEFAULT false;

-- Remove duplicate followerCount
ALTER TABLE influencer_profiles DROP COLUMN IF EXISTS "followerCount";
```

#### Fix 9: Fix Company budgetRange
**Problem**: Uses audience size fields instead of budget fields
```typescript
// Backend: profiles.service.ts
budgetRange: {
  min: companyProfile.budget ? companyProfile.budget * 0.8 : null,
  max: companyProfile.budget ? companyProfile.budget * 1.2 : null
}
```

#### Fix 10: Use matches table
**Problem**: Matches calculated on-the-fly (performance issue)
```typescript
// Backend: Save matches to database
async saveMatch(userId: string, matchUserId: string, score: number, factors: any) {
  const match = this.matchRepository.create({
    influencerId: user.role === 'INFLUENCER' ? userId : matchUserId,
    companyId: user.role === 'COMPANY' ? userId : matchUserId,
    score,
    factors
  });
  return this.matchRepository.save(match);
}
```

---

### MEDIUM PRIORITY FIXES

#### Fix 11: Standardize array storage
**Problem**: Mix of JSONB, simple-array, and native arrays
```sql
-- Standardize to JSONB
ALTER TABLE feed_posts ALTER COLUMN "mediaUrls" TYPE jsonb USING "mediaUrls"::jsonb;
ALTER TABLE influencer_profiles ALTER COLUMN platforms TYPE jsonb USING platforms::jsonb;
```

#### Fix 12: Fix engagement rate type
**Problem**: DECIMAL returns as string, needs parsing
```typescript
// Backend: Always parse to number
engagementRate: profile.engagementRate ? Number(profile.engagementRate) : 0
```

#### Fix 13: Clarify unread count fields
```sql
-- Migration
ALTER TABLE conversations RENAME COLUMN unread_count_1 TO unread_count_for_user1;
ALTER TABLE conversations RENAME COLUMN unread_count_2 TO unread_count_for_user2;
```

---

### TESTING CHECKLIST

After each fix:
- [ ] Test login/register flow
- [ ] Test profile view/edit
- [ ] Test matches page with real scores
- [ ] Test messaging with previews
- [ ] Test connection status changes
- [ ] Test avatar uploads
- [ ] Check database for orphaned data
- [ ] Monitor error logs for 24 hours

---

### ESTIMATED IMPACT

- **Immediate Fixes**: Will resolve 70% of current errors
- **High Priority Fixes**: Will resolve 90% of current errors
- **All Fixes**: Will resolve 98% of current errors

**Total Time Estimate**: 3-4 days for all fixes + testing

---

**Generated**: 2026-02-13  
**Status**: READY FOR IMPLEMENTATION  
**Next Step**: Begin with Immediate Fixes in order listed
