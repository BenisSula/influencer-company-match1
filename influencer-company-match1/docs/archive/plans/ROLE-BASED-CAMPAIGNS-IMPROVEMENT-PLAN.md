# Role-Based Campaigns Page Improvement Plan 🎯

## Current State Analysis

### What Exists ✅
- Basic tab system (All, My Campaigns/Applications, Saved)
- Filter sidebar (niche, budget, platforms)
- Campaign cards with apply/edit actions
- Role detection (isCompany)
- Basic responsive design

### Issues Found ❌
1. **Role Confusion**: Both roles see "All Campaigns" tab
2. **Missing Features**: Saved campaigns not implemented
3. **Poor UX**: No status indicators for applications
4. **Inconsistent Design**: Doesn't match Feed/Matches pages
5. **No Empty States**: Generic empty messages
6. **Missing Stats**: No campaign performance metrics
7. **No Quick Actions**: Can't save/bookmark from card

---

## Role-Based Requirements

### INFLUENCER View 🎨

**Primary Goal**: Find and apply for campaigns

**Tabs:**
1. **Discover** (default) - Browse all active campaigns
2. **My Applications** - Track application status
3. **Active Collaborations** - Ongoing work
4. **Saved** - Bookmarked campaigns

**Features:**
- ✅ Browse all active campaigns
- ✅ Filter by niche, budget, platform
- ✅ Apply to campaigns
- ✅ Message company directly
- ✅ Save/bookmark campaigns
- ✅ Track application status
- ✅ View collaboration progress
- ❌ Cannot create campaigns
- ❌ Cannot see draft campaigns

**UI Elements:**
- Application status badges (Pending, Accepted, Rejected)
- Save/bookmark button on cards
- Quick apply button
- Message company button
- Progress indicators for collaborations
- Deadline warnings

---

### COMPANY View 🏢

**Primary Goal**: Create campaigns and manage applications

**Tabs:**
1. **My Campaigns** (default) - All created campaigns
2. **Applications** - Review influencer applications
3. **Active Collaborations** - Ongoing partnerships
4. **Discover** - Browse other campaigns (optional)

**Features:**
- ✅ Create new campaigns
- ✅ Edit/delete own campaigns
- ✅ View campaign analytics
- ✅ Review applications
- ✅ Accept/reject applications
- ✅ Manage collaborations
- ✅ Message applicants
- ❌ Cannot apply to campaigns
- ❌ Cannot save other campaigns

**UI Elements:**
- Campaign status badges (Draft, Active, Closed, Completed)
- Application count indicators
- Quick stats (views, applications, acceptance rate)
- Edit/delete buttons
- Publish/unpublish toggle
- Performance metrics

---

## Improved Page Structure

### INFLUENCER Layout

```
┌─────────────────────────────────────────────────────┐
│  Campaigns                                          │
│  [Discover] [My Applications] [Active] [Saved]     │
├─────────────┬───────────────────────────────────────┤
│  Filters    │  Campaign Cards                       │
│             │  ┌──────────────────────────────┐    │
│  Niche      │  │ Company Logo | Company Name  │    │
│  Budget     │  │ Campaign Title               │    │
│  Platform   │  │ Description...               │    │
│  Deadline   │  │ Budget | Niche | Platforms   │    │
│             │  │ [Message] [Apply Now] [Save] │    │
│  [Clear]    │  └──────────────────────────────┘    │
│             │                                       │
└─────────────┴───────────────────────────────────────┘
```

### COMPANY Layout

```
┌─────────────────────────────────────────────────────┐
│  Campaigns                    [+ Create Campaign]   │
│  [My Campaigns] [Applications] [Active]             │
├─────────────┬───────────────────────────────────────┤
│  Filters    │  Campaign Cards                       │
│             │  ┌──────────────────────────────┐    │
│  Status     │  │ Campaign Title        [Edit] │    │
│  Date       │  │ Status: Active               │    │
│  Budget     │  │ 👁 125 views | 📝 12 apps    │    │
│             │  │ Budget | Deadline            │    │
│  [Clear]    │  │ [View Applications] [Stats]  │    │
│             │  └──────────────────────────────┘    │
│             │                                       │
└─────────────┴───────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Role-Based Tab System ⭐⭐⭐

**File:** `src/renderer/pages/Campaigns.tsx`

**Changes:**

```typescript
// Define role-specific tabs
const influencerTabs = [
  { id: 'discover', label: 'Discover', icon: '🔍' },
  { id: 'my-applications', label: 'My Applications', icon: '📝' },
  { id: 'active', label: 'Active', icon: '⚡' },
  { id: 'saved', label: 'Saved', icon: '🔖' }
];

const companyTabs = [
  { id: 'my-campaigns', label: 'My Campaigns', icon: '📋' },
  { id: 'applications', label: 'Applications', icon: '👥' },
  { id: 'active', label: 'Active', icon: '⚡' },
  { id: 'discover', label: 'Discover', icon: '🔍', optional: true }
];

const tabs = isCompany ? companyTabs : influencerTabs;
const defaultTab = isCompany ? 'my-campaigns' : 'discover';
```

**Estimated Time:** 30 minutes

---

### Phase 2: Enhanced Campaign Cards ⭐⭐⭐

**File:** `src/renderer/components/CampaignCard/CampaignCard.tsx`

**Influencer Card Features:**
- Save/bookmark button
- Application status badge (if applied)
- Deadline countdown
- Message company button
- Quick apply button

**Company Card Features:**
- Campaign status badge
- Quick stats (views, applications)
- Edit/delete buttons
- View applications button
- Performance indicator

**Estimated Time:** 1 hour

---

### Phase 3: Application Status Tracking ⭐⭐⭐

**Backend:** Already exists in `campaign-application.entity.ts`

**Frontend Updates:**

```typescript
// Application status component
<ApplicationStatusBadge status={application.status} />

// Status colors
pending: yellow
accepted: green
rejected: red
withdrawn: gray
```

**Show on:**
- Campaign cards (if user applied)
- My Applications tab
- Campaign detail page

**Estimated Time:** 45 minutes

---

### Phase 4: Save/Bookmark Feature ⭐⭐

**Backend:**

**New Table:** `saved_campaigns`
```sql
CREATE TABLE saved_campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  campaign_id UUID REFERENCES campaigns(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, campaign_id)
);
```

**New Endpoints:**
- POST `/api/campaigns/:id/save`
- DELETE `/api/campaigns/:id/unsave`
- GET `/api/campaigns/saved`

**Frontend:**
- Save button on campaign cards
- Saved tab shows bookmarked campaigns
- Toast notification on save/unsave

**Estimated Time:** 1.5 hours

---

### Phase 5: Campaign Analytics (Company) ⭐⭐

**Backend:**

**New Endpoint:** GET `/api/campaigns/:id/analytics`

**Returns:**
```typescript
{
  views: number,
  applications: number,
  acceptanceRate: number,
  averageInfluencerRating: number,
  topPlatforms: string[],
  applicationsByStatus: {
    pending: number,
    accepted: number,
    rejected: number
  }
}
```

**Frontend:**
- Stats cards on campaign cards
- Detailed analytics page
- Charts and graphs

**Estimated Time:** 2 hours

---

### Phase 6: Improved Filters ⭐⭐

**Influencer Filters:**
- Niche (dropdown)
- Budget range (min/max)
- Platforms (checkboxes)
- Deadline (upcoming, this week, this month)
- Campaign type (one-time, ongoing)

**Company Filters:**
- Status (draft, active, closed, completed)
- Date created (newest, oldest)
- Application count (most, least)
- Budget range

**Estimated Time:** 1 hour

---

### Phase 7: Empty States & Onboarding ⭐⭐

**Influencer Empty States:**

**Discover (no campaigns):**
```
🔍 No campaigns match your filters
Try adjusting your search criteria
[Clear Filters]
```

**My Applications (none):**
```
📝 You haven't applied to any campaigns yet
Browse campaigns and start applying!
[Discover Campaigns]
```

**Saved (none):**
```
🔖 No saved campaigns
Save campaigns to review them later
[Discover Campaigns]
```

**Company Empty States:**

**My Campaigns (none):**
```
📋 You haven't created any campaigns yet
Create your first campaign to find influencers
[Create Campaign]
```

**Applications (none):**
```
👥 No applications yet
Create campaigns to receive applications
[Create Campaign]
```

**Estimated Time:** 45 minutes

---

### Phase 8: UI/UX Polish ⭐⭐⭐

**Consistency with Other Pages:**

**Match Feed/Matches Design:**
- Same card shadow and hover effects
- Consistent button styles
- Same color scheme
- Matching typography
- Similar spacing and padding

**Improvements:**
- Smooth transitions
- Loading skeletons (not just spinner)
- Hover effects on cards
- Tooltip on icons
- Badge animations
- Sticky filters sidebar
- Infinite scroll or pagination

**Estimated Time:** 2 hours

---

## Detailed Component Updates

### 1. Enhanced CampaignCard Component

**For Influencers:**
```tsx
<CampaignCard>
  <CardHeader>
    <CompanyAvatar />
    <CompanyInfo>
      <CompanyName />
      <Industry />
    </CompanyInfo>
    <SaveButton />
  </CardHeader>
  
  <CardBody>
    <CampaignTitle />
    <Description />
    <Tags>
      <BudgetTag />
      <NicheTag />
      <PlatformTags />
    </Tags>
    {hasApplied && <ApplicationStatusBadge />}
    {deadline && <DeadlineWarning />}
  </CardBody>
  
  <CardActions>
    <MessageButton />
    <ApplyButton />
  </CardActions>
</CampaignCard>
```

**For Companies:**
```tsx
<CampaignCard>
  <CardHeader>
    <CampaignTitle />
    <StatusBadge />
    <MoreMenu>
      <EditOption />
      <DeleteOption />
      <DuplicateOption />
    </MoreMenu>
  </CardHeader>
  
  <CardBody>
    <Description />
    <QuickStats>
      <ViewCount />
      <ApplicationCount />
      <AcceptanceRate />
    </QuickStats>
    <Tags>
      <BudgetTag />
      <DeadlineTag />
    </Tags>
  </CardBody>
  
  <CardActions>
    <ViewApplicationsButton />
    <ViewAnalyticsButton />
  </CardActions>
</CampaignCard>
```

---

### 2. Application Status Component

```tsx
interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  showLabel?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending Review',
    color: '#F59E0B',
    icon: '⏳',
    bgColor: '#FEF3C7'
  },
  accepted: {
    label: 'Accepted',
    color: '#10B981',
    icon: '✓',
    bgColor: '#D1FAE5'
  },
  rejected: {
    label: 'Rejected',
    color: '#EF4444',
    icon: '✗',
    bgColor: '#FEE2E2'
  },
  withdrawn: {
    label: 'Withdrawn',
    color: '#6B7280',
    icon: '↩',
    bgColor: '#F3F4F6'
  }
};
```

---

### 3. Save Button Component

```tsx
<SaveButton
  isSaved={isSaved}
  onClick={handleSave}
  loading={saving}
>
  {isSaved ? <HiBookmark /> : <HiOutlineBookmark />}
</SaveButton>
```

---

## CSS Improvements

### Match Feed Page Design

```css
/* Card hover effect like Feed */
.campaign-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.campaign-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Loading skeleton */
.campaign-card-skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Badge animations */
.status-badge {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```

---

## Backend Endpoints Needed

### Saved Campaigns
```typescript
POST   /api/campaigns/:id/save
DELETE /api/campaigns/:id/unsave
GET    /api/campaigns/saved
```

### Campaign Analytics
```typescript
GET /api/campaigns/:id/analytics
GET /api/campaigns/:id/views
```

### Application Management
```typescript
GET    /api/campaigns/applications/received  // For companies
PATCH  /api/campaigns/applications/:id/status
```

---

## File Structure

```
src/renderer/
├── pages/
│   └── Campaigns.tsx (major refactor)
├── components/
│   ├── CampaignCard/
│   │   ├── CampaignCard.tsx (enhance)
│   │   └── CampaignCard.css (improve)
│   ├── ApplicationStatusBadge/
│   │   ├── ApplicationStatusBadge.tsx (new)
│   │   └── ApplicationStatusBadge.css (new)
│   ├── SaveButton/
│   │   ├── SaveButton.tsx (new)
│   │   └── SaveButton.css (new)
│   └── CampaignStats/
│       ├── CampaignStats.tsx (new)
│       └── CampaignStats.css (new)
└── services/
    └── campaigns.service.ts (add methods)

backend/src/modules/campaigns/
├── campaigns.controller.ts (add endpoints)
├── campaigns.service.ts (add methods)
├── entities/
│   └── saved-campaign.entity.ts (new)
└── dto/
    └── campaign-analytics.dto.ts (new)
```

---

## Implementation Priority

### Must Have (Phase 1) ⭐⭐⭐
1. Role-based tab system
2. Enhanced campaign cards
3. Application status tracking
4. Save/bookmark feature

**Time:** ~4 hours

### Should Have (Phase 2) ⭐⭐
5. Campaign analytics
6. Improved filters
7. Empty states

**Time:** ~4 hours

### Nice to Have (Phase 3) ⭐
8. UI/UX polish
9. Loading skeletons
10. Animations

**Time:** ~2 hours

**Total Estimated Time:** 10-12 hours

---

## Success Metrics

### Functionality
- ✅ Influencers see only relevant tabs
- ✅ Companies see only relevant tabs
- ✅ Application status visible everywhere
- ✅ Save/unsave works smoothly
- ✅ Analytics show accurate data
- ✅ Filters work correctly

### UX
- ✅ Consistent with Feed/Matches pages
- ✅ Smooth animations and transitions
- ✅ Clear empty states
- ✅ Helpful error messages
- ✅ Mobile responsive
- ✅ Fast loading times

### Design
- ✅ Matches platform design system
- ✅ Professional and clean
- ✅ Clear visual hierarchy
- ✅ Accessible (WCAG AA)
- ✅ Consistent spacing
- ✅ Proper color usage

---

## Testing Checklist

### Influencer Tests
- [ ] Can browse all campaigns
- [ ] Can filter campaigns
- [ ] Can apply to campaigns
- [ ] Can save/unsave campaigns
- [ ] Can see application status
- [ ] Can message companies
- [ ] Cannot create campaigns
- [ ] Cannot see draft campaigns

### Company Tests
- [ ] Can create campaigns
- [ ] Can edit own campaigns
- [ ] Can delete own campaigns
- [ ] Can view applications
- [ ] Can accept/reject applications
- [ ] Can see analytics
- [ ] Cannot apply to campaigns
- [ ] Cannot save campaigns

### UI Tests
- [ ] Tabs switch correctly
- [ ] Filters work
- [ ] Cards display properly
- [ ] Buttons work
- [ ] Loading states show
- [ ] Empty states show
- [ ] Mobile responsive
- [ ] Animations smooth

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (role-based tabs)
3. Implement Phase 2 (enhanced cards)
4. Add Phase 3 (status tracking)
5. Build Phase 4 (save feature)
6. Polish UI/UX
7. Test thoroughly
8. Deploy

**Ready to start implementation!** 🚀
