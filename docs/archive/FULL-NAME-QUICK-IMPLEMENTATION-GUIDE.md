# Full Name Field - Quick Implementation Guide

## TL;DR
Add "Full Name" field to registration form and sync it across the entire platform.

---

## Quick Facts

- **Current State**: Registration has NO name field
- **Problem**: Users must edit profile separately to add name
- **Solution**: Add name field to registration form
- **Effort**: ~3 hours
- **Risk**: Low (backward compatible)
- **Files to Change**: 6 files

---

## Implementation Steps

### Step 1: Backend (30 min)

#### File 1: `backend/src/modules/auth/dto/register.dto.ts`
```typescript
// Change from:
@IsOptional()
@IsString()
name?: string;

// To:
@IsString()
@MinLength(2, { message: 'Name must be at least 2 characters' })
@MaxLength(100, { message: 'Name must not exceed 100 characters' })
name: string; // ✅ Now required
```

#### File 2: `backend/src/modules/auth/auth.service.ts`
```typescript
// In register() method, ensure name is always saved:

// For INFLUENCER
const profile = this.influencerProfileRepository.create({
  userId: user.id,
  name: registerDto.name, // ✅ Always set
  // ... other fields
});

// For COMPANY
const profile = this.companyProfileRepository.create({
  userId: user.id,
  name: registerDto.name, // ✅ Always set
  // ... other fields
});
```

**Test Backend**:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "role": "INFLUENCER",
    "name": "John Doe"
  }'
```

---

### Step 2: Frontend (1 hour)

#### File 3: `src/renderer/components/RegisterForm/RegisterForm.tsx`

**Add state**:
```typescript
const [fullName, setFullName] = useState('');
```

**Add input field** (after role selection, before email):
```tsx
<div className="form-group">
  <label htmlFor="register-fullname">Full Name</label>
  <div className="form-input-wrapper">
    <User className="input-icon" size={20} />
    <input
      id="register-fullname"
      type="text"
      className="form-input with-icon"
      placeholder="Enter your full name"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      disabled={loading}
      required
      autoComplete="name"
    />
  </div>
</div>
```

**Add validation** (in handleSubmit):
```typescript
if (!fullName.trim()) {
  setError('Please enter your full name');
  return;
}
if (fullName.trim().length < 2) {
  setError('Name must be at least 2 characters');
  return;
}
```

**Update register call**:
```typescript
await register(email, password, role, fullName.trim());
```

#### File 4: `src/renderer/pages/Register.tsx`

Same changes as RegisterForm.tsx (add state, input, validation, pass to register)

#### File 5: `src/renderer/contexts/AuthContext.tsx`

**Update register function signature**:
```typescript
const register = async (
  email: string,
  password: string,
  role: 'INFLUENCER' | 'COMPANY',
  fullName: string // ✅ Add parameter
) => {
  const response = await apiClient.post('/auth/register', {
    email,
    password,
    role,
    name: fullName, // ✅ Pass to backend
  });
  // ... rest of logic
};
```

**Update interface**:
```typescript
interface AuthContextType {
  // ... other properties
  register: (
    email: string,
    password: string,
    role: 'INFLUENCER' | 'COMPANY',
    fullName: string // ✅ Add parameter
  ) => Promise<void>;
}
```

---

### Step 3: Test (1 hour)

#### Manual Testing Checklist
```
✅ Open registration page
✅ See "Full Name" field
✅ Try to submit without name → See error
✅ Enter name with 1 character → See error
✅ Enter valid name → Form submits
✅ Check database → Name is saved
✅ Login → Name appears in profile
✅ Check dashboard → Name appears
✅ Edit profile → Name can be updated
```

#### Test with Different Names
```
✅ "John Doe" → Works
✅ "José María" → Works (special chars)
✅ "李明" → Works (Chinese)
✅ "محمد" → Works (Arabic)
✅ "A" → Error (too short)
✅ "" → Error (required)
```

---

## Verification Commands

### Check Database
```sql
-- Check if name is saved
SELECT id, email, role FROM users WHERE email = 'test@example.com';

-- Check influencer profile
SELECT userId, name, niche FROM influencer_profiles 
WHERE userId = (SELECT id FROM users WHERE email = 'test@example.com');

-- Check company profile
SELECT userId, name, industry FROM company_profiles 
WHERE userId = (SELECT id FROM users WHERE email = 'test@example.com');
```

### Check API Response
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "role": "INFLUENCER",
    "name": "John Doe"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Get current user
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Issues & Solutions

### Issue 1: "name is required" error on backend
**Solution**: Make sure frontend is passing `name` field in request body

### Issue 2: Name not appearing in profile
**Solution**: Check that `getUnifiedProfileData()` returns name field

### Issue 3: Name not updating in UI
**Solution**: Call `refreshProfile()` after update

### Issue 4: Existing users can't login
**Solution**: Keep name optional in database (nullable: true)

---

## Optional Enhancements

### Enhancement 1: Profile Completion Banner
```typescript
// In ProfileCompletionBanner.tsx
if (!user.name) {
  return (
    <div className="profile-completion-banner">
      <AlertCircle size={20} />
      <span>Please add your name to complete your profile</span>
      <Button onClick={() => navigate('/profile/edit')}>
        Add Name
      </Button>
    </div>
  );
}
```

### Enhancement 2: Welcome Message
```typescript
// After successful registration
showToast(`Welcome, ${fullName}! 🎉`, 'success');
```

### Enhancement 3: Name in Header
```typescript
// In Header.tsx
<div className="user-info">
  <Avatar src={user.avatarUrl} name={user.name} />
  <span>{user.name}</span>
</div>
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Code reviewed
- [ ] Database schema verified
- [ ] API endpoints tested
- [ ] Frontend builds successfully

### Deployment
- [ ] Deploy backend first
- [ ] Test backend in production
- [ ] Deploy frontend
- [ ] Test registration flow
- [ ] Monitor error logs

### Post-Deployment
- [ ] Verify new users have names
- [ ] Check existing users can still login
- [ ] Monitor registration success rate
- [ ] Check for any error spikes

---

## Rollback Instructions

If something goes wrong:

1. **Revert Frontend** (5 min)
   ```bash
   git revert <commit-hash>
   npm run build
   # Deploy
   ```

2. **Revert Backend** (5 min)
   ```bash
   git revert <commit-hash>
   npm run build
   pm2 restart backend
   ```

3. **Verify** (2 min)
   - Test registration without name
   - Confirm old behavior restored

---

## Success Metrics

After deployment, verify:
- ✅ 100% of new registrations have names
- ✅ 0 registration errors related to name field
- ✅ Name appears in all UI components
- ✅ Existing users unaffected

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for validation errors
3. Verify database has name column
4. Test API endpoints with curl/Postman
5. Review this guide for missed steps

---

## Summary

**What Changed**:
- ✅ Added "Full Name" field to registration form
- ✅ Made name required in backend validation
- ✅ Name is saved to profile during registration
- ✅ Name appears everywhere in the app

**What Didn't Change**:
- ✅ Existing users can still login
- ✅ Profile edit still works
- ✅ Database schema unchanged (name column already exists)
- ✅ No breaking changes

**Result**:
New users provide their name during registration, improving data quality and user experience.
