# Feed System Phase 6 - Quick Reference

## 🎯 Current Status

### ✅ What's Working
- Backend fully implemented and synced with database
- All CRUD operations working
- Reactions, comments, shares, saves all functional
- Hashtags and mentions working
- Message from post button already implemented
- Frontend components complete

### ❌ What's Missing
- **Feed Algorithm** - Currently just chronological
- **Collaboration Request from Post** - Button not added
- **Connection-based Filtering** - Shows all posts
- **Post Type Visual Distinction** - Basic labels only

## 🚀 Quick Implementation Guide

### Step 1: Add Personalized Feed (4-6 hours)

**Backend** - `backend/src/modules/feed/feed.service.ts`:
```typescript
async getPersonalizedFeed(userId: string, query: FeedQueryDto) {
  // 1. Get user connections
  // 2. Get high-compatibility matches (score >= 75)
  // 3. Get user niche/industry
  // 4. Build prioritized query with scoring:
  //    - Connections: 100 points
  //    - High matches: 75 points
  //    - Same niche: 50 points
  //    - Others: 25 points
  //    - + engagement boost
  //    - - recency decay
}
```

**Frontend** - `src/renderer/pages/Feed.tsx`:
```typescript
// Change line 36:
const response = await feedService.getPersonalizedFeed({ page: pageNum, limit: 20 });
```

### Step 2: Add Collaboration Button (2-3 hours)

**Frontend** - `src/renderer/components/FeedPost/FeedPost.tsx`:
```typescript
// Add to actionBarItems:
{
  id: 'collaborate',
  icon: <HiUserAdd />,
  label: 'Collaborate',
  onClick: () => setShowCollaborationModal(true),
}

// Add modal:
{showCollaborationModal && (
  <CollaborationRequestModal
    recipientId={post.authorId}
    recipientName={getAuthorName()}
    isOpen={showCollaborationModal}
    onClose={() => setShowCollaborationModal(false)}
  />
)}
```

### Step 3: Visual Enhancements (2-3 hours)

**Post Type Badges**:
- Update: 📝 Blue
- Collaboration: 🤝 Green
- Portfolio: 🎨 Purple
- Campaign: 📢 Orange

**Connection Indicators**:
- Connected: ✓ Connected badge
- High Match: 🔥 85% Match badge

## 📊 Priority Order

1. **Personalized Feed Algorithm** ⚡ CRITICAL
   - Transforms entire feed experience
   - 4-6 hours implementation
   - HIGH impact

2. **Collaboration from Post** ⚡ HIGH
   - Enables direct action from feed
   - 2-3 hours implementation
   - HIGH impact

3. **Visual Enhancements** 🎨 MEDIUM
   - Improves UX
   - 2-3 hours implementation
   - MEDIUM impact

4. **Feed Filters/Tabs** 🎨 LOW
   - Nice to have
   - 3-4 hours implementation
   - LOW impact

## 🧪 Quick Test

### Test Personalized Feed:
1. Create 3 users: A (you), B (connected), C (not connected)
2. Post from B and C
3. Login as A
4. **Expected**: See B's post first (connection priority)

### Test Collaboration:
1. View post from another user
2. Click "Collaborate" button
3. Fill modal
4. **Expected**: Request sent successfully

## 📝 Files to Modify

### Backend (2 files):
1. `backend/src/modules/feed/feed.service.ts` - Add getPersonalizedFeed
2. `backend/src/modules/feed/feed.controller.ts` - Add endpoint

### Frontend (3 files):
1. `src/renderer/services/feed.service.ts` - Add method
2. `src/renderer/pages/Feed.tsx` - Use new method
3. `src/renderer/components/FeedPost/FeedPost.tsx` - Add button

## ⏱️ Total Time: 11-16 hours

**Quick Win**: Start with personalized feed algorithm - biggest impact for time invested.
