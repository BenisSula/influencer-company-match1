# Full Name Field Implementation Plan

## Investigation Summary

After thorough investigation of the registration flow, profile pages, backend services, and database schema, I've identified the following:

### Current State
1. **Registration Form**: Does NOT have a "Full Name" field - only email, password, and role selection
2. **Backend DTO**: Has optional `name` field in RegisterDto but it's never populated from frontend
3. **Database**: Both `influencer_profiles` and `company_profiles` tables have a `name` column
4. **Profile Edit**: Has `name` field and works correctly
5. **Data Flow**: Name can only be set AFTER registration via Profile Edit page

### Problem
Users register without providing their name, leading to:
- Empty name fields in profiles
- Poor UX (users must edit profile separately)
- Inconsistent data (some users never complete their name)
- Profile completion percentage starts lower than necessary

---

## Implementation Plan

### Phase 1: Frontend - Add Full Name to Registration Form ✅

#### 1.1 Update RegisterForm Component
**File**: `src/renderer/components/RegisterForm/RegisterForm.tsx`

**Changes**:
- Add `fullName` state variable
- Add Full Name input field (after role selection, before email)
- Add validation for full name (required, min 2 characters)
- Pass `fullName` to register function

```typescript
// Add state
const [fullName, setFullName] = useState('');

// Add validation
if (!fullName.trim()) {
  setError('Please enter your full name');
  return;
}
if (fullName.trim().length < 2) {
  setError('Name must be at least 2 characters');
  return;
}

// Update register call
await register(email, password, role, fullName);
```

#### 1.2 Update Register Page Component
**File**: `src/renderer/pages/Register.tsx`

**Changes**:
- Add `fullName` state variable
- Add Full Name input field
- Add validation
- Pass `fullName` to register function

#### 1.3 Update AuthContext
**File**: `src/renderer/contexts/AuthContext.tsx`

**Changes**:
- Update `register` function signature to accept `fullName` parameter
- Pass `fullName` to backend API call

```typescript
const register = async (
  email: string, 
  password: string, 
  role: 'INFLUENCER' | 'COMPANY',
  fullName: string
) => {
  const response = await apiClient.post('/auth/register', {
    email,
    password,
    role,
    name: fullName, // Map to 'name' field expected by backend
  });
  // ... rest of logic
};
```

---

### Phase 2: Backend - Update Registration Logic ✅

#### 2.1 Update RegisterDto
**File**: `backend/src/modules/auth/dto/register.dto.ts`

**Changes**:
- Make `name` field REQUIRED (remove @IsOptional)
- Add proper validation

```typescript
@IsString()
@MinLength(2, { message: 'Name must be at least 2 characters' })
@MaxLength(100, { message: 'Name must not exceed 100 characters' })
name: string; // ✅ Now required
```

#### 2.2 Update AuthService Registration
**File**: `backend/src/modules/auth/auth.service.ts`

**Changes**:
- Ensure `name` is always saved to profile during registration
- Update both influencer and company profile creation

```typescript
// For INFLUENCER
const profile = this.influencerProfileRepository.create({
  userId: user.id,
  name: registerDto.name, // ✅ Always set from registration
  niche: registerDto.niche,
  bio: registerDto.bio,
});

// For COMPANY
const profile = this.companyProfileRepository.create({
  userId: user.id,
  name: registerDto.name, // ✅ Always set from registration
  industry: registerDto.industry,
  bio: registerDto.bio,
});
```

---

### Phase 3: Database - Ensure Consistency ✅

#### 3.1 Verify Schema
**Files**: 
- `backend/src/modules/auth/entities/influencer-profile.entity.ts`
- `backend/src/modules/auth/entities/company-profile.entity.ts`

**Status**: ✅ Both entities already have `name` column (nullable: true)

**Optional Enhancement**: Create migration to make `name` NOT NULL
```sql
ALTER TABLE influencer_profiles ALTER COLUMN name SET NOT NULL;
ALTER TABLE company_profiles ALTER COLUMN name SET NOT NULL;
```

---

### Phase 4: Data Flow Verification ✅

#### 4.1 Registration Flow
```
User fills form → Frontend validates → Backend receives:
{
  email: "user@example.com",
  password: "SecurePass123!",
  role: "INFLUENCER",
  name: "John Doe" ← NEW FIELD
}
→ Backend creates user → Backend creates profile with name
→ Returns user with profile data → Frontend stores in AuthContext
```

#### 4.2 Profile Display Flow
```
User logs in → Backend loads user + profile → Returns unified data:
{
  id: "uuid",
  email: "user@example.com",
  role: "INFLUENCER",
  name: "John Doe", ← Available immediately
  bio: "",
  niche: "",
  ...
}
→ Frontend displays name in Profile, Dashboard, etc.
```

#### 4.3 Profile Edit Flow
```
User edits profile → Updates name field → Backend receives:
{
  name: "John Smith", ← Updated name
  bio: "...",
  ...
}
→ Backend updates profile table → Returns updated user
→ Frontend refreshes AuthContext → UI updates everywhere
```

---

### Phase 5: Consistency Checks ✅

#### 5.1 Ensure Name Syncs Everywhere
**Files to verify**:
1. ✅ `ProfileEdit.tsx` - Already has name field
2. ✅ `Profile.tsx` - Already displays name
3. ✅ `Dashboard.tsx` - Should display name
4. ✅ `MatchCard.tsx` - Should display name
5. ✅ `FeedPost.tsx` - Should display name
6. ✅ `Messages.tsx` - Should display name

**Backend Services**:
1. ✅ `auth.service.ts` - getUnifiedProfileData() returns name
2. ✅ `profiles.service.ts` - getProfileByUserId() returns name
3. ✅ `matching.service.ts` - Should include name in match data

---

### Phase 6: Migration Strategy for Existing Users

#### 6.1 Handle Existing Users Without Names
**Options**:

**Option A: Soft Requirement (Recommended)**
- Keep `name` nullable in database
- Show "Complete Your Profile" banner if name is empty
- Redirect to Profile Edit on first login if name is missing

**Option B: Hard Requirement**
- Make `name` NOT NULL in database
- Run migration to set default names for existing users
- Force profile completion modal on login if name is empty

**Recommended**: Option A for better UX

#### 6.2 Profile Completion Calculation
Update `calculateProfileCompletion()` in `auth.service.ts`:
```typescript
const requiredFields = role === 'INFLUENCER' 
  ? ['name', 'niche', 'bio', 'audienceSize', 'platforms', 'location']
  : ['name', 'industry', 'bio', 'budget', 'location'];
```
✅ Already includes 'name' in required fields

---

## Testing Checklist

### Frontend Tests
- [ ] Register form shows Full Name field
- [ ] Full Name validation works (required, min length)
- [ ] Error messages display correctly
- [ ] Form submission includes full name
- [ ] Registration succeeds with valid full name
- [ ] Registration fails without full name

### Backend Tests
- [ ] RegisterDto validates name field
- [ ] Registration creates profile with name
- [ ] Name is returned in login response
- [ ] Name is returned in getCurrentUser response
- [ ] Profile update syncs name correctly

### Integration Tests
- [ ] Register → Login → Profile displays name
- [ ] Register → Dashboard displays name
- [ ] Register → Edit Profile shows name
- [ ] Name appears in match cards
- [ ] Name appears in feed posts
- [ ] Name appears in messages

### Data Consistency Tests
- [ ] Name syncs between user and profile tables
- [ ] Name updates propagate to all UI components
- [ ] Name persists after logout/login
- [ ] Name displays correctly for both roles

---

## Implementation Order

### Step 1: Backend First (Safer)
1. Update RegisterDto (make name required)
2. Update auth.service.ts (ensure name is saved)
3. Test backend with Postman/curl
4. Verify database has name after registration

### Step 2: Frontend
1. Update RegisterForm.tsx (add name field)
2. Update Register.tsx (add name field)
3. Update AuthContext.tsx (pass name to backend)
4. Test registration flow end-to-end

### Step 3: Verification
1. Test new user registration
2. Verify name appears in profile
3. Verify name appears in dashboard
4. Verify name appears in matches
5. Test profile edit (name update)

### Step 4: Existing Users (Optional)
1. Add profile completion banner
2. Show "Add Your Name" prompt
3. Redirect to profile edit if name missing

---

## Files to Modify

### Frontend (4 files)
1. ✅ `src/renderer/components/RegisterForm/RegisterForm.tsx`
2. ✅ `src/renderer/pages/Register.tsx`
3. ✅ `src/renderer/contexts/AuthContext.tsx`
4. ⚠️ `src/renderer/components/ProfileCompletionBanner/ProfileCompletionBanner.tsx` (optional)

### Backend (2 files)
1. ✅ `backend/src/modules/auth/dto/register.dto.ts`
2. ✅ `backend/src/modules/auth/auth.service.ts`

### Database (1 file - optional)
1. ⚠️ `backend/src/database/migrations/XXXXXX-MakeNameRequired.ts` (optional)

---

## Rollout Strategy

### Phase 1: Soft Launch (Recommended)
1. Deploy backend changes (name optional but encouraged)
2. Deploy frontend changes (name field required in form)
3. Monitor for issues
4. Existing users can continue without name
5. New users must provide name

### Phase 2: Gradual Enforcement (Optional)
1. Show banner to users without names
2. Encourage profile completion
3. After 30 days, make name required for all users
4. Force profile edit modal on login if name missing

---

## Success Criteria

✅ New users can register with full name
✅ Full name is stored in database
✅ Full name displays in profile page
✅ Full name displays in dashboard
✅ Full name displays in match cards
✅ Full name displays in feed posts
✅ Full name displays in messages
✅ Full name can be edited in profile edit
✅ Full name syncs across all components
✅ Existing users can add name via profile edit

---

## Risk Assessment

### Low Risk
- Adding optional field to registration form
- Backend already supports name field
- Database schema already has name column
- Profile edit already handles name updates

### Medium Risk
- Making name required might break existing API clients
- Existing users without names need migration path

### Mitigation
- Keep name optional in database (nullable: true)
- Add frontend validation only
- Show profile completion prompts for existing users
- Gradual rollout with monitoring

---

## Estimated Effort

- **Backend Changes**: 30 minutes
- **Frontend Changes**: 1 hour
- **Testing**: 1 hour
- **Documentation**: 30 minutes
- **Total**: ~3 hours

---

## Next Steps

1. Review and approve this plan
2. Create feature branch: `feature/add-full-name-to-registration`
3. Implement backend changes first
4. Test backend with API client
5. Implement frontend changes
6. Test end-to-end flow
7. Create PR for review
8. Deploy to staging
9. Test in staging environment
10. Deploy to production

---

## Questions to Resolve

1. Should name be required in database (NOT NULL) or optional?
   - **Recommendation**: Keep optional for backward compatibility
   
2. Should we force existing users to add their name?
   - **Recommendation**: Show banner, don't force
   
3. Should we validate name format (e.g., no numbers, special chars)?
   - **Recommendation**: Allow any characters (international names)
   
4. Should we split into firstName and lastName?
   - **Recommendation**: Keep as single "name" field for simplicity
   
5. Should we show name in registration success message?
   - **Recommendation**: Yes, personalize the welcome message

---

## Conclusion

This implementation plan ensures that the "Full Name" field is properly integrated into the registration flow with complete data synchronization across:
- ✅ Registration form (frontend)
- ✅ Backend API and validation
- ✅ Database storage
- ✅ Profile display
- ✅ Profile editing
- ✅ All UI components (dashboard, matches, feed, messages)

The plan maintains backward compatibility with existing users while ensuring all new users provide their name during registration.
