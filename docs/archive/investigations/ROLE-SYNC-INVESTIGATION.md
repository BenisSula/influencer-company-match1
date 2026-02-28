# Role Synchronization Investigation & Fix Plan

**Date:** February 10, 2026  
**Issue:** Profile data not properly aligned between registration, profile editing, and display based on user role

## Problem Statement

The system has inconsistencies in how it handles INFLUENCER vs COMPANY roles across:
1. Account creation (Register page)
2. Profile completion (ProfileEdit/ProfileSetup)
3. Profile display (Profile page, Dashboard)
4. Backend data storage (User entity + role-specific profile tables)

## Current Data Flow Analysis

### 1. Registration Flow ✅ (Working)
```
Register Page → Select Role (INFLUENCER/COMPANY) → Backend creates:
  - User record with role
  - Empty InfluencerProfile OR CompanyProfile
```

**What's Stored:**
- User table: `id`, `email`, `password`, `role`
- InfluencerProfile table: `userId`, `niche`, `bio`, etc.
- CompanyProfile table: `userId`, `companyName`, `industry`, etc.

### 2. Profile Editing Flow ⚠️ (Issues Found)

**Problem 1: Field Mismatch**
- ProfileEdit shows same fields for both roles
- Doesn't adapt based on user.role
- Missing role-specific validation

**Problem 2: Backend Mapping Issues**
```typescript
// INFLUENCER
user.name = profile.niche  // ❌ Wrong! Should be separate
profile.niche = "Fashion"  // ✅ Correct

// COMPANY
user.name = profile.companyName  // ✅ Correct
profile.companyName = "StyleCo"  // ✅ Correct
```

**Problem 3: Frontend-Backend Field Mismatch**
| Frontend Field | Influencer Backend | Company Backend |
|----------------|-------------------|-----------------|
| name | ❌ niche (wrong) | ✅ companyName |
| niche | ✅ niche | ❌ N/A |
| industry | ❌ N/A | ✅ industry |
| audienceSize | ✅ audienceSize | ❌ N/A |
| budget | ❌ N/A | ✅ budget |
| platforms | ✅ platforms | ❌ targetPlatforms |
| location | ✅ location | ⚠️ targetLocation |

### 3. Profile Display Flow ⚠️ (Issues Found)

**Problem 1: Profile Page**
- Shows same layout for both roles
- Doesn't highlight role-specific fields
- Missing role-specific sections

**Problem 2: Dashboard**
- Generic display
- Doesn't show role-appropriate stats
- Missing role context

## Database Schema Analysis

### User Table (Shared)
```sql
users
├── id (UUID)
├── email
├── password
├── role (ENUM: INFLUENCER, COMPANY, ADMIN)
├── profileCompleted (boolean)
├── profileCompletionPercentage (int)
├── createdAt
└── updatedAt
```

### InfluencerProfile Table
```sql
influencer_profiles
├── id (UUID)
├── userId (FK → users.id)
├── niche (string) ⚠️ Used as name!
├── audienceSize (int)
├── engagementRate (decimal)
├── platforms (array)
├── location (string)
├── minBudget (int)
├── maxBudget (int)
├── bio (text)
├── portfolioUrl (string)
├── contentType (text)
├── collaborationPreference (string)
├── verificationStatus (boolean)
└── mediaGallery (json)
```

### CompanyProfile Table
```sql
company_profiles
├── id (UUID)
├── userId (FK → users.id)
├── companyName (string) ✅ Used as name
├── industry (string)
├── budget (int)
├── targetPlatforms (array)
├── targetLocation (string)
├── minAudienceSize (int)
├── maxAudienceSize (int)
├── description (text) ⚠️ Used as bio
├── website (string)
├── companySize (string)
├── campaignType (text)
├── preferredInfluencerNiches (text)
├── collaborationDuration (string)
└── verificationStatus (boolean)
```

## Issues Identified

### Critical Issues 🔴

1. **Missing Name Field for Influencers**
   - Backend uses `niche` as name
   - Should have separate `name` field
   - Causes confusion in UI

2. **Field Name Inconsistencies**
   - `platforms` vs `targetPlatforms`
   - `location` vs `targetLocation`
   - `bio` vs `description`

3. **No Role-Based UI Adaptation**
   - ProfileEdit shows all fields to all roles
   - No conditional rendering based on role
   - Confusing UX

4. **Profile Completion Calculation**
   - Doesn't account for role-specific fields
   - Same percentage for different roles
   - Misleading progress

### Medium Issues 🟡

5. **Profile Display Not Role-Aware**
   - Same layout for both roles
   - Missing role-specific highlights
   - Generic presentation

6. **Dashboard Stats Not Role-Specific**
   - Shows same metrics for both
   - Should show relevant KPIs per role

7. **Missing Validation**
   - No role-based field validation
   - Can submit wrong fields for role

## Fix Plan

### Phase 1: Database Schema Updates 🔧

#### 1.1 Add Name Field to InfluencerProfile
```typescript
// Migration: Add name column
@Column({ nullable: true })
name: string;
```

#### 1.2 Standardize Field Names
```typescript
// CompanyProfile
targetPlatforms → platforms (align with Influencer)
targetLocation → location (align with Influencer)
description → bio (align with Influencer)
```

### Phase 2: Backend Service Updates 🔧

#### 2.1 Update getUserWithProfile()
```typescript
if (user.role === 'INFLUENCER') {
  const profile = await this.influencerProfileRepository.findOne({
    where: { userId: user.id }
  });
  if (profile) {
    user.name = profile.name || profile.niche; // ✅ Use name field
    user.bio = profile.bio;
    user.niche = profile.niche;
    user.audienceSize = profile.audienceSize;
    user.engagementRate = profile.engagementRate;
    user.platforms = profile.platforms;
    user.location = profile.location;
  }
} else if (user.role === 'COMPANY') {
  const profile = await this.companyProfileRepository.findOne({
    where: { userId: user.id }
  });
  if (profile) {
    user.name = profile.companyName;
    user.bio = profile.bio; // ✅ Use bio instead of description
    user.industry = profile.industry;
    user.budget = profile.budget;
    user.platforms = profile.platforms; // ✅ Renamed from targetPlatforms
    user.location = profile.location; // ✅ Renamed from targetLocation
  }
}
```

#### 2.2 Update updateProfile()
```typescript
// Add role-based validation
if (user.role === 'INFLUENCER') {
  // Only allow influencer fields
  if (updateProfileDto.name) profile.name = updateProfileDto.name;
  if (updateProfileDto.niche) profile.niche = updateProfileDto.niche;
  // ... other influencer fields
} else if (user.role === 'COMPANY') {
  // Only allow company fields
  if (updateProfileDto.name) profile.companyName = updateProfileDto.name;
  if (updateProfileDto.industry) profile.industry = updateProfileDto.industry;
  // ... other company fields
}
```

#### 2.3 Add Profile Completion Calculator
```typescript
private calculateProfileCompletion(user: User, profile: any): number {
  const requiredFields = user.role === 'INFLUENCER' 
    ? ['name', 'niche', 'bio', 'audienceSize', 'platforms', 'location']
    : ['companyName', 'industry', 'bio', 'budget', 'location'];
  
  const filledFields = requiredFields.filter(field => {
    const value = profile[field];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });
  
  return Math.round((filledFields.length / requiredFields.length) * 100);
}
```

### Phase 3: Frontend Updates 🎨

#### 3.1 Update ProfileEdit Component
```typescript
// Add role-based rendering
const renderRoleSpecificFields = () => {
  if (user?.role === 'INFLUENCER') {
    return (
      <>
        <Input label="Full Name" value={profileData.name} ... />
        <Input label="Niche" value={profileData.niche} ... />
        <Input label="Audience Size" value={profileData.audienceSize} ... />
        <Input label="Engagement Rate" value={profileData.engagementRate} ... />
        <PlatformSelector value={profileData.platforms} ... />
      </>
    );
  } else {
    return (
      <>
        <Input label="Company Name" value={profileData.name} ... />
        <Input label="Industry" value={profileData.industry} ... />
        <Input label="Budget" value={profileData.budget} ... />
        <Input label="Company Size" value={profileData.companySize} ... />
      </>
    );
  }
};
```

#### 3.2 Update Profile Display
```typescript
// Profile.tsx - Add role-specific sections
{user.role === 'INFLUENCER' && (
  <div className="influencer-stats">
    <StatCard label="Audience" value={profile.audienceSize} />
    <StatCard label="Engagement" value={`${profile.engagementRate}%`} />
    <StatCard label="Niche" value={profile.niche} />
  </div>
)}

{user.role === 'COMPANY' && (
  <div className="company-stats">
    <StatCard label="Industry" value={profile.industry} />
    <StatCard label="Budget" value={`$${profile.budget}`} />
    <StatCard label="Company Size" value={profile.companySize} />
  </div>
)}
```

#### 3.3 Update Dashboard
```typescript
// Dashboard.tsx - Role-specific welcome message
<h2>
  Welcome back, {user.role === 'INFLUENCER' ? 'Creator' : 'Brand'}!
</h2>

// Role-specific stats
{user.role === 'INFLUENCER' && (
  <div className="influencer-dashboard">
    <StatCard label="Profile Views" value={stats.views} />
    <StatCard label="Connection Requests" value={stats.requests} />
    <StatCard label="Active Campaigns" value={stats.campaigns} />
  </div>
)}
```

### Phase 4: Validation & Error Handling 🛡️

#### 4.1 Add Role-Based Validation
```typescript
const validateProfileData = (role: string, data: ProfileData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (role === 'INFLUENCER') {
    if (!data.name) errors.name = 'Name is required';
    if (!data.niche) errors.niche = 'Niche is required';
    if (!data.audienceSize) errors.audienceSize = 'Audience size is required';
  } else {
    if (!data.name) errors.name = 'Company name is required';
    if (!data.industry) errors.industry = 'Industry is required';
    if (!data.budget) errors.budget = 'Budget is required';
  }
  
  return errors;
};
```

#### 4.2 Add Backend DTO Validation
```typescript
// update-profile.dto.ts
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  // Influencer-only fields
  @ValidateIf(o => o.role === 'INFLUENCER')
  @IsString()
  niche?: string;
  
  // Company-only fields
  @ValidateIf(o => o.role === 'COMPANY')
  @IsString()
  industry?: string;
}
```

## Implementation Steps

### Step 1: Database Migration (30 min)
1. Create migration to add `name` to InfluencerProfile
2. Create migration to rename CompanyProfile fields
3. Run migrations
4. Verify schema changes

### Step 2: Backend Updates (1 hour)
1. Update InfluencerProfile entity
2. Update CompanyProfile entity
3. Update AuthService.getUserWithProfile()
4. Update AuthService.updateProfile()
5. Add profile completion calculator
6. Test backend endpoints

### Step 3: Frontend Updates (1.5 hours)
1. Update ProfileEdit with role-based rendering
2. Update Profile page with role-specific sections
3. Update Dashboard with role-specific content
4. Add role-based validation
5. Test all flows

### Step 4: Testing (30 min)
1. Test INFLUENCER registration → profile edit → display
2. Test COMPANY registration → profile edit → display
3. Test profile completion percentage
4. Test field validation
5. Test data persistence

## Success Criteria

✅ Influencers have separate name and niche fields  
✅ Companies use companyName as name  
✅ Field names consistent across roles  
✅ ProfileEdit shows only relevant fields per role  
✅ Profile page displays role-specific information  
✅ Dashboard shows role-appropriate content  
✅ Profile completion percentage accurate per role  
✅ Validation prevents wrong fields for role  
✅ All data syncs correctly with backend  
✅ No TypeScript errors  

## Risk Assessment

### Low Risk ✅
- Frontend UI changes
- Adding new fields
- Display logic updates

### Medium Risk ⚠️
- Database migrations (test thoroughly)
- Backend service changes (maintain backward compatibility)
- Field name changes (update all references)

### Mitigation
- Create database backup before migration
- Test migrations on dev database first
- Keep old field names as aliases temporarily
- Gradual rollout with feature flags

## Timeline

- **Database Migration:** 30 minutes
- **Backend Updates:** 1 hour
- **Frontend Updates:** 1.5 hours
- **Testing:** 30 minutes
- **Total:** ~3.5 hours

## Next Steps

1. Review and approve this plan
2. Create database backup
3. Implement database migrations
4. Update backend services
5. Update frontend components
6. Run comprehensive tests
7. Deploy to staging
8. User acceptance testing
9. Deploy to production

Ready to proceed with implementation!
