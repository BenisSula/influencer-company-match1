# Full Name Field - Data Flow Diagram

## Current State (Before Implementation)

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

Frontend (RegisterForm.tsx)
┌──────────────────────────┐
│  Registration Form       │
│  ┌────────────────────┐  │
│  │ Email              │  │
│  │ Password           │  │
│  │ Role (I/C)         │  │
│  └────────────────────┘  │
│  ❌ NO NAME FIELD        │
└──────────────────────────┘
           │
           ▼
Backend (auth.service.ts)
┌──────────────────────────┐
│  Creates User            │
│  {                       │
│    email: "..."          │
│    password: "..."       │
│    role: "INFLUENCER"    │
│  }                       │
└──────────────────────────┘
           │
           ▼
Database
┌──────────────────────────┐
│  influencer_profiles     │
│  ┌────────────────────┐  │
│  │ name: NULL ❌      │  │
│  │ niche: NULL        │  │
│  │ bio: NULL          │  │
│  └────────────────────┘  │
└──────────────────────────┘
           │
           ▼
Result: User must edit profile later to add name
```

---

## Proposed State (After Implementation)

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

Frontend (RegisterForm.tsx)
┌──────────────────────────┐
│  Registration Form       │
│  ┌────────────────────┐  │
│  │ Full Name ✅       │  │  ← NEW FIELD
│  │ Email              │  │
│  │ Password           │  │
│  │ Role (I/C)         │  │
│  └────────────────────┘  │
│  Validation:             │
│  - Required              │
│  - Min 2 chars           │
└──────────────────────────┘
           │
           ▼
AuthContext (register function)
┌──────────────────────────┐
│  POST /auth/register     │
│  {                       │
│    email: "..."          │
│    password: "..."       │
│    role: "INFLUENCER"    │
│    name: "John Doe" ✅   │  ← PASSED TO BACKEND
│  }                       │
└──────────────────────────┘
           │
           ▼
Backend (auth.service.ts)
┌──────────────────────────┐
│  1. Create User          │
│  2. Create Profile       │
│     {                    │
│       userId: "..."      │
│       name: "John Doe" ✅│  ← SAVED TO PROFILE
│     }                    │
└──────────────────────────┘
           │
           ▼
Database
┌──────────────────────────┐
│  influencer_profiles     │
│  ┌────────────────────┐  │
│  │ name: "John Doe" ✅│  │  ← POPULATED
│  │ niche: NULL        │  │
│  │ bio: NULL          │  │
│  └────────────────────┘  │
└──────────────────────────┘
           │
           ▼
Result: User has name immediately after registration
```

---

## Complete Data Synchronization Flow

```
┌─────────────────────────────────────────────────────────────┐
│              FULL NAME SYNCHRONIZATION                       │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌──────────────┐
   │ RegisterForm │ → name: "John Doe"
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ AuthContext  │ → POST /auth/register { name: "John Doe" }
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ AuthService  │ → Save to influencer_profiles.name
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ Database     │ → name: "John Doe" ✅
   └──────────────┘

2. LOGIN
   ┌──────────────┐
   │ LoginForm    │ → email + password
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ AuthService  │ → Load user + profile
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ Response     │ → { name: "John Doe", ... }
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ AuthContext  │ → Store in user state
   └──────────────┘
          │
          ▼
   ┌──────────────────────────────────────┐
   │ UI Components Display Name           │
   ├──────────────────────────────────────┤
   │ ✅ Profile Page                      │
   │ ✅ Dashboard                         │
   │ ✅ Match Cards                       │
   │ ✅ Feed Posts                        │
   │ ✅ Messages                          │
   │ ✅ Connections                       │
   └──────────────────────────────────────┘

3. PROFILE EDIT
   ┌──────────────┐
   │ ProfileEdit  │ → Update name: "John Smith"
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ AuthService  │ → Update influencer_profiles.name
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ Database     │ → name: "John Smith" ✅
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ AuthContext  │ → refreshProfile()
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ All UI       │ → Updates automatically
   └──────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                           │
└─────────────────────────────────────────────────────────────┘

users
┌──────────────────────────┐
│ id (PK)                  │
│ email                    │
│ password                 │
│ role                     │
│ avatarUrl                │
│ profileCompleted         │
└──────────────────────────┘
           │
           │ 1:1
           ▼
influencer_profiles
┌──────────────────────────┐
│ id (PK)                  │
│ userId (FK) → users.id   │
│ name ✅                  │  ← STORES FULL NAME
│ niche                    │
│ bio                      │
│ audienceSize             │
│ engagementRate           │
│ platforms                │
│ location                 │
│ avatarUrl                │
│ ...                      │
└──────────────────────────┘

company_profiles
┌──────────────────────────┐
│ id (PK)                  │
│ userId (FK) → users.id   │
│ name ✅                  │  ← STORES FULL NAME
│ industry                 │
│ bio                      │
│ budget                   │
│ platforms                │
│ location                 │
│ avatarUrl                │
│ ...                      │
└──────────────────────────┘
```

---

## API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                             │
└─────────────────────────────────────────────────────────────┘

POST /auth/register
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "INFLUENCER",
  "name": "John Doe" ✅  ← NEW REQUIRED FIELD
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "INFLUENCER",
    "name": "John Doe" ✅,  ← RETURNED IMMEDIATELY
    "bio": "",
    "niche": "",
    ...
  },
  "token": "jwt-token"
}

---

POST /auth/login
Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "INFLUENCER",
    "name": "John Doe" ✅,  ← ALWAYS AVAILABLE
    ...
  },
  "token": "jwt-token"
}

---

GET /auth/me
Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "INFLUENCER",
  "name": "John Doe" ✅,  ← ALWAYS AVAILABLE
  ...
}

---

PUT /auth/profile
Request:
{
  "name": "John Smith" ✅,  ← CAN BE UPDATED
  "bio": "...",
  "niche": "...",
  ...
}

Response:
{
  "id": "uuid",
  "name": "John Smith" ✅,  ← UPDATED VALUE
  ...
}
```

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│              COMPONENT DATA FLOW                             │
└─────────────────────────────────────────────────────────────┘

AuthContext (Global State)
┌────────────────────────────────┐
│ user: {                        │
│   id: "uuid",                  │
│   email: "user@example.com",   │
│   role: "INFLUENCER",          │
│   name: "John Doe" ✅          │  ← SOURCE OF TRUTH
│   ...                          │
│ }                              │
└────────────────────────────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
           ▼                                     ▼
    ┌─────────────┐                      ┌─────────────┐
    │ Profile     │                      │ Dashboard   │
    │ Displays:   │                      │ Displays:   │
    │ {user.name} │                      │ {user.name} │
    └─────────────┘                      └─────────────┘
           │                                     │
           ▼                                     ▼
    ┌─────────────┐                      ┌─────────────┐
    │ ProfileEdit │                      │ MatchCard   │
    │ Edits:      │                      │ Shows:      │
    │ {user.name} │                      │ {user.name} │
    └─────────────┘                      └─────────────┘
           │                                     │
           ▼                                     ▼
    ┌─────────────┐                      ┌─────────────┐
    │ FeedPost    │                      │ Messages    │
    │ Shows:      │                      │ Shows:      │
    │ {user.name} │                      │ {user.name} │
    └─────────────┘                      └─────────────┘

All components read from AuthContext → Single source of truth
```

---

## Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  VALIDATION LAYERS                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Frontend Validation (RegisterForm.tsx)
┌────────────────────────────────┐
│ if (!fullName.trim()) {        │
│   error = "Name is required"   │
│ }                              │
│ if (fullName.length < 2) {     │
│   error = "Min 2 characters"   │
│ }                              │
└────────────────────────────────┘
           │
           ▼ (if valid)
Layer 2: Backend DTO Validation (register.dto.ts)
┌────────────────────────────────┐
│ @IsString()                    │
│ @MinLength(2)                  │
│ @MaxLength(100)                │
│ name: string;                  │
└────────────────────────────────┘
           │
           ▼ (if valid)
Layer 3: Database Constraint
┌────────────────────────────────┐
│ name VARCHAR(255)              │
│ (nullable: true for now)       │
└────────────────────────────────┘
           │
           ▼
✅ Name saved successfully
```

---

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                           │
└─────────────────────────────────────────────────────────────┘

Scenario 1: Empty Name
Frontend → "Please enter your full name"
Backend  → 400 Bad Request: "name should not be empty"

Scenario 2: Name Too Short
Frontend → "Name must be at least 2 characters"
Backend  → 400 Bad Request: "name must be longer than or equal to 2 characters"

Scenario 3: Name Too Long
Frontend → (No check, allow any length)
Backend  → 400 Bad Request: "name must be shorter than or equal to 100 characters"

Scenario 4: Special Characters
Frontend → ✅ Allow (international names)
Backend  → ✅ Allow (international names)

Scenario 5: Existing User Without Name
Frontend → Show "Complete Your Profile" banner
Backend  → Return name: "" or name: null
UI       → Display "Add your name" prompt
```

---

## Migration Path for Existing Users

```
┌─────────────────────────────────────────────────────────────┐
│              EXISTING USER MIGRATION                         │
└─────────────────────────────────────────────────────────────┘

Existing User Logs In
┌────────────────────────────────┐
│ Backend returns:               │
│ { name: null or "" }           │
└────────────────────────────────┘
           │
           ▼
Frontend Checks
┌────────────────────────────────┐
│ if (!user.name) {              │
│   showProfileCompletionBanner  │
│ }                              │
└────────────────────────────────┘
           │
           ▼
User Clicks "Complete Profile"
┌────────────────────────────────┐
│ Navigate to /profile/edit      │
│ Highlight name field           │
│ Show "Please add your name"    │
└────────────────────────────────┘
           │
           ▼
User Adds Name
┌────────────────────────────────┐
│ PUT /auth/profile              │
│ { name: "John Doe" }           │
└────────────────────────────────┘
           │
           ▼
✅ Profile Complete
```

---

## Testing Scenarios

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST CASES                                │
└─────────────────────────────────────────────────────────────┘

Test 1: New User Registration
✅ Fill name: "John Doe"
✅ Submit form
✅ Verify name in database
✅ Verify name in profile page
✅ Verify name in dashboard

Test 2: Empty Name Validation
❌ Leave name empty
❌ Submit form
✅ See error: "Please enter your full name"
✅ Form not submitted

Test 3: Short Name Validation
❌ Enter name: "J"
❌ Submit form
✅ See error: "Name must be at least 2 characters"
✅ Form not submitted

Test 4: Name with Special Characters
✅ Enter name: "José María"
✅ Submit form
✅ Name saved correctly
✅ Name displays correctly

Test 5: Name Update
✅ Login as existing user
✅ Go to Profile Edit
✅ Change name: "John Smith"
✅ Save changes
✅ Verify name updated everywhere

Test 6: Existing User Without Name
✅ Login as user with name: null
✅ See "Complete Your Profile" banner
✅ Click banner
✅ Redirected to Profile Edit
✅ Add name
✅ Banner disappears
```

---

## Success Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                  SUCCESS CRITERIA                            │
└─────────────────────────────────────────────────────────────┘

✅ 100% of new users have names after registration
✅ Name field is required in registration form
✅ Name is validated on frontend and backend
✅ Name is stored in database immediately
✅ Name displays in all UI components
✅ Name can be edited in Profile Edit
✅ Name updates propagate to all components
✅ Existing users can add names via profile edit
✅ No breaking changes to existing functionality
✅ Backward compatible with existing users
```

---

## Rollback Plan

```
┌─────────────────────────────────────────────────────────────┐
│                    ROLLBACK STRATEGY                         │
└─────────────────────────────────────────────────────────────┘

If Issues Occur:

Step 1: Revert Frontend Changes
- Remove name field from RegisterForm
- Remove name validation
- Revert AuthContext changes
→ Users can register without name (old behavior)

Step 2: Revert Backend Changes
- Make name optional in RegisterDto
- Remove name requirement
→ Backend accepts registrations without name

Step 3: Database Rollback (if needed)
- Keep name column (no harm)
- Existing data preserved
→ No data loss

Recovery Time: < 5 minutes
Risk Level: Low (backward compatible)
```

This comprehensive data flow diagram shows exactly how the Full Name field will flow through the entire system from registration to display across all components.
