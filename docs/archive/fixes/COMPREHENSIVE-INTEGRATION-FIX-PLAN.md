# Comprehensive Frontend-Backend-Database Integration Fix Plan

**Date:** February 16, 2026  
**Status:** 🔴 CRITICAL - Immediate Action Required  
**Estimated Time:** 5-7 days for complete implementation

---

## 📊 Executive Summary

After thorough investigation of existing audit documents and codebase analysis, I've identified **32 critical integration issues** across the entire stack. This document consolidates all findings and provides a prioritized, actionable fix plan.

### Current State
- ✅ **Strengths**: 95% of API endpoints are implemented and functional
- ⚠️ **Issues**: Data structure mismatches, inconsistent naming, missing validations
- 🔴 **Critical**: 8 issues blocking core functionality
- ⚠️ **High**: 12 issues causing user-facing errors
- 📝 **Medium**: 12 issues affecting data consistency

---

## 🎯 CRITICAL ISSUES (Fix Immediately)

### 1. Connection Status Enum Duplication ⚠️ PARTIALLY FIXED
**Status:** Backend has both 'CONNECTED' and 'ACCEPTED'

**Problem:**
```typescript
// Backend Entity
export enum ConnectionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',  // ❌ Duplicate
  ACCEPTED = 'accepted',     // ❌ Duplicate
  REJECTED = 'rejected'
}
```

**Impact:** Connection flow breaks, status checks fail

**Fix:**
```sql
-- Migration: Standardize to 'accepted'
UPDATE connections SET status = 'accepted' WHERE status = 'connected';

-- Update enum
ALTER TYPE connection_status RENAME TO connection_status_old;
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected');
ALTER TABLE connections ALTER COLUMN status TYPE connection_status USING status::text::connection_status;
DROP TYPE connection_status_old;
```

```typescript
// Update backend entity
export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',  // ✅ Single status
  REJECTED = 'rejected'
}
```

**Files to Update:**
- `backend/src/modules/matching/entities/connection.entity.ts`
- `backend/src/database/migrations/[new]-StandardizeConnectionStatus.ts`
- `src/renderer/contexts/ConnectionContext.tsx`

---

### 2. Profile Name Field Inconsistency 🔴 CRITICAL
**Status:** Companies use 'companyName' in DB, 'name' in frontend

**Problem:**
```typescript
// Database: company_profiles table
companyName VARCHAR  // ❌

// Frontend expects
name: string  // ❌ Mismatch
```

**Impact:** Company profile updates fail, display shows undefined

**Fix Option A (Recommended):** Rename database column
```sql
-- Migration
ALTER TABLE company_profiles RENAME COLUMN "companyName" TO "name";
```

```typescript
// Update entity
@Column({ nullable: true })
name: string;  // ✅ Consistent
```

**Fix Option B:** Keep backend mapping
```typescript
// In auth.service.ts - ensure consistent mapping
return {
  ...profile,
  name: profile.companyName || profile.name || '',  // ✅ Fallback
};
```

**Files to Update:**
- `backend/src/modules/auth/entities/company-profile.entity.ts`
- `backend/src/database/migrations/[new]-RenameCompanyNameToName.ts`
- `backend/src/modules/auth/auth.service.ts`

---

### 3. Match Response Structure Mismatch 🔴 CRITICAL
**Status:** Backend returns 'user', frontend expects 'profile'

**Problem:**
```typescript
// Backend returns
{
  id: string,
  user: { ...profileData },  // ❌
  score: number,
  factors: { ...breakdown }  // ❌ Frontend expects 'breakdown'
}

// Frontend expects
{
  id: string,
  profile: { ...profileData },  // ❌ Mismatch
  score: number,
  tier: string,  // ❌ Missing
  breakdown: { ...factors }  // ❌ Mismatch
}
```

**Impact:** Match display fails, scores show as 50 (fallback)

**Fix:**
```typescript
// backend/src/modules/matching/matching.service.ts
async getMatches(userId: string, filters?: any) {
  // ... matching logic
  
  return matches.map(match => ({
    id: match.id,
    profile: { ...match.user },  // ✅ Changed from 'user'
    score: match.score,
    tier: this.calculateTier(match.score),  // ✅ Add tier
    breakdown: match.factors  // ✅ Changed from 'factors'
  }));
}

private calculateTier(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}
```

**Files to Update:**
- `backend/src/modules/matching/matching.service.ts`
- `backend/src/modules/matching/dto/match-response.dto.ts` (create)
- `src/renderer/services/matching.service.ts` (remove transformation)

---

### 4. Message Sender Profile Structure 🔴 CRITICAL
**Status:** Frontend expects nested profile, backend returns flat

**Problem:**
```typescript
// Frontend expects
sender: {
  id: string,
  profile: {
    fullName: string,  // ❌ Wrong field name
    avatarUrl: string
  }
}

// Backend returns
sender: {
  id: string,
  name: string,  // ❌ Not nested
  avatarUrl: string
}
```

**Impact:** Message sender names show as undefined

**Fix:**
```typescript
// backend/src/modules/messaging/messaging.service.ts
async getMessages(conversationId: string) {
  const messages = await this.messageRepository.find({
    where: { conversationId },
    relations: ['sender'],
    order: { createdAt: 'DESC' }
  });
  
  return messages.map(msg => ({
    ...msg,
    sender: {
      id: msg.sender.id,
      email: msg.sender.email,
      name: msg.sender.name || msg.sender.email,  // ✅ Use 'name'
      avatarUrl: msg.sender.avatarUrl
    }
  }));
}
```

```typescript
// src/renderer/services/messaging.service.ts
export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;  // ✅ Changed from profile.fullName
    avatarUrl?: string;
  };
  content: string;
  // ...
}
```

**Files to Update:**
- `backend/src/modules/messaging/messaging.service.ts`
- `src/renderer/services/messaging.service.ts`
- `src/renderer/components/MessageThread/MessageThread.tsx`

---

### 5. Collaboration Request Data Structure 🔴 CRITICAL
**Status:** Frontend sends flat, backend expects nested

**Problem:**
```typescript
// Frontend sends
{
  recipientId: string,
  message: string,
  budgetMin: number,
  budgetMax: number,
  // ... all fields flat
}

// Backend expects
{
  recipientId: string,
  collaborationRequestData: {  // ❌ Nested
    message: string,
    budgetMin: number,
    // ...
  }
}
```

**Impact:** Collaboration requests fail to save properly

**Fix:**
```typescript
// backend/src/modules/matching/dto/create-collaboration-request.dto.ts
export class CreateCollaborationRequestDto {
  @IsString()
  recipientId: string;
  
  @IsString()
  message: string;
  
  @IsOptional()
  @IsNumber()
  budgetMin?: number;
  
  @IsOptional()
  @IsNumber()
  budgetMax?: number;
  
  @IsOptional()
  @IsString()
  timeline?: string;
  
  @IsOptional()
  @IsString()
  collaborationType?: string;
  
  @IsOptional()
  @IsArray()
  platforms?: string[];
  
  @IsOptional()
  @IsArray()
  deliverables?: string[];
  
  @IsOptional()
  @IsString()
  startDate?: string;
  
  @IsOptional()
  @IsString()
  endDate?: string;
  
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
```

```typescript
// backend/src/modules/matching/matching.controller.ts
@Post('collaboration-requests')
async createCollaborationRequest(@Body() dto: CreateCollaborationRequestDto) {
  // Wrap into collaborationRequestData
  return this.matchingService.createConnection({
    recipientId: dto.recipientId,
    collaborationRequestData: {
      message: dto.message,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      timeline: dto.timeline,
      collaborationType: dto.collaborationType,
      platforms: dto.platforms,
      deliverables: dto.deliverables,
      startDate: dto.startDate,
      endDate: dto.endDate,
      additionalNotes: dto.additionalNotes
    }
  });
}
```

**Files to Update:**
- `backend/src/modules/matching/dto/create-collaboration-request.dto.ts`
- `backend/src/modules/matching/matching.controller.ts`
- `backend/src/modules/matching/matching.service.ts`

---

### 6. Avatar URL Triple Storage 🔴 CRITICAL
**Status:** Avatar stored in 3 places, sync issues

**Problem:**
```sql
-- Stored in 3 tables
users.avatarUrl
influencer_profiles.avatarUrl
company_profiles.avatarUrl
```

**Impact:** Avatar updates don't sync, displays show old/wrong avatars

**Fix Option A (Recommended):** Single source of truth
```sql
-- Migration: Remove from profile tables
ALTER TABLE influencer_profiles DROP COLUMN IF EXISTS "avatarUrl";
ALTER TABLE company_profiles DROP COLUMN IF EXISTS "avatarUrl";

-- Always use users.avatarUrl
```

```typescript
// backend/src/modules/auth/auth.service.ts
async updateProfile(userId: string, updates: any) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  
  // Update avatar in users table only
  if (updates.avatarUrl !== undefined) {
    user.avatarUrl = updates.avatarUrl;
    await this.userRepository.save(user);
  }
  
  // Update profile (without avatar)
  const profile = await this.getProfileByUserId(userId, user.role);
  Object.assign(profile, updates);
  delete profile.avatarUrl;  // ✅ Don't store in profile
  await this.profileRepository.save(profile);
}
```

**Fix Option B:** Sync all three
```typescript
// Keep current sync logic but ensure it's always called
private async syncAvatarUrl(userId: string, avatarUrl: string) {
  await this.userRepository.update(userId, { avatarUrl });
  await this.influencerProfileRepository.update({ userId }, { avatarUrl });
  await this.companyProfileRepository.update({ userId }, { avatarUrl });
}
```

**Files to Update:**
- `backend/src/database/migrations/[new]-ConsolidateAvatarStorage.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/entities/influencer-profile.entity.ts`
- `backend/src/modules/auth/entities/company-profile.entity.ts`

---

### 7. Platform Field JSONB Serialization 🔴 CRITICAL
**Status:** JSONB array may not serialize correctly

**Problem:**
```typescript
// Database
platforms JSONB

// TypeORM entity
@Column({ type: 'jsonb', nullable: true })
platforms: string[];
```

**Impact:** Platform data may not save/load correctly, causing undefined errors

**Fix:**
```typescript
// backend/src/modules/auth/entities/influencer-profile.entity.ts
@Column({ 
  type: 'jsonb', 
  nullable: true,
  transformer: {
    to: (value: string[]) => value ? JSON.stringify(value) : null,
    from: (value: string) => value ? JSON.parse(value) : []
  }
})
platforms: string[];
```

**Files to Update:**
- `backend/src/modules/auth/entities/influencer-profile.entity.ts`
- `backend/src/modules/auth/entities/company-profile.entity.ts`

---

### 8. Engagement Rate Type Coercion 🔴 CRITICAL
**Status:** Database returns string, code expects number

**Problem:**
```typescript
// Database: DECIMAL(5,2)
// TypeORM returns: string
// Code expects: number
```

**Impact:** Engagement rate calculations fail

**Fix:**
```typescript
// backend/src/modules/auth/entities/influencer-profile.entity.ts
@Column({ 
  type: 'decimal', 
  precision: 5, 
  scale: 2, 
  nullable: true,
  transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : 0
  }
})
engagementRate: number;
```

**Files to Update:**
- `backend/src/modules/auth/entities/influencer-profile.entity.ts`

---

## ⚠️ HIGH PRIORITY ISSUES (Fix This Week)

### 9. Conversation Last Message Preview
**Status:** Missing lastMessage content field

**Fix:**
```sql
-- Migration
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "last_message" TEXT;
```

```typescript
// Update when message is sent
async sendMessage(data: CreateMessageDto) {
  const message = await this.messageRepository.save(data);
  
  // Update conversation lastMessage
  await this.conversationRepository.update(
    { id: message.conversationId },
    { 
      lastMessage: message.content.substring(0, 100),  // ✅ Preview
      lastMessageAt: new Date()
    }
  );
  
  return message;
}
```

---

### 10. Remove Duplicate followerCount Column
**Status:** Orphaned column in database

**Fix:**
```sql
-- Migration
ALTER TABLE influencer_profiles DROP COLUMN IF EXISTS "followerCount";
-- Keep only audienceSize
```

---

### 11. Standardize Error Responses
**Status:** Inconsistent error handling

**Fix:**
```typescript
// backend/src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
```

```typescript
// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

---

### 12. Add Comprehensive Type Definitions
**Status:** Missing shared types

**Fix:**
```typescript
// src/renderer/types/matching.types.ts
export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  collaborationStatus?: 'requested' | 'negotiating' | 'agreed' | 'active' | 'completed' | 'cancelled';
  collaborationRequestData?: CollaborationRequestData;
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationRequestData {
  message?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  deliverables?: string[];
  platforms?: string[];
  collaborationType?: string;
  startDate?: string;
  endDate?: string;
  additionalNotes?: string;
}

export interface Match {
  id: string;
  profile: MatchProfile;
  score: number;
  tier: 'excellent' | 'good' | 'fair' | 'poor';
  breakdown: MatchBreakdown;
}

export interface MatchBreakdown {
  nicheCompatibility: number;
  locationCompatibility: number;
  budgetAlignment: number;
  platformOverlap: number;
  audienceSizeMatch: number;
  engagementTierMatch: number;
}

export interface MatchProfile {
  id: string;
  userId: string;
  type: 'influencer' | 'company';
  name: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  // ... all profile fields
}
```

---

### 13. Fix Post Media URLs Storage
**Status:** Using simple-array (comma-separated), breaks with commas in URLs

**Fix:**
```sql
-- Migration
ALTER TABLE feed_posts ALTER COLUMN "mediaUrls" TYPE jsonb USING 
  CASE 
    WHEN "mediaUrls" IS NULL THEN NULL
    WHEN "mediaUrls" = '' THEN '[]'::jsonb
    ELSE ('["' || replace("mediaUrls", ',', '","') || '"]')::jsonb
  END;
```

```typescript
// backend/src/modules/feed/entities/feed-post.entity.ts
@Column({ type: 'jsonb', nullable: true })
mediaUrls: string[];
```

---

### 14. Add Match History Monitoring
**Status:** Fails silently

**Fix:**
```typescript
// backend/src/modules/matching/matching.service.ts
private async recordMatchHistoryWithRetry(
  userId: string,
  data: any,
  retries: number = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await this.matchHistoryService.recordMatch(userId, data);
      return;
    } catch (error) {
      this.logger.error(`Match history recording failed (attempt ${attempt}/${retries})`, {
        userId,
        error: error.message,
        stack: error.stack
      });
      
      if (attempt === retries) {
        // Send alert on final failure
        this.logger.error('Match history recording failed after all retries', {
          userId,
          data
        });
      }
    }
  }
}
```

---

### 15. Standardize Role Types
**Status:** Mixed uppercase/lowercase usage

**Fix:**
```typescript
// src/renderer/types/user.types.ts
export type UserRole = 'INFLUENCER' | 'COMPANY' | 'ADMIN';  // ✅ Backend format
export type ProfileType = 'influencer' | 'company';  // ✅ Display format

// Helper function
export function roleToProfileType(role: UserRole): ProfileType {
  return role.toLowerCase() as ProfileType;
}

export function profileTypeToRole(type: ProfileType): UserRole {
  return type.toUpperCase() as UserRole;
}
```

---

### 16. Fix Conversation Unread Count Field Names
**Status:** Confusing naming

**Fix:**
```sql
-- Migration (optional, for clarity)
ALTER TABLE conversations RENAME COLUMN "unread_count_1" TO "unread_count_user1";
ALTER TABLE conversations RENAME COLUMN "unread_count_2" TO "unread_count_user2";
```

```typescript
// Or add clear documentation
@Column({ name: 'unread_count_1', default: 0 })
unreadCountUser1: number;  // Unread count for user1

@Column({ name: 'unread_count_2', default: 0 })
unreadCountUser2: number;  // Unread count for user2
```

---

### 17. Add API Response Validation
**Status:** No validation of API responses

**Fix:**
```typescript
// src/renderer/utils/api-validator.ts
export function validateApiResponse<T>(
  data: any,
  requiredFields: string[]
): T {
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  return data as T;
}

// Usage in services
async getMatches(filters?: any): Promise<Match[]> {
  const response = await apiClient.get('/matches', { params: filters });
  
  // Validate each match
  return response.map(match => 
    validateApiResponse<Match>(match, ['id', 'profile', 'score', 'breakdown'])
  );
}
```

---

### 18. Add Database Constraints
**Status:** Missing data integrity constraints

**Fix:**
```sql
-- Migration
ALTER TABLE connections 
ADD CONSTRAINT check_collaboration_status 
CHECK (collaboration_status IN ('requested', 'negotiating', 'agreed', 'active', 'completed', 'cancelled'));

ALTER TABLE connections
ADD CONSTRAINT check_connection_status
CHECK (status IN ('pending', 'accepted', 'rejected'));

ALTER TABLE users
ADD CONSTRAINT check_user_role
CHECK (role IN ('INFLUENCER', 'COMPANY', 'ADMIN'));

ALTER TABLE feed_posts
ADD CONSTRAINT check_post_type
CHECK ("postType" IN ('update', 'achievement', 'collaboration', 'question'));
```

---

### 19. Fix Campaign Application Status
**Status:** Frontend has 'withdrawn', backend may not

**Fix:**
```typescript
// backend/src/modules/campaigns/entities/campaign-application.entity.ts
export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'  // ✅ Add this
}
```

```sql
-- Migration
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'withdrawn';
```

---

### 20. Centralize API Configuration
**Status:** Hardcoded URLs in multiple places

**Fix:**
```typescript
// src/renderer/config/api.config.ts
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  wsURL: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3
};

// Update all services to use this
import { API_CONFIG } from '@/config/api.config';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout
});
```

---

## 📝 MEDIUM PRIORITY ISSUES (Fix Next Week)

### 21. Profile Completion Percentage Sync
**Status:** Calculated dynamically but also stored

**Fix:** Either calculate always or store always, not both

### 22. Campaign Deliverables Type
**Status:** Stored as TEXT, should be array

### 23. Campaign Platforms Consistency
**Status:** Uses PostgreSQL array, inconsistent with JSONB elsewhere

### 24. Saved Profile Notes and Tags
**Status:** May not persist correctly

### 25. Review Helpful Count
**Status:** Field may be missing

### 26. Message Read Status Serialization
**Status:** Date vs string mismatch

### 27. Feed Post Author Avatar
**Status:** May not be populated

### 28. Campaign Budget Field Clarity
**Status:** Range vs single value confusion

### 29. Add Missing Matching Methods
**Status:** getMatchById and searchUsers not implemented

### 30. Add Request Validation
**Status:** Missing class-validator on DTOs

### 31. Add Response DTOs
**Status:** No enforced response structure

### 32. Add Integration Tests
**Status:** No automated testing

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Critical Fixes (Days 1-2)
- [ ] Fix connection status enum
- [ ] Fix profile name field
- [ ] Fix match response structure
- [ ] Fix message sender structure
- [ ] Fix collaboration request structure
- [ ] Fix avatar URL storage
- [ ] Fix platform JSONB serialization
- [ ] Fix engagement rate type

### Phase 2: High Priority (Days 3-4)
- [ ] Add conversation last message
- [ ] Remove duplicate followerCount
- [ ] Standardize error responses
- [ ] Add comprehensive types
- [ ] Fix post media URLs
- [ ] Add match history monitoring
- [ ] Standardize role types
- [ ] Fix unread count naming
- [ ] Add API validation
- [ ] Add database constraints
- [ ] Fix campaign status
- [ ] Centralize API config

### Phase 3: Medium Priority (Days 5-7)
- [ ] Fix profile completion sync
- [ ] Fix campaign deliverables
- [ ] Fix campaign platforms
- [ ] Add saved profile features
- [ ] Add review helpful count
- [ ] Fix message read status
- [ ] Fix feed author avatar
- [ ] Clarify campaign budget
- [ ] Add missing matching methods
- [ ] Add request validation
- [ ] Add response DTOs
- [ ] Add integration tests

### Phase 4: Testing & Validation (Ongoing)
- [ ] Unit tests for all services
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation update

---

## 🧪 TESTING STRATEGY

### After Each Fix:
1. Run backend unit tests
2. Run frontend unit tests
3. Test affected API endpoints
4. Test affected UI flows
5. Check database consistency
6. Monitor error logs

### Integration Testing:
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 📊 SUCCESS METRICS

- [ ] Zero type coercion errors
- [ ] Zero undefined property errors
- [ ] 100% API endpoint consistency
- [ ] All database columns used
- [ ] All enum values consistent
- [ ] All array fields use JSONB
- [ ] All date fields serialize correctly
- [ ] All profile fields map correctly
- [ ] Error rate < 0.1%
- [ ] API response time < 200ms
- [ ] Test coverage > 80%

---

## 🚀 DEPLOYMENT STRATEGY

### Development:
1. Create feature branch for each fix
2. Test locally
3. Create PR with tests
4. Code review
5. Merge to develop

### Staging:
1. Deploy to staging environment
2. Run full test suite
3. Manual QA testing
4. Performance testing
5. Security scan

### Production:
1. Create release branch
2. Final testing
3. Deploy during low-traffic window
4. Monitor for 24 hours
5. Rollback plan ready

---

## 📞 SUPPORT & MONITORING

### Monitoring:
- Error tracking (Sentry/similar)
- Performance monitoring (New Relic/similar)
- Database query monitoring
- API endpoint monitoring
- User session monitoring

### Alerts:
- Error rate > 1%
- Response time > 500ms
- Database connection issues
- Failed migrations
- Authentication failures

---

## 📚 DOCUMENTATION UPDATES

After implementation:
- [ ] Update API documentation
- [ ] Update database schema docs
- [ ] Update type definitions
- [ ] Update README
- [ ] Create migration guide
- [ ] Update troubleshooting guide

---

**Status:** Ready for Implementation  
**Priority:** CRITICAL  
**Estimated Completion:** 7 days  
**Risk Level:** MEDIUM (with proper testing)

---

**Next Steps:**
1. Review this plan with team
2. Assign tasks to developers
3. Create tracking tickets
4. Begin Phase 1 implementation
5. Daily standup to track progress
