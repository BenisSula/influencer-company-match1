# Settings Page - Investigation Complete

## Current State Analysis ❌

### What Exists
- Basic Settings page with placeholder content
- Static text showing 3 setting categories
- No functional settings
- No backend integration
- No save functionality

### What's Missing
- All actual settings functionality
- Backend settings tables
- Settings service
- Form inputs and controls
- Save/Cancel buttons
- Settings navigation
- Privacy controls
- Notification preferences
- Matching preferences
- Account management

## What the Settings Page Should Do

### Core Purpose
The Settings page is the **control center** where users manage:

1. **Account Settings**
   - Email & password management
   - Account status (active/inactive)
   - Account deletion

2. **Privacy Settings**
   - Profile visibility (public/private)
   - Who can message them
   - Activity status visibility
   - Contact information visibility

3. **Notification Preferences**
   - Email notifications (matches, messages, connections)
   - Push notifications
   - In-app notifications
   - Notification frequency

4. **Matching Preferences**
   - Filter criteria (budget, audience, location)
   - Deal breakers (verified only, same location)
   - Preferred industries/niches
   - Platform preferences

5. **Communication Settings**
   - Read receipts
   - Typing indicators
   - Auto-reply messages
   - Message retention

6. **Data & Privacy**
   - Export user data
   - Deactivate account
   - Delete account permanently

## UI/UX Design

### Layout
```
┌──────────────────────────────────────────┐
│ Settings                                  │
│ Manage your account and preferences       │
├──────────────────────────────────────────┤
│                                           │
│ ┌──────────┐  ┌────────────────────────┐│
│ │ Nav      │  │ Content Area           ││
│ │          │  │                        ││
│ │ Account  │  │ [Settings Form]        ││
│ │ Privacy  │  │                        ││
│ │ Notif.   │  │ • Toggle switches      ││
│ │ Matching │  │ • Dropdowns            ││
│ │ Comm.    │  │ • Sliders              ││
│ │ Data     │  │ • Checkboxes           ││
│ │          │  │                        ││
│ │          │  │ [Save] [Cancel]        ││
│ └──────────┘  └────────────────────────┘│
│                                           │
└──────────────────────────────────────────┘
```

### Key Features
- **Tabbed Navigation** - Left sidebar with sections
- **Live Preview** - See changes before saving
- **Clear Labels** - Every setting explained
- **Visual Controls** - Toggles, sliders, dropdowns
- **Save Confirmation** - Toast on successful save
- **Unsaved Warning** - Prompt before leaving
- **Mobile Responsive** - Stacked layout on mobile

## Backend Integration

### Database Tables Needed

#### 1. user_settings
Stores user preferences:
- Privacy settings
- Notification preferences
- Communication settings
- UI preferences

#### 2. user_matching_preferences
Stores matching criteria:
- Budget/audience ranges
- Location preferences
- Platform preferences
- Deal breakers

### API Endpoints Needed

```typescript
GET    /api/settings              // Get all settings
PUT    /api/settings              // Update settings
POST   /api/settings/reset        // Reset to defaults

GET    /api/settings/matching     // Get matching prefs
PUT    /api/settings/matching     // Update matching prefs

POST   /api/settings/change-email // Change email
POST   /api/settings/change-password // Change password
POST   /api/settings/deactivate   // Deactivate account
POST   /api/settings/delete        // Delete account

GET    /api/settings/export-data  // Export user data
```

### Frontend Service Needed

```typescript
class SettingsService {
  getSettings()
  updateSettings(settings)
  resetSettings()
  
  getMatchingPreferences()
  updateMatchingPreferences(prefs)
  
  changeEmail(newEmail, password)
  changePassword(current, new)
  
  deactivateAccount(password)
  deleteAccount(password, reason)
  
  exportData()
}
```

## Page Connections

### How Users Access Settings
```
1. Sidebar → Settings
2. User Dropdown (top right) → Settings
3. Profile Page → Settings link
4. Dashboard → User Menu → Settings
```

### How Settings Affect Other Pages

#### Privacy Settings Impact
- **ProfileView** - Controls who can view profile
- **Matches** - Controls visibility in search
- **Messages** - Controls who can message

#### Notification Settings Impact
- **NotificationDropdown** - Controls what notifications show
- **Email** - Controls email frequency
- **Push** - Controls push notifications

#### Matching Preferences Impact
- **Matches Page** - Filters applied automatically
- **Dashboard** - Match quality improved
- **Matching Algorithm** - Uses preferences for scoring

#### Communication Settings Impact
- **Messages** - Read receipts, typing indicators
- **Auto-reply** - Automatic responses
- **Retention** - Message deletion policy

## Implementation Priority

### Phase 1: Essential Settings (Week 1)
**Goal:** Basic functional settings page

Tasks:
1. Create user_settings table migration
2. Create Settings backend module
3. Create settings service (frontend)
4. Build Account Settings section
5. Build Privacy Settings section
6. Implement save functionality

**Deliverables:**
- Users can change email/password
- Users can set privacy preferences
- Settings persist in database
- Settings sync across sessions

### Phase 2: Preferences (Week 2)
**Goal:** Notification and matching preferences

Tasks:
1. Create user_matching_preferences table
2. Build Notification Settings section
3. Build Matching Preferences section
4. Integrate with notification system
5. Integrate with matching algorithm

**Deliverables:**
- Users can set notification preferences
- Users can set matching criteria
- Notifications respect preferences
- Matches filtered by preferences

### Phase 3: Advanced Features (Week 3)
**Goal:** Data management and account actions

Tasks:
1. Build Communication Settings section
2. Build Data & Privacy section
3. Implement data export
4. Implement account deactivation
5. Implement account deletion

**Deliverables:**
- Users can export their data
- Users can deactivate account
- Users can delete account
- All data properly handled

### Phase 4: Polish (Week 4)
**Goal:** Enhanced UX and edge cases

Tasks:
1. Add unsaved changes warning
2. Add settings search
3. Add keyboard shortcuts
4. Add mobile optimizations
5. Add analytics tracking

**Deliverables:**
- Smooth UX with no data loss
- Easy to find settings
- Mobile-friendly
- Usage tracked for improvements

## Technical Architecture

### Component Structure
```
Settings/
├── Settings.tsx (main page)
├── Settings.css
├── components/
│   ├── SettingsNav/
│   │   ├── SettingsNav.tsx
│   │   └── SettingsNav.css
│   ├── SettingsSection/
│   │   ├── SettingsSection.tsx
│   │   └── SettingsSection.css
│   ├── SettingItem/
│   │   ├── SettingItem.tsx
│   │   └── SettingItem.css
│   └── Toggle/
│       ├── Toggle.tsx
│       └── Toggle.css
├── sections/
│   ├── AccountSettings.tsx
│   ├── PrivacySettings.tsx
│   ├── NotificationSettings.tsx
│   ├── MatchingSettings.tsx
│   ├── CommunicationSettings.tsx
│   └── DataPrivacySettings.tsx
└── hooks/
    ├── useSettings.ts
    └── useUnsavedChanges.ts
```

### State Management
```typescript
// Settings state
const [settings, setSettings] = useState<UserSettings>()
const [matchingPrefs, setMatchingPrefs] = useState<MatchingPreferences>()
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
const [activeSection, setActiveSection] = useState('account')

// Load settings on mount
useEffect(() => {
  loadSettings()
  loadMatchingPreferences()
}, [])

// Track unsaved changes
useEffect(() => {
  setHasUnsavedChanges(true)
}, [settings, matchingPrefs])

// Warn before leaving
useEffect(() => {
  if (hasUnsavedChanges) {
    window.onbeforeunload = () => true
  }
  return () => { window.onbeforeunload = null }
}, [hasUnsavedChanges])
```

### Data Flow
```
User opens Settings
  ↓
Load settings from backend
  ↓
Display current settings
  ↓
User changes a setting
  ↓
Update local state
  ↓
Mark as unsaved
  ↓
User clicks Save
  ↓
Send to backend
  ↓
Update database
  ↓
Show success toast
  ↓
Mark as saved
```

## Files to Create/Modify

### Backend (New)
1. `backend/src/database/migrations/XXXX-CreateUserSettingsTable.ts`
2. `backend/src/database/migrations/XXXX-CreateUserMatchingPreferencesTable.ts`
3. `backend/src/modules/settings/` (entire module)

### Frontend (New)
1. `src/renderer/services/settings.service.ts`
2. `src/renderer/components/SettingsNav/`
3. `src/renderer/components/SettingsSection/`
4. `src/renderer/components/SettingItem/`
5. `src/renderer/components/Toggle/`
6. `src/renderer/hooks/useSettings.ts`
7. `src/renderer/hooks/useUnsavedChanges.ts`

### Frontend (Modify)
1. `src/renderer/pages/Settings.tsx` - Complete rewrite
2. `src/renderer/components/index.ts` - Export new components

## Success Metrics

### Functionality
- ✅ All settings load from backend
- ✅ All settings save to backend
- ✅ Settings persist across sessions
- ✅ Privacy settings affect visibility
- ✅ Notification settings work
- ✅ Matching preferences filter matches
- ✅ Account actions work correctly

### UX
- ✅ Clear, understandable labels
- ✅ Visual feedback on changes
- ✅ Save confirmation
- ✅ Unsaved changes warning
- ✅ Mobile responsive
- ✅ Fast load times (<1s)
- ✅ No data loss

### Technical
- ✅ No console errors
- ✅ Proper error handling
- ✅ Loading states
- ✅ Form validation
- ✅ API error handling
- ✅ Database constraints
- ✅ Security (password required for sensitive actions)

## Conclusion

The Settings page needs a **complete implementation** from scratch. It's currently just a placeholder with no functionality.

**Estimated Effort:** 3-4 weeks for full implementation

**Priority:** High - Users need to control their privacy and preferences

**Dependencies:**
- Backend settings module
- Database migrations
- Frontend settings service
- UI components (Toggle, Slider, etc.)

**Next Step:** Start with Phase 1 (Essential Settings) to get basic functionality working, then iterate with additional features.
