# Testing Dynamic Testimonials - Quick Guide

## Prerequisites

1. **Backend Running:** Ensure backend server is running on port 3000
2. **Database Setup:** Profile reviews table exists with `is_featured` column
3. **Frontend Running:** Vite dev server running

## Quick Test Steps

### 1. Test Backend Endpoint

```bash
# Test the API endpoint directly
curl http://localhost:3000/profiles/testimonials?limit=5
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "name": "User Name",
    "role": "Influencer",
    "company": "@username",
    "avatar": "/avatars/...",
    "rating": 5,
    "text": "Review text here",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Add Featured Reviews (If None Exist)

Run this SQL to mark existing reviews as featured:

```sql
-- Mark top 5 reviews as featured
UPDATE profile_reviews 
SET is_featured = true 
WHERE rating >= 4 
ORDER BY created_at DESC 
LIMIT 5;
```

Or use the Admin Panel:
1. Navigate to `/admin/reviews`
2. Click "Feature" button on reviews you want to showcase

### 3. View on Landing Page

1. Open browser to `http://localhost:5173`
2. Scroll to testimonials section
3. Verify:
   - Testimonials load (no loading spinner stuck)
   - Carousel navigation works
   - Indicators update correctly
   - Ratings display properly
   - Dates format correctly

### 4. Test Edge Cases

#### No Testimonials
```sql
-- Temporarily unfeature all reviews
UPDATE profile_reviews SET is_featured = false;
```
**Expected:** "No testimonials available" message

#### Single Testimonial
```sql
-- Feature only one review
UPDATE profile_reviews SET is_featured = false;
UPDATE profile_reviews SET is_featured = true WHERE id = 'some-id' LIMIT 1;
```
**Expected:** Navigation buttons disabled, no indicators

#### API Error
- Stop backend server
- Refresh page
**Expected:** Error message displayed gracefully

### 5. Mobile Testing

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, etc.)
4. Verify:
   - Layout stacks vertically
   - Navigation buttons reposition
   - Text remains readable
   - Touch interactions work

### 6. Performance Check

Open DevTools → Network tab:
- API call should complete in < 500ms
- No unnecessary re-fetches
- Images load efficiently

## Common Issues & Solutions

### Issue: "Unable to load testimonials"
**Solution:** Check backend is running and endpoint is accessible

### Issue: Stuck on loading spinner
**Solution:** Check browser console for errors, verify API URL in env

### Issue: No testimonials showing
**Solution:** Verify database has reviews with `is_featured = true`

### Issue: Images not loading
**Solution:** Check avatar URLs are valid, fallback should trigger

### Issue: Carousel not working
**Solution:** Verify testimonials array has multiple items

## Browser Console Commands

```javascript
// Check if component loaded
document.querySelector('.testimonials-section')

// Check API response
fetch('http://localhost:3000/profiles/testimonials?limit=5')
  .then(r => r.json())
  .then(console.log)

// Check for errors
console.error
```

## Success Indicators ✅

- [ ] API endpoint returns data
- [ ] Testimonials render on page
- [ ] Carousel navigation functional
- [ ] Loading state appears briefly
- [ ] No console errors
- [ ] Mobile layout works
- [ ] Ratings display correctly
- [ ] Smooth animations

## Quick Fix Commands

```bash
# Restart backend
cd backend
npm run start:dev

# Restart frontend
cd ..
npm run dev

# Check for TypeScript errors
npm run type-check

# Clear cache if needed
rm -rf node_modules/.vite
```

## Test Data Generator

If you need test data, run this SQL:

```sql
-- Insert sample featured reviews
INSERT INTO profile_reviews (id, profile_id, reviewer_id, reviewer_name, rating, comment, is_featured, created_at)
VALUES 
  (gen_random_uuid(), 'profile-1', 'user-1', 'Sarah Johnson', 5, 'Amazing platform! Found perfect brand partnerships.', true, NOW()),
  (gen_random_uuid(), 'profile-2', 'user-2', 'Michael Chen', 5, 'The AI matching is incredibly accurate.', true, NOW()),
  (gen_random_uuid(), 'profile-3', 'user-3', 'Emma Rodriguez', 4, 'Great experience, highly recommend!', true, NOW());
```

## Done! 🎉

Your dynamic testimonials should now be working perfectly. If you encounter any issues, check the console for error messages and verify the backend endpoint is accessible.
