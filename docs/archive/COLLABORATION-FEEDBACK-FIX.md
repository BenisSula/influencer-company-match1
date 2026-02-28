# Collaboration Feedback Submission Fix

## Problem Identified

The "Rate Your Collaboration" feedback form is not submitting because of a **data mismatch**:

1. **Frontend Issue**: The `CollaborationFeedbackModal` is being passed a `conversationId` (from Messages page)
2. **Backend Expectation**: The API endpoint expects a `connectionId` (from connections table)
3. **Result**: The backend can't find the connection and fails silently or returns an error

### Root Cause

In `Messages.tsx`, the feedback modal is opened like this:
```typescript
<CollaborationFeedbackModal
  connectionId={selectedConversation.id}  // ❌ This is a conversation ID, not connection ID!
  partnerName={...}
  onClose={() => setFeedbackModalOpen(false)}
  onSubmit={handleFeedbackSubmit}
/>
```

The `selectedConversation.id` is a conversation ID from the `conversations` table, but the backend service needs a connection ID from the `connections` table.

## Solution

We need to:
1. Find the connection ID from the conversation's user IDs
2. Pass the correct connection ID to the feedback modal
3. Add error handling for when no connection exists

## Implementation

### Fix 1: Update Messages.tsx to Find Connection ID

We need to fetch the connection ID before opening the feedback modal.

### Fix 2: Add Connection ID Lookup Function

Add a function to find the connection between two users.

### Fix 3: Update Feedback Modal Props

Ensure the modal receives the correct connection ID.

### Fix 4: Add Better Error Handling

Show clear error messages when submission fails.
