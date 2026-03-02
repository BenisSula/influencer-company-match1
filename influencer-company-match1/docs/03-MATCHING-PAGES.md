# Main Matching Pages Documentation

## Overview

The matching pages are the core user-facing features of the platform where influencers and companies discover, connect, and collaborate. These pages provide AI-powered matching, messaging, profile management, and collaboration tools.

**Access:** Authenticated users only  
**Layout:** `AppLayout` with sidebar navigation

---

## Page Structure

### 1. Dashboard
**Route:** `/dashboard`  
**Component:** `Dashboard.tsx`

**Purpose:** Central hub showing personalized overview and quick actions

**Widgets:**

**Analytics Widget** (`AnalyticsWidget.tsx`)
- Profile views (last 7/30 days)
- Match count
- Connection requests
- Message count
- Engagement rate

**Compatibility Matches Widget** (`CompatibilityMatchesWidget.tsx`)
- Top 5 recommended matches
- Compatibility scores
- Quick action buttons
- "View All Matches" link

**Collaboration Requests Widget** (`CollaborationRequestsWidget.tsx`)
- Pending incoming requests
- Pending outgoing requests
- Request status
- Quick accept/decline actions

**Profile Completion Banner** (`ProfileCompletionBanner.tsx`)
- Profile completion percentage
- Missing fields highlighted
- Quick link to profile edit

**Features:**
- Real-time updates via WebSocket
- Personalized recommendations
- Quick navigation to key features
- Mobile-responsive grid layout

**Backend:**
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/widgets` - Widget data

---

### 2. Matches Page
**Route:** `/matches`  
**Component:** `Matches.tsx`

**Purpose:** Discover and browse potential collaboration partners

**Layout:**
- Left sidebar: Filter panel
- Main content: Match cards grid
- Right sidebar: Comparison bar (when comparing)

**Filter Panel** (`FilterPanel.tsx`)

**Filters Available:**
- **Role:** Influencer or Company
- **Industry/Niche:** Multiple selection
- **Location:** Country/city
- **Budget Range:** Min-max slider
- **Follower Count:** Range slider (influencers)
- **Platforms:** Instagram, YouTube, TikTok, etc.
- **Engagement Rate:** Minimum threshold
- **Compatibility Score:** Minimum score
- **Verified Only:** Toggle

**Match Cards** (`MatchCard.tsx`)

**Card Information:**
- Profile photo/avatar
- Name and role
- Industry/niche tags
- Location
- Key metrics (followers, engagement, budget)
- Compatibility score with breakdown
- Quick action buttons

**Card Actions:**
- View full profile
- Send collaboration request
- Save profile
- Compare (checkbox)
- Share profile

**Compatibility Score** (`CompatibilityIndicator.tsx`)
- Visual score indicator (0-100%)
- Color-coded (red < 50%, yellow 50-75%, green > 75%)
- Hover tooltip with breakdown

**Sorting Options:**
- Best match (default)
- Highest compatibility
- Most recent
- Most followers/budget
- Location proximity

**Pagination:**
- Infinite scroll or page-based
- 20 matches per page
- Loading skeleton states

**Backend:**
- `GET /api/matching/matches` - Get matches with filters
- `POST /api/matching/save` - Save profile
- `GET /api/matching/compatibility/:id` - Detailed compatibility

**Matching Algorithm:**
Weighted scoring system:
- Niche compatibility: 30%
- Budget alignment: 20%
- Location compatibility: 15%
- Platform overlap: 15%
- Audience size match: 10%
- Engagement tier: 10%

---

### 3. Match Comparison
**Route:** `/matches/compare`  
**Component:** `MatchComparison.tsx`

**Purpose:** Side-by-side comparison of multiple matches

**Features:**
- Compare up to 4 profiles simultaneously
- Side-by-side metric comparison
- Visual comparison charts
- Compatibility breakdown
- Export comparison as PDF

**Comparison Metrics:**
- Follower count / Company size
- Engagement rate / Budget range
- Platform presence
- Industry alignment
- Location
- Compatibility factors
- Reviews and ratings

**Components:**
- `ComparisonTable.tsx` - Tabular comparison
- `ComparisonChart.tsx` - Visual charts
- `ComparisonBar.tsx` - Floating comparison bar
- `ComparisonCheckbox.tsx` - Select profiles to compare

**Context:** `ComparisonContext.tsx` - Global comparison state

**Backend:**
- `POST /api/matching/compare` - Compare multiple profiles

---

### 4. Match History & Analytics
**Route:** `/matches/history`  
**Component:** `MatchHistory.tsx`  
**Feature Flag:** `MATCH_HISTORY_ENABLED`

**Purpose:** Track and analyze matching performance over time

**Sections:**

**Match History:**
- All past matches
- Match date and status
- Compatibility scores
- Outcome (connected, declined, expired)
- Filter by date range and status

**Match Analytics** (`MatchAnalytics.tsx`)
- Total matches received
- Match acceptance rate
- Average compatibility score
- Best performing niches
- Geographic distribution
- Time-based trends

**Charts:**
- Match volume over time
- Compatibility score distribution
- Acceptance rate trends
- Industry breakdown

**Backend:**
- `GET /api/matching/history` - Match history
- `GET /api/matching/analytics` - Match analytics

**Database Table:** `match_history`

---

### 5. Profile View
**Route:** `/profile/:id`  
**Component:** `ProfileView.tsx`

**Purpose:** View detailed profile of another user

**Profile Sections:**

**Header:**
- Profile photo
- Name and role
- Location
- Verification badge
- Social media links
- Compatibility score (if applicable)

**About Section:**
- Bio/description
- Company description
- Mission statement
- Years of experience

**Metrics Section:**
- Follower counts by platform
- Engagement rates
- Budget range (companies)
- Collaboration count
- Success rate

**Portfolio/Work Samples:**
- Images and videos
- Case studies
- Previous collaborations
- Media kit (downloadable)

**Reviews & Ratings** (`ReviewList.tsx`)
- Star ratings
- Written reviews
- Review date
- Reviewer information
- Featured reviews

**Tabs** (`ProfileTabs.tsx`)
- Overview
- Portfolio
- Reviews
- Statistics
- Collaborations

**Action Buttons:**
- Send collaboration request
- Send message
- Save profile
- Share profile
- Report profile

**Backend:**
- `GET /api/profiles/:id` - Profile details
- `GET /api/profiles/:id/reviews` - Profile reviews
- `GET /api/profiles/:id/portfolio` - Portfolio items

---

### 6. Own Profile
**Route:** `/profile`  
**Component:** `Profile.tsx`

**Purpose:** View and manage own profile

**Features:**
- View profile as others see it
- Edit profile button
- Profile completion status
- Analytics overview
- Recent activity

**Quick Actions:**
- Edit profile
- Upload media
- Manage portfolio
- View analytics
- Settings

---

### 7. Profile Edit
**Route:** `/profile/edit`  
**Component:** `ProfileEdit.tsx`

**Purpose:** Edit profile information

**Editable Sections:**

**Basic Information:**
- Profile photo
- Full name
- Bio/description
- Location
- Contact information

**Role-Specific (Influencer):**
- Niches/industries
- Platform accounts
- Follower counts
- Engagement rates
- Content categories
- Collaboration preferences

**Role-Specific (Company):**
- Company name
- Industry
- Company size
- Budget range
- Target audience
- Campaign types
- Collaboration goals

**Portfolio Management:**
- Upload images/videos
- Add case studies
- Link to previous work
- Media kit upload

**Social Media:**
- Connect Instagram
- Connect YouTube
- Connect TikTok
- Connect Twitter/X
- Connect LinkedIn

**Preferences:**
- Notification settings
- Privacy settings
- Matching preferences
- Collaboration preferences

**Components:**
- `AvatarUpload.tsx` - Profile photo upload
- `FileUpload.tsx` - Media file upload
- Form validation with real-time feedback

**Backend:**
- `PUT /api/profiles/me` - Update profile
- `POST /api/media/upload` - Upload media files
- `DELETE /api/media/:id` - Delete media

---

### 8. Messages
**Route:** `/messages`  
**Component:** `Messages.tsx`

**Purpose:** Real-time messaging with connections

**Layout:**
- Left sidebar: Conversation list
- Main area: Active conversation
- Right sidebar: Conversation details (optional)

**Conversation List** (`ConversationList.tsx`)
- All conversations
- Unread message badges
- Last message preview
- Timestamp
- Search conversations
- Filter (all, unread, archived)

**Message Thread** (`MessageThread.tsx`)
- Message history
- Real-time message updates
- Typing indicators
- Read receipts
- Message timestamps
- Sender avatars

**Message Input:**
- Text input with emoji picker
- File attachments
- Image/video sharing
- Voice messages (planned)
- Message templates

**Message Notifications:**
- Toast notifications for new messages
- Browser notifications
- Unread count in sidebar
- Sound alerts (optional)

**Features:**
- WebSocket-powered real-time messaging
- Message search
- Conversation archiving
- Block/report users
- Message reactions (planned)

**Backend:**
- `GET /api/messaging/conversations` - List conversations
- `GET /api/messaging/conversations/:id/messages` - Message history
- `POST /api/messaging/conversations/:id/messages` - Send message
- `WebSocket /messaging` - Real-time messaging

**Database Tables:**
- `conversations` - Conversation metadata
- `messages` - Message content

---

### 9. Connections
**Route:** `/connections`  
**Component:** `Connections.tsx`

**Purpose:** Manage connections and collaboration requests

**Tabs:**

**Active Connections:**
- All accepted connections
- Connection date
- Collaboration status
- Quick message button
- View profile button
- Collaboration stats

**Pending Requests:**
- Incoming requests (need action)
- Outgoing requests (waiting)
- Request message
- Accept/decline buttons
- Request expiration timer

**Collaboration Requests:**
- Active collaborations
- Collaboration details
- Status tracking
- Payment information
- Deliverables checklist

**Collaboration Stats** (`CollaborationStats.tsx`)
- Total collaborations
- Success rate
- Average rating
- Total earnings/spent
- Collaboration outcomes

**Collaboration Feedback** (`CollaborationFeedbackModal.tsx`)
- Rate collaboration (1-5 stars)
- Written feedback
- Outcome selection (successful, neutral, unsuccessful)
- Improvement suggestions

**Backend:**
- `GET /api/connections` - List connections
- `GET /api/connections/requests` - Collaboration requests
- `POST /api/connections/accept` - Accept request
- `POST /api/connections/decline` - Decline request
- `POST /api/connections/:id/feedback` - Submit feedback

**Database Tables:**
- `connections` - Connection records
- `collaboration_outcomes` - Collaboration feedback

---

### 10. Campaigns
**Route:** `/campaigns`  
**Component:** `Campaigns.tsx`  
**Feature Flag:** `CAMPAIGNS_ENABLED`

**Purpose:** Browse and manage campaigns (company-created opportunities)

**For Influencers:**
- Browse available campaigns
- Filter by niche, budget, duration
- Apply to campaigns
- Track application status
- View campaign details

**For Companies:**
- Create new campaigns
- Manage active campaigns
- Review applications
- Select influencers
- Track campaign progress

**Campaign Card** (`CampaignCard.tsx`)
- Campaign title
- Company information
- Budget range
- Duration
- Requirements
- Application deadline
- Number of applicants

**Campaign Detail** (`CampaignDetail.tsx`)
- Full campaign description
- Detailed requirements
- Deliverables
- Timeline
- Budget breakdown
- Application form
- Similar campaigns

**Create Campaign** (`CreateCampaign.tsx`)
- Campaign information form
- Target audience definition
- Budget allocation
- Timeline setup
- Requirements specification
- Preview before publishing

**Backend:**
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Campaign details
- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/:id/apply` - Apply to campaign
- `GET /api/campaigns/:id/applications` - View applications

**Database Tables:**
- `campaigns` - Campaign information
- `campaign_applications` - Applications
- `campaign_milestones` - Campaign milestones
- `collaborations` - Active collaborations

---

### 11. Feed
**Route:** `/feed`  
**Component:** `Feed.tsx`

**Purpose:** Social feed for platform updates and content sharing

**Features:**

**Create Post** (`CreatePost.tsx`)
- Text posts
- Image/video uploads
- Hashtags
- Mentions (@username)
- Post visibility (public, connections only)

**Feed Post** (`FeedPost.tsx`)
- Post content
- Author information
- Timestamp
- Like/reaction buttons
- Comment button
- Share button
- Save button

**Post Interactions:**
- Reactions (like, love, celebrate, insightful)
- Comments with threading
- Shares
- Saves to collections

**Feed Filters** (`FeedFilters.tsx`)
- All posts
- Following only
- My posts
- Saved posts
- By hashtag
- By industry

**Components:**
- `CommentSection.tsx` - Post comments
- `ShareModal.tsx` - Share post
- `WhoReactedModal.tsx` - View reactions

**Backend:**
- `GET /api/feed/posts` - Feed posts
- `POST /api/feed/posts` - Create post
- `POST /api/feed/posts/:id/react` - React to post
- `POST /api/feed/posts/:id/comment` - Comment on post
- `POST /api/feed/posts/:id/share` - Share post

**Database Tables:**
- `feed_posts` - Post content
- `post_comments` - Comments
- `reactions` - Post reactions
- `shares` - Post shares
- `hashtags` - Hashtag index

---

### 12. Saved Items
**Route:** `/saved`  
**Component:** `SavedItems.tsx`  
**Feature Flag:** `SAVED_ITEMS_ENABLED`

**Purpose:** Manage saved profiles and posts

**Collections:**
- Default collection (all saved items)
- Custom collections
- Create new collections
- Organize saved items

**Saved Profiles:**
- Saved match profiles
- Quick access to profiles
- Remove from saved
- Add notes

**Saved Posts:**
- Saved feed posts
- Organize by collection
- Remove from saved

**Backend:**
- `GET /api/profiles/saved` - Saved profiles
- `POST /api/profiles/:id/save` - Save profile
- `DELETE /api/profiles/:id/save` - Unsave profile

**Database Tables:**
- `saved_profiles` - Saved profile records
- `post_saves` - Saved posts
- `collections` - User collections

---

### 13. Settings
**Route:** `/settings`  
**Component:** `Settings.tsx`

**Purpose:** User account and preference management

**Settings Sections:**

**Account Settings:**
- Email address
- Password change
- Two-factor authentication
- Account deletion

**Profile Settings:**
- Profile visibility
- Who can message me
- Who can see my profile
- Search visibility

**Notification Settings:**
- Email notifications
- Push notifications
- In-app notifications
- Notification frequency
- Notification types

**Privacy Settings:**
- Profile visibility
- Activity visibility
- Connection visibility
- Data sharing preferences

**Payment Settings:**
- Payment methods
- Payout account (Stripe Connect)
- Billing history
- Invoices

**Preferences:**
- Language
- Timezone
- Currency
- Theme (light/dark)

**Components:**
- `Toggle.tsx` - Setting toggles
- `PasswordStrengthMeter.tsx` - Password validation

**Backend:**
- `GET /api/settings` - User settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/change-password` - Change password

**Database Table:** `user_settings`

---

### 14. Payment Pages

**Payment Checkout**  
**Route:** `/payments/checkout/:collaborationId`  
**Component:** `PaymentCheckout.tsx`

**Features:**
- Collaboration details
- Payment amount
- Stripe payment form
- Payment method selection
- Invoice preview

**Payment Success**  
**Route:** `/payments/success`  
**Component:** `PaymentSuccess.tsx`

**Features:**
- Payment confirmation
- Transaction details
- Download invoice
- Return to dashboard

**Invoices**  
**Route:** `/invoices` (planned)  
**Component:** `Invoices.tsx`

**Features:**
- Invoice history
- Download PDF invoices
- Payment status
- Filter by date

**Components:**
- `PaymentForm.tsx` - Stripe payment form
- `PaymentMethodForm.tsx` - Save payment method
- `InvoicePDF.tsx` - PDF invoice generation
- `PaymentSetupModal.tsx` - Stripe Connect onboarding

**Backend:**
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/invoices` - List invoices
- `GET /api/payments/invoices/:id/pdf` - Download invoice PDF

---

## Common Features

### AI-Powered Recommendations
**Service:** `ai-matching.service.ts`

**Features:**
- Smart match recommendations
- Personalized suggestions
- ML-based scoring
- Continuous learning from user feedback

**Components:**
- `SmartRecommendations.tsx` - Recommendation widget
- `AIMatchScore.tsx` - AI compatibility score
- `RecommendationCard.tsx` - Recommended match card

**Backend:**
- `GET /api/ai-matching/recommendations` - Get recommendations
- `POST /api/ai-matching/feedback` - Submit feedback

### Global Search
**Component:** `GlobalSearch.tsx`

**Search Scope:**
- Users (influencers and companies)
- Posts
- Campaigns
- Hashtags

**Features:**
- Real-time search suggestions
- Search history
- Advanced filters
- Recent searches

**Components:**
- `SearchDropdown.tsx` - Search results dropdown
- `SearchResultItem.tsx` - Individual result

**Backend:**
- `GET /api/search` - Global search
- `GET /api/search/suggestions` - Search suggestions

### Notifications
**Context:** `NotificationContext.tsx`

**Notification Types:**
- New match
- Collaboration request
- Message received
- Payment received
- Profile view
- Review received

**Components:**
- `NotificationDropdown.tsx` - Notification center
- `MessageNotification.tsx` - Message-specific notifications
- `MessageToastNotification.tsx` - Toast notifications
- `UnreadBadge.tsx` - Unread count badge

**Backend:**
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `WebSocket /notifications` - Real-time notifications

### Chatbot Widget
**Component:** `ChatbotWidget.tsx`

**Features:**
- AI-powered support chatbot
- Context-aware responses
- Quick actions
- Conversation history
- Minimize/maximize

**Backend:**
- `POST /api/chatbot/message` - Send message
- `WebSocket /chatbot` - Real-time chat
- ML Service: `http://localhost:8000` - NLP processing

---

## Mobile Responsiveness

All matching pages are fully responsive with:
- Mobile-optimized layouts
- Touch-friendly interactions
- Swipe gestures
- Bottom navigation (mobile)
- Responsive tables
- Mobile-specific components

**Components:**
- `MobileNav.tsx` - Mobile navigation
- `MobileNavToggle.tsx` - Hamburger menu
- `MobileNavMenu.tsx` - Mobile menu drawer

**Hooks:**
- `useMobileNav.ts` - Mobile navigation state
- `useTouchDevice.ts` - Touch device detection
- `useMediaQuery.ts` - Responsive breakpoints

---

## Performance Optimization

### Code Splitting
- Lazy loading for all non-critical routes
- Separate chunks for major features
- Skeleton loading states

### Caching
- React Query for API response caching
- 5-minute stale time for most queries
- Optimistic updates for mutations
- Cache invalidation strategies

### Image Optimization
- Lazy loading images
- Responsive image sizes
- WebP format support
- Image compression

**Utilities:**
- `imageOptimization.ts` - Image optimization
- `apiCache.ts` - API caching utilities

---

## Testing

### Test Files
- `test-complete-auth-flow.js` - Authentication flow
- `test-suggested-matches.js` - Match suggestions
- `test-collaboration-request.js` - Collaboration requests
- `test-messaging-system.js` - Real-time messaging
- `test-feed-posts.js` - Social feed
- `test-complete-payment-flow.js` - Payment processing

---

## Related Documentation
- [Frontend Architecture](./03-FRONTEND-ARCHITECTURE.md)
- [Backend API](./04-BACKEND-API.md)
- [User Manual](./06-USER-MANUAL.md)
- [Admin Dashboard](./02-ADMIN-DASHBOARD.md)
