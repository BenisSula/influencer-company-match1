# Matching Score - Real Data Investigation 🔍

## Problem Identified

The matching system is currently using **placeholder values** instead of calculating real compatibility scores from actual user data.

---

## Current Issues

### Backend (`matching.service.ts`)

**Problem**: `getMatchFactors()` returns minimal data
```typescript
private getMatchFactors(user1: User, user2: User): any {
  return {
    nicheMatch: user1.niche && user2.industry ? user1.niche.toLowerCase().includes(user2.industry.toLowerCase()) : false,
    audienceSize: user1.audienceSize || 0,
    budget: user2.budget || 0,
    engagementRate: user1.engagementRate || 0
  };
}
```

**Issues**:
- Returns boolean for niche (not percentage)
- Returns raw numbers (not compatibility scores)
- No location compatibility calculation
- No platform overlap calculation
- No budget alignment calculation
- No audience size match calculation

### Frontend (`matching.service.ts`)

**Problem**: `transformMatch()` uses hardcoded placeholders
```typescript
breakdown: {
  nicheCompatibility: backendMatch.factors?.nicheMatch ? 100 : 50,  // ❌ Placeholder
  locationCompatibility: 75,  // ❌ Hardcoded
  budgetAlignment: backendMatch.factors?.budget ? 80 : 50,  // ❌ Placeholder
  platformOverlap: 70,  // ❌ Hardcoded
  audienceSizeMatch: backendMatch.factors?.audienceSize ? 85 : 50,  // ❌ Placeholder
  engagementTierMatch: backendMatch.factors?.engagementRate ? 90 : 50,  // ❌ Placeholder
}
```

**Issues**:
- All values are hardcoded or simple boolean checks
- No real calculation based on actual data
- Misleading to users (shows fake compatibility)
- Not useful for decision-making

---

## Solution: Real Score Calculation

### Backend Changes

Need to implement proper scoring algorithms for each factor:

#### 1. Niche/Industry Compatibility (0-100%)
```typescript
calculateNicheCompatibility(influencerNiche: string, companyIndustry: string): number {
  if (!influencerNiche || !companyIndustry) return 0;
  
  const niche = influencerNiche.toLowerCase();
  const industry = companyIndustry.toLowerCase();
  
  // Exact match
  if (niche === industry) return 100;
  
  // Partial match (contains)
  if (niche.includes(industry) || industry.includes(niche)) return 80;
  
  // Related industries (could use a mapping)
  const relatedIndustries = {
    'food': ['restaurant', 'cooking', 'recipe', 'culinary'],
    'fashion': ['clothing', 'style', 'apparel', 'beauty'],
    'tech': ['technology', 'software', 'gadget', 'digital'],
    // ... more mappings
  };
  
  // Check for related matches
  for (const [key, related] of Object.entries(relatedIndustries)) {
    if (niche.includes(key) && related.some(r => industry.includes(r))) {
      return 60;
    }
  }
  
  return 30; // No match
}
```

#### 2. Location Compatibility (0-100%)
```typescript
calculateLocationCompatibility(location1: string, location2: string): number {
  if (!location1 || !location2) return 50; // Unknown
  
  const loc1 = location1.toLowerCase();
  const loc2 = location2.toLowerCase();
  
  // Exact match (same city)
  if (loc1 === loc2) return 100;
  
  // Same state/region
  if (this.isSameRegion(loc1, loc2)) return 80;
  
  // Same country
  if (this.isSameCountry(loc1, loc2)) return 60;
  
  // Different country
  return 40;
}
```

#### 3. Budget Alignment (0-100%)
```typescript
calculateBudgetAlignment(influencerRate: number, companyBudget: number): number {
  if (!influencerRate || !companyBudget) return 50; // Unknown
  
  const ratio = companyBudget / influencerRate;
  
  // Perfect alignment (budget is 1-2x the rate)
  if (ratio >= 1 && ratio <= 2) return 100;
  
  // Good alignment (budget is 0.8-3x the rate)
  if (ratio >= 0.8 && ratio <= 3) return 80;
  
  // Fair alignment (budget is 0.5-5x the rate)
  if (ratio >= 0.5 && ratio <= 5) return 60;
  
  // Poor alignment
  if (ratio < 0.5) return 30; // Budget too low
  return 40; // Budget too high (might be suspicious)
}
```

#### 4. Platform Overlap (0-100%)
```typescript
calculatePlatformOverlap(platforms1: string[], platforms2: string[]): number {
  if (!platforms1?.length || !platforms2?.length) return 50; // Unknown
  
  const set1 = new Set(platforms1.map(p => p.toLowerCase()));
  const set2 = new Set(platforms2.map(p => p.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  // Jaccard similarity
  const overlap = (intersection.size / union.size) * 100;
  
  return Math.round(overlap);
}
```

#### 5. Audience Size Match (0-100%)
```typescript
calculateAudienceSizeMatch(audienceSize: number, targetAudience: number): number {
  if (!audienceSize || !targetAudience) return 50; // Unknown
  
  const ratio = audienceSize / targetAudience;
  
  // Perfect match (within 20%)
  if (ratio >= 0.8 && ratio <= 1.2) return 100;
  
  // Good match (within 50%)
  if (ratio >= 0.5 && ratio <= 1.5) return 80;
  
  // Fair match (within 2x)
  if (ratio >= 0.5 && ratio <= 2) return 60;
  
  // Poor match
  return 40;
}
```

#### 6. Engagement Tier Match (0-100%)
```typescript
calculateEngagementTierMatch(engagementRate: number): number {
  if (!engagementRate) return 50; // Unknown
  
  // Excellent engagement (>5%)
  if (engagementRate >= 5) return 100;
  
  // Good engagement (3-5%)
  if (engagementRate >= 3) return 80;
  
  // Fair engagement (1-3%)
  if (engagementRate >= 1) return 60;
  
  // Poor engagement (<1%)
  return 40;
}
```

---

## Implementation Plan

### Phase 1: Backend Enhancement

**File**: `backend/src/modules/matching/matching.service.ts`

1. Add helper methods for each compatibility factor
2. Update `getMatchFactors()` to return percentage scores
3. Update `calculateMatchScore()` to use weighted average
4. Add proper data validation

**New Method**:
```typescript
private calculateDetailedMatchFactors(user1: User, user2: User): any {
  // Determine roles
  const influencer = user1.role === UserRole.INFLUENCER ? user1 : user2;
  const company = user1.role === UserRole.COMPANY ? user1 : user2;
  
  return {
    nicheCompatibility: this.calculateNicheCompatibility(
      influencer.niche,
      company.industry
    ),
    locationCompatibility: this.calculateLocationCompatibility(
      influencer.location,
      company.location
    ),
    budgetAlignment: this.calculateBudgetAlignment(
      influencer.audienceSize,
      company.budget
    ),
    platformOverlap: this.calculatePlatformOverlap(
      influencer.platforms,
      company.platforms
    ),
    audienceSizeMatch: this.calculateAudienceSizeMatch(
      influencer.audienceSize,
      company.targetAudience || company.budget * 1000 // Estimate
    ),
    engagementTierMatch: this.calculateEngagementTierMatch(
      influencer.engagementRate
    ),
  };
}
```

### Phase 2: Frontend Simplification

**File**: `src/renderer/services/matching.service.ts`

1. Remove hardcoded placeholder values
2. Use backend-calculated scores directly
3. Add fallback for missing data

**Updated Transform**:
```typescript
private transformMatch = (backendMatch: any): Match => {
  const score = backendMatch.score || 0;
  
  return {
    id: backendMatch.id || backendMatch.user?.id || '',
    profile: { /* ... */ },
    score,
    tier: this.calculateTier(score),
    breakdown: backendMatch.factors || {
      // Fallback if backend doesn't provide factors
      nicheCompatibility: 50,
      locationCompatibility: 50,
      budgetAlignment: 50,
      platformOverlap: 50,
      audienceSizeMatch: 50,
      engagementTierMatch: 50,
    }
  };
};
```

### Phase 3: Enhanced Scoring Algorithm

**Weighted Average** for overall score:
```typescript
private calculateMatchScore(user1: User, user2: User): number {
  const factors = this.calculateDetailedMatchFactors(user1, user2);
  
  // Weighted average (adjust weights based on importance)
  const weights = {
    nicheCompatibility: 0.25,      // 25% - Most important
    budgetAlignment: 0.20,          // 20% - Very important
    platformOverlap: 0.15,          // 15% - Important
    engagementTierMatch: 0.15,      // 15% - Important
    audienceSizeMatch: 0.15,        // 15% - Important
    locationCompatibility: 0.10,    // 10% - Less important (remote work)
  };
  
  const score = 
    factors.nicheCompatibility * weights.nicheCompatibility +
    factors.budgetAlignment * weights.budgetAlignment +
    factors.platformOverlap * weights.platformOverlap +
    factors.engagementTierMatch * weights.engagementTierMatch +
    factors.audienceSizeMatch * weights.audienceSizeMatch +
    factors.locationCompatibility * weights.locationCompatibility;
  
  return Math.round(score);
}
```

---

## Data Requirements

### Influencer Profile Must Have:
- ✅ Niche (string)
- ✅ Location (string)
- ✅ Audience size (number)
- ✅ Engagement rate (number)
- ✅ Platforms (array)
- ⚠️ Rate/pricing (optional)

### Company Profile Must Have:
- ✅ Industry (string)
- ✅ Location (string)
- ✅ Budget (number)
- ✅ Platforms (array)
- ⚠️ Target audience size (optional)

---

## Testing Strategy

### Unit Tests
1. Test each calculation method with various inputs
2. Test edge cases (null, undefined, empty)
3. Test boundary conditions (0, 100, negative)

### Integration Tests
1. Test full matching flow with real data
2. Verify scores are consistent
3. Verify breakdown adds up correctly

### Manual Tests
1. Create test users with known data
2. Verify scores make sense
3. Compare with expected results

---

## Expected Improvements

### Before (Placeholders)
- Niche Match: 50% or 100% (boolean)
- Location: Always 75%
- Budget: 50% or 80% (boolean)
- Platform: Always 70%
- Audience: 50% or 85% (boolean)
- Engagement: 50% or 90% (boolean)

### After (Real Calculation)
- Niche Match: 0-100% (based on similarity)
- Location: 40-100% (based on proximity)
- Budget: 30-100% (based on alignment)
- Platform: 0-100% (based on overlap)
- Audience: 40-100% (based on match)
- Engagement: 40-100% (based on rate)

---

## Benefits

1. **Accurate Matching**: Real scores based on actual data
2. **Better Decisions**: Users can trust the compatibility scores
3. **Transparency**: Clear why matches are good or bad
4. **Improved UX**: Meaningful information, not placeholders
5. **Higher Engagement**: Users spend more time on good matches
6. **Better Outcomes**: More successful collaborations

---

## Next Steps

1. ✅ Identify the problem (DONE)
2. ⏳ Implement backend calculation methods
3. ⏳ Update frontend to use real scores
4. ⏳ Test with real data
5. ⏳ Deploy and monitor

---

**Status**: Investigation Complete
**Priority**: HIGH (Critical for user trust)
**Complexity**: Medium
**Impact**: HIGH (Core feature)
**Estimated Time**: 3-4 hours
