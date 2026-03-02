---
inclusion: fileMatch
fileMatchPattern: "**/matching/**"
---

# Matching Algorithm Specification

This steering file is automatically included when working with matching-related code.

## Algorithm Overview

The matching algorithm calculates a compatibility score (0-100) between influencers and companies based on weighted factors.

## Scoring Factors & Weights

### 1. Niche Compatibility (30%)
- **Perfect Match (100)**: Exact niche overlap
- **Partial Match (50-80)**: Related niches
- **No Match (0)**: Completely different niches

**Implementation**:
```typescript
function calculateNicheScore(
  influencerNiches: string[],
  companyNiches: string[]
): number {
  const overlap = influencerNiches.filter(n => 
    companyNiches.includes(n)
  ).length;
  
  const maxNiches = Math.max(
    influencerNiches.length,
    companyNiches.length
  );
  
  return (overlap / maxNiches) * 100;
}
```

### 2. Location Compatibility (15%)
- **Same City (100)**: Exact location match
- **Same Region/State (70)**: Regional match
- **Same Country (40)**: Country match
- **Different Country (20)**: International
- **Remote/Flexible (100)**: Either party accepts remote

### 3. Budget Alignment (20%)
- **Within Range (100)**: Influencer rate within company budget
- **Slightly Above (70)**: 10-20% above budget
- **Significantly Above (30)**: 20-50% above budget
- **Far Above (0)**: >50% above budget

**Implementation**:
```typescript
function calculateBudgetScore(
  influencerRate: number,
  companyBudget: { min: number; max: number }
): number {
  if (influencerRate >= companyBudget.min && 
      influencerRate <= companyBudget.max) {
    return 100;
  }
  
  const overBudget = influencerRate - companyBudget.max;
  const percentOver = (overBudget / companyBudget.max) * 100;
  
  if (percentOver <= 10) return 90;
  if (percentOver <= 20) return 70;
  if (percentOver <= 50) return 30;
  return 0;
}
```

### 4. Platform Overlap (15%)
- **All Platforms Match (100)**: Company wants all influencer platforms
- **Partial Match (50-80)**: Some platforms overlap
- **No Match (0)**: No common platforms

### 5. Audience Size Compatibility (10%)
- **Perfect Fit (100)**: Audience size matches campaign needs
- **Close Fit (70-90)**: Within acceptable range
- **Mismatch (0-50)**: Too large or too small

**Tiers**:
- Nano: 1K-10K
- Micro: 10K-100K
- Mid: 100K-500K
- Macro: 500K-1M
- Mega: 1M+

### 6. Engagement Tier Match (10%)
- **High Engagement (100)**: >5% engagement rate
- **Medium Engagement (70)**: 2-5% engagement rate
- **Low Engagement (40)**: <2% engagement rate

## Final Score Calculation

```typescript
interface MatchWeights {
  niche: 0.30;
  location: 0.15;
  budget: 0.20;
  platform: 0.15;
  audienceSize: 0.10;
  engagement: 0.10;
}

function calculateFinalScore(scores: {
  niche: number;
  location: number;
  budget: number;
  platform: number;
  audienceSize: number;
  engagement: number;
}): number {
  return (
    scores.niche * 0.30 +
    scores.location * 0.15 +
    scores.budget * 0.20 +
    scores.platform * 0.15 +
    scores.audienceSize * 0.10 +
    scores.engagement * 0.10
  );
}
```

## Compatibility Tiers

- **High (80-100)**: Excellent match, highly recommended
- **Medium (50-79)**: Good match, worth considering
- **Low (0-49)**: Poor match, not recommended

## Performance Requirements

### Caching Strategy
- Cache match scores in Redis for 24 hours
- Invalidate cache when profile is updated
- Use cache key: `match:{influencerId}:{companyId}`

### Database Optimization
- Index columns: `niche`, `location`, `budget_min`, `budget_max`, `audience_size`
- Use composite indexes for common filter combinations
- Implement pagination (50 results per page)

### Query Optimization
```sql
-- Pre-filter before scoring
SELECT * FROM influencers
WHERE niche IN ('fashion', 'lifestyle')
  AND location = 'New York'
  AND audience_size BETWEEN 10000 AND 100000
  AND engagement_rate > 0.02
LIMIT 50;
```

## Filtering System

### Available Filters
- Niche (multi-select)
- Location (text/dropdown)
- Budget Range (min/max)
- Audience Size Range (min/max)
- Platform (multi-select)
- Engagement Rate (min)
- Verified Status (boolean)

### Filter Application
1. Apply filters to narrow dataset
2. Calculate scores for filtered results
3. Sort by score (descending)
4. Paginate results

## Testing Requirements

### Unit Tests
- Test each scoring function independently
- Test edge cases (empty arrays, null values)
- Test weight calculations
- Test tier classification

### Integration Tests
- Test full matching pipeline
- Test with real profile data
- Test filtering + scoring combination
- Test pagination

### Performance Tests
- Benchmark scoring for 1000+ profiles
- Test cache hit/miss scenarios
- Test query performance with indexes

## Algorithm Determinism

**Critical**: The algorithm must be deterministic.
- Same inputs must always produce same output
- No randomness or timestamps in scoring
- Consistent rounding (use Math.round)
- Stable sorting (include secondary sort by ID)

## Future Enhancements (Not MVP)

- Machine learning for personalized weights
- Historical collaboration success factor
- Sentiment analysis of past reviews
- Trending niche bonus
- Response rate factor