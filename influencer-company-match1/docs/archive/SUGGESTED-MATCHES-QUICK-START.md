# Suggested Matches - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Application (2 minutes)

```bash
# Terminal 1 - Backend
cd influencer-company-match1/backend
npm run start:dev

# Terminal 2 - Frontend  
cd influencer-company-match1
npm run dev
```

Wait for both to start:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Step 2: Open Browser (30 seconds)

1. Open Chrome/Firefox/Edge
2. Navigate to `http://localhost:5173`
3. Press **F12** to open DevTools
4. Click **Console** tab

### Step 3: Login (1 minute)

Login with any test account:
- Influencer account OR
- Company account

### Step 4: Check Right Sidebar (1 minute)

Look for **"Suggested Matches"** section in the right sidebar.

### Step 5: Verify Console Logs (30 seconds)

You should see:
```
[useSuggestedMatches] Fetching suggestions for user: abc123
[SuggestionsService] Fetching suggested matches with limit: 8
[SuggestionsService] Raw response: {...}
[SuggestionsService] Response data length: 3
[SuggestionsService] Transformed suggestions: 3 [...]
[useSuggestedMatches] Received suggestions: 3
[SuggestedMatchesList] Render state: { suggestionsCount: 3, loading: false, error: null }
```

## ✅ Success Indicators

You'll know it's working when you see:

1. **Right Sidebar:**
   - "Suggested Matches" header
   - Refresh icon button
   - Match cards with:
     - Avatar with score badge
     - Name and location
     - Professional icons (👤 📊 💵 🏢)
     - Tier badge (Perfect/Excellent/Good/Fair)

2. **Console:**
   - No red errors
   - Green success logs
   - Positive suggestion count

3. **Interactions:**
   - Hover over card → lifts up with shadow
   - Click card → navigates to profile
   - Click refresh → reloads suggestions

## ❌ Troubleshooting

### Problem: "No suggestions available yet"

**Quick Fix:**
```typescript
// In: src/renderer/services/suggestions.service.ts
// Line ~40, change:
minScore: 50,  // Lower this to 30 or 40
```

### Problem: Icons show as boxes

**Quick Fix:**
```bash
npm install react-icons
npm run dev
```

### Problem: 401 Unauthorized

**Quick Fix:**
1. Logout and login again
2. Check backend is running
3. Verify JWT_SECRET in backend .env

### Problem: Backend not responding

**Quick Fix:**
```bash
cd backend
npm run typeorm migration:run
npm run start:dev
```

## 🎯 What to Test

### Basic Tests (2 minutes)
- [ ] Suggestions appear in right sidebar
- [ ] Icons are professional (not emojis)
- [ ] Scores display correctly
- [ ] Click card navigates to profile

### Advanced Tests (3 minutes)
- [ ] Refresh button works
- [ ] Hover effects work
- [ ] Keyboard navigation (Tab + Enter)
- [ ] Empty state (if no matches)
- [ ] Error state (stop backend)

## 📊 Expected Results

### For Influencer Users:
Should see **Company** matches with:
- Company name
- Industry
- Budget (💵 icon)
- Company size (🏢 icon)
- Match score

### For Company Users:
Should see **Influencer** matches with:
- Influencer name
- Niche
- Audience size (👤 icon)
- Engagement rate (📊 icon)
- Match score

## 🔍 Debug Mode

Enable detailed debugging:

```javascript
// In browser console:
localStorage.setItem('debug', 'true');
location.reload();
```

This will show even more detailed logs.

## 📱 Mobile Testing

Test responsive design:

1. Press **F12** in browser
2. Click **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Select mobile device
4. Right sidebar should hide on mobile

## 🎨 Visual Checklist

Match cards should have:
- ✅ White background
- ✅ Rounded corners
- ✅ Subtle border
- ✅ Avatar on left
- ✅ Score badge on avatar (colored)
- ✅ Name in bold
- ✅ Meta info in gray
- ✅ Stats with icons
- ✅ Tier badge at bottom
- ✅ Hover: lifts up, shadow appears
- ✅ Focus: blue outline

## 🚨 Common Mistakes

1. **Forgot to start backend** → No API responses
2. **Not logged in** → No user context
3. **No test data** → No matches to show
4. **Wrong port** → Check frontend runs on 5173
5. **Cache issues** → Clear browser cache

## 💡 Pro Tips

1. **Create Test Data:**
   ```sql
   -- Create influencer
   INSERT INTO users (email, password, role) VALUES 
   ('influencer@test.com', 'hashed_password', 'INFLUENCER');
   
   -- Create company
   INSERT INTO users (email, password, role) VALUES 
   ('company@test.com', 'hashed_password', 'COMPANY');
   ```

2. **Clear Cache:**
   ```javascript
   // In browser console:
   suggestionsService.clearCache();
   ```

3. **Force Refresh:**
   ```javascript
   // In browser console:
   location.reload(true);
   ```

## 📞 Need Help?

Check these files:
1. `SUGGESTED-MATCHES-INTEGRATION-TEST.md` - Detailed testing
2. `SUGGESTED-MATCHES-COMPLETE.md` - Feature overview
3. `SUGGESTED-MATCHES-FINAL-INTEGRATION-COMPLETE.md` - Full documentation

## ✨ Next Steps

Once working:
1. Test with real user data
2. Adjust minScore threshold
3. Customize UI colors/styles
4. Add more features
5. Deploy to production

---

**Time to Complete:** 5 minutes
**Difficulty:** Easy
**Status:** Production Ready ✅
