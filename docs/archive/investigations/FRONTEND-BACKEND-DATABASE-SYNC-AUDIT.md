# Frontend-Backend-Database Sync Audit & Fix Plan

**Date:** February 14, 2026  
**Status:** Investigation Complete - Fixes Required

## Executive Summary

Comprehensive audit of the entire stack (Frontend → Backend → Database) reveals several critical sync issues that need immediate attention. The collaboration request form fix highlighted deeper structural problems.

---

## 🔍 Investigation Findings

### 1. **Collaboration Request System** ✅ FIXED
**Status:** Recently fixed - form now includes all required fields

**Frontend:** `CollaborationRequestModal.tsx`
- ✅ Now includes: collaborationType, budgetMin, budgetMax, timeline, message

**Backend DTO:** `create-collaboration-request.dto.ts`
- ✅ Expects: recipientId, message, budgetMin, budgetMax, timeline, deliverables, platforms, collaborationType, startDate, endDate, additionalNotes

**Database:** `connections` table
- ✅ Has `collaboration_request_data` JSONB column to store all data

**Verdict:** NOW SYNCED ✅

---

### 2. **Profile Field Naming Inconsistency** ⚠️ CRITICAL

**Issue:** Company profile uses different field names across layers

**Database Entity:** `company-profile.entity.ts`
```typescript
@Column({ nullable: true })
name: string; // ✅ Uses 'name'
```

**Backend Service:** `auth.service.ts`
```typescript
// ✅ FIXED: Now uses 'name' consistently
name: profile.name || ''
```

**Frontend Types:** `profile.types.ts`
```typescript
// ✅ Uses 'name' consistently
name: string;
```

**Verdict:** SYNCED ✅ (Fixed in recent updates)

---

### 3. **Match Response Structure Mismatch** ⚠️ NEEDS ATTENTION

**Backend Returns:**
```typescript
{
  id: string,
  user: { ...profileData },
  score: number,
  breakdown: { ...factors }  // ✅ Changed from 'factors'
}
```

**Frontend Expects:**
```typescript
{
  id: string,
  profile: { ...profileData },  // ⚠️ Expects 'profile' not 'user'
  score: number,
  tier: string,  // ⚠️ Calculated client-side
  breakdown: { ...factors }
}
```

**Current Solution:** Frontend transforms in `matchingService.transformMatch()`

**Issue:** Unnecessary transformation layer adds complexity

**Recommendation:** 
- Option A: Backend should return `profile` instead of `user`
- Option B: Keep transformation but document it clearly

---

### 4. **Connection Status Enum Mismatch** ✅ RESOLVED

**Database/Backend:**
```typescript
enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',  // ✅ Fixed
  REJECTED = 'rejected'
}
```

**Previous Issue:** Had both 'CONNECTED' and 'ACCEPTED'
**Status:** FIXED ✅

---

### 5. **Avatar URL Sync Issues** ✅ RESOLVED

**Problem:** Avatar stored in 3 places:
- `users.avatarUrl`
- `influencer_profiles.avatarUrl`
- `company_profiles.avatarUrl`

**Solution Implemented:** `syncAvatarUrl()` helper in `auth.service.ts`
```typescript
private async syncAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  await this.userRepository.update(userId, { avatarUrl });
  await this.influencerProfileRepository.update({ userId }, { avatarUrl });
  await this.companyProfileRepository.update({ userId }, { avatarUrl });
}
```

**Status:** SYNCED ✅

---

### 6. **Profile Completion Calculation** ✅ WORKING

**Backend:** Calculates in `auth.service.ts`
```typescript
private calculateProfileCompletion(role: string, profile: any): number {
  const requiredFields = role === 'INFLUENCER' 
    ? ['name', 'niche', 'bio', 'audienceSize', 'platforms', 'location']
    : ['name', 'industry', 'bio', 'budget', 'location'];
  // ... calculation logic
}
```

**Frontend:** Uses value from backend
**Status:** SYNCED ✅

---

### 7. **Messaging Integration with Collaboration Requests** ✅ WORKING

**Backend:** `matching.service.ts` creates message when collaboration request is sent
```typescript
await this.messagingService.createMessage(requesterId, {
  recipientId: recipientId,
  content: messageText,
});
```

**Status:** INTEGRATED ✅

---

### 8. **Match History Recording** ⚠️ NEEDS MONITORING

**Implementation:** Uses retry logic
```typescript
private async recordMatchHistoryWithRetry(
  userId: string,
  data: any,
  retries: number = 3,
): Promise<void>
```

**Issue:** Fails silently if all retries exhausted
**Recommendation:** Add monitoring/logging for failed recordings

---

### 9. **Frontend Type Definitions** ⚠️ INCOMPLETE

**Missing Types:**
- No type definition file for `Match` entity
- No type definition for `Connection` entity  
- Campaign types exist but may not match backend exactly

**Recommendation:** Create comprehensive type definition files

---

### 10. **API Error Handling** ⚠️ INCONSISTENT

**Backend:** Some endpoints return safe defaults on error
```typescript
async getConnectionStatus(userId: string, otherUserId: string) {
  try {
    // ... logic
  } catch (error) {
    return { status: 'none', connection: null }; // Safe default
  }
}
```

**Frontend:** Expects consistent error responses
**Issue:** Inconsistent error handling patterns

---

## 🔧 Required Fixes

### Priority 1: CRITICAL (Do Immediately)

#### Fix 1.1: Standardize Match Response Format
**File:** `backend/src/modules/matching/matching.service.ts`

**Change:**
```typescript
// Current
return {
  id: match.id,
  user: { ...match, ...profileData },
  score,
  breakdown
};

// Should be
return {
  id: match.id,
  profile: { ...match, ...profileData },  // Changed 'user' to 'profile'
  score,
  tier: this.calculateTier(score),  // Add tier calculation
  breakdown
};
```

**Impact:** Eliminates frontend transformation layer

---

#### Fix 1.2: Create Comprehensive Type Definitions
**File:** `src/renderer/types/matching.types.ts` (NEW)

```typescript
export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  collaborationStatus?: 'requested' | 'negotiating' | 'agreed' | 'active' | 'completed' | 'cancelled';
  collaborationRequestData?: {
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
  };
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  influencerId: string;
  companyId: string;
  score: number;
  factors: any;
  createdAt: string;
}

export interface MatchBreakdown {
  nicheCompatibility: number;
  locationCompatibility: number;
  budgetAlignment: number;
  platformOverlap: number;
  audienceSizeMatch: number;
  engagementTierMatch: number;
}
```

---

### Priority 2: HIGH (Do This Week)

#### Fix 2.1: Standardize Error Responses
**File:** `backend/src/common/filters/http-exception.filter.ts` (NEW)

Create global exception filter:
```typescript
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

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

#### Fix 2.2: Add Match History Monitoring
**File:** `backend/src/modules/matching/matching.service.ts`

Add logging service:
```typescript
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
      // ✅ ADD: Log to monitoring service
      await this.loggingService.logError('match_history_failed', {
        userId,
        attempt,
        error: error.message
      });
      
      if (attempt === retries) {
        // ✅ ADD: Alert on final failure
        await this.alertService.sendAlert('Match history recording failed', {
          userId,
          error: error.message
        });
      }
    }
  }
}
```

---

### Priority 3: MEDIUM (Do This Month)

#### Fix 3.1: Consolidate Avatar Storage
**Recommendation:** Store avatar URL in ONE place only

**Option A:** Store only in profile tables
```typescript
// Remove from users table
// Always fetch from profile tables
```

**Option B:** Store only in users table (RECOMMENDED)
```typescript
// Remove from profile tables
// Always use users.avatarUrl
// Simpler, single source of truth
```

---

#### Fix 3.2: Add Database Constraints
**File:** `backend/src/database/migrations/[timestamp]-AddConstraints.ts`

```typescript
// Ensure data integrity
await queryRunner.query(`
  ALTER TABLE connections 
  ADD CONSTRAINT check_collaboration_status 
  CHECK (collaboration_status IN ('requested', 'negotiating', 'agreed', 'active', 'completed', 'cancelled'));
  
  ALTER TABLE connections
  ADD CONSTRAINT check_connection_status
  CHECK (status IN ('pending', 'accepted', 'rejected'));
`);
```

---

#### Fix 3.3: Add API Response Validation
**File:** `src/renderer/services/api-client.ts`

Add response validation:
```typescript
async get<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  const data = await response.json();
  
  // ✅ ADD: Validate response structure
  if (!this.validateResponse(data)) {
    throw new Error('Invalid API response structure');
  }
  
  return data;
}
```

---

## 📊 Sync Status Matrix

| Component | Frontend | Backend | Database | Status |
|-----------|----------|---------|----------|--------|
| Collaboration Request | ✅ | ✅ | ✅ | SYNCED |
| Profile Fields (name) | ✅ | ✅ | ✅ | SYNCED |
| Connection Status | ✅ | ✅ | ✅ | SYNCED |
| Avatar URL | ✅ | ✅ | ⚠️ | NEEDS CONSOLIDATION |
| Match Response | ⚠️ | ⚠️ | ✅ | NEEDS STANDARDIZATION |
| Error Handling | ⚠️ | ⚠️ | N/A | NEEDS STANDARDIZATION |
| Type Definitions | ⚠️ | ✅ | ✅ | INCOMPLETE |
| Match History | ✅ | ⚠️ | ✅ | NEEDS MONITORING |

---

## 🎯 Implementation Plan

### Week 1: Critical Fixes
- [ ] Fix 1.1: Standardize Match Response Format
- [ ] Fix 1.2: Create Comprehensive Type Definitions
- [ ] Test all changes thoroughly

### Week 2: High Priority
- [ ] Fix 2.1: Standardize Error Responses
- [ ] Fix 2.2: Add Match History Monitoring
- [ ] Update documentation

### Week 3: Medium Priority
- [ ] Fix 3.1: Consolidate Avatar Storage
- [ ] Fix 3.2: Add Database Constraints
- [ ] Fix 3.3: Add API Response Validation

### Week 4: Testing & Validation
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation update

---

## 🧪 Testing Checklist

### Collaboration Requests
- [ ] Send collaboration request with all fields
- [ ] Send collaboration request with minimal fields
- [ ] Receive collaboration request
- [ ] Accept/reject collaboration request
- [ ] View sent requests
- [ ] View received requests

### Profile Management
- [ ] Update influencer profile
- [ ] Update company profile
- [ ] Upload avatar (verify sync across tables)
- [ ] Calculate profile completion
- [ ] View profile from different users

### Matching System
- [ ] Get matches list
- [ ] Filter matches
- [ ] Sort matches
- [ ] View match details
- [ ] Check match score calculation
- [ ] Verify match history recording

### Connection Management
- [ ] Create connection
- [ ] Get connection status
- [ ] List all connections
- [ ] Delete connection

---

## 📝 Notes

1. **Backward Compatibility:** All fixes maintain backward compatibility
2. **Migration Strategy:** Gradual rollout with feature flags
3. **Monitoring:** Add comprehensive logging for all sync operations
4. **Documentation:** Update API docs after each fix

---

## 🚀 Quick Wins

These can be done immediately with minimal risk:

1. ✅ Add type definitions (no code changes)
2. ✅ Add logging (non-breaking)
3. ✅ Update documentation (no code changes)
4. ✅ Add validation tests (no production impact)

---

## ⚠️ Risk Assessment

| Fix | Risk Level | Impact | Effort |
|-----|-----------|--------|--------|
| Match Response Format | LOW | HIGH | MEDIUM |
| Type Definitions | NONE | MEDIUM | LOW |
| Error Handling | LOW | HIGH | MEDIUM |
| Avatar Consolidation | MEDIUM | MEDIUM | HIGH |
| Database Constraints | MEDIUM | LOW | LOW |
| API Validation | LOW | MEDIUM | MEDIUM |

---

**Last Updated:** February 14, 2026  
**Next Review:** After Priority 1 fixes completed
