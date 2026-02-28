# 🎯 ROI Calculator Backend Integration - Implementation Status

**Last Updated:** February 22, 2026  
**Reference Document:** `ROI-CALCULATOR-BACKEND-INTEGRATION-PLAN.md`

---

## 📊 Overall Status: **PARTIALLY IMPLEMENTED (40%)**

The ROI Calculator has **basic backend integration** but is still using **mostly hardcoded data** in the frontend. The backend infrastructure exists but needs to be fully connected.

---

## ✅ WHAT'S IMPLEMENTED

### 1. **Database Tables Created** ✅
- ✅ `market_rates` - Stores niche-specific pricing data
- ✅ `campaign_performance_metrics` - Tracks actual campaign outcomes
- ✅ `roi_calculations_history` - Logs all calculator usage
- ✅ `industry_benchmarks` - Stores calculated industry averages

**Migration:** `1708025000000-CreateROICalculatorTables.ts`

### 2. **Backend Entities** ✅
- ✅ `MarketRate` entity created
- ✅ Initial seed data inserted (30 niche/tier combinations)
- ✅ Industry benchmarks seeded

**File:** `backend/src/modules/landing/entities/market-rate.entity.ts`

### 3. **Backend API Endpoints** ✅
- ✅ `GET /landing/market-rates` - Returns market rates
- ✅ `POST /landing/calculate-roi` - Calculates ROI with backend data
- ✅ ROI calculation uses **REAL conversion rates** from database

**Files:**
- `backend/src/modules/landing/landing.controller.ts`
- `backend/src/modules/landing/landing.service.ts`

### 4. **Backend ROI Calculation Logic** ⚠️ PARTIAL
- ✅ Queries real collaboration data from database
- ✅ Calculates niche-specific engagement rates
- ✅ Uses actual conversion rates from completed collaborations
- ✅ Caching implemented (15-minute TTL)
- ❌ Frontend still uses hardcoded `calculator.ts` file

---

## ❌ WHAT'S NOT IMPLEMENTED

### 1. **Niche-Specific Market Rates** ⚠️ PARTIAL (30%)

**Current State:**
- ✅ Database table exists with seed data
- ✅ Backend queries real collaboration data
- ❌ Frontend still uses hardcoded `nicheRates` object

**Frontend File:** `src/renderer/data/landing/calculator.ts`
```typescript
// ❌ STILL HARDCODED
export const nicheRates = {
  fashion: { min: 10, max: 25, avgEngagement: 3.5 },
  tech: { min: 15, max: 35, avgEngagement: 2.8 },
  // ... more hardcoded data
};
```

**What's Needed:**
1. Create frontend service to fetch market rates from backend
2. Replace hardcoded `nicheRates` with API call
3. Update `calculateROI()` function to use backend data
4. Add loading states and error handling

---

### 2. **Industry Averages** ⚠️ PARTIAL (40%)

**Current State:**
- ✅ Backend calculates from real data
- ✅ Database table exists
- ❌ Frontend still uses hardcoded values

**Frontend File:** `src/renderer/data/landing/calculator.ts`
```typescript
// ❌ STILL HARDCODED
industryAverages: {
  engagementRate: 3.5,
  conversionRate: 2.0,
  averageOrderValue: 50,
  reachMultiplier: 2.5,
}
```

**What's Needed:**
1. Fetch industry averages from backend API
2. Replace hardcoded values in calculator
3. Update calculations to use dynamic data

---

### 3. **Platform Fee Comparison** ✅ WORKING

**Status:** This is correctly implemented and working.

---

### 4. **Estimated Reach Calculation** ⚠️ BASIC FORMULA (50%)

**Current State:**
- ✅ Basic formula exists
- ❌ Not using actual influencer profile data
- ❌ Not factoring in niche-specific reach patterns
- ❌ Not using historical performance data

**Current Formula:**
```typescript
estimatedReach = followers * (engagementRate / 100) * reachMultiplier
```

**What's Needed:**
1. Query actual influencer profiles from database
2. Calculate niche-specific reach multipliers
3. Factor in platform-specific algorithms
4. Use historical campaign performance data

---

### 5. **Conversion Rate Estimation** ❌ NOT INTEGRATED (0%)

**Current State:**
- ✅ Backend calculates from `collaboration_outcomes` table
- ❌ Frontend uses static 2% conversion rate

**What's Needed:**
1. Fetch real conversion rates from backend
2. Factor in niche-specific conversion patterns
3. Consider campaign type (awareness vs sales)
4. Use historical campaign data

---

### 6. **Revenue Projection** ❌ NOT INTEGRATED (0%)

**Current State:**
- ❌ Uses simple formula: `conversions * averageOrderValue`
- ❌ Not pulling from actual collaboration results

**What's Needed:**
1. Query `collaboration_outcomes` table
2. Calculate niche-specific AOV
3. Factor in campaign objectives
4. Use real performance metrics

---

### 7. **Savings Calculation** ✅ WORKING

**Status:** This is correctly implemented and working.

---

### 8. **ROI Breakdown** ⚠️ BASIC (30%)

**Current State:**
- ✅ Shows basic fee comparison
- ❌ No detailed cost breakdown
- ❌ No time-to-ROI calculation
- ❌ No opportunity cost analysis

**What's Needed:**
1. Add detailed cost breakdown
2. Calculate time-to-ROI
3. Include opportunity cost
4. Factor in campaign management time

---

### 9. **Personalized Recommendations** ❌ NOT IMPLEMENTED (0%)

**Current State:**
- ❌ Generic results for all users
- ❌ No user-specific insights

**What's Needed:**
1. Factor in user's niche
2. Consider user's follower count tier
3. Analyze user's engagement patterns
4. Provide niche-specific insights

---

### 10. **Historical Performance Data** ❌ NOT INTEGRATED (0%)

**Current State:**
- ✅ `roi_calculations_history` table exists
- ❌ Not tracking calculations
- ❌ Not storing actual campaign outcomes
- ❌ Not comparing predictions vs actuals

**What's Needed:**
1. Track all ROI calculations
2. Store actual campaign outcomes
3. Compare predictions vs actuals
4. Improve algorithm accuracy over time

---

## 🔧 IMPLEMENTATION PLAN

### **Phase 1: Connect Frontend to Backend** (HIGH PRIORITY)

#### Step 1.1: Create Frontend Service
**File:** `src/renderer/services/roi-calculator.service.ts`

```typescript
import { apiClient } from './api-client';

export interface MarketRates {
  influencerRates: {
    micro: { min: number; max: number; avg: number };
    mid: { min: number; max: number; avg: number };
    macro: { min: number; max: number; avg: number };
  };
  nicheSpecificRates: Record<string, any>;
  platformFees: {
    traditional: number;
    ourPlatform: number;
  };
  industryAverages: {
    engagementRate: number;
    conversionRate: number;
    averageOrderValue: number;
    reachMultiplier: number;
  };
  nicheEngagementRates: Record<string, { rate: number; sampleSize: number }>;
  dataSource: string;
  lastUpdated: string;
}

export interface ROICalculationInput {
  campaignBudget: number;
  followers: number;
  engagementRate: number;
  niche?: string;
  postsPerMonth?: number;
}

export interface ROICalculationResult {
  ourPlatformCost: number;
  traditionalCost: number;
  savings: number;
  savingsPercentage: number;
  estimatedReach: number;
  conversions: number;
  revenue: number;
  roi: number;
  breakdown: {
    platformFee: number;
    traditionalFee: number;
    engagementRate: number;
    conversionRate: number;
    niche: string;
    postsPerMonth: number;
    dataSource: string;
  };
}

class ROICalculatorService {
  async getMarketRates(): Promise<MarketRates> {
    const response = await apiClient.get('/landing/market-rates');
    return response.data;
  }

  async calculateROI(input: ROICalculationInput): Promise<ROICalculationResult> {
    const response = await apiClient.post('/landing/calculate-roi', input);
    return response.data;
  }

  async trackCalculation(input: ROICalculationInput, result: ROICalculationResult): Promise<void> {
    // Track calculation for analytics
    await apiClient.post('/landing/analytics/track', {
      section: 'roi-calculator',
      action: 'calculation',
      metadata: {
        input,
        result,
        timestamp: Date.now()
      }
    });
  }
}

export const roiCalculatorService = new ROICalculatorService();
```

#### Step 1.2: Update ROI Calculator Component
**File:** `src/renderer/components/Landing/ROICalculator.tsx`

Replace hardcoded calculation with backend service:

```typescript
import { roiCalculatorService } from '../../services/roi-calculator.service';

// Inside component:
const [marketRates, setMarketRates] = useState<MarketRates | null>(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  // Fetch market rates on mount
  roiCalculatorService.getMarketRates()
    .then(setMarketRates)
    .catch(console.error);
}, []);

const handleCalculate = async () => {
  setLoading(true);
  try {
    const result = await roiCalculatorService.calculateROI({
      campaignBudget: inputs.budget,
      followers: inputs.followerCount,
      engagementRate: inputs.engagementRate,
      niche: inputs.niche,
      postsPerMonth: inputs.postsPerMonth
    });
    
    setResults(result);
    
    // Track calculation
    await roiCalculatorService.trackCalculation(inputs, result);
  } catch (error) {
    console.error('ROI calculation failed:', error);
    // Show error message to user
  } finally {
    setLoading(false);
  }
};
```

#### Step 1.3: Remove Hardcoded Data
**File:** `src/renderer/data/landing/calculator.ts`

```typescript
// ❌ DELETE THIS FILE OR MARK AS DEPRECATED
// All calculation logic should now use backend API
```

---

### **Phase 2: Enhanced Calculations** (MEDIUM PRIORITY)

#### Step 2.1: Add Personalized Recommendations

**Backend:** Add new endpoint
```typescript
// landing.controller.ts
@Post('calculate-roi/personalized')
@UseGuards(JwtAuthGuard)
async calculatePersonalizedROI(@Body() dto: ROICalculationDto, @CurrentUser() user: User) {
  return await this.landingService.calculatePersonalizedROI(dto, user);
}
```

**Backend Service:**
```typescript
// landing.service.ts
async calculatePersonalizedROI(dto: ROICalculationDto, user: User) {
  // Get user's profile data
  const profile = await this.getInfluencerProfile(user.id);
  
  // Use user's actual metrics
  const actualFollowers = profile.instagramFollowers || dto.followers;
  const actualEngagement = profile.instagramEngagementRate || dto.engagementRate;
  const actualNiche = profile.niche || dto.niche;
  
  // Calculate with personalized data
  const result = await this.calculateROI({
    ...dto,
    followers: actualFollowers,
    engagementRate: actualEngagement,
    niche: actualNiche
  });
  
  // Add personalized insights
  return {
    ...result,
    insights: this.generatePersonalizedInsights(profile, result),
    recommendations: this.generateRecommendations(profile, result)
  };
}
```

#### Step 2.2: Track Historical Performance

**Backend:** Save calculations to history
```typescript
// landing.service.ts
async calculateROI(dto: ROICalculationDto, userId?: string) {
  const result = await this.performROICalculation(dto);
  
  // Save to history
  await this.roiHistoryRepository.save({
    userId,
    visitorId: dto.visitorId,
    inputFollowers: dto.followers,
    inputEngagementRate: dto.engagementRate,
    inputNiche: dto.niche,
    inputPostsPerMonth: dto.postsPerMonth,
    calculatedBudget: result.ourPlatformCost,
    calculatedROI: result.roi,
    calculatedReach: result.estimatedReach,
    calculatedConversions: result.conversions,
    calculatedRevenue: result.revenue
  });
  
  return result;
}
```

#### Step 2.3: Compare Predictions vs Actuals

**Backend:** Add comparison endpoint
```typescript
// landing.controller.ts
@Get('roi-accuracy')
@UseGuards(JwtAuthGuard)
async getROIAccuracy(@CurrentUser() user: User) {
  return await this.landingService.compareROIPredictions(user.id);
}
```

**Backend Service:**
```typescript
// landing.service.ts
async compareROIPredictions(userId: string) {
  // Get user's ROI predictions
  const predictions = await this.roiHistoryRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' },
    take: 10
  });
  
  // Get user's actual campaign results
  const actuals = await this.campaignPerformanceRepository.find({
    where: { userId },
    order: { recordedAt: 'DESC' },
    take: 10
  });
  
  // Compare and calculate accuracy
  const accuracy = this.calculateAccuracy(predictions, actuals);
  
  return {
    predictions,
    actuals,
    accuracy,
    insights: this.generateAccuracyInsights(accuracy)
  };
}
```

---

### **Phase 3: Advanced Features** (LOW PRIORITY)

#### Step 3.1: Real-Time Market Rate Updates

**Backend:** Add scheduled job to update market rates
```typescript
// market-rates-update.service.ts
@Injectable()
export class MarketRatesUpdateService {
  @Cron('0 0 * * *') // Daily at midnight
  async updateMarketRates() {
    // Query recent collaborations
    const recentCollabs = await this.getRecentCollaborations();
    
    // Calculate new rates by niche
    const newRates = this.calculateRatesByNiche(recentCollabs);
    
    // Update database
    await this.updateRatesInDatabase(newRates);
    
    // Invalidate cache
    await this.cacheManager.del('landing:market-rates');
  }
}
```

#### Step 3.2: A/B Testing for ROI Calculator

**Backend:** Track different calculation methods
```typescript
// landing.service.ts
async calculateROI(dto: ROICalculationDto, variant?: 'A' | 'B') {
  const method = variant || this.getABTestVariant();
  
  const result = method === 'A' 
    ? await this.calculateROIMethodA(dto)
    : await this.calculateROIMethodB(dto);
  
  // Track which method was used
  await this.trackABTest(method, dto, result);
  
  return result;
}
```

---

## 📋 TESTING CHECKLIST

### Backend Testing
- [ ] Test `GET /landing/market-rates` endpoint
- [ ] Test `POST /landing/calculate-roi` endpoint
- [ ] Verify real data is being used (not fallback)
- [ ] Test caching behavior
- [ ] Test with different niches
- [ ] Test with different follower counts
- [ ] Test error handling

### Frontend Testing
- [ ] Test ROI calculator loads market rates
- [ ] Test calculation uses backend API
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test with different inputs
- [ ] Test caching behavior
- [ ] Test offline behavior

### Integration Testing
- [ ] Test end-to-end calculation flow
- [ ] Test data consistency
- [ ] Test performance under load
- [ ] Test cache invalidation
- [ ] Test with real user data

---

## 🚀 QUICK START IMPLEMENTATION

### Immediate Actions (1-2 hours)

1. **Create ROI Calculator Service**
   ```bash
   # Create new service file
   touch src/renderer/services/roi-calculator.service.ts
   ```

2. **Update ROI Calculator Component**
   - Replace `calculateROI()` function
   - Add API calls
   - Add loading states

3. **Test Backend Endpoints**
   ```bash
   # Test market rates endpoint
   curl http://localhost:3000/landing/market-rates
   
   # Test ROI calculation
   curl -X POST http://localhost:3000/landing/calculate-roi \
     -H "Content-Type: application/json" \
     -d '{"campaignBudget":1000,"followers":10000,"engagementRate":3.5,"niche":"fashion","postsPerMonth":12}'
   ```

4. **Verify Data Flow**
   - Check backend logs
   - Verify database queries
   - Check cache behavior

---

## 📊 CURRENT vs TARGET STATE

| Feature | Current | Target | Priority |
|---------|---------|--------|----------|
| Market Rates | Hardcoded | Database | HIGH |
| Industry Averages | Hardcoded | Database | HIGH |
| Conversion Rates | Static 2% | Real Data | HIGH |
| Reach Calculation | Basic Formula | Advanced | MEDIUM |
| Revenue Projection | Simple | Real Data | MEDIUM |
| Personalization | None | User-Specific | MEDIUM |
| Historical Tracking | None | Full Tracking | LOW |
| A/B Testing | None | Implemented | LOW |

---

## 🎯 SUCCESS METRICS

### Phase 1 Success Criteria
- ✅ Frontend uses backend API for all calculations
- ✅ No hardcoded data in frontend
- ✅ Real market rates from database
- ✅ Real conversion rates from collaborations
- ✅ Proper error handling and loading states

### Phase 2 Success Criteria
- ✅ Personalized recommendations for logged-in users
- ✅ Historical tracking of all calculations
- ✅ Comparison of predictions vs actuals
- ✅ Improved accuracy over time

### Phase 3 Success Criteria
- ✅ Automated market rate updates
- ✅ A/B testing framework
- ✅ Advanced analytics and insights
- ✅ Machine learning predictions

---

## 📝 NOTES

1. **Backend is Ready**: The backend infrastructure is fully implemented and working. The main issue is that the frontend is not using it.

2. **Quick Win**: Connecting the frontend to the backend API is a quick win that will immediately improve accuracy.

3. **Data Quality**: The backend queries real data from the database, but the quality depends on having actual collaboration data.

4. **Caching**: The backend implements aggressive caching (15 minutes for ROI calculations, 1 hour for market rates) to improve performance.

5. **Fallback Behavior**: The backend has fallback values if database queries fail, ensuring the calculator always works.

---

## 🔗 RELATED FILES

### Frontend
- `src/renderer/components/Landing/ROICalculator.tsx` - Main component
- `src/renderer/data/landing/calculator.ts` - **NEEDS TO BE REPLACED**
- `src/renderer/services/roi-calculator.service.ts` - **NEEDS TO BE CREATED**

### Backend
- `backend/src/modules/landing/landing.controller.ts` - API endpoints
- `backend/src/modules/landing/landing.service.ts` - Business logic
- `backend/src/modules/landing/entities/market-rate.entity.ts` - Database entity
- `backend/src/database/migrations/1708025000000-CreateROICalculatorTables.ts` - Database schema

---

**Status:** Ready for Phase 1 implementation  
**Estimated Time:** 2-4 hours for Phase 1  
**Next Step:** Create `roi-calculator.service.ts` and update `ROICalculator.tsx`
