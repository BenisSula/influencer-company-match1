# 🧪 Match Card Icons - Quick Test Guide

## 🚀 Quick Start

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Open browser DevTools** (F12)

3. **Navigate to Matches page**

4. **Check console output**

## 🔍 What to Look For

### ✅ Success Indicators

You should see console logs like:
```
[MatchCard] Profile data for icons: {
  location: "New York, NY",
  audienceSize: 50000,
  engagementRate: 4.5,
  budget: null,
  budgetRange: { min: 1000, max: 5000 }
}

[MatchCard] Icon components: {
  hasLocationIcon: true,
  hasFollowersIcon: true,
  hasEngagementIcon: true,
  hasBudgetIcon: true
}
```

### ❌ Problem Indicators

#### Problem 1: All Profile Data is Null
```
[MatchCard] Profile data for icons: {
  location: null,
  audienceSize: null,
  engagementRate: null,
  budget: null,
  budgetRange: null
}
```
**Root Cause**: Missing profile data
**Solution**: Check database seed data or profile creation

#### Problem 2: Icon Components are Undefined
```
[MatchCard] Icon components: {
  hasLocationIcon: false,
  hasFollowersIcon: false,
  hasEngagementIcon: false,
  hasBudgetIcon: false
}
```
**Root Cause**: lucide-react not installed or icons not exported
**Solution**: 
```bash
npm install lucide-react
```

#### Problem 3: Icons Render but Not Visible
- Check DOM: Icons exist but have `display: none` or `opacity: 0`
- Check CSS: Conflicting styles overriding !important flags
- Check computed styles in DevTools

## 🔧 Quick Fixes

### Fix 1: Install lucide-react
```bash
npm install lucide-react
npm run build
```

### Fix 2: Verify Icon Configuration
Check `src/renderer/config/icons.ts`:
```typescript
import { MapPin, Users, TrendingUp, DollarSign } from 'lucide-react';

export const MatchCardIcons = {
  location: MapPin,
  followers: Users,
  engagement: TrendingUp,
  budget: DollarSign,
};
```

### Fix 3: Add Test Profile Data
If profile data is missing, add to database:
```sql
UPDATE influencer_profiles 
SET location = 'New York, NY',
    audience_size = 50000,
    engagement_rate = 4.5
WHERE id = 'your-profile-id';
```

## 📊 Visual Inspection

### Expected Appearance
Each stat item should show:
```
📍 New York, NY
👥 50K followers
📈 4.5% engagement
💰 $1K - $5K
```

### Icon Specifications
- Size: 20px × 20px
- Color: #1877F2 (Instagram blue)
- Style: Outlined (stroke, not fill)
- Alignment: Vertically centered with text

## 🐛 Debugging Steps

### Step 1: Check Console Logs
```javascript
// Look for these logs in console:
[MatchCard] Match data: {...}
[MatchCard] Profile data for icons: {...}
[MatchCard] Icon components: {...}
```

### Step 2: Inspect DOM
1. Right-click on match card
2. Select "Inspect Element"
3. Find `.stat-item` elements
4. Check if `.stat-icon` and `svg` elements exist

### Step 3: Check Computed Styles
1. Select `.stat-icon` element in DevTools
2. Go to "Computed" tab
3. Verify:
   - width: 20px
   - height: 20px
   - display: inline-flex
   - opacity: 1
   - visibility: visible
   - color: rgb(24, 119, 242)

### Step 4: Test Icon Import
Open browser console and run:
```javascript
// This should show the icon components
console.log(window.MatchCardIcons);
```

## 📝 Report Template

If icons still don't show, report with this info:

```
### Environment
- Browser: [Chrome/Firefox/Safari]
- Version: [Browser version]
- OS: [Windows/Mac/Linux]

### Console Output
[Paste console logs here]

### DOM Inspection
- .stat-icon elements exist: [Yes/No]
- SVG elements exist: [Yes/No]
- Computed width: [value]
- Computed height: [value]
- Computed display: [value]
- Computed opacity: [value]

### Profile Data
- location: [value or null]
- audienceSize: [value or null]
- engagementRate: [value or null]
- budget: [value or null]

### Icon Components
- hasLocationIcon: [true/false]
- hasFollowersIcon: [true/false]
- hasEngagementIcon: [true/false]
- hasBudgetIcon: [true/false]
```

## ✅ Success Criteria

Icons are working correctly when:
1. ✅ Console shows profile data with values
2. ✅ Console shows all icon components as true
3. ✅ DOM contains `.stat-icon` and `svg` elements
4. ✅ Icons are visible on the page (blue, 20px)
5. ✅ Icons align properly with text
6. ✅ No console errors

## 🎯 Next Steps

Once you've tested:
1. Share console output
2. Share screenshot of match card
3. Share DOM inspection results
4. I'll provide targeted fix based on findings

---

**Quick Test Time**: ~2 minutes
**Full Debug Time**: ~5 minutes
