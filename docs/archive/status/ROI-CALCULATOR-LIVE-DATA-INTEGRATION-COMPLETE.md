# ROI Calculator - Live Data Integration (Using Existing Tables)

## ✅ Solution: Connect to Existing Database Tables

Instead of creating new tables, we'll connect the ROI Calculator to the **existing** campaign, collaboration, and user data.

---

## 📊 Existing Tables We'll Use

### 1. **campaigns** table
- `budget_min`, `budget_max` - Real campaign budgets
- `niche` - Campaign niches
- `status` - Campaign status (completed, active, etc.)

### 2. **collaborations** table  
- `agreed_rate` - Actual rates paid
- `status` - Collaboration outcomes
- `start_date`, `end_date` - Duration data

### 3. **influencer_profile** table
- Follower counts (from social media data)
- Engagement rates
- Niche information

### 4. **company_profile** table
- Industry data
- Company size

### 5. **connections** table
- `collaboration_status` - Success/failure data
- Match outcomes

---

## 🔧 Implementation: Update Backend Service

### Step 1: Enhance `landing.service.ts` to Query Real Data

<function_calls>
<invoke name="strReplace">
<parameter name="path">influencer-company-match1/backend/src/modules/landing/landing.service.ts