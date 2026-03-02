# Settings Page - Complete Implementation Plan

## Current Status ❌

The Settings page is currently a **placeholder** with:
- Static text only
- No functional settings
- No backend integration
- No user preferences
- No save functionality

## What the Settings Page Should Do

### Primary Purpose
The Settings page is where users manage their:
1. **Account Settings** - Email, password, account status
2. **Privacy Settings** - Profile visibility, who can contact them
3. **Notification Preferences** - Email, push, in-app notifications
4. **Matching Preferences** - Filters, criteria, deal-breakers
5. **Communication Preferences** - Message settings, auto-responses
6. **Data & Privacy** - Download data, delete account

## Detailed Feature Breakdown

### 1. Account Settings Section

#### Email & Password
- **Current Email** (display only)
- **Change Email** (with verification)
- **Change Password** (current + new + confirm)
- **Two-Factor Authentication** (enable/disable)

#### Account Status
- **Account Type** (Influencer/Company - display only)
- **Member Since** (display only)
- **Account Status** (Active/Inactive toggle)
- **Deactivate Account** (temporary)
- **Delete Account** (permanent with confirmation)

### 2. Privacy Settings Section

#### Profile Visibility
- **Public Profile** (toggle)
  - ON: Anyone can view your profile
  - OFF: Only connections can view
- **Show in Search** (toggle)
  - ON: Appear in search results
  - OFF: Hidden from searches
- **Show Activity Status** (toggle)
  - ON: Show "Active now", "Active 2h ago"
  - OFF: Never show online status

#### Contact Permissions
- **Who can message you**
  - Everyone
  - Connections only
  - No one
- **Who can see your email**
  - No one (default)
  - Connections only
  - Everyone
- **Who can see your phone** (if added)
  - No one (default)
  - Connections only

### 3. Notification Preferences Section

#### Email Notifications
- **New Match** (toggle)
- **New Message** (toggle)
- **Connection Request** (toggle)
- **Post Likes/Comments** (toggle)
- **Weekly Summary** (toggle)
- **Marketing Emails** (toggle)

#### Push Notifications (if applicable)
- **New Message** (toggle)
- **Connection Request** (toggle)
- **Match Alerts** (toggle)

#### In-App Notifications
- **Sound** (toggle)
- **Desktop Notifications** (toggle)
- **Notification Badge** (toggle)

### 4. Matching Preferences Section

#### For Influencers
- **Preferred Industries** (multi-select)
- **Minimum Budget** (slider)
- **Maximum Budget** (slider)
- **Preferred Locations** (multi-select)
- **Company Size Preference** (checkboxes)
- **Campaign Types** (checkboxes)

#### For Companies
- **Preferred Niches** (multi-select)
- **Minimum Audience Size** (slider)
- **Maximum Audience Size** (slider)
- **Minimum Engagement Rate** (slider)
- **Preferred Platforms** (checkboxes)
- **Content Types** (checkboxes)

#### Deal Breakers
- **Must be verified** (toggle)
- **Must have portfolio** (toggle)
- **Must be in same location** (toggle)

### 5. Communication Preferences Section

#### Message Settings
- **Read Receipts** (toggle)
- **Typing Indicators** (toggle)
- **Auto-Reply** (toggle with message)
- **Message Retention** (dropdown: Forever, 1 year, 6 months, 3 months)

#### Language & Time
- **Language** (dropdown)
- **Timezone** (dropdown)
- **Date Format** (dropdown)

### 6. Data & Privacy Section

#### Your Data
- **Download Your Data** (button)
  - Profile information
  - Messages
  - Connections
  - Posts & Comments
- **Data Usage** (display)
  - Storage used
  - Messages count
  - Connections count

#### Account Actions
- **Deactivate Account** (button)
  - Temporary suspension
  - Can reactivate anytime
  - Profile hidden
- **Delete Account** (button)
  - Permanent deletion
  - 30-day grace period
  - Cannot be undone after 30 days

## UI/UX Design

### Layout Structure
```
┌─────────────────────────────────────────┐
│ Settings                                 │
│ Manage your account and preferences      │
├─────────────────────────────────────────┤
│                                          │
│ ┌─────────────┐  ┌──────────────────┐  │
│ │ Navigation  │  │  Content Area    │  │
│ │             │  │                  │  │
│ │ • Account   │  │  [Settings Form] │  │
│ │ • Privacy   │  │                  │  │
│ │ • Notif.    │  │  [Save Button]   │  │
│ │ • Matching  │  │                  │  │
│ │ • Comm.     │  │                  │  │
│ │ • Data      │  │                  │  │
│ └─────────────┘  └──────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### Design Principles
1. **Tabbed Navigation** - Left sidebar with sections
2. **Clear Labels** - Every setting has a clear description
3. **Visual Feedback** - Toggles, checkboxes, sliders
4. **Save Confirmation** - Toast notification on save
5. **Unsaved Changes Warning** - Prompt before leaving
6. **Responsive** - Mobile-friendly layout

### Component Hierarchy
```
Settings Page
├── SettingsNav (sidebar)
│   ├── NavItem (Account)
│   ├── NavItem (Privacy)
│   ├── NavItem (Notifications)
│   ├── NavItem (Matching)
│   ├── NavItem (Communication)
│   └── NavItem (Data & Privacy)
├── SettingsContent
│   ├── AccountSettings
│   ├── PrivacySettings
│   ├── NotificationSettings
│   ├── MatchingSettings
│   ├── CommunicationSettings
│   └── DataPrivacySettings
└── SettingsFooter
    ├── SaveButton
    └── CancelButton
```

## Backend Integration

### New Database Tables Needed

#### 1. user_settings Table
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Privacy
  profile_visibility VARCHAR DEFAULT 'public',
  show_in_search BOOLEAN DEFAULT true,
  show_activity_status BOOLEAN DEFAULT true,
  message_permission VARCHAR DEFAULT 'everyone',
  email_visibility VARCHAR DEFAULT 'none',
  
  -- Notifications
  email_new_match BOOLEAN DEFAULT true,
  email_new_message BOOLEAN DEFAULT true,
  email_connection_request BOOLEAN DEFAULT true,
  email_post_interactions BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  
  push_new_message BOOLEAN DEFAULT true,
  push_connection_request BOOLEAN DEFAULT true,
  push_match_alerts BOOLEAN DEFAULT true,
  
  inapp_sound BOOLEAN DEFAULT true,
  inapp_desktop BOOLEAN DEFAULT true,
  inapp_badge BOOLEAN DEFAULT true,
  
  -- Communication
  read_receipts BOOLEAN DEFAULT true,
  typing_indicators BOOLEAN DEFAULT true,
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_message TEXT,
  message_retention VARCHAR DEFAULT 'forever',
  
  -- Preferences
  language VARCHAR DEFAULT 'en',
  timezone VARCHAR DEFAULT 'UTC',
  date_format VARCHAR DEFAULT 'MM/DD/YYYY',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. user_matching_preferences Table
```sql
CREATE TABLE user_matching_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- For Influencers
  preferred_industries TEXT[], -- Array of industries
  min_budget INTEGER,
  max_budget INTEGER,
  preferred_locations TEXT[],
  company_sizes TEXT[],
  campaign_types TEXT[],
  
  -- For Companies
  preferred_niches TEXT[],
  min_audience_size INTEGER,
  max_audience_size INTEGER,
  min_engagement_rate DECIMAL,
  preferred_platforms TEXT[],
  content_types TEXT[],
  
  -- Deal Breakers
  must_be_verified BOOLEAN DEFAULT false,
  must_have_portfolio BOOLEAN DEFAULT false,
  must_be_same_location BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### New Backend Endpoints

#### Settings Endpoints
```typescript
GET    /api/settings              // Get user settings
PUT    /api/settings              // Update user settings
POST   /api/settings/reset        // Reset to defaults

GET    /api/settings/matching     // Get matching preferences
PUT    /api/settings/matching     // Update matching preferences

POST   /api/settings/change-email // Change email (with verification)
POST   /api/settings/change-password // Change password
POST   /api/settings/deactivate   // Deactivate account
POST   /api/settings/delete        // Delete account (with confirmation)

GET    /api/settings/export-data  // Export user data
```

### Frontend Services

#### settings.service.ts
```typescript
class SettingsService {
  async getSettings(): Promise<UserSettings>
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>
  async resetSettings(): Promise<UserSettings>
  
  async getMatchingPreferences(): Promise<MatchingPreferences>
  async updateMatchingPreferences(prefs: Partial<MatchingPreferences>): Promise<MatchingPreferences>
  
  async changeEmail(newEmail: string, password: string): Promise<void>
  async changePassword(currentPassword: string, newPassword: string): Promise<void>
  
  async deactivateAccount(password: string): Promise<void>
  async deleteAccount(password: string, reason: string): Promise<void>
  
  async exportData(): Promise<Blob>
}
```

## Page Connections

### Navigation Flow
```
Sidebar → Settings
Profile → Edit Profile → Settings (link at bottom)
Dashboard → User Menu → Settings
Any Page → User Dropdown → Settings
```

### Integration Points

#### 1. From Profile Page
- "Edit Profile" button → ProfileEdit
- "Settings" link → Settings page

#### 2. From User Dropdown (Top Right)
- Profile
- Settings ← Direct link
- Logout

#### 3. From Settings Page
- Back to Profile
- Back to Dashboard
- Logout

#### 4. Settings Affect Other Pages
- **Privacy Settings** → Profile visibility on ProfileView
- **Notification Settings** → Notification behavior everywhere
- **Matching Preferences** → Matches page filtering
- **Communication Settings** → Messages page behavior

## Implementation Phases

### Phase 1: Core Settings (Priority 1)
- [x] Create settings database tables
- [x] Create backend endpoints
- [x] Create settings service
- [x] Build Account Settings section
- [x] Build Privacy Settings section
- [x] Implement save functionality

### Phase 2: Preferences (Priority 2)
- [ ] Build Notification Settings section
- [ ] Build Matching Preferences section
- [ ] Build Communication Settings section
- [ ] Integrate with notification system
- [ ] Integrate with matching algorithm

### Phase 3: Advanced Features (Priority 3)
- [ ] Build Data & Privacy section
- [ ] Implement data export
- [ ] Implement account deactivation
- [ ] Implement account deletion
- [ ] Add email verification for changes
- [ ] Add 2FA support

### Phase 4: Polish (Priority 4)
- [ ] Add unsaved changes warning
- [ ] Add settings search
- [ ] Add keyboard shortcuts
- [ ] Add settings import/export
- [ ] Add settings history/audit log

## Files to Create

### Backend
1. `backend/src/database/migrations/XXXX-CreateUserSettingsTable.ts`
2. `backend/src/database/migrations/XXXX-CreateUserMatchingPreferencesTable.ts`
3. `backend/src/modules/settings/settings.module.ts`
4. `backend/src/modules/settings/settings.controller.ts`
5. `backend/src/modules/settings/settings.service.ts`
6. `backend/src/modules/settings/entities/user-settings.entity.ts`
7. `backend/src/modules/settings/entities/user-matching-preferences.entity.ts`
8. `backend/src/modules/settings/dto/update-settings.dto.ts`
9. `backend/src/modules/settings/dto/update-matching-preferences.dto.ts`

### Frontend
1. `src/renderer/services/settings.service.ts`
2. `src/renderer/pages/Settings.tsx` (rewrite)
3. `src/renderer/pages/Settings.css`
4. `src/renderer/components/SettingsNav/SettingsNav.tsx`
5. `src/renderer/components/SettingsNav/SettingsNav.css`
6. `src/renderer/components/SettingsSection/SettingsSection.tsx`
7. `src/renderer/components/SettingsSection/SettingsSection.css`
8. `src/renderer/components/SettingItem/SettingItem.tsx`
9. `src/renderer/components/SettingItem/SettingItem.css`
10. `src/renderer/components/Toggle/Toggle.tsx`
11. `src/renderer/components/Toggle/Toggle.css`
12. `src/renderer/hooks/useSettings.ts`
13. `src/renderer/hooks/useUnsavedChanges.ts`

## Success Criteria

✅ User can view all their settings
✅ User can update settings and changes persist
✅ Settings sync with backend/database
✅ Privacy settings affect profile visibility
✅ Notification settings affect notifications
✅ Matching preferences affect match results
✅ Account actions work (deactivate, delete)
✅ Data export works
✅ Mobile responsive
✅ Unsaved changes warning works
✅ All settings have clear descriptions
✅ Save confirmation shows
✅ Error handling works

## Next Steps

1. Create database migrations for settings tables
2. Create backend settings module
3. Create frontend settings service
4. Build settings components
5. Implement each settings section
6. Test all functionality
7. Add analytics tracking
8. Document all settings

The Settings page will be a comprehensive control center for users to manage every aspect of their account and experience!
