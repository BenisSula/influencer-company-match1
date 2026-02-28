# 🚨 ROI Calculator - Critical Issues Found

**Date:** February 22, 2026  
**Status:** BROKEN - Needs Immediate Fix

---

## ❌ CRITICAL ISSUE: Missing Repository Injections

The `landing.service.ts` file references repositories that are **NOT injected** in the constructor, causing the service to fail.

### Missing Repositories

1. **`featureCategoriesRepository`** - Used in `getFeatures()` method
2. **`platformComparisonsRepository`** - Used in `getComparisonData()` method

### Error Location

**File:** `backend/src/modules/landing/landing.service.ts`

**Lines 820-926:**
```typescript
// ❌ BROKEN CODE
async getFeatures() {
  // ...
  const categories = await this.featureCategoriesRepository.find({
    // This will throw: "Cannot read property 'find' of undefined"
  });
}

async getComparisonData() {
  // ...
  const comparisons = await this.platformComparisonsRepository.find({
    // This will throw: "Cannot read property 'find' of undefined"
  });
}
```

### Constructor (Missing Injections)

**Current Constructor:**
```typescript
constructor(
  @InjectRepository(LandingStatistic)
  private statisticsRepository: Repository<LandingStatistic>,
  @InjectRepository(Testimonial)
  private testimonialsRepository: Repository<Testimonial>,
  @InjectRepository(LandingAnalytics)
  private analyticsRepository: Repository<LandingAnalytics>,
  @InjectRepository(LandingActivity)
  private activitiesRepository: Repository<LandingActivity>,
  @InjectRepository(User)
  private userRepository: Repository<User>,
  @InjectRepository(Connection)
  private connectionRepository: Repository<Connection>,
  @InjectRepository(UserSettings)
  private userSettingsRepository: Repository<UserSettings>,
  @InjectRepository(ProfileReview)
  private profileReviewRepository: Repository<ProfileReview>,
  @Inject(CACHE_MANAGER) private cacheManager: Cache,
  private eventEmitter: EventEmitter2,
  private platformMetricsService: PlatformMetricsService,
) {}
```

**Missing:**
- ❌ `featureCategoriesRepository`
- ❌ `platformComparisonsRepository`

---

## 🔧 IMMEDIATE FIX REQUIRED

### Option 1: Remove Broken Methods (RECOMMENDED)

Since these methods have fallback implementations and are not critical for ROI calculator:

```typescript
// landing.service.ts

// ❌ DELETE OR COMMENT OUT
async getFeatures() {
  // This method is broken - use fallback only
  return this.getFallbackFeatures();
}

async getComparisonData() {
  // This method is broken - use fallback only
  return this.getFallbackComparisons();
}
```

### Option 2: Create Missing Entities and Repositories

If you want to implement these features properly:

1. **Create Entities:**
   - `FeatureCategory.entity.ts`
   - `Feature.entity.ts`
   - `FeatureBenefit.entity.ts`
   - `FeatureMetric.entity.ts`
   - `PlatformComparison.entity.ts`

2. **Create Migration:**
   - `CreateFeaturesTables.ts`

3. **Inject Repositories:**
   ```typescript
   constructor(
     // ... existing repositories ...
     @InjectRepository(FeatureCategory)
     private featureCategoriesRepository: Repository<FeatureCategory>,
     @InjectRepository(PlatformComparison)
     private platformComparisonsRepository: Repository<PlatformComparison>,
   ) {}
   ```

---

## ✅ ROI CALCULATOR STATUS (After Fix)

### What Works
- ✅ `GET /landing/market-rates` - Returns market rates from database
- ✅ `POST /landing/calculate-roi` - Calculates ROI with real data
- ✅ Database tables exist and are seeded
- ✅ Caching is implemented
- ✅ Real conversion rates from collaborations

### What's Broken
- ❌ `GET /landing/features` - Will crash if called
- ❌ `GET /landing/comparisons` - Will crash if called

### Impact on ROI Calculator
- ✅ **ROI Calculator itself is NOT affected** - it uses different endpoints
- ❌ **Landing page features section** may be broken
- ❌ **Platform comparison section** may be broken

---

## 🎯 RECOMMENDED ACTION PLAN

### Step 1: Quick Fix (5 minutes)
Replace broken methods with fallback-only versions:

```typescript
// backend/src/modules/landing/landing.service.ts

async getFeatures() {
  const cacheKey = 'landing:features';
  
  try {
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Use fallback data only (no database query)
    const result = this.getFallbackFeatures();
    
    await this.cacheManager.set(cacheKey, result, 300 * 1000);
    return result;
  } catch (error) {
    this.logger.error('Failed to fetch features', error);
    return this.getFallbackFeatures();
  }
}

async getComparisonData() {
  const cacheKey = 'landing:comparisons';
  
  try {
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Use fallback data only (no database query)
    const result = this.getFallbackComparisons();
    
    await this.cacheManager.set(cacheKey, result, 300 * 1000);
    return result;
  } catch (error) {
    this.logger.error('Failed to fetch comparisons', error);
    return this.getFallbackComparisons();
  }
}
```

### Step 2: Update Controller (2 minutes)
The controller already uses `platformMetricsService` for features, which is good:

```typescript
// backend/src/modules/landing/landing.controller.ts

@Get('features')
@Public()
async getFeatures() {
  // ✅ This is correct - uses platformMetricsService
  return await this.platformMetricsService.getAllPlatformMetrics();
}

@Get('comparisons')
@Public()
async getComparisons() {
  // ✅ This returns static data - no database needed
  return [
    {
      feature: 'AI-Powered Matching',
      icmatch: '89% accuracy',
      competitor1: 'Basic filters',
      competitor2: '78% accuracy',
      competitor3: 'Manual search'
    },
    // ... more static data
  ];
}
```

**Conclusion:** The controller is fine. The broken methods in the service are not being called.

---

## 📊 FINAL STATUS

### ROI Calculator Backend Integration

| Component | Status | Notes |
|-----------|--------|-------|
| Database Tables | ✅ Working | All tables created and seeded |
| Market Rates API | ✅ Working | Returns real data from database |
| ROI Calculation API | ✅ Working | Uses real conversion rates |
| Caching | ✅ Working | 15-minute TTL for calculations |
| Frontend Integration | ❌ Not Connected | Still uses hardcoded data |
| Features API | ⚠️ Broken | Uses fallback data only |
| Comparisons API | ✅ Working | Returns static data |

### Critical Path for ROI Calculator

1. ✅ Backend API is working
2. ✅ Database is populated
3. ✅ Calculations use real data
4. ❌ **Frontend needs to be connected** (see `ROI-CALCULATOR-IMPLEMENTATION-STATUS.md`)

---

## 🚀 NEXT STEPS

1. **Apply Quick Fix** (5 minutes)
   - Update `getFeatures()` and `getComparisonData()` methods
   - Remove database queries that reference missing repositories

2. **Test Backend** (5 minutes)
   ```bash
   # Test market rates
   curl http://localhost:3000/landing/market-rates
   
   # Test ROI calculation
   curl -X POST http://localhost:3000/landing/calculate-roi \
     -H "Content-Type: application/json" \
     -d '{"campaignBudget":1000,"followers":10000,"engagementRate":3.5,"niche":"fashion","postsPerMonth":12}'
   ```

3. **Connect Frontend** (2-4 hours)
   - Follow steps in `ROI-CALCULATOR-IMPLEMENTATION-STATUS.md`
   - Create `roi-calculator.service.ts`
   - Update `ROICalculator.tsx` component

---

**Priority:** HIGH  
**Impact:** Medium (ROI calculator works, but features section may crash)  
**Effort:** 5 minutes to fix  
**Status:** Ready to fix
