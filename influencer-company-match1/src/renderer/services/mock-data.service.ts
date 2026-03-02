import { Match, MatchProfile } from './matching.service';

// Mock data matching the backend seed data
const MOCK_INFLUENCERS: MatchProfile[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    type: 'influencer',
    niche: 'Fashion',
    audienceSize: 250000,
    engagementRate: 4.5,
    location: 'New York, NY',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    bio: 'Fashion influencer specializing in sustainable and ethical fashion. Passionate about helping brands tell their story through authentic content.',
    portfolioUrl: 'https://sarahjohnson.com',
    budgetRange: { min: 5000, max: 15000 }
  },
  {
    id: '2',
    name: 'Mike Chen',
    type: 'influencer',
    niche: 'Technology',
    audienceSize: 500000,
    engagementRate: 5.2,
    location: 'San Francisco, CA',
    platforms: ['YouTube', 'Twitter', 'LinkedIn'],
    bio: 'Tech reviewer and software engineer. I help tech companies reach developers and early adopters.',
    portfolioUrl: 'https://mikechen.tech',
    budgetRange: { min: 10000, max: 25000 }
  },
  {
    id: '3',
    name: 'Emma Davis',
    type: 'influencer',
    niche: 'Beauty',
    audienceSize: 350000,
    engagementRate: 6.1,
    location: 'Los Angeles, CA',
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    bio: 'Beauty and skincare expert. Specializing in clean beauty and cruelty-free products.',
    portfolioUrl: 'https://emmadavis.beauty',
    budgetRange: { min: 7000, max: 18000 }
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    type: 'influencer',
    niche: 'Fitness',
    audienceSize: 180000,
    engagementRate: 5.8,
    location: 'Miami, FL',
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    bio: 'Certified personal trainer and nutrition coach. Helping people achieve their fitness goals.',
    portfolioUrl: 'https://alexfitness.com',
    budgetRange: { min: 4000, max: 12000 }
  },
  {
    id: '5',
    name: 'Lisa Park',
    type: 'influencer',
    niche: 'Food',
    audienceSize: 420000,
    engagementRate: 7.3,
    location: 'Chicago, IL',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    bio: 'Food blogger and recipe developer. Specializing in quick, healthy meals for busy professionals.',
    portfolioUrl: 'https://lisapark.food',
    budgetRange: { min: 8000, max: 20000 }
  }
];

const MOCK_COMPANIES: MatchProfile[] = [
  {
    id: '6',
    name: 'StyleCo',
    type: 'company',
    industry: 'Fashion',
    budget: 12000,
    location: 'New York, NY',
    platforms: ['Instagram', 'TikTok'],
    description: 'Sustainable fashion brand looking for influencers who align with our eco-friendly values.',
    website: 'https://styleco.com',
    budgetRange: { min: 5000, max: 15000 }
  },
  {
    id: '7',
    name: 'TechGear',
    type: 'company',
    industry: 'Technology',
    budget: 20000,
    location: 'San Francisco, CA',
    platforms: ['YouTube', 'Twitter'],
    description: 'Consumer electronics company seeking tech reviewers and early adopters.',
    website: 'https://techgear.com',
    budgetRange: { min: 10000, max: 30000 }
  },
  {
    id: '8',
    name: 'GlowBeauty',
    type: 'company',
    industry: 'Beauty',
    budget: 15000,
    location: 'Los Angeles, CA',
    platforms: ['Instagram', 'YouTube'],
    description: 'Clean beauty brand focused on natural, cruelty-free skincare products.',
    website: 'https://glowbeauty.com',
    budgetRange: { min: 7000, max: 20000 }
  },
  {
    id: '9',
    name: 'FitLife',
    type: 'company',
    industry: 'Fitness',
    budget: 10000,
    location: 'Miami, FL',
    platforms: ['Instagram', 'TikTok'],
    description: 'Fitness equipment and supplement company looking for authentic fitness influencers.',
    website: 'https://fitlife.com',
    budgetRange: { min: 4000, max: 15000 }
  },
  {
    id: '10',
    name: 'TastyBites',
    type: 'company',
    industry: 'Food',
    budget: 18000,
    location: 'Chicago, IL',
    platforms: ['Instagram', 'TikTok'],
    description: 'Meal kit delivery service seeking food bloggers and recipe creators.',
    website: 'https://tastybites.com',
    budgetRange: { min: 8000, max: 25000 }
  }
];

// Matching algorithm (simplified version of backend)
function calculateMatchScore(
  influencer: MatchProfile,
  company: MatchProfile
): { score: number; breakdown: Match['breakdown'] } {
  const breakdown = {
    nicheCompatibility: 0,
    locationCompatibility: 0,
    budgetAlignment: 0,
    platformOverlap: 0,
    audienceSizeMatch: 0,
    engagementTierMatch: 0
  };

  // Niche compatibility (30%)
  if (influencer.niche?.toLowerCase() === company.industry?.toLowerCase()) {
    breakdown.nicheCompatibility = 100;
  } else {
    breakdown.nicheCompatibility = 30;
  }

  // Location compatibility (15%)
  if (influencer.location === company.location) {
    breakdown.locationCompatibility = 100;
  } else {
    breakdown.locationCompatibility = 50;
  }

  // Budget alignment (20%)
  const influencerMin = influencer.budgetRange?.min || 0;
  const influencerMax = influencer.budgetRange?.max || 999999;
  const companyBudget = company.budget || 0;
  
  if (companyBudget >= influencerMin && companyBudget <= influencerMax) {
    breakdown.budgetAlignment = 100;
  } else if (companyBudget < influencerMin) {
    const diff = influencerMin - companyBudget;
    breakdown.budgetAlignment = Math.max(0, 100 - (diff / influencerMin) * 100);
  } else {
    breakdown.budgetAlignment = 70;
  }

  // Platform overlap (15%)
  const influencerPlatforms = new Set(influencer.platforms || []);
  const companyPlatforms = new Set(company.platforms || []);
  const overlap = [...influencerPlatforms].filter(p => companyPlatforms.has(p)).length;
  const total = Math.max(influencerPlatforms.size, companyPlatforms.size);
  breakdown.platformOverlap = total > 0 ? (overlap / total) * 100 : 0;

  // Audience size match (10%)
  breakdown.audienceSizeMatch = 80;

  // Engagement tier match (10%)
  breakdown.engagementTierMatch = 85;

  // Calculate weighted score
  const score = 
    breakdown.nicheCompatibility * 0.30 +
    breakdown.locationCompatibility * 0.15 +
    breakdown.budgetAlignment * 0.20 +
    breakdown.platformOverlap * 0.15 +
    breakdown.audienceSizeMatch * 0.10 +
    breakdown.engagementTierMatch * 0.10;

  return { score: Math.round(score), breakdown };
}

function getMatchTier(score: number): string {
  if (score >= 90) return 'Perfect';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 60) return 'Good';
  return 'Fair';
}

export class MockDataService {
  private readonly STORAGE_KEY = 'mock_matches';
  private readonly CURRENT_USER_KEY = 'current_user';

  // Initialize mock data in localStorage
  initializeMockData(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.generateMatches();
    }
    
    // Set default user as influencer
    if (!localStorage.getItem(this.CURRENT_USER_KEY)) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify({
        id: '1',
        type: 'influencer',
        profile: MOCK_INFLUENCERS[0]
      }));
    }
  }

  // Generate matches based on current user
  private generateMatches(): void {
    const currentUser = this.getCurrentUser();
    const matches: Match[] = [];

    if (currentUser.type === 'influencer') {
      // Match influencer with companies
      MOCK_COMPANIES.forEach(company => {
        const { score, breakdown } = calculateMatchScore(currentUser.profile, company);
        matches.push({
          id: `match-${currentUser.profile.id}-${company.id}`,
          profile: company,
          score,
          tier: getMatchTier(score),
          breakdown
        });
      });
    } else {
      // Match company with influencers
      MOCK_INFLUENCERS.forEach(influencer => {
        const { score, breakdown } = calculateMatchScore(influencer, currentUser.profile);
        matches.push({
          id: `match-${currentUser.profile.id}-${influencer.id}`,
          profile: influencer,
          score,
          tier: getMatchTier(score),
          breakdown
        });
      });
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(matches));
  }

  getCurrentUser(): { id: string; type: 'influencer' | 'company'; profile: MatchProfile } {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Default to first influencer
    return {
      id: '1',
      type: 'influencer',
      profile: MOCK_INFLUENCERS[0]
    };
  }

  setCurrentUser(userId: string, type: 'influencer' | 'company'): void {
    const profiles = type === 'influencer' ? MOCK_INFLUENCERS : MOCK_COMPANIES;
    const profile = profiles.find(p => p.id === userId);
    
    if (profile) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify({
        id: userId,
        type,
        profile
      }));
      this.generateMatches();
    }
  }

  getMatches(): Match[] {
    const matchesData = localStorage.getItem(this.STORAGE_KEY);
    if (matchesData) {
      return JSON.parse(matchesData);
    }
    return [];
  }

  getAllInfluencers(): MatchProfile[] {
    return MOCK_INFLUENCERS;
  }

  getAllCompanies(): MatchProfile[] {
    return MOCK_COMPANIES;
  }
}

export const mockDataService = new MockDataService();
