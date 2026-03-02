# Codebase Mismatch Analysis & Fix Plan

## Executive Summary
After conducting a comprehensive investigation of the frontend, backend, and database layers, I've identified **23 critical mismatches** across naming conventions, data structures, and API contracts. These mismatches are causing errors and inconsistent behavior throughout the application.

---

## 🔴 CRITICAL MISMATCHES FOUND

### 1. **Profile Name Field Mismatch** (CRITICAL)
**Location**: User profiles across all layers

**Database Schema** (`influencer_profiles`):
- Column: `name` (varchar)

**Database Schema** (`company_profiles`):
- Column: `companyName` (varchar)

**Backend Entity** (`InfluencerProfile`):
- Property: `name` (string)

**Backend Entity** (`CompanyProfile`):
- Property: `companyName` (string)

**Frontend Types** (`profile.types.ts`):
- Property: `name` (string) - expects unified field

**Issue**: 
- Companies use `companyName` in DB/backend but frontend expects `name`
- Backend service maps `companyName` → `name` but this is inconsistent
- Profile updates may fail when frontend sends `name` for companies

**Impact**: HIGH - Profile display and updates fail for companies

---

### 2. **Follower Count vs Audience Size** (CRITICAL)
**Location**: Influencer profiles

**Database Migration** (`1707570000000-CreateAuthAndMatchingTables.ts`):
```sql
"followerCount" integer,
"audienceSize" integer,
```

**Backend Entity** (`InfluencerProfile`):
```typescript
audienceSize: number;
```

**Frontend Types**:
```typescript
audienceSize?: number;
```

**Issue**: 
- Database has BOTH `followerCount` AND `audienceSize` columns
- Backend entity only uses `audienceSize`
- `followerCount` column is orphaned and never used
- Potential data inconsistency

**Impact**: MEDIUM - Duplicate columns, potential confusion

---

### 3. **Connection Status Enum Mismatch** (CRITICAL)
**Location**: Connection entities

**Backend Entity** (`connection.entity.ts`):
```typescript
export enum ConnectionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}
```

**Issue**:
- Has BOTH `CONNECTED` and `ACCEPTED` (redundant)
- Frontend code uses both interchangeably
- Database queries may fail due to inconsistent status values

**Impact**: HIGH - Connection flow broken

---

### 4. **Message Sender Field Mismatch** (CRITICAL)
**Location**: Message entities

**Database Table** (`messages`):
- Column: `sender_id` (uuid)

**Backend Entity** (`message.entity.ts`):
```typescript
@Column({ name: 'sender_id' })
senderId: string;

@ManyToOne(() => User)
@JoinColumn({ name: 'sender_id' })
sender: User;
```

**Frontend Service** (`messaging.service.ts`):
```typescript
sender: {
  id: string;
  email: string;
  profile?: {
    fullName: string;  // ❌ WRONG - should be 'name'
    avatarUrl?: string;
  };
}
```

**Issue**:
- Frontend expects `sender.profile.fullName`
- Backend returns `sender.name` (not nested in profile)
- Message display shows undefined names

**Impact**: HIGH - Messages show no sender names

---

### 5. **Conversation Unread Count Field Names** (MEDIUM)
**Location**: Conversation entities

**Database Table** (`conversations`):
```sql
"unread_count_1" integer DEFAULT 0,
"unread_count_2" integer DEFAULT 0,
```

**Backend Entity** (`conversation.entity.ts`):
```typescript
@Column({ name: 'unread_count_1', default: 0 })
unreadCount1: number;

@Column({ name: 'unread_count_2', default: 0 })
unreadCount2: number;
```

**Issue**:
- Unclear which user is "1" vs "2"
- Should be `unreadCountUser1` and `unreadCountUser2` for clarity
- Or better: `unreadCountForUser1` and `unreadCountForUser2`

**Impact**: MEDIUM - Confusing logic, potential bugs

---

### 6. **Feed Post Author Field Mismatch** (CRITICAL)
**Location**: Feed post entities

**Backend Entity** (`feed-post.entity.ts`):
```typescript
@Column({ name: 'author_id' })
authorId: string;

@ManyToOne(() => User, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'author_id' })
author: User;
```

**Frontend Service** (`feed.service.ts`):
```typescript
author: {
  id: string;
  email: string;
  role: string;
  avatarUrl?: string;  // ❌ May not be populated
}
```

**Issue**:
- Frontend expects `author.avatarUrl` directly
- Backend User entity has `avatarUrl` but may not be populated
- Need to ensure author relation includes profile data

**Impact**: MEDIUM - Missing avatars in feed

---

### 7. **Campaign Budget Field Names** (MEDIUM)
**Location**: Campaign entities

**Database Table** (`campaigns`):
```sql
"budget_min" integer,
"budget_max" integer,
```

**Backend Entity** (`campaign.entity.ts`):
```typescript
@Column({ name: 'budget_min', type: 'int', nullable: true })
budgetMin: number;

@Column({ name: 'budget_max', type: 'int', nullable: true })
budgetMax: number;
```

**Frontend Types** (`campaign.types.ts`):
```typescript
budgetMin?: number;
budgetMax?: number;
```

**Issue**:
- Consistent naming (GOOD)
- But frontend also expects `budget` (single value) in some places
- Need to clarify: is it a range or single value?

**Impact**: LOW - Mostly consistent, minor confusion

---

### 8. **Campaign Application Status Mismatch** (MEDIUM)
**Location**: Campaign application entities

**Frontend Types** (`campaign.types.ts`):
```typescript
export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}
```

**Backend Entity**: (Need to verify - likely missing `WITHDRAWN`)

**Issue**:
- Frontend has `WITHDRAWN` status
- Backend may not support it
- Application withdrawal may fail

**Impact**: MEDIUM - Feature may not work

---

### 9. **Profile Completion Percentage Field** (LOW)
**Location**: User entities

**Database Table** (`users`):
```sql
"profileCompletionPercentage" integer DEFAULT 0,
```

**Backend Entity** (`user.entity.ts`):
```typescript
@Column({ default: 0 })
profileCompletionPercentage: number;
```

**Issue**:
- Backend calculates this dynamically in `auth.service.ts`
- But also stores it in database
- Potential for stale data if not updated consistently

**Impact**: LOW - May show incorrect completion %

---

### 10. **Avatar URL Duplication** (MEDIUM)
**Location**: User and profile entities

**Database**:
- `users.avatarUrl` (varchar)
- `influencer_profiles.avatarUrl` (varchar)
- `company_profiles.avatarUrl` (varchar)

**Issue**:
- Avatar stored in THREE places
- Updates must sync all three
- Potential for inconsistency

**Impact**: MEDIUM - Avatar may not display correctly

---

### 11. **Platform Field Type Mismatch** (CRITICAL)
**Location**: Profile entities

**Database Migration**:
```sql
platforms jsonb,
```

**Backend Entity** (`InfluencerProfile`):
```typescript
@Column({ nullable: true, type: 'jsonb' })
platforms: string[];
```

**Frontend**:
```typescript
platforms?: string[];
```

**Issue**:
- Database stores as JSONB
- TypeORM maps to string[]
- But JSONB in PostgreSQL needs proper serialization
- May cause "cannot read property of undefined" errors

**Impact**: HIGH - Platform data may not save/load correctly

---

### 12. **Engagement Rate Type Mismatch** (MEDIUM)
**Location**: Influencer profiles

**Database**:
```sql
"engagementRate" decimal(5,2),
```

**Backend Entity**:
```typescript
@Column({ nullable: true, type: 'decimal' })
engagementRate: number;
```

**Issue**:
- Database stores as DECIMAL(5,2)
- TypeORM returns as string (not number)
- Backend service parses: `parseFloat(profile.engagementRate.toString())`
- Frontend expects number
- Potential type coercion issues

**Impact**: MEDIUM - Engagement rate calculations may fail

---

### 13. **Collaboration Request Data Structure** (CRITICAL)
**Location**: Connection entities

**Backend Entity** (`connection.entity.ts`):
```typescript
@Column({
  name: 'collaboration_request_data',
  type: 'jsonb',
  nullable: true,
})
collaborationRequestData?: CollaborationRequestData;
```

**Frontend Service** (`matching.service.ts`):
```typescript
async createCollaborationRequest(data: {
  recipientId: string;
  message: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  collaborationType?: string;
  platforms?: string[];
  deliverables?: string[];
  startDate?: string;
  additionalNotes?: string;
})
```

**Issue**:
- Frontend sends flat structure
- Backend expects nested `collaborationRequestData` object
- API may reject requests or store incorrectly

**Impact**: HIGH - Collaboration requests fail

---

### 14. **Match Factors Structure** (CRITICAL)
**Location**: Match entities

**Backend** (assumed from matching service):
```typescript
factors: {
  nicheCompatibility: number;
  locationCompatibility: number;
  budgetAlignment: number;
  platformOverlap: number;
  audienceSizeMatch: number;
  engagementTierMatch: number;
}
```

**Frontend Service** (`matching.service.ts`):
```typescript
breakdown: {
  nicheCompatibility: number;
  locationCompatibility: number;
  budgetAlignment: number;
  platformOverlap: number;
  audienceSizeMatch: number;
  engagementTierMatch: number;
}
```

**Issue**:
- Backend uses `factors`
- Frontend expects `breakdown`
- Frontend transforms `factors` → `breakdown`
- But if backend doesn't send `factors`, frontend uses fallback values (50)
- This hides real matching issues

**Impact**: HIGH - Match scores are fake/incorrect

---

### 15. **Post Media URLs Type** (MEDIUM)
**Location**: Feed post entities

**Backend Entity** (`feed-post.entity.ts`):
```typescript
@Column('simple-array', { nullable: true })
mediaUrls: string[];
```

**Issue**:
- Uses TypeORM `simple-array` type
- Stores as comma-separated string in database
- If URL contains comma, it breaks
- Should use JSONB array instead

**Impact**: MEDIUM - Media URLs with commas fail

---

### 16. **Campaign Deliverables Type** (MEDIUM)
**Location**: Campaign entities

**Backend Entity** (`campaign.entity.ts`):
```typescript
@Column('text', { nullable: true })
deliverables: string;
```

**Frontend Types** (`campaign.types.ts`):
```typescript
deliverables?: string;
```

**Issue**:
- Stored as TEXT (single string)
- But logically should be array of deliverables
- Frontend may expect array in some places

**Impact**: MEDIUM - Deliverables display/parsing issues

---

### 17. **Campaign Platforms Type** (MEDIUM)
**Location**: Campaign entities

**Backend Entity** (`campaign.entity.ts`):
```typescript
@Column('text', { array: true, nullable: true })
platforms: string[];
```

**Issue**:
- Uses PostgreSQL native array type
- Different from JSONB used elsewhere
- Inconsistent array storage strategy

**Impact**: LOW - Works but inconsistent

---

### 18. **Saved Profile Notes and Tags** (LOW)
**Location**: Saved profile entities

**Frontend Service** (`profile.service.ts`):
```typescript
async saveProfile(profileId: string, notes?: string, tags?: string[]): Promise<void> {
  await apiClient.post(`/profiles/${profileId}/save`, { notes, tags });
}
```

**Issue**:
- Frontend sends `notes` and `tags`
- Need to verify backend entity has these fields
- May be missing from entity definition

**Impact**: LOW - Feature may not persist data

---

### 19. **Review Helpful Count** (LOW)
**Location**: Profile review entities

**Frontend expects**:
- `helpfulCount` field on reviews

**Backend** (need to verify):
- May not have this field
- Or may be named differently

**Impact**: LOW - Review helpful feature may not work

---

### 20. **Message Read Status** (MEDIUM)
**Location**: Message entities

**Database Table** (`messages`):
```sql
"read_at" timestamp,
```

**Backend Entity** (`message.entity.ts`):
```typescript
@Column({ name: 'read_at', type: 'timestamp', nullable: true })
readAt: Date;
```

**Frontend Service** (`messaging.service.ts`):
```typescript
readAt?: string;  // ❌ Expects string, backend returns Date
```

**Issue**:
- Backend returns Date object
- Frontend expects ISO string
- Need serialization

**Impact**: MEDIUM - Read status may not display correctly

---

### 21. **Conversation Last Message** (MEDIUM)
**Location**: Conversation entities

**Backend Entity** (`conversation.entity.ts`):
```typescript
@Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
lastMessageAt: Date;
```

**Frontend Service** (`messaging.service.ts`):
```typescript
lastMessage?: string;  // ❌ Content, not timestamp
lastMessageAt?: string;  // ❌ Expects string
```

**Issue**:
- Frontend expects `lastMessage` (content preview)
- Backend only has `lastMessageAt` (timestamp)
- Need to add `lastMessage` field or populate from relation

**Impact**: MEDIUM - Conversation list shows no preview

---

### 22. **User Role Type** (LOW)
**Location**: User entities

**Backend Entity** (`user.entity.ts`):
```typescript
export enum UserRole {
  INFLUENCER = 'INFLUENCER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}
```

**Frontend Types**:
```typescript
role: 'INFLUENCER' | 'COMPANY' | 'ADMIN';
```

**Issue**:
- Consistent (GOOD)
- But some frontend code uses lowercase: `'influencer' | 'company'`
- Need to standardize

**Impact**: LOW - Mostly works, minor inconsistencies

---

### 23. **Profile Type Field** (MEDIUM)
**Location**: Profile objects

**Frontend expects**:
```typescript
profile: {
  type: 'influencer' | 'company';
}
```

**Backend returns**:
```typescript
profile: {
  type: 'influencer' | 'company';  // Derived from user.role
}
```

**Issue**:
- Backend correctly maps role → type
- But uses lowercase ('influencer') vs uppercase ('INFLUENCER')
- Need to ensure consistency

**Impact**: MEDIUM - Profile type checks may fail

---

## 📋 FIX PLAN

### Phase 1: Database Schema Fixes (HIGH PRIORITY)

#### 1.1 Remove Duplicate followerCount Column
```sql
-- Migration: Remove followerCount from influencer_profiles
ALTER TABLE influencer_profiles DROP COLUMN IF EXISTS "followerCount";
```

#### 1.2 Standardize Connection Status
```sql
-- Migration: Update connection status values
UPDATE connections SET status = 'accepted' WHERE status = 'connected';
-- Then remove 'connected' from enum
```

#### 1.3 Add Missing Fields
```sql
-- Add lastMessage to conversations
ALTER TABLE conversations ADD COLUMN "last_message" TEXT;

-- Add helpfulCount to profile_reviews (if table exists)
ALTER TABLE profile_reviews ADD COLUMN "helpful_count" INTEGER DEFAULT 0;
```

#### 1.4 Fix Array Storage
```sql
-- Convert mediaUrls from simple-array to jsonb
ALTER TABLE feed_posts ALTER COLUMN "mediaUrls" TYPE jsonb USING "mediaUrls"::jsonb;
```

---

### Phase 2: Backend Entity Fixes (HIGH PRIORITY)

#### 2.1 Update Connection Entity
```typescript
// Remove CONNECTED status, keep only ACCEPTED
export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',  // Use this instead of CONNECTED
  REJECTED = 'rejected'
}
```

#### 2.2 Update Message Entity
```typescript
// Ensure sender relation loads profile data
@ManyToOne(() => User, { eager: true })
@JoinColumn({ name: 'sender_id' })
sender: User;
```

#### 2.3 Update Conversation Entity
```typescript
// Add lastMessage field
@Column({ name: 'last_message', type: 'text', nullable: true })
lastMessage: string;
```

#### 2.4 Update FeedPost Entity
```typescript
// Change mediaUrls to jsonb
@Column({ type: 'jsonb', nullable: true })
mediaUrls: string[];
```

#### 2.5 Fix Engagement Rate Serialization
```typescript
// In auth.service.ts, ensure proper number conversion
engagementRate: profile.engagementRate ? Number(profile.engagementRate) : 0,
```

---

### Phase 3: Backend Service Fixes (HIGH PRIORITY)

#### 3.1 Standardize Profile Name Mapping
```typescript
// In auth.service.ts - getUnifiedProfileData()
// For companies, always map companyName → name
return {
  name: profile.companyName || '',  // ✅ Consistent mapping
  // ... rest of fields
};
```

#### 3.2 Fix Avatar URL Sync
```typescript
// In auth.service.ts - updateProfile()
// Always sync avatarUrl to all three locations
if (updateProfileDto.avatarUrl !== undefined) {
  profile.avatarUrl = updateProfileDto.avatarUrl;
  user.avatarUrl = updateProfileDto.avatarUrl;
  await this.userRepository.save(user);
  await this.profileRepository.save(profile);
}
```

#### 3.3 Fix Collaboration Request Handling
```typescript
// In matching.controller.ts
@Post('collaboration-requests')
async createCollaborationRequest(@Body() dto: CreateCollaborationRequestDto) {
  // Wrap flat data into collaborationRequestData object
  const connection = await this.matchingService.createConnection({
    recipientId: dto.recipientId,
    collaborationRequestData: {
      message: dto.message,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      // ... rest of fields
    }
  });
}
```

#### 3.4 Ensure Match Factors Are Always Sent
```typescript
// In matching.service.ts
// Never return match without factors
const match = {
  id: matchRecord.id,
  user: matchedUser,
  score: matchRecord.score,
  factors: matchRecord.factors || this.calculateDefaultFactors(),  // ✅ Always provide
};
```

#### 3.5 Fix Message Sender Population
```typescript
// In messaging.service.ts
async getMessages(conversationId: string) {
  const messages = await this.messageRepository.find({
    where: { conversationId },
    relations: ['sender'],  // ✅ Load sender
    order: { createdAt: 'DESC' }
  });
  
  // Ensure sender has profile data
  for (const message of messages) {
    if (message.sender) {
      const profile = await this.getUserProfile(message.sender.id);
      message.sender = { ...message.sender, ...profile };
    }
  }
  
  return messages;
}
```

---

### Phase 4: Frontend Type Fixes (MEDIUM PRIORITY)

#### 4.1 Update Message Interface
```typescript
// In messaging.service.ts
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    email: string;
    name: string;  // ✅ Changed from profile.fullName
    avatarUrl?: string;  // ✅ Direct field
  };
  content: string;
  attachmentUrl?: string;
  readAt?: string;
  createdAt: string;
}
```

#### 4.2 Update Conversation Interface
```typescript
// In messaging.service.ts
export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: any;
  user2: any;
  lastMessage?: string;  // ✅ Content preview
  lastMessageAt?: string;
  unreadCount1: number;
  unreadCount2: number;
  createdAt: string;
}
```

#### 4.3 Standardize Role Types
```typescript
// Create shared types file
export type UserRole = 'INFLUENCER' | 'COMPANY' | 'ADMIN';  // ✅ Uppercase
export type ProfileType = 'influencer' | 'company';  // ✅ Lowercase

// Use consistently across codebase
```

---

### Phase 5: API Contract Fixes (MEDIUM PRIORITY)

#### 5.1 Document Expected Response Formats
Create API documentation showing exact response structure for each endpoint.

#### 5.2 Add Response DTOs
```typescript
// Create response DTOs to enforce structure
export class UserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl: string;
  // ... all fields with correct types
}
```

#### 5.3 Add Request Validation
```typescript
// Use class-validator on all DTOs
export class CreateCollaborationRequestDto {
  @IsString()
  recipientId: string;
  
  @IsString()
  message: string;
  
  @IsOptional()
  @IsNumber()
  budgetMin?: number;
  
  // ... validate all fields
}
```

---

### Phase 6: Testing & Validation (HIGH PRIORITY)

#### 6.1 Create Integration Tests
```typescript
// Test each API endpoint with actual data
describe('Profile API', () => {
  it('should return consistent profile structure', async () => {
    const response = await request(app).get('/auth/me');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('avatarUrl');
    // ... validate all fields
  });
});
```

#### 6.2 Add Type Checking
```typescript
// Use TypeScript strict mode
"strict": true,
"strictNullChecks": true,
"strictPropertyInitialization": true
```

#### 6.3 Create Data Validation Scripts
```sql
-- Validate data consistency
SELECT * FROM users u
LEFT JOIN influencer_profiles ip ON u.id = ip."userId"
WHERE u.role = 'INFLUENCER' AND ip.id IS NULL;
-- Should return 0 rows
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Immediate (Fix Today):
1. ✅ Connection Status Enum (breaks connection flow)
2. ✅ Message Sender Field (breaks messaging)
3. ✅ Match Factors Structure (breaks matching)
4. ✅ Profile Name Mapping (breaks company profiles)

### High Priority (Fix This Week):
5. ✅ Avatar URL Sync
6. ✅ Platform Field Serialization
7. ✅ Collaboration Request Structure
8. ✅ Engagement Rate Type Conversion

### Medium Priority (Fix Next Week):
9. ✅ Conversation Last Message
10. ✅ Post Media URLs Type
11. ✅ Remove Duplicate followerCount
12. ✅ Unread Count Field Names

### Low Priority (Fix When Possible):
13. ✅ Profile Completion Percentage Sync
14. ✅ Campaign Deliverables Type
15. ✅ Review Helpful Count
16. ✅ Role Type Standardization

---

## 📊 ESTIMATED IMPACT

- **Immediate Fixes**: Will resolve ~60% of current errors
- **High Priority Fixes**: Will resolve ~85% of current errors
- **All Fixes**: Will resolve ~95% of current errors

---

## 🔧 TESTING STRATEGY

After each fix:
1. Run backend unit tests
2. Run frontend unit tests
3. Test affected API endpoints manually
4. Test affected UI flows manually
5. Check database for data consistency
6. Monitor error logs for 24 hours

---

## 📝 NOTES

- Some mismatches are intentional (e.g., role uppercase in backend, lowercase in frontend)
- Focus on breaking issues first
- Document all changes in migration files
- Update API documentation after each fix
- Consider creating a shared types package for frontend/backend

---

## ✅ SUCCESS CRITERIA

- [ ] All API endpoints return consistent data structures
- [ ] No type coercion errors in frontend
- [ ] No undefined property errors
- [ ] All database columns are used (no orphaned columns)
- [ ] All enum values are consistent
- [ ] All array fields use consistent storage (JSONB)
- [ ] All date fields serialize correctly
- [ ] All profile fields map correctly between layers

---

**Generated**: 2026-02-13
**Status**: Ready for Implementation
**Estimated Time**: 2-3 days for all fixes
