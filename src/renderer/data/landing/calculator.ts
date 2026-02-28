// ROI Calculator Data and Logic
// Phase 2.3: Interactive ROI Calculator

export interface CalculatorInputs {
  followerCount: number;
  engagementRate: number;
  niche: string;
  postsPerMonth: number;
}

export interface CalculatorResults {
  estimatedEarnings: {
    min: number;
    max: number;
    average: number;
  };
  matchPotential: number;
  brandOpportunities: number;
  projectedGrowth: number;
  timeToROI: number; // months
}

// Base CPM rates by niche (Cost Per Mille - per 1000 impressions)
export const nicheRates = {
  fashion: { min: 10, max: 25, avgEngagement: 3.5 },
  tech: { min: 15, max: 35, avgEngagement: 2.8 },
  beauty: { min: 12, max: 28, avgEngagement: 4.2 },
  fitness: { min: 8, max: 20, avgEngagement: 3.8 },
  food: { min: 10, max: 22, avgEngagement: 4.5 },
  travel: { min: 12, max: 30, avgEngagement: 3.2 },
  lifestyle: { min: 10, max: 25, avgEngagement: 3.6 },
  gaming: { min: 18, max: 40, avgEngagement: 5.2 },
  business: { min: 20, max: 45, avgEngagement: 2.5 },
  other: { min: 8, max: 20, avgEngagement: 3.0 }
};

export const niches = [
  { value: 'fashion', label: 'Fashion & Style' },
  { value: 'tech', label: 'Technology' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'fitness', label: 'Fitness & Health' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'travel', label: 'Travel & Adventure' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'gaming', label: 'Gaming & Esports' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'other', label: 'Other' }
];

// Calculate ROI based on inputs
export const calculateROI = (inputs: CalculatorInputs): CalculatorResults => {
  const { followerCount, engagementRate, niche, postsPerMonth } = inputs;
  
  // Get niche-specific rates
  const rates = nicheRates[niche as keyof typeof nicheRates] || nicheRates.other;
  
  // Calculate reach per post (followers * engagement rate)
  const reachPerPost = followerCount * (engagementRate / 100);
  
  // Calculate monthly reach
  const monthlyReach = reachPerPost * postsPerMonth;
  
  // Calculate earnings (reach / 1000 * CPM)
  const minEarnings = (monthlyReach / 1000) * rates.min;
  const maxEarnings = (monthlyReach / 1000) * rates.max;
  const avgEarnings = (minEarnings + maxEarnings) / 2;
  
  // Calculate match potential (0-100 score)
  // Based on follower count, engagement rate, and niche
  let matchScore = 0;
  
  // Follower count contribution (40%)
  if (followerCount >= 100000) matchScore += 40;
  else if (followerCount >= 50000) matchScore += 35;
  else if (followerCount >= 10000) matchScore += 30;
  else if (followerCount >= 5000) matchScore += 25;
  else matchScore += 20;
  
  // Engagement rate contribution (40%)
  if (engagementRate >= 5) matchScore += 40;
  else if (engagementRate >= 3) matchScore += 35;
  else if (engagementRate >= 2) matchScore += 30;
  else if (engagementRate >= 1) matchScore += 25;
  else matchScore += 20;
  
  // Activity contribution (20%)
  if (postsPerMonth >= 20) matchScore += 20;
  else if (postsPerMonth >= 12) matchScore += 18;
  else if (postsPerMonth >= 8) matchScore += 15;
  else if (postsPerMonth >= 4) matchScore += 12;
  else matchScore += 10;
  
  // Calculate brand opportunities per month
  // Based on match score and follower count
  const brandOpportunities = Math.floor(
    (matchScore / 100) * (followerCount / 10000) * 2
  );
  
  // Calculate projected growth (% increase over 6 months)
  // Higher engagement = higher growth potential
  const growthMultiplier = engagementRate >= 3 ? 1.5 : 1.2;
  const projectedGrowth = Math.floor(
    ((followerCount * 0.15 * growthMultiplier) / followerCount) * 100
  );
  
  // Calculate time to ROI (months)
  // Assuming platform fee of $29/month
  const platformFee = 29;
  const timeToROI = avgEarnings > 0 ? Math.ceil(platformFee / avgEarnings) : 12;
  
  return {
    estimatedEarnings: {
      min: Math.round(minEarnings),
      max: Math.round(maxEarnings),
      average: Math.round(avgEarnings)
    },
    matchPotential: Math.min(matchScore, 100),
    brandOpportunities: Math.max(brandOpportunities, 1),
    projectedGrowth: Math.min(projectedGrowth, 50),
    timeToROI: Math.min(timeToROI, 12)
  };
};

// Follower count presets
export const followerPresets = [
  { value: 1000, label: '1K' },
  { value: 5000, label: '5K' },
  { value: 10000, label: '10K' },
  { value: 50000, label: '50K' },
  { value: 100000, label: '100K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1M' }
];

// Engagement rate benchmarks
export const engagementBenchmarks = {
  excellent: 5,
  good: 3,
  average: 2,
  poor: 1
};
