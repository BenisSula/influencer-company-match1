# Integration Fix Quick Reference

**Date:** February 16, 2026  
**Full Plan:** See `COMPREHENSIVE-INTEGRATION-FIX-PLAN.md`

---

## 🔴 TOP 8 CRITICAL FIXES (Do First)

### 1. Connection Status Enum
```typescript
// Remove 'CONNECTED', keep only 'ACCEPTED'
export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',  // ✅ Use this
  REJECTED = 'rejected'
}
```

### 2. Profile Name Field
```sql
-- Rename companyName to name
ALTER TABLE company_profiles RENAME COLUMN "companyName" TO "name";
```

### 3. Match Response Structure
```typescript
// Backend should return
{
  profile: {...},  // Changed from 'user'
  breakdown: {...}  // Changed from 'factors'
}
```

### 4. Message Sender
```typescript
// Use flat structure
sender: {
  name: string,  // Not profile.fullName
  avatarUrl: string
}
```

### 5. Collaboration Request
```typescript
// Backend controller wraps flat DTO into nested structure
collaborationRequestData: { ...allFields }
```

### 6. Avatar URL Storage
```sql
-- Remove from profile tables, use only users.avatarUrl
ALTER TABLE influencer_profiles DROP COLUMN "avatarUrl";
ALTER TABLE company_profiles DROP COLUMN "avatarUrl";
```

### 7. Platform JSONB
```typescript
// Add transformer
@Column({ 
  type: 'jsonb',
  transformer: {
    to: (v) => JSON.stringify(v),
    from: (v) => JSON.parse(v)
  }
})
platforms: string[];
```

### 8. Engagement Rate
```typescript
// Add transformer
@Column({ 
  type: 'decimal',
  transformer: {
    from: (v) => parseFloat(v)
  }
})
engagementRate: number;
```

---

## ⚠️ HIGH PRIORITY (12 Fixes)

9. Add conversation.lastMessage field
10. Remove duplicate followerCount column
11. Standardize error responses (global filter)
12. Add comprehensive type definitions
13. Fix post mediaUrls (simple-array → jsonb)
14. Add match history monitoring/logging
15. Standardize role types (uppercase backend, lowercase frontend)
16. Rename unread_count_1/2 for clarity
17. Add API response validation
18. Add database constraints (CHECK)
19. Add 'withdrawn' to ApplicationStatus enum
20. Centralize API configuration

---

## 📝 MEDIUM PRIORITY (12 Fixes)

21. Profile completion sync strategy
22. Campaign deliverables (TEXT → array)
23. Campaign platforms consistency
24. Saved profile notes/tags
25. Review helpful count field
26. Message readAt serialization
27. Feed post author avatar population
28. Campaign budget clarity
29. Add getMatchById() method
30. Add searchUsers() method
31. Add request validation (class-validator)
32. Add response DTOs

---

## 📊 QUICK STATUS

| Category | Count | Status |
|----------|-------|--------|
| Critical | 8 | 🔴 Fix immediately |
| High | 12 | ⚠️ Fix this week |
| Medium | 12 | 📝 Fix next week |
| **Total** | **32** | **5-7 days** |

---

## 🎯 DAILY PLAN

### Day 1: Critical Fixes 1-4
- Connection status enum
- Profile name field
- Match response structure
- Message sender structure

### Day 2: Critical Fixes 5-8
- Collaboration request structure
- Avatar URL storage
- Platform JSONB serialization
- Engagement rate type

### Day 3: High Priority 9-14
- Conversation last message
- Remove followerCount
- Error responses
- Type definitions
- Post media URLs
- Match history monitoring

### Day 4: High Priority 15-20
- Role types
- Unread count naming
- API validation
- Database constraints
- Campaign status
- API config

### Day 5-7: Medium Priority
- All remaining fixes
- Testing
- Documentation

---

## 🧪 TEST AFTER EACH FIX

```bash
# Backend
cd backend
npm run test

# Frontend
npm run test

# Manual test
# 1. Test affected feature
# 2. Check browser console
# 3. Check network tab
# 4. Check database
```

---

## 📁 FILES TO UPDATE

### Backend Entities (8 files)
- `connection.entity.ts`
- `company-profile.entity.ts`
- `influencer-profile.entity.ts`
- `feed-post.entity.ts`
- `conversation.entity.ts`
- `campaign-application.entity.ts`
- `message.entity.ts`
- `user.entity.ts`

### Backend Services (5 files)
- `matching.service.ts`
- `auth.service.ts`
- `messaging.service.ts`
- `feed.service.ts`
- `campaigns.service.ts`

### Backend Controllers (3 files)
- `matching.controller.ts`
- `messaging.controller.ts`
- `campaigns.controller.ts`

### Frontend Services (4 files)
- `matching.service.ts`
- `messaging.service.ts`
- `auth.service.ts`
- `feed.service.ts`

### Frontend Types (3 files)
- `matching.types.ts` (create)
- `user.types.ts` (update)
- `profile.types.ts` (update)

### Migrations (10+ files)
- Create new migrations for each schema change

---

## 🚨 ROLLBACK PLAN

If issues occur:

```bash
# Revert migration
npm run migration:revert

# Rollback code
git revert <commit-hash>

# Restart services
npm run restart
```

---

## ✅ COMPLETION CHECKLIST

- [ ] All 8 critical fixes implemented
- [ ] All 12 high priority fixes implemented
- [ ] All 12 medium priority fixes implemented
- [ ] All tests passing
- [ ] No console errors
- [ ] No type errors
- [ ] Database consistent
- [ ] Documentation updated
- [ ] Team notified
- [ ] Deployed to staging
- [ ] QA approved
- [ ] Deployed to production

---

## 📞 NEED HELP?

- Full details: `COMPREHENSIVE-INTEGRATION-FIX-PLAN.md`
- Previous audits: `FRONTEND-BACKEND-SYNC-AUDIT.md`
- Mismatch analysis: `CODEBASE-MISMATCH-ANALYSIS-AND-FIX-PLAN.md`

---

**Start with Critical Fixes 1-8, then move to High Priority!**
