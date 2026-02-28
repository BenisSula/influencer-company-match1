# Social Media Platform Implementation Plan

## Overview
Transform the influencer-company matching platform into a full-featured social media experience with content sharing, engagement features (likes, comments), messaging, and a modern brand identity.

---

## 🎨 Phase 1: Brand Identity & Color Scheme

### Current Colors (Professional/Corporate)
- Primary: `#1F2A44` (Dark Navy)
- Secondary: `#2563EB` (Blue)
- Accent: `#14B8A6` (Teal)

### Proposed New Colors (Social Media/Vibrant)
**Option A: Instagram-inspired (Recommended)**
- Primary: `#E1306C` (Instagram Pink/Magenta)
- Secondary: `#5B51D8` (Purple)
- Accent: `#FD8D32` (Orange)
- Success: `#00D95F` (Green)
- Background: `#FAFAFA` (Light Gray)
- Card: `#FFFFFF` (White)
- Text Primary: `#262626` (Dark Gray)
- Text Secondary: `#8E8E8E` (Medium Gray)

**Option B: TikTok-inspired**
- Primary: `#FE2C55` (TikTok Red)
- Secondary: `#25F4EE` (Cyan)
- Accent: `#000000` (Black)
- Background: `#121212` (Dark Mode)

**Option C: LinkedIn-inspired (Professional Social)**
- Primary: `#0A66C2` (LinkedIn Blue)
- Secondary: `#00A0DC` (Light Blue)
- Accent: `#057642` (Green)
- Background: `#F3F2EF` (Warm Gray)

### Implementation Tasks
- [ ] 1.1 Update CSS variables in `global.css`
- [ ] 1.2 Create theme context for light/dark mode support
- [ ] 1.3 Update all component styles to use new color scheme
- [ ] 1.4 Add gradient backgrounds for hero sections
- [ ] 1.5 Update button styles with modern hover effects
- [ ] 1.6 Add smooth transitions and animations

---

## 📱 Phase 2: Social Feed Implementation ✅ COMPLETE

### Backend Tasks

#### 2.1 Feed Post Entity & Module ✅
- [x] Create `FeedPost` entity
  - id, authorId, content, postType, mediaUrls[], likeCount, commentCount, createdAt
- [x] Create `PostLike` entity
  - id, userId, postId, createdAt
- [x] Create `PostComment` entity
  - id, authorId, postId, content, createdAt
- [x] Create FeedModule with service, controller, DTOs
- [x] Implement POST `/api/feed/posts` - Create post
- [x] Implement GET `/api/feed` - Get feed with pagination
- [x] Implement POST `/api/feed/posts/:id/like` - Like post
- [x] Implement DELETE `/api/feed/posts/:id/like` - Unlike post
- [x] Implement POST `/api/feed/posts/:id/comments` - Add comment
- [x] Implement GET `/api/feed/posts/:id/comments` - Get comments
- [x] Implement DELETE `/api/feed/posts/:id` - Delete post (author only)

#### 2.2 Media Upload Service
- [ ] Create media upload endpoint with Multer
- [ ] Implement image optimization (resize, compress)
- [ ] Implement video thumbnail generation
- [ ] Store files in `/uploads` directory
- [ ] Add file type validation (images: jpg, png, webp; videos: mp4, webm)
- [ ] Add file size limits (images: 5MB, videos: 50MB)

### Frontend Tasks

#### 2.3 Feed Components ✅
- [x] Create `FeedPost` component
  - Author info with avatar
  - Post content with "Read more" for long text
  - Media gallery (images/videos)
  - Like button with count
  - Comment button with count
  - Share button
  - Timestamp
- [x] Create `CreatePost` component
  - Text area with emoji picker
  - Media upload (drag & drop)
  - Media preview with remove option
  - Post type selector (update, collaboration story, campaign announcement)
  - Character counter
- [x] Create `CommentSection` component
  - Comment list with nested replies
  - Comment input
  - Like comments
  - Delete own comments
- [ ] Create `MediaGallery` component
  - Image carousel
  - Video player with controls
  - Fullscreen view
  - Download option

#### 2.4 Feed Page ✅
- [x] Create infinite scroll feed
- [ ] Add pull-to-refresh
- [x] Add post filtering (all, following, trending)
- [x] Add "Create Post" floating action button
- [x] Implement optimistic UI updates for likes

---

## 💬 Phase 3: Real-Time Messaging System ✅ COMPLETE

### Backend Tasks

#### 3.1 Messaging Entities ✅
- [x] Create `Conversation` entity
  - id, user1Id, user2Id, lastMessageAt, unreadCount1, unreadCount2
- [x] Create `Message` entity
  - id, conversationId, senderId, content, attachmentUrl, readAt, createdAt

#### 3.2 WebSocket Gateway ✅
- [x] Install Socket.io (`npm install @nestjs/websockets @nestjs/platform-socket.io socket.io`)
- [x] Create MessagingGateway
- [x] Implement JWT authentication for WebSocket
- [x] Handle `send_message` event
- [x] Handle `typing_start` event
- [x] Handle `typing_stop` event
- [x] Handle `mark_read` event
- [x] Emit `new_message` to recipient
- [x] Emit `typing` indicator to recipient

#### 3.3 Messaging REST API ✅
- [x] Implement GET `/api/conversations` - Get user conversations
- [x] Implement GET `/api/conversations/:id/messages` - Get messages
- [x] Implement POST `/api/messages` - Send message (fallback)
- [x] Implement PATCH `/api/conversations/:id/read` - Mark as read

### Frontend Tasks

#### 3.4 Messaging Components ✅
- [x] Create `ConversationList` component
  - List of conversations
  - Unread badge
  - Last message preview
  - Search conversations
- [x] Create `MessageThread` component
  - Message bubbles (sent/received)
  - Typing indicator
  - Read receipts
  - Timestamp
  - Attachment preview
- [x] Create `MessageInput` component
  - Text input with emoji picker
  - File attachment button
  - Send button
  - Character counter

#### 3.5 WebSocket Integration ✅
- [x] Create `useMessaging` hook
  - Connect to WebSocket
  - Handle connection/disconnection
  - Send messages
  - Receive messages
  - Handle typing indicators
- [x] Implement real-time message updates
- [x] Add notification sound for new messages
- [x] Add desktop notifications (if permitted)

---

## 🔗 Phase 4: Connections & Networking

### Backend Tasks

#### 4.1 Connection System
- [ ] Enhance `Connection` entity (already exists)
- [ ] Create ConnectionModule with service, controller
- [ ] Implement POST `/api/connections/request` - Send connection request
- [ ] Implement POST `/api/connections/:id/accept` - Accept request
- [ ] Implement POST `/api/connections/:id/reject` - Reject request
- [ ] Implement GET `/api/connections` - Get user connections
- [ ] Implement GET `/api/connections/requests` - Get pending requests
- [ ] Implement DELETE `/api/connections/:id` - Remove connection

### Frontend Tasks

#### 4.2 Connection Components
- [ ] Create `ConnectionButton` component
  - Connect/Pending/Connected states
  - Handle connection requests
- [ ] Create `ConnectionsList` page
  - List of connections
  - Search connections
  - Filter by role
- [ ] Create `ConnectionRequests` page
  - Pending requests (sent/received)
  - Accept/Reject buttons
- [ ] Add connection status to profile pages
- [ ] Add "Mutual Connections" section

---

## 📸 Phase 5: Media Upload & Portfolio

### Backend Tasks

#### 5.1 Portfolio Media
- [ ] Enhance media upload for profiles
- [ ] Add media categories (portfolio, cover photo, profile picture)
- [ ] Implement image cropping API
- [ ] Add video processing queue

### Frontend Tasks

#### 5.2 Media Upload Components
- [ ] Create `MediaUploader` component
  - Drag & drop zone
  - File preview
  - Progress bar
  - Multiple file support
- [ ] Create `ImageCropper` component
  - Crop tool for profile pictures
  - Aspect ratio presets
- [ ] Create `PortfolioGallery` component
  - Grid layout
  - Lightbox view
  - Reorder media
  - Delete media
- [ ] Add profile picture upload to profile page
- [ ] Add cover photo upload to profile page

---

## 🎯 Phase 6: Enhanced Matching & Discovery

### Frontend Tasks

#### 6.1 Discovery Features
- [ ] Create `DiscoverPage`
  - Trending influencers/companies
  - Suggested matches
  - Recently joined
  - Filter by niche/industry
- [ ] Create `TrendingSection` component
  - Top posts this week
  - Rising stars
  - Popular campaigns
- [ ] Add "People You May Know" section
- [ ] Add "Similar Profiles" section

---

## 🔔 Phase 7: Notifications System

### Backend Tasks

#### 7.1 Notifications
- [ ] Create `Notification` entity
  - id, userId, type, data, read, createdAt
- [ ] Create NotificationModule
- [ ] Implement GET `/api/notifications` - Get notifications
- [ ] Implement PATCH `/api/notifications/:id/read` - Mark as read
- [ ] Implement PATCH `/api/notifications/read-all` - Mark all as read
- [ ] Create notification triggers:
  - New connection request
  - Connection accepted
  - New message
  - Post liked
  - Post commented
  - New match

### Frontend Tasks

#### 7.2 Notification Components
- [ ] Create `NotificationBell` component
  - Unread count badge
  - Dropdown with recent notifications
  - Mark as read
- [ ] Create `NotificationsPage`
  - List all notifications
  - Filter by type
  - Mark all as read
- [ ] Add real-time notification updates via WebSocket

---

## 🎨 Phase 8: UI/UX Enhancements

### 8.1 Layout Improvements
- [ ] Create sticky navigation bar
- [ ] Add left sidebar (navigation)
- [ ] Add right sidebar (suggestions, trending)
- [ ] Implement responsive mobile layout
- [ ] Add bottom navigation for mobile

### 8.2 Component Enhancements
- [ ] Add loading skeletons for all components
- [ ] Add empty states with illustrations
- [ ] Add error states with retry buttons
- [ ] Implement smooth page transitions
- [ ] Add micro-interactions (button clicks, hover effects)

### 8.3 Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen readers
- [ ] Add alt text to all images

---

## 📊 Phase 9: Analytics & Insights

### Backend Tasks
- [ ] Create `ProfileView` entity
- [ ] Track profile views
- [ ] Track post engagement
- [ ] Create analytics endpoints

### Frontend Tasks
- [ ] Create `AnalyticsDashboard` page
  - Profile views chart
  - Engagement metrics
  - Top posts
  - Audience demographics
- [ ] Add analytics to profile page

---

## 🚀 Implementation Priority

### Sprint 1 (Week 1-2): Foundation
1. Brand identity & color scheme update
2. Layout restructure (3-column layout)
3. Basic feed post entity & API

### Sprint 2 (Week 3-4): Social Features
1. Feed post creation & display
2. Like & comment functionality
3. Media upload for posts

### Sprint 3 (Week 5-6): Messaging
1. Real-time messaging backend
2. Messaging UI components
3. WebSocket integration

### Sprint 4 (Week 7-8): Connections & Polish
1. Connection system
2. Notifications
3. UI/UX enhancements
4. Mobile responsiveness

---

## 🎯 Success Metrics

- Users can create posts with images/videos
- Users can like and comment on posts
- Users can send real-time messages
- Users can connect with each other
- Platform has a modern, social media feel
- Mobile-responsive design
- Fast load times (<2s)
- High engagement rate

---

## 📝 Notes

- All features should maintain the core matching algorithm
- Keep the professional B2B focus while adding social features
- Ensure data privacy and security for all user interactions
- Implement rate limiting to prevent spam
- Add content moderation capabilities for future
