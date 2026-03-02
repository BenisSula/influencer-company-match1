# Data Sync Issues - Implementation Plan

**Date**: 2026-02-14  
**Priority**: Medium (Non-blocking)  
**Issues Found**: 3

---

## Issues to Fix

### Issue 1: Response Time Placeholder ⚠️
**Priority**: Low  
**Impact**: Display only  
**Location**: `ProfileView.tsx` line 1050

### Issue 2: Collaboration Stats Placeholder ⚠️
**Priority**: Medium  
**Impact**: Shows incorrect data  
**Location**: `ProfileView.tsx` lines 145-156

### Issue 3: Email Fallback for Name ⚠️
**Priority**: Low  
**Impact**: Poor UX for incomplete profiles  
**Location**: `Profile.tsx` lines 24-35, `auth.service.ts`

---

## Implementation Plan

### Phase 1: Collaboration Stats API (Priority: Medium)

**Estimated Time**: 1-2 hours

#### Backend Changes

1. **Create Stats Endpoint**
   - File: `backend/src/modules/ai-matching/collaboration-outcome.service.ts`
   - Add method: `getUserCollaborationStats(userId: string)`
   
2. **Add Controller Route**
   - File: `backend/src/modules/ai-matching/ai-matching.controller.ts`
   - Route: `GET /ai-matching/collaboration-outcomes/user/:userId/stats`

#### Frontend Changes

3. **Update ProfileView**
   - File: `src/renderer/pages/ProfileView.tsx`
   - Replace placeholder with real API call
   - Add loading state
   - Handle no data case

#### Implementation Steps

**Step 1: Backend Service Method**
```typescript
// backend/src/modules/ai-matching/collaboration-outcome.service.ts

async getUserCollaborationStats(userId: string) {
  // Get all outcomes where user is either partner
  const outcomes = await this.outcomeRepository
    .createQueryBuilder('outcome')
    .leftJoin('outcome.connection', 'connection')
    .where('connection.requesterId = :userId', { userId })
    .orWhere('connection.recipientId = :userId', { userId })
    .getMany();

  if (outcomes.length === 0) {
    return {
      totalCollaborations: 0,
      successfulCollaborations: 0,
      averageRating: 0,
      successRate: 0,
      hasData: false
    };
  }

  const successful = outcomes.filter(o => o.wasSuccessful).length;
  const totalRating = outcomes.reduce((sum, o) => sum + o.overallRating, 0);
  
  return {
    totalCollaborations: outcomes.length,
    successfulCollaborations: successful,
    averageRating: totalRating / outcomes.length,
    successRate: (successful / outcomes.length) * 100,
    hasData: true
  };
}
```

**Step 2: Backend Controller Route**
```typescript
// backend/src/modules/ai-matching/ai-matching.controller.ts

@Get('collaboration-outcomes/user/:userId/stats')
async getUserStats(@Param('userId') userId: string) {
  return this.collaborationOutcomeService.getUserCollaborationStats(userId);
}
```

**Step 3: Frontend Service Method**
```typescript
// src/renderer/services/collaboration-outcome.service.ts

async getUserStats(userId: string) {
  return apiClient.get(`/ai-matching/collaboration-outcomes/user/${userId}/stats`);
}
```

**Step 4: Update ProfileView**
```typescript
// src/renderer/pages/ProfileView.tsx

// Replace lines 145-156 with:
useEffect(() => {
  const fetchCollaborationStats = async () => {
    if (!id || isOwnProfile) return;
    
    try {
      const stats = await collaborationOutcomeService.getUserStats(id);
      setCollaborationStats(stats);
    } catch (error) {
      console.error('Error fetching collaboration stats:', error);
      setCollaborationStats(null);
    }
  };

  fetchCollaborationStats();
}, [id, isOwnProfile]);

// Update display logic (line 1050+):
{collaborationStats && collaborationStats.hasData ? (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <HiCheckCircle size={20} style={{ color: '#4CAF50' }} />
      <span style={{ fontSize: '0.9rem', color: '#050505' }}>
        {collaborationStats.successfulCollaborations} Successful Collaborations
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <HiStar size={20} style={{ color: '#FFA500' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#050505' }}>
        {collaborationStats.averageRating.toFixed(1)} Rating
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <HiChartBar size={20} style={{ color: '#2196F3' }} />
      <span style={{ fontSize: '0.9rem', color: '#050505' }}>
        {collaborationStats.successRate.toFixed(0)}% Success Rate
      </span>
    </div>
  </>
) : (
  <div style={{ fontSize: '0.875rem', color: '#65676B', fontStyle: 'italic' }}>
    No collaboration history yet
  </div>
)}
```

---

### Phase 2: Response Time Tracking (Priority: Low)

**Estimated Time**: 2-3 hours

#### Database Changes

1. **Add Response Time Tracking**
   - Track message response times
   - Calculate rolling average

#### Backend Changes

2. **Message Service Enhancement**
   - Calculate time between messages
   - Store response times
   - Calculate 30-day average

3. **Add to Profile Response**
   - Include `averageResponseTime` in profile data

#### Frontend Changes

4. **Update ProfileView Display**
   - Show real response time
   - Format nicely (e.g., "2 hours", "30 minutes", "1 day")
   - Show "N/A" if no data

#### Implementation Steps

**Step 1: Database Migration**
```typescript
// backend/src/database/migrations/1707599000000-AddResponseTimeTracking.ts

export class AddResponseTimeTracking1707599000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN average_response_time_minutes INTEGER DEFAULT NULL;
    `);
    
    await queryRunner.query(`
      ALTER TABLE messages 
      ADD COLUMN response_time_minutes INTEGER DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN average_response_time_minutes;
    `);
    await queryRunner.query(`
      ALTER TABLE messages DROP COLUMN response_time_minutes;
    `);
  }
}
```

**Step 2: Message Service Enhancement**
```typescript
// backend/src/modules/messaging/messaging.service.ts

async createMessage(senderId: string, dto: CreateMessageDto) {
  // ... existing code ...
  
  // Calculate response time if this is a reply
  const previousMessage = await this.messageRepository
    .createQueryBuilder('message')
    .where('message.conversationId = :conversationId', { conversationId: conversation.id })
    .andWhere('message.senderId != :senderId', { senderId })
    .orderBy('message.createdAt', 'DESC')
    .getOne();
  
  if (previousMessage) {
    const responseTimeMinutes = Math.floor(
      (Date.now() - previousMessage.createdAt.getTime()) / 60000
    );
    message.responseTimeMinutes = responseTimeMinutes;
    
    // Update user's average response time
    await this.updateAverageResponseTime(senderId);
  }
  
  // ... rest of code ...
}

private async updateAverageResponseTime(userId: string) {
  // Get last 30 days of response times
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const messages = await this.messageRepository
    .createQueryBuilder('message')
    .where('message.senderId = :userId', { userId })
    .andWhere('message.responseTimeMinutes IS NOT NULL')
    .andWhere('message.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
    .getMany();
  
  if (messages.length > 0) {
    const avgResponseTime = Math.floor(
      messages.reduce((sum, m) => sum + (m.responseTimeMinutes || 0), 0) / messages.length
    );
    
    await this.userRepository.update(userId, {
      averageResponseTimeMinutes: avgResponseTime
    });
  }
}
```

**Step 3: Include in Profile Response**
```typescript
// backend/src/modules/auth/auth.service.ts

private async getUnifiedProfileData(user: User): Promise<any> {
  // ... existing code ...
  
  return {
    // ... existing fields ...
    averageResponseTimeMinutes: user.averageResponseTimeMinutes || null,
  };
}
```

**Step 4: Frontend Display**
```typescript
// src/renderer/pages/ProfileView.tsx

// Helper function
const formatResponseTime = (minutes: number | null): string => {
  if (!minutes) return 'N/A';
  
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
  return `${Math.floor(minutes / 1440)} days`;
};

// Update display (line 1050):
<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <HiClock size={20} style={{ color: '#65676B' }} />
  <span style={{ fontSize: '0.9rem', color: '#65676B' }}>
    {isOwnProfile 
      ? `Your average response time: ${formatResponseTime(profile.averageResponseTimeMinutes)}`
      : `Usually responds in ${formatResponseTime(profile.averageResponseTimeMinutes)}`
    }
  </span>
</div>
```

---

### Phase 3: Name Validation (Priority: Low)

**Estimated Time**: 30 minutes

#### Backend Changes

1. **Prevent Email as Name**
   - Validate name field
   - Return empty string if not set

#### Frontend Changes

2. **Improve Empty Name Handling**
   - Already shows completion prompt
   - No changes needed

#### Implementation Steps

**Step 1: Backend Validation**
```typescript
// backend/src/modules/auth/auth.service.ts

private async getUnifiedProfileData(user: User): Promise<any> {
  if (user.role === 'INFLUENCER') {
    const profile = await this.influencerProfileRepository.findOne({
      where: { userId: user.id }
    });
    
    if (!profile) {
      return {
        name: '', // ✅ Empty string, not email
        // ... rest of fields ...
      };
    }

    // ✅ Validate name is not email
    const name = profile.name && profile.name !== user.email 
      ? profile.name 
      : '';

    return {
      name, // ✅ Validated name
      // ... rest of fields ...
    };
  }
  
  // Same for company profile
  // ...
}
```

**Step 2: Profile Update Validation**
```typescript
// backend/src/modules/auth/auth.service.ts

async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
  // ... existing code ...
  
  // Validate name is not email
  if (updateProfileDto.name) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (updateProfileDto.name === user?.email) {
      throw new BadRequestException('Name cannot be your email address');
    }
  }
  
  // ... rest of code ...
}
```

---

## Testing Plan

### Test 1: Collaboration Stats

```bash
# 1. Create test users with collaborations
# 2. Submit collaboration outcomes
# 3. View profile
# 4. Verify stats displayed correctly

# Test API directly
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/ai-matching/collaboration-outcomes/user/<userId>/stats

# Expected response:
{
  "totalCollaborations": 5,
  "successfulCollaborations": 4,
  "averageRating": 4.2,
  "successRate": 80,
  "hasData": true
}
```

### Test 2: Response Time

```bash
# 1. Send messages between users
# 2. Wait varying amounts of time
# 3. Reply to messages
# 4. Check database for response times
# 5. View profile
# 6. Verify average displayed

# Check database
SELECT average_response_time_minutes FROM users WHERE id = '<userId>';

# Expected: Number in minutes or NULL
```

### Test 3: Name Validation

```bash
# 1. Try to set name to email
POST /auth/profile
{
  "name": "user@example.com"
}

# Expected: 400 Bad Request
# "Name cannot be your email address"

# 2. Set valid name
POST /auth/profile
{
  "name": "John Doe"
}

# Expected: 200 OK

# 3. View profile with no name
# Expected: Shows "Complete Your Profile" prompt
```

---

## Deployment Checklist

### Phase 1: Collaboration Stats
- [ ] Backend service method created
- [ ] Controller route added
- [ ] Frontend service method added
- [ ] ProfileView updated
- [ ] Tested with real data
- [ ] Tested with no data
- [ ] Error handling verified

### Phase 2: Response Time
- [ ] Database migration created
- [ ] Migration run successfully
- [ ] Message service updated
- [ ] Response time calculation tested
- [ ] Profile response includes field
- [ ] Frontend display updated
- [ ] Formatting tested

### Phase 3: Name Validation
- [ ] Backend validation added
- [ ] Update endpoint validated
- [ ] Error messages tested
- [ ] Frontend handles empty names
- [ ] Completion prompt works

---

## Rollback Plan

### If Issues Occur

**Phase 1 Rollback**:
```bash
# Remove new endpoint
# Frontend will fall back to showing no stats
# No data loss
```

**Phase 2 Rollback**:
```bash
# Revert migration
npm run migration:revert

# Frontend will show "N/A"
# No data loss
```

**Phase 3 Rollback**:
```bash
# Remove validation
# System works as before
# No data loss
```

---

## Timeline

**Total Estimated Time**: 3.5-5.5 hours

- Phase 1 (Collaboration Stats): 1-2 hours
- Phase 2 (Response Time): 2-3 hours
- Phase 3 (Name Validation): 0.5 hours

**Recommended Order**:
1. Phase 3 (quickest, lowest risk)
2. Phase 1 (medium priority, medium complexity)
3. Phase 2 (lowest priority, highest complexity)

---

## Success Criteria

### Phase 1 Success
- ✅ Real collaboration stats displayed on profiles
- ✅ "No collaboration history" shown when appropriate
- ✅ Loading state while fetching
- ✅ No errors in console

### Phase 2 Success
- ✅ Real response times calculated
- ✅ Average updated after each message
- ✅ Formatted nicely in UI
- ✅ "N/A" shown when no data

### Phase 3 Success
- ✅ Email cannot be used as name
- ✅ Empty names handled gracefully
- ✅ Completion prompt shows
- ✅ No errors on profile view

---

**Status**: 📋 Ready for Implementation  
**Priority**: Medium (Non-blocking)  
**Risk Level**: Low  
**Deployment**: Can be done incrementally
