# Phase 4: Campaign Management System - Implementation Plan 🚀

## Status Investigation

### ✅ What's Already Complete (Phases 1-3)
- ✅ Phase 1: Profile Onboarding & Settings
- ✅ Phase 2: Enhanced Cards (MediaGrid, ReactionPicker, ActionBar, RichText)
- ✅ Phase 3: Rich Media Upload (Avatar, Post Images)

### ❌ What's Missing (Phase 4)
- ❌ Campaign creation system
- ❌ Campaign browsing/discovery
- ❌ Campaign application system
- ❌ Collaboration tracking
- ❌ Campaign database tables
- ❌ Campaign backend API
- ❌ Campaign frontend components

---

## Phase 4 Overview

Campaign Management is a **CORE BUSINESS FEATURE** that enables:
- **Companies** to create and post campaigns/opportunities
- **Influencers** to discover and apply to campaigns
- **Both** to track collaborations and deliverables

---

## Implementation Plan

### 4.1 Backend Implementation

#### Step 1: Database Schema (Migration)
**File:** `backend/src/database/migrations/1707578000000-CreateCampaignTables.ts`

**Tables to Create:**

1. **campaigns**
   - id (UUID, PK)
   - company_id (UUID, FK → users.id)
   - title (VARCHAR 200)
   - description (TEXT)
   - requirements (TEXT)
   - budget_min (INT)
   - budget_max (INT)
   - niche (VARCHAR 100)
   - platforms (TEXT[]) - Instagram, TikTok, YouTube, etc.
   - deliverables (TEXT)
   - status (ENUM: draft, active, closed, completed)
   - start_date (DATE)
   - end_date (DATE)
   - application_deadline (DATE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **campaign_applications**
   - id (UUID, PK)
   - campaign_id (UUID, FK → campaigns.id)
   - influencer_id (UUID, FK → users.id)
   - proposal (TEXT)
   - proposed_rate (INT)
   - status (ENUM: pending, accepted, rejected, withdrawn)
   - applied_at (TIMESTAMP)
   - reviewed_at (TIMESTAMP)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **collaborations**
   - id (UUID, PK)
   - campaign_id (UUID, FK → campaigns.id)
   - application_id (UUID, FK → campaign_applications.id)
   - company_id (UUID, FK → users.id)
   - influencer_id (UUID, FK → users.id)
   - status (ENUM: active, completed, cancelled)
   - agreed_rate (INT)
   - deliverables_status (JSONB) - Track each deliverable
   - start_date (DATE)
   - end_date (DATE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. **campaign_milestones**
   - id (UUID, PK)
   - collaboration_id (UUID, FK → collaborations.id)
   - title (VARCHAR 200)
   - description (TEXT)
   - due_date (DATE)
   - status (ENUM: pending, in_progress, completed, overdue)
   - completed_at (TIMESTAMP)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

#### Step 2: Entities
**Files to Create:**

1. `backend/src/modules/campaigns/entities/campaign.entity.ts`
2. `backend/src/modules/campaigns/entities/campaign-application.entity.ts`
3. `backend/src/modules/campaigns/entities/collaboration.entity.ts`
4. `backend/src/modules/campaigns/entities/campaign-milestone.entity.ts`

#### Step 3: DTOs
**Files to Create:**

1. `backend/src/modules/campaigns/dto/create-campaign.dto.ts`
2. `backend/src/modules/campaigns/dto/update-campaign.dto.ts`
3. `backend/src/modules/campaigns/dto/apply-campaign.dto.ts`
4. `backend/src/modules/campaigns/dto/update-application.dto.ts`
5. `backend/src/modules/campaigns/dto/create-milestone.dto.ts`

#### Step 4: Service
**File:** `backend/src/modules/campaigns/campaigns.service.ts`

**Methods:**
- `createCampaign(companyId, dto)` - Create new campaign
- `updateCampaign(id, companyId, dto)` - Update campaign
- `deleteCampaign(id, companyId)` - Delete campaign
- `getCampaigns(filters)` - Get all campaigns with filters
- `getCampaignById(id)` - Get single campaign
- `getMyCampaigns(companyId)` - Get company's campaigns
- `applyCampaign(campaignId, influencerId, dto)` - Apply to campaign
- `getMyApplications(influencerId)` - Get influencer's applications
- `updateApplicationStatus(id, companyId, status)` - Accept/reject application
- `createCollaboration(applicationId)` - Create collaboration from accepted application
- `getMyCollaborations(userId)` - Get user's collaborations
- `updateCollaborationStatus(id, status)` - Update collaboration
- `createMilestone(collaborationId, dto)` - Add milestone
- `updateMilestone(id, dto)` - Update milestone

#### Step 5: Controller
**File:** `backend/src/modules/campaigns/campaigns.controller.ts`

**Endpoints:**

**Campaign Management (Companies)**
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Browse all campaigns (with filters)
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/my-campaigns` - Get my campaigns

**Applications (Influencers)**
- `POST /api/campaigns/:id/apply` - Apply to campaign
- `GET /api/campaigns/my-applications` - Get my applications
- `DELETE /api/campaigns/applications/:id` - Withdraw application

**Application Management (Companies)**
- `GET /api/campaigns/:id/applications` - Get campaign applications
- `PUT /api/campaigns/applications/:id/status` - Accept/reject application

**Collaborations (Both)**
- `GET /api/collaborations` - Get my collaborations
- `GET /api/collaborations/:id` - Get collaboration details
- `PUT /api/collaborations/:id/status` - Update collaboration status
- `POST /api/collaborations/:id/milestones` - Add milestone
- `PUT /api/collaborations/milestones/:id` - Update milestone

#### Step 6: Module
**File:** `backend/src/modules/campaigns/campaigns.module.ts`

Register module in `app.module.ts`

---

### 4.2 Frontend Implementation

#### Step 1: Services
**File:** `src/renderer/services/campaigns.service.ts`

**Methods:**
- `createCampaign(data)` - Create campaign
- `updateCampaign(id, data)` - Update campaign
- `deleteCampaign(id)` - Delete campaign
- `getCampaigns(filters)` - Browse campaigns
- `getCampaignById(id)` - Get campaign details
- `getMyCampaigns()` - Get my campaigns
- `applyCampaign(id, proposal)` - Apply to campaign
- `getMyApplications()` - Get my applications
- `withdrawApplication(id)` - Withdraw application
- `getApplications(campaignId)` - Get campaign applications (company)
- `updateApplicationStatus(id, status)` - Accept/reject (company)
- `getCollaborations()` - Get my collaborations
- `getCollaborationById(id)` - Get collaboration details
- `updateCollaborationStatus(id, status)` - Update collaboration
- `createMilestone(collaborationId, data)` - Add milestone
- `updateMilestone(id, data)` - Update milestone

#### Step 2: Types
**File:** `src/renderer/types/campaign.types.ts`

**Interfaces:**
- `Campaign`
- `CampaignApplication`
- `Collaboration`
- `CampaignMilestone`
- `CampaignFilters`

#### Step 3: Components

**A. CampaignCard Component**
**Files:**
- `src/renderer/components/CampaignCard/CampaignCard.tsx`
- `src/renderer/components/CampaignCard/CampaignCard.css`

**Features:**
- Campaign title and description
- Company info with avatar
- Budget range display
- Required niche/platforms
- Timeline (start/end dates)
- Application deadline
- Status badge (Active, Closed, etc.)
- Action buttons:
  - "Apply Now" (influencers)
  - "View Applications" (companies)
  - "Edit" (campaign owner)
  - "Save" bookmark
  - "Share"

**B. CampaignWizard Component**
**Files:**
- `src/renderer/components/CampaignWizard/CampaignWizard.tsx`
- `src/renderer/components/CampaignWizard/CampaignWizard.css`
- `src/renderer/components/CampaignWizard/steps/BasicInfoStep.tsx`
- `src/renderer/components/CampaignWizard/steps/RequirementsStep.tsx`
- `src/renderer/components/CampaignWizard/steps/TimelineStep.tsx`

**3-Step Wizard:**
1. Basic Info: Title, description, goals
2. Requirements: Niche, platforms, audience, budget, deliverables
3. Timeline: Start date, end date, application deadline

**C. ApplicationModal Component**
**Files:**
- `src/renderer/components/ApplicationModal/ApplicationModal.tsx`
- `src/renderer/components/ApplicationModal/ApplicationModal.css`

**Features:**
- Campaign summary
- Proposal text area
- Proposed rate input
- Portfolio/media attachments
- Submit/cancel buttons

**D. CollaborationCard Component**
**Files:**
- `src/renderer/components/CollaborationCard/CollaborationCard.tsx`
- `src/renderer/components/CollaborationCard/CollaborationCard.css`

**Features:**
- Campaign info
- Partner info (company/influencer)
- Status badge
- Progress bar
- Milestones list
- Quick actions (message, view details)

**E. MilestoneTimeline Component**
**Files:**
- `src/renderer/components/MilestoneTimeline/MilestoneTimeline.tsx`
- `src/renderer/components/MilestoneTimeline/MilestoneTimeline.css`

**Features:**
- Visual timeline
- Milestone cards
- Status indicators (pending, in progress, completed, overdue)
- Due dates
- Add milestone button
- Mark complete button

#### Step 4: Pages

**A. Campaigns Page (Browse)**
**Files:**
- `src/renderer/pages/Campaigns.tsx`
- `src/renderer/pages/Campaigns.css`

**Features:**
- Campaign grid/list view
- Filter sidebar:
  - Budget range
  - Niche
  - Platforms
  - Status
  - Application deadline
- Search bar
- Sort options (newest, budget, deadline)
- Tabs:
  - "All Campaigns" (influencers)
  - "My Campaigns" (companies)
  - "My Applications" (influencers)
  - "Saved Campaigns"

**B. CreateCampaign Page**
**Files:**
- `src/renderer/pages/CreateCampaign.tsx`
- `src/renderer/pages/CreateCampaign.css`

**Features:**
- Campaign wizard component
- Save as draft option
- Preview before publishing
- Cancel/back navigation

**C. CampaignDetail Page**
**Files:**
- `src/renderer/pages/CampaignDetail.tsx`
- `src/renderer/pages/CampaignDetail.css`

**Features:**
- Full campaign details
- Company profile section
- Requirements breakdown
- Timeline visualization
- Application section:
  - "Apply Now" button (influencers)
  - Application form
  - Application status (if applied)
- Applications list (campaign owner)
- Similar campaigns section

**D. Collaboration Page**
**Files:**
- `src/renderer/pages/Collaboration.tsx`
- `src/renderer/pages/Collaboration.css`

**Features:**
- Collaboration overview
- Partner info cards
- Milestone timeline
- Deliverables checklist
- Messages section (integrated with existing messaging)
- Status updates
- Complete/cancel collaboration

**E. MyCollaborations Page**
**Files:**
- `src/renderer/pages/MyCollaborations.tsx`
- `src/renderer/pages/MyCollaborations.css`

**Features:**
- List of all collaborations
- Filter by status (active, completed, cancelled)
- Collaboration cards
- Quick stats (total, active, completed)

#### Step 5: Routing
**Update:** `src/renderer/AppComponent.tsx`

**New Routes:**
- `/campaigns` - Browse campaigns
- `/campaigns/create` - Create campaign (companies only)
- `/campaigns/:id` - Campaign details
- `/campaigns/:id/edit` - Edit campaign (owner only)
- `/collaborations` - My collaborations
- `/collaborations/:id` - Collaboration details

#### Step 6: Navigation
**Update:** `src/renderer/layouts/AppLayout/AppLayout.tsx`

**Add to Sidebar:**
- "Campaigns" menu item (icon: 📋)
- "Collaborations" menu item (icon: 🤝)

---

## Implementation Order

### Week 1: Backend Foundation
**Days 1-2: Database & Entities**
1. Create migration for campaign tables
2. Create all entity files
3. Run migration and verify schema

**Days 3-4: DTOs & Service**
1. Create all DTO files
2. Implement campaigns service
3. Add validation

**Day 5: Controller & Module**
1. Create controller with all endpoints
2. Create module
3. Register in app.module
4. Test with Postman/curl

### Week 2: Frontend Implementation
**Days 1-2: Services & Types**
1. Create campaign types
2. Create campaigns service
3. Test API integration

**Days 3-4: Core Components**
1. CampaignCard component
2. CampaignWizard component
3. ApplicationModal component

**Day 5: Pages (Part 1)**
1. Campaigns page (browse)
2. CreateCampaign page
3. CampaignDetail page

### Week 3: Advanced Features
**Days 1-2: Collaboration System**
1. CollaborationCard component
2. MilestoneTimeline component
3. Collaboration page
4. MyCollaborations page

**Days 3-4: Integration**
1. Add routing
2. Update navigation
3. Connect to existing features (messaging, notifications)

**Day 5: Testing & Polish**
1. Test all flows
2. Fix bugs
3. Add loading states
4. Error handling
5. Mobile responsive

---

## User Flows

### Flow 1: Company Creates Campaign
```
1. Company logs in
2. Navigates to Campaigns
3. Clicks "Create Campaign"
4. Fills wizard (3 steps)
5. Reviews and publishes
6. Campaign appears in "My Campaigns"
7. Receives notifications when influencers apply
```

### Flow 2: Influencer Applies to Campaign
```
1. Influencer logs in
2. Navigates to Campaigns
3. Browses/filters campaigns
4. Clicks on interesting campaign
5. Reviews details
6. Clicks "Apply Now"
7. Fills application form (proposal, rate)
8. Submits application
9. Application appears in "My Applications"
10. Receives notification when reviewed
```

### Flow 3: Company Reviews Applications
```
1. Company receives notification
2. Navigates to campaign
3. Views applications list
4. Reviews each application
5. Accepts or rejects
6. Accepted application creates collaboration
7. Both parties notified
```

### Flow 4: Collaboration Tracking
```
1. Both parties navigate to Collaborations
2. View collaboration details
3. See milestone timeline
4. Update milestone status
5. Message each other
6. Mark deliverables complete
7. Complete collaboration
8. Leave reviews (future)
```

---

## Database Relationships

```
users (companies)
  ↓ (1:N)
campaigns
  ↓ (1:N)
campaign_applications
  ↓ (1:1)
collaborations
  ↓ (1:N)
campaign_milestones

users (influencers)
  ↓ (1:N)
campaign_applications
  ↓ (1:1)
collaborations
```

---

## API Endpoints Summary

### Campaigns
- `POST /api/campaigns` - Create
- `GET /api/campaigns` - List all (with filters)
- `GET /api/campaigns/:id` - Get one
- `PUT /api/campaigns/:id` - Update
- `DELETE /api/campaigns/:id` - Delete
- `GET /api/campaigns/my-campaigns` - My campaigns

### Applications
- `POST /api/campaigns/:id/apply` - Apply
- `GET /api/campaigns/my-applications` - My applications
- `GET /api/campaigns/:id/applications` - Campaign applications (owner)
- `PUT /api/campaigns/applications/:id/status` - Update status
- `DELETE /api/campaigns/applications/:id` - Withdraw

### Collaborations
- `GET /api/collaborations` - My collaborations
- `GET /api/collaborations/:id` - Get one
- `PUT /api/collaborations/:id/status` - Update status
- `POST /api/collaborations/:id/milestones` - Add milestone
- `PUT /api/collaborations/milestones/:id` - Update milestone

---

## Files to Create

### Backend (15 files)
```
backend/src/database/migrations/
  └── 1707578000000-CreateCampaignTables.ts

backend/src/modules/campaigns/
  ├── entities/
  │   ├── campaign.entity.ts
  │   ├── campaign-application.entity.ts
  │   ├── collaboration.entity.ts
  │   └── campaign-milestone.entity.ts
  ├── dto/
  │   ├── create-campaign.dto.ts
  │   ├── update-campaign.dto.ts
  │   ├── apply-campaign.dto.ts
  │   ├── update-application.dto.ts
  │   └── create-milestone.dto.ts
  ├── campaigns.service.ts
  ├── campaigns.controller.ts
  └── campaigns.module.ts
```

### Frontend (20+ files)
```
src/renderer/
  ├── types/
  │   └── campaign.types.ts
  ├── services/
  │   └── campaigns.service.ts
  ├── components/
  │   ├── CampaignCard/
  │   │   ├── CampaignCard.tsx
  │   │   └── CampaignCard.css
  │   ├── CampaignWizard/
  │   │   ├── CampaignWizard.tsx
  │   │   ├── CampaignWizard.css
  │   │   └── steps/
  │   │       ├── BasicInfoStep.tsx
  │   │       ├── RequirementsStep.tsx
  │   │       └── TimelineStep.tsx
  │   ├── ApplicationModal/
  │   │   ├── ApplicationModal.tsx
  │   │   └── ApplicationModal.css
  │   ├── CollaborationCard/
  │   │   ├── CollaborationCard.tsx
  │   │   └── CollaborationCard.css
  │   └── MilestoneTimeline/
  │       ├── MilestoneTimeline.tsx
  │       └── MilestoneTimeline.css
  └── pages/
      ├── Campaigns.tsx
      ├── Campaigns.css
      ├── CreateCampaign.tsx
      ├── CreateCampaign.css
      ├── CampaignDetail.tsx
      ├── CampaignDetail.css
      ├── Collaboration.tsx
      ├── Collaboration.css
      ├── MyCollaborations.tsx
      └── MyCollaborations.css
```

---

## Success Criteria

### Functionality
- ✅ Companies can create campaigns
- ✅ Influencers can browse and filter campaigns
- ✅ Influencers can apply to campaigns
- ✅ Companies can review and accept/reject applications
- ✅ Accepted applications create collaborations
- ✅ Both parties can track collaboration progress
- ✅ Milestones can be added and updated
- ✅ All data persists in database

### User Experience
- ✅ Intuitive campaign creation wizard
- ✅ Easy campaign discovery and filtering
- ✅ Simple application process
- ✅ Clear collaboration tracking
- ✅ Mobile responsive
- ✅ Loading states
- ✅ Error handling

### Technical
- ✅ No TypeScript errors
- ✅ All API endpoints work
- ✅ Database relationships correct
- ✅ Proper validation
- ✅ Security (auth guards)
- ✅ Performance optimized

---

## Next Steps After Phase 4

### Phase 5: Enhanced Interactions
- Reaction system for campaigns
- Save/bookmark campaigns
- Share campaigns
- Campaign reviews/ratings

### Phase 6: Search & Discovery
- Global search including campaigns
- Trending campaigns
- Recommended campaigns

### Phase 7: Analytics
- Campaign performance metrics
- Application analytics
- Collaboration success rates

---

## Estimated Timeline

- **Backend:** 5 days
- **Frontend:** 10 days
- **Testing & Polish:** 3 days
- **Total:** ~3 weeks

---

## Ready to Start Implementation! 🚀

This plan provides a complete roadmap for implementing the Campaign Management System. We'll build it incrementally, starting with the backend foundation and then adding frontend features.

Shall we begin with Step 1: Creating the database migration?

