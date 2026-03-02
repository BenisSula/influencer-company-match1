# Collaboration Request - Immediate Fix Guide

**Issue:** Unable to send collaboration request  
**Date:** February 14, 2026

## Quick Diagnosis Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and look for errors when clicking "Send Request"

Common errors:
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Token issue
- `500 Internal Server Error` - Backend crash
- Network error - Backend not running

### Step 2: Check Backend Logs
Look at the terminal where backend is running for error messages

### Step 3: Verify Backend is Running
```bash
curl http://localhost:3000/api/health
```

Should return 200 OK

---

## Common Issues & Fixes

### Issue 1: "recipientId is required"

**Symptom:** 400 error with message about recipientId

**Fix:** Check that `profileData.id` exists in MatchCard

**Verification:**
```typescript
// In MatchCard.tsx, add console.log before opening modal
const handleRequestCollaboration = () => {
  console.log('Opening modal for recipient:', profileData.id, profileData.name);
  setShowCollaborationModal(true);
};
```

---

### Issue 2: "Message is required"

**Symptom:** 400 error even though message field is filled

**Fix:** Check that message is being sent in request

**Verification:** Add logging in CollaborationRequestModal:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log('Submitting collaboration request:', {
    recipientId,
    message: message.trim(),
    collaborationType,
    budgetMin,
    budgetMax,
    timeline
  });
  
  // ... rest of code
};
```

---

### Issue 3: Backend Crash on Budget Parsing

**Symptom:** Backend restarts when sending request

**Root Cause:** Backend tries to parse budget as string "500-2000"

**Fix:** Already implemented - we now send budgetMin and budgetMax separately

**Verify Fix:**
```typescript
// In CollaborationRequestModal.tsx - should look like this:
const requestData: any = {
  recipientId,
  message: message.trim(),
  collaborationType,
};

if (budgetMin) {
  requestData.budgetMin = parseFloat(budgetMin);  // ✅ Separate fields
}
if (budgetMax) {
  requestData.budgetMax = parseFloat(budgetMax);  // ✅ Separate fields
}
```

---

### Issue 4: Modal Not Opening

**Symptom:** Nothing happens when clicking "Request Collaboration"

**Possible Causes:**
1. Button onClick not wired up
2. Modal state not updating
3. Modal component not imported

**Fix:** Verify in MatchCard.tsx:
```typescript
// 1. Check import
import { CollaborationRequestModal } from '../';

// 2. Check state
const [showCollaborationModal, setShowCollaborationModal] = useState(false);

// 3. Check button handler
const handleRequestCollaboration = () => {
  setShowCollaborationModal(true);
};

// 4. Check render
{showCollaborationModal && (
  <CollaborationRequestModal
    recipientId={profileData.id}
    recipientName={profileData.name}
    isOpen={showCollaborationModal}
    onClose={() => setShowCollaborationModal(false)}
    onSuccess={handleCollaborationSuccess}
  />
)}
```

---

### Issue 5: Form Validation Error

**Symptom:** "Please add a message" toast appears immediately

**Fix:** Check that message state is properly initialized:
```typescript
const [message, setMessage] = useState('');  // ✅ Empty string, not undefined
```

---

## Testing Procedure

### Test 1: Open Modal
1. Go to Matches page
2. Find a match card
3. Click "Request Collaboration" button
4. **Expected:** Modal opens with form

### Test 2: Fill Form
1. Select collaboration type (dropdown)
2. Enter budget min (e.g., 500)
3. Enter budget max (e.g., 2000)
4. Enter timeline (e.g., "2-4 weeks")
5. Enter message (required)
6. **Expected:** All fields accept input

### Test 3: Submit Request
1. Click "Send Request" button
2. **Expected:** 
   - Loading state shows
   - Success toast appears
   - Modal closes
   - Button changes to "Message"

### Test 4: Verify Backend
1. Check backend logs for:
   ```
   [MatchingService] Creating collaboration request
   ```
2. Check database:
   ```sql
   SELECT * FROM connections 
   WHERE collaboration_status = 'requested' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

---

## Debug Mode

Add this to CollaborationRequestModal.tsx for detailed logging:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.group('🔍 Collaboration Request Debug');
  console.log('Recipient ID:', recipientId);
  console.log('Recipient Name:', recipientName);
  console.log('Message:', message);
  console.log('Collaboration Type:', collaborationType);
  console.log('Budget Min:', budgetMin);
  console.log('Budget Max:', budgetMax);
  console.log('Timeline:', timeline);
  
  if (!message.trim()) {
    console.error('❌ Validation failed: Message is empty');
    showToast('Please add a message', 'error');
    console.groupEnd();
    return;
  }
  
  try {
    setLoading(true);
    console.log('📤 Sending request...');
    
    const requestData: any = {
      recipientId,
      message: message.trim(),
      collaborationType,
    };

    if (budgetMin) {
      requestData.budgetMin = parseFloat(budgetMin);
    }
    if (budgetMax) {
      requestData.budgetMax = parseFloat(budgetMax);
    }
    if (timeline) {
      requestData.timeline = timeline;
    }
    
    console.log('📦 Request payload:', requestData);

    const response = await matchingService.createCollaborationRequest(requestData);
    
    console.log('✅ Response received:', response);
    console.groupEnd();

    showToast(`Collaboration request sent to ${recipientName}!`, 'success');
    setMessage('');
    setBudgetMin('');
    setBudgetMax('');
    setTimeline('');
    setCollaborationType('sponsored_post');
    onSuccess?.();
    onClose();
  } catch (error: any) {
    console.error('❌ Request failed:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.groupEnd();
    showToast(error.message || 'Failed to send request', 'error');
  } finally {
    setLoading(false);
  }
};
```

---

## Quick Fix Checklist

- [ ] Backend is running on port 3000
- [ ] Frontend is running and connected
- [ ] User is logged in (check localStorage for auth_token)
- [ ] Match cards are displaying
- [ ] "Request Collaboration" button is visible
- [ ] Modal opens when button is clicked
- [ ] All form fields are visible and editable
- [ ] Message field is required and validates
- [ ] Submit button is enabled when message is filled
- [ ] No console errors when submitting
- [ ] Backend logs show request received
- [ ] Success toast appears
- [ ] Modal closes after success
- [ ] Button changes to "Message" after request sent

---

## If Still Not Working

### Nuclear Option: Clear Everything
```bash
# Stop all services
# Clear browser cache and localStorage
# Restart backend
cd backend
npm run start:dev

# Restart frontend
cd ..
npm run dev

# Login again
# Try sending request
```

### Check Network Tab
1. Open DevTools → Network tab
2. Click "Send Request"
3. Look for POST request to `/api/matching/collaboration-requests`
4. Check:
   - Request Headers (Authorization token present?)
   - Request Payload (all fields present?)
   - Response Status (200, 400, 500?)
   - Response Body (error message?)

---

## Success Indicators

✅ Modal opens smoothly  
✅ All fields are visible and functional  
✅ Form validation works  
✅ Submit button shows loading state  
✅ Success toast appears  
✅ Modal closes automatically  
✅ Backend logs show request processed  
✅ Database has new connection record  
✅ Button changes to "Message"  

---

**Next Steps After Fix:**
1. Test with different collaboration types
2. Test with and without optional fields
3. Test error handling (invalid recipient, etc.)
4. Test on mobile viewport
5. Document any edge cases found

