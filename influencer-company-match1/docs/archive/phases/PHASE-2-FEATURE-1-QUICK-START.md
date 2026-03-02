# Phase 2 Feature 1: Match Comparison - Quick Start Guide

## 🚀 How to Test

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd influencer-company-match1/backend
npm run start:dev

# Terminal 2 - Frontend
cd influencer-company-match1
npm run dev
```

### 2. Test the Feature

#### Step 1: Navigate to Matches Page
- Log in to the application
- Click "Matches" in the sidebar
- You should see match cards with "Compare" checkboxes

#### Step 2: Select Matches for Comparison
- Check the "Compare" checkbox on 2-3 match cards
- Notice the comparison bar appears at the bottom
- Try selecting a 4th match - it should be disabled with "Max 3 matches" hint

#### Step 3: View Comparison
- Click "Compare Matches" button in the bottom bar
- You'll be taken to `/matches/compare?ids=...`
- See the side-by-side table comparison

#### Step 4: Toggle Views
- Click "Chart View" button at the top
- See the radar chart visualization
- Toggle back to "Table View"

#### Step 5: Navigate Back
- Click "← Back to Matches" button
- Your selections should still be active
- Click "Clear" to reset

---

## 📁 Key Files

### Frontend Components
```
src/renderer/
├── components/
│   ├── ComparisonCheckbox/
│   │   ├── ComparisonCheckbox.tsx
│   │   └── ComparisonCheckbox.css
│   ├── ComparisonBar/
│   │   ├── ComparisonBar.tsx
│   │   └── ComparisonBar.css
│   └── MatchComparison/
│       ├── MatchComparison.tsx
│       ├── MatchComparison.css
│       ├── ComparisonTable.tsx
│       ├── ComparisonTable.css
│       ├── ComparisonChart.tsx
│       └── ComparisonChart.css
└── contexts/
    └── ComparisonContext.tsx
```

### Backend
```
backend/src/modules/matching/
└── dto/
    └── match-comparison.dto.ts
```

---

## 🎨 Visual Features

### Comparison Checkbox
- Located in top-right of each match card
- Shows "Compare" label
- Disabled when 3 matches already selected
- Shows "Max 3 matches" hint when disabled

### Comparison Bar
- Fixed at bottom of screen
- Slides up with animation
- Shows: "X matches selected"
- Shows: "Ready to compare" when 2+
- Buttons: "Clear" and "Compare Matches"
- Mobile responsive (stacks vertically)

### Table View
- Side-by-side columns for each match
- Avatar + name + role headers
- Overall score (large, color-coded)
- 6 factor breakdowns with progress bars
- "Best" badge on highest scores
- Color coding:
  - 80-100%: Green (Excellent)
  - 60-79%: Blue (Good)
  - 40-59%: Yellow (Fair)
  - 0-39%: Gray (Poor)

### Chart View
- Radar/spider chart
- 5 factors plotted
- 3 colored datasets (one per match)
- Interactive tooltips
- Legend with names and scores
- Responsive sizing

---

## 🔧 Technical Implementation

### State Management
```typescript
// ComparisonContext provides:
const {
  selectedMatches,      // string[] - Array of match IDs
  addToComparison,      // (id: string) => void
  removeFromComparison, // (id: string) => void
  clearComparison,      // () => void
  isInComparison,       // (id: string) => boolean
  canAddMore            // boolean - true if < 3 selected
} = useComparison();
```

### Routing
```typescript
// Comparison page route
/matches/compare?ids=match1,match2,match3

// Validates:
- Minimum 2 matches
- Fetches match data by IDs
- Shows error if < 2 matches
```

### Data Flow
```
1. User checks checkbox on MatchCard
   ↓
2. ComparisonContext updates selectedMatches
   ↓
3. ComparisonBar appears (if matches > 0)
   ↓
4. User clicks "Compare Matches"
   ↓
5. Navigate to /matches/compare?ids=...
   ↓
6. MatchComparison fetches match data
   ↓
7. Display table or chart view
```

---

## 🐛 Troubleshooting

### Checkbox Not Appearing
- Check MatchCard.tsx imports ComparisonCheckbox
- Verify ComparisonProvider wraps app in AppComponent.tsx

### Comparison Bar Not Showing
- Check Matches.tsx includes `<ComparisonBar />`
- Verify at least 1 match is selected

### Chart Not Rendering
- Verify chart.js and react-chartjs-2 are installed
- Check browser console for errors
- Ensure Chart.js components are registered

### Navigation Not Working
- Check route exists in AppComponent.tsx: `/matches/compare`
- Verify ComparisonProvider wraps BrowserRouter

---

## 📊 Expected Behavior

### Selection Limits
- ✅ Can select 1-3 matches
- ✅ 4th checkbox is disabled
- ✅ Shows "Max 3 matches" hint
- ✅ Can uncheck to select different matches

### Comparison Bar
- ✅ Appears when 1+ matches selected
- ✅ Hides when 0 matches selected
- ✅ "Compare" button disabled until 2+ selected
- ✅ "Clear" button clears all selections

### Comparison Page
- ✅ Requires 2+ matches (redirects if < 2)
- ✅ Loads match data by IDs
- ✅ Shows loading state
- ✅ Shows error if fetch fails
- ✅ Table view is default
- ✅ Can toggle to chart view
- ✅ Back button returns to matches

---

## 🎯 User Scenarios

### Scenario 1: Compare 2 Matches
1. Select 2 matches
2. Click "Compare Matches"
3. View side-by-side comparison
4. Identify which match is better for each factor

### Scenario 2: Compare 3 Matches
1. Select 3 matches
2. Click "Compare Matches"
3. Toggle to chart view
4. See visual representation of all factors

### Scenario 3: Change Selection
1. Select 3 matches
2. Uncheck 1 match
3. Check a different match
4. Compare new selection

### Scenario 4: Clear and Start Over
1. Select matches
2. Click "Clear" in comparison bar
3. All checkboxes unchecked
4. Comparison bar disappears

---

## 📱 Mobile Testing

### Responsive Breakpoints
- Desktop: Full layout
- Tablet (768px): Adjusted spacing
- Mobile (<768px): Stacked layout

### Mobile-Specific Features
- Comparison bar stacks vertically
- Table scrolls horizontally
- Chart height reduced
- Toggle buttons full width
- Touch-friendly tap targets

---

## ✅ Testing Checklist

### Visual Tests
- [ ] Checkbox appears on each match card
- [ ] Comparison bar slides up smoothly
- [ ] Table displays correctly
- [ ] Chart renders properly
- [ ] Colors are correct
- [ ] "Best" badges show on highest scores
- [ ] Mobile responsive

### Functional Tests
- [ ] Can select 1-3 matches
- [ ] 4th checkbox is disabled
- [ ] Comparison bar shows/hides correctly
- [ ] Compare button disabled until 2+ selected
- [ ] Navigation to comparison page works
- [ ] View toggle works
- [ ] Back button works
- [ ] Clear button works
- [ ] URL params correct

### Edge Cases
- [ ] Selecting 0 matches (bar should hide)
- [ ] Selecting 1 match (compare button disabled)
- [ ] Selecting 4+ matches (4th+ disabled)
- [ ] Navigating directly to /matches/compare (should redirect)
- [ ] Invalid match IDs in URL (should show error)
- [ ] Network error (should show error message)

---

## 🚀 Next Steps

1. **Test with Real Data**
   - Create test users
   - Generate matches
   - Test comparison with various scores

2. **Gather Feedback**
   - User testing sessions
   - Collect usability feedback
   - Identify pain points

3. **Monitor Analytics**
   - Track comparison page views
   - Monitor feature adoption
   - Measure time spent comparing

4. **Move to Feature 2**
   - User Preference Customization
   - Allow users to adjust factor weights
   - Personalize match scoring

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all dependencies installed
3. Ensure backend is running
4. Check network tab for API calls
5. Review this guide for troubleshooting

---

**Feature Status:** ✅ Ready for Testing
**Estimated Test Time:** 15-20 minutes
**Complexity:** Medium
**User Impact:** High

Happy testing! 🎉
